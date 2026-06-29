package main

import (
	"context"
	"flag"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"store-lab-go-loader/internal/shopload"
)

func main() {
	config := shopload.Config{}

	flag.StringVar(&config.APIBaseURL, "api-base-url", envString("API_BASE_URL", "http://api:8000"), "Store API base URL")
	flag.IntVar(&config.Users, "users", envInt("USERS", 1), "number of simulated users in this loader instance")
	flag.DurationVar(&config.Period, "period", envDuration("ORDER_PERIOD", time.Minute), "average order placement period for each simulated user")
	flag.DurationVar(&config.MinDelay, "min-delay", envDuration("MIN_DELAY", 5*time.Second), "minimum random transaction start delay")
	flag.DurationVar(&config.MaxDelay, "max-delay", envDuration("MAX_DELAY", 15*time.Second), "maximum random transaction start delay")
	flag.IntVar(&config.MaxProductsPerOrder, "max-products-per-order", envInt("MAX_PRODUCTS_PER_ORDER", 3), "maximum number of random products per order")
	flag.StringVar(&config.UserEmailDomain, "email-domain", envString("USER_EMAIL_DOMAIN", "load.example.com"), "email domain for generated users")
	flag.StringVar(&config.UserPassword, "user-password", envString("USER_PASSWORD", "loader-password-change-me"), "password for generated users")
	flag.Parse()

	logger := shopload.NewLogger(os.Stdout)
	if err := config.Validate(); err != nil {
		logger.Error("invalid_config", err, nil)
		os.Exit(2)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	runner := shopload.NewRunner(config, logger)
	if err := runner.Run(ctx); err != nil {
		logger.Error("loader_stopped", err, nil)
		os.Exit(1)
	}
}

func envString(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

func envInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsedValue, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsedValue
}

func envDuration(key string, fallback time.Duration) time.Duration {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsedValue, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}
	return parsedValue
}
