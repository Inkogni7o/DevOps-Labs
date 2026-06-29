package shopload

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"net"
	"sync"
	"time"
)

type Runner struct {
	config Config
	client *Client
	logger *Logger
}

type simulatedUser struct {
	ID       int
	Email    string
	FullName string
	Token    string
}

func NewRunner(config Config, logger *Logger) *Runner {
	return &Runner{
		config: config,
		client: NewClient(config.APIBaseURL),
		logger: logger,
	}
}

func (r *Runner) Run(ctx context.Context) error {
	r.logger.Info("loader_starting", map[string]any{
		"api_base_url":           r.config.APIBaseURL,
		"users":                  r.config.Users,
		"period":                 r.config.Period.String(),
		"min_delay":              r.config.MinDelay.String(),
		"max_delay":              r.config.MaxDelay.String(),
		"max_products_per_order": r.config.MaxProductsPerOrder,
	})

	if err := r.waitUntilReady(ctx); err != nil {
		return err
	}

	runID := time.Now().UTC().Format("20060102T150405")
	users, err := r.prepareUsers(ctx, runID)
	if err != nil {
		return err
	}

	var waitGroup sync.WaitGroup
	for index := range users {
		user := users[index]
		initialDelay := r.initialDelay(index)
		waitGroup.Add(1)
		go func() {
			defer waitGroup.Done()
			r.runUser(ctx, user, initialDelay)
		}()
	}

	<-ctx.Done()
	r.logger.Info("loader_stopping", map[string]any{"reason": ctx.Err().Error()})
	waitGroup.Wait()
	return nil
}

func (r *Runner) prepareUsers(ctx context.Context, runID string) ([]simulatedUser, error) {
	users := make([]simulatedUser, 0, r.config.Users)
	for userID := 1; userID <= r.config.Users; userID++ {
		email := fmt.Sprintf("loader-%s-%03d@%s", runID, userID, r.config.UserEmailDomain)
		fullName := fmt.Sprintf("Loader User %03d", userID)
		if err := r.withRetry(ctx, fmt.Sprintf("register user %d", userID), func() error {
			return r.client.Register(ctx, email, r.config.UserPassword, fullName)
		}); err != nil {
			return nil, fmt.Errorf("register user %d: %w", userID, err)
		}
		var token string
		if err := r.withRetry(ctx, fmt.Sprintf("login user %d", userID), func() error {
			var loginErr error
			token, loginErr = r.client.Login(ctx, email, r.config.UserPassword)
			return loginErr
		}); err != nil {
			return nil, fmt.Errorf("login user %d: %w", userID, err)
		}
		users = append(users, simulatedUser{
			ID:       userID,
			Email:    email,
			FullName: fullName,
			Token:    token,
		})
		r.logger.Info("loader_user_ready", map[string]any{"user_id": userID, "email": email})
	}
	return users, nil
}

func (r *Runner) waitUntilReady(ctx context.Context) error {
	return r.withRetry(ctx, "api readiness", func() error {
		return r.client.Ready(ctx)
	})
}

func (r *Runner) withRetry(ctx context.Context, operation string, callback func() error) error {
	delay := time.Second
	for attempt := 1; ; attempt++ {
		err := callback()
		if err == nil {
			if attempt > 1 {
				r.logger.Info("retry_succeeded", map[string]any{
					"operation": operation,
					"attempt":   attempt,
				})
			}
			return nil
		}
		if !isRetryable(err) {
			return err
		}
		if ctx.Err() != nil {
			return ctx.Err()
		}
		r.logger.Error("retry_waiting", err, map[string]any{
			"operation": operation,
			"attempt":   attempt,
			"delay":     delay.String(),
		})
		if !sleepContext(ctx, delay) {
			return ctx.Err()
		}
		if delay < 15*time.Second {
			delay *= 2
		}
	}
}

type retryableAPIError interface {
	Retryable() bool
}

func isRetryable(err error) bool {
	var apiErr retryableAPIError
	if errors.As(err, &apiErr) {
		return apiErr.Retryable()
	}
	var netErr net.Error
	if errors.As(err, &netErr) {
		return true
	}
	return true
}

func (r *Runner) runUser(ctx context.Context, user simulatedUser, initialDelay time.Duration) {
	if !sleepContext(ctx, initialDelay) {
		return
	}

	random := rand.New(rand.NewSource(time.Now().UnixNano() + int64(user.ID)))
	for {
		startedAt := time.Now()
		if err := r.placeOrder(ctx, random, user); err != nil {
			if !errors.Is(err, context.Canceled) {
				r.logger.Error("order_failed", err, map[string]any{"user_id": user.ID})
			}
		}

		nextDelay := r.nextOrderDelay(random, startedAt)
		if nextDelay < time.Second {
			nextDelay = time.Second
		}
		if !sleepContext(ctx, nextDelay) {
			return
		}
	}
}

func (r *Runner) placeOrder(ctx context.Context, random *rand.Rand, user simulatedUser) error {
	products, err := r.client.Products(ctx)
	if err != nil {
		return fmt.Errorf("fetch products: %w", err)
	}

	availableProducts := filterAvailableProducts(products)
	if len(availableProducts) == 0 {
		r.logger.Info("no_available_products", map[string]any{"user_id": user.ID})
		return nil
	}

	selectedProducts := chooseProducts(random, availableProducts, r.config.MaxProductsPerOrder)
	totalItems := 0
	for _, product := range selectedProducts {
		quantity := chooseQuantity(random, product.StockQuantity)
		if quantity < 1 {
			continue
		}
		if err := r.client.AddCartItem(ctx, user.Token, product.ID, quantity); err != nil {
			return fmt.Errorf("add cart item product_id=%d: %w", product.ID, err)
		}
		totalItems += quantity
	}
	if totalItems == 0 {
		return nil
	}

	order, err := r.client.CreateOrder(ctx, user.Token)
	if err != nil {
		return fmt.Errorf("create order: %w", err)
	}
	payment, err := r.client.PayOrder(ctx, user.Token, order.ID)
	if err != nil {
		return fmt.Errorf("pay order %d: %w", order.ID, err)
	}

	r.logger.Info("order_completed", map[string]any{
		"user_id":     user.ID,
		"order_id":    order.ID,
		"payment_id":  payment.ID,
		"items":       totalItems,
		"total_cents": order.TotalCents,
		"status":      payment.Status,
	})
	return nil
}

func (r *Runner) initialDelay(index int) time.Duration {
	random := rand.New(rand.NewSource(time.Now().UnixNano() + int64(index)))
	slot := r.config.Period / time.Duration(r.config.Users)
	if slot < 0 {
		slot = 0
	}
	return time.Duration(index)*slot + randomDelay(random, r.config.MinDelay, r.config.MaxDelay)
}

func (r *Runner) nextOrderDelay(random *rand.Rand, startedAt time.Time) time.Duration {
	averageDelay := (r.config.MinDelay + r.config.MaxDelay) / 2
	jitter := randomDelay(random, r.config.MinDelay, r.config.MaxDelay) - averageDelay
	return r.config.Period + jitter - time.Since(startedAt)
}

func filterAvailableProducts(products []Product) []Product {
	availableProducts := make([]Product, 0, len(products))
	for _, product := range products {
		if product.IsActive && product.StockQuantity > 0 {
			availableProducts = append(availableProducts, product)
		}
	}
	return availableProducts
}

func chooseProducts(random *rand.Rand, products []Product, maxProducts int) []Product {
	productsCopy := append([]Product(nil), products...)
	random.Shuffle(len(productsCopy), func(left int, right int) {
		productsCopy[left], productsCopy[right] = productsCopy[right], productsCopy[left]
	})
	limit := 1 + random.Intn(maxProducts)
	if limit > len(productsCopy) {
		limit = len(productsCopy)
	}
	return productsCopy[:limit]
}

func chooseQuantity(random *rand.Rand, stockQuantity int) int {
	limit := stockQuantity
	if limit > 2 {
		limit = 2
	}
	if limit < 1 {
		return 0
	}
	return 1 + random.Intn(limit)
}

func randomDelay(random *rand.Rand, minDelay time.Duration, maxDelay time.Duration) time.Duration {
	if maxDelay == minDelay {
		return minDelay
	}
	return minDelay + time.Duration(random.Int63n(int64(maxDelay-minDelay)))
}

func sleepContext(ctx context.Context, duration time.Duration) bool {
	timer := time.NewTimer(duration)
	defer timer.Stop()
	select {
	case <-ctx.Done():
		return false
	case <-timer.C:
		return true
	}
}
