
package config

import (
	"os"
	"strconv"
	"strings"
)

// Config holds all configuration for the application
type Config struct {
	values map[string]string
}

// New creates a new Config instance
func New() *Config {
	return &Config{
		values: make(map[string]string),
	}
}

// GetString retrieves a string value by key with a default fallback
func (c *Config) GetString(key string, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists && value != "" {
		return value
	}
	
	if value, exists := c.values[key]; exists && value != "" {
		return value
	}
	
	return defaultValue
}

// GetInt retrieves an integer value by key with a default fallback
func (c *Config) GetInt(key string, defaultValue int) int {
	if strValue, exists := os.LookupEnv(key); exists && strValue != "" {
		if value, err := strconv.Atoi(strValue); err == nil {
			return value
		}
	}
	
	if strValue, exists := c.values[key]; exists && strValue != "" {
		if value, err := strconv.Atoi(strValue); err == nil {
			return value
		}
	}
	
	return defaultValue
}

// GetBool retrieves a boolean value by key with a default fallback
func (c *Config) GetBool(key string, defaultValue bool) bool {
	if strValue, exists := os.LookupEnv(key); exists && strValue != "" {
		lowercase := strings.ToLower(strValue)
		if lowercase == "true" || lowercase == "1" || lowercase == "yes" {
			return true
		} else if lowercase == "false" || lowercase == "0" || lowercase == "no" {
			return false
		}
	}
	
	if strValue, exists := c.values[key]; exists && strValue != "" {
		lowercase := strings.ToLower(strValue)
		if lowercase == "true" || lowercase == "1" || lowercase == "yes" {
			return true
		} else if lowercase == "false" || lowercase == "0" || lowercase == "no" {
			return false
		}
	}
	
	return defaultValue
}

// Set sets a configuration value
func (c *Config) Set(key string, value string) {
	c.values[key] = value
}
