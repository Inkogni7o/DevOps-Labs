package shopload

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type APIError struct {
	StatusCode int
	Body       string
}

func (e APIError) Error() string {
	return "api returned status " + strconv.Itoa(e.StatusCode) + ": " + e.Body
}

func (e APIError) Retryable() bool {
	return e.StatusCode == http.StatusTooManyRequests || e.StatusCode >= 500
}

type Client struct {
	baseURL    string
	httpClient *http.Client
}

type Product struct {
	ID            int    `json:"id"`
	SKU           string `json:"sku"`
	Name          string `json:"name"`
	PriceCents    int    `json:"price_cents"`
	StockQuantity int    `json:"stock_quantity"`
	IsActive      bool   `json:"is_active"`
}

type LoginResponse struct {
	AccessToken string `json:"access_token"`
}

type OrderResponse struct {
	ID         int    `json:"id"`
	Status     string `json:"status"`
	TotalCents int    `json:"total_cents"`
}

type PaymentResponse struct {
	ID      int    `json:"id"`
	Status  string `json:"status"`
	OrderID int    `json:"order_id"`
}

func NewClient(baseURL string) *Client {
	return &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		httpClient: &http.Client{
			Timeout: 20 * time.Second,
		},
	}
}

func (c *Client) Ready(ctx context.Context) error {
	response, err := c.do(ctx, http.MethodGet, "/readyz", "", nil)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	return decodeResponse[struct{}](response)
}

func (c *Client) Register(ctx context.Context, email string, password string, fullName string) error {
	request := map[string]any{
		"email":     email,
		"password":  password,
		"full_name": fullName,
	}
	response, err := c.do(ctx, http.MethodPost, "/api/users/register", "", request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode == http.StatusConflict {
		return nil
	}
	return decodeResponse[struct{}](response)
}

func (c *Client) Login(ctx context.Context, email string, password string) (string, error) {
	request := map[string]any{
		"email":    email,
		"password": password,
	}
	response, err := c.do(ctx, http.MethodPost, "/api/users/login", "", request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	loginResponse, err := decodeJSONResponse[LoginResponse](response)
	if err != nil {
		return "", err
	}
	return loginResponse.AccessToken, nil
}

func (c *Client) Products(ctx context.Context) ([]Product, error) {
	response, err := c.do(ctx, http.MethodGet, "/api/products", "", nil)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	return decodeJSONResponse[[]Product](response)
}

func (c *Client) AddCartItem(ctx context.Context, token string, productID int, quantity int) error {
	request := map[string]any{
		"product_id": productID,
		"quantity":   quantity,
	}
	response, err := c.do(ctx, http.MethodPost, "/api/cart/items", token, request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	return decodeResponse[struct{}](response)
}

func (c *Client) CreateOrder(ctx context.Context, token string) (OrderResponse, error) {
	response, err := c.do(ctx, http.MethodPost, "/api/orders", token, nil)
	if err != nil {
		return OrderResponse{}, err
	}
	defer response.Body.Close()
	return decodeJSONResponse[OrderResponse](response)
}

func (c *Client) PayOrder(ctx context.Context, token string, orderID int) (PaymentResponse, error) {
	request := map[string]any{"order_id": orderID}
	response, err := c.do(ctx, http.MethodPost, "/api/payments/pay-order", token, request)
	if err != nil {
		return PaymentResponse{}, err
	}
	defer response.Body.Close()
	return decodeJSONResponse[PaymentResponse](response)
}

func (c *Client) do(ctx context.Context, method string, path string, token string, body any) (*http.Response, error) {
	var requestBody io.Reader
	if body != nil {
		encodedBody, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("encode request body: %w", err)
		}
		requestBody = bytes.NewReader(encodedBody)
	}
	request, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, requestBody)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	request.Header.Set("Accept", "application/json")
	if body != nil {
		request.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		request.Header.Set("Authorization", "Bearer "+token)
	}
	response, err := c.httpClient.Do(request)
	if err != nil {
		return nil, fmt.Errorf("%s %s: %w", method, path, err)
	}
	return response, nil
}

func decodeResponse[T any](response *http.Response) error {
	if response.StatusCode >= 200 && response.StatusCode < 300 {
		_, _ = io.Copy(io.Discard, response.Body)
		return nil
	}
	return decodeAPIError(response)
}

func decodeJSONResponse[T any](response *http.Response) (T, error) {
	var result T
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return result, decodeAPIError(response)
	}
	if err := json.NewDecoder(response.Body).Decode(&result); err != nil {
		return result, fmt.Errorf("decode response: %w", err)
	}
	return result, nil
}

func decodeAPIError(response *http.Response) error {
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return APIError{StatusCode: response.StatusCode, Body: ""}
	}
	return APIError{StatusCode: response.StatusCode, Body: strings.TrimSpace(string(body))}
}
