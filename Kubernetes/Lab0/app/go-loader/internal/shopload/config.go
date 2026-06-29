package shopload

import (
	"errors"
	"strings"
	"time"
)

type Config struct {
	APIBaseURL          string
	Users               int
	Period              time.Duration
	MinDelay            time.Duration
	MaxDelay            time.Duration
	MaxProductsPerOrder int
	UserEmailDomain     string
	UserPassword        string
}

func (c Config) Validate() error {
	if strings.TrimSpace(c.APIBaseURL) == "" {
		return errors.New("api base url is required")
	}
	if c.Users < 1 {
		return errors.New("users must be greater than zero")
	}
	if c.Period <= 0 {
		return errors.New("period must be greater than zero")
	}
	if c.MinDelay < 0 {
		return errors.New("min delay cannot be negative")
	}
	if c.MaxDelay < c.MinDelay {
		return errors.New("max delay must be greater than or equal to min delay")
	}
	if c.MaxProductsPerOrder < 1 {
		return errors.New("max products per order must be greater than zero")
	}
	if strings.TrimSpace(c.UserEmailDomain) == "" {
		return errors.New("user email domain is required")
	}
	if len(c.UserPassword) < 8 {
		return errors.New("user password must be at least 8 characters")
	}
	return nil
}
