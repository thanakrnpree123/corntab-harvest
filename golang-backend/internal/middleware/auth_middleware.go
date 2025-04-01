
package middleware

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
	
	"crontab/internal/models"
)

// AuthMiddleware handles authentication for protected routes
func AuthMiddleware(db *gorm.DB) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Get token from header
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return c.JSON(http.StatusUnauthorized, map[string]interface{}{
					"success": false,
					"error":   "Missing Authorization header",
				})
			}
			
			// Extract token from "Bearer <token>" format
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				return c.JSON(http.StatusUnauthorized, map[string]interface{}{
					"success": false,
					"error":   "Invalid Authorization header format",
				})
			}
			
			token := parts[1]
			
			// Decode and validate token
			payload, err := parseToken(token)
			if err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]interface{}{
					"success": false,
					"error":   "Invalid token: " + err.Error(),
				})
			}
			
			// Check if user exists
			var user models.User
			if err := db.Preload("Role").Where("id = ? AND email = ?", payload["id"], payload["email"]).First(&user).Error; err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]interface{}{
					"success": false,
					"error":   "User not found",
				})
			}
			
			// Store user in context
			c.Set("user", user)
			
			// Continue with request
			return next(c)
		}
	}
}

// parseToken decodes a token into its payload
func parseToken(token string) (map[string]string, error) {
	// Decode base64
	decoded, err := base64.StdEncoding.DecodeString(strings.TrimSpace(token))
	if err != nil {
		return nil, err
	}
	
	// Parse JSON
	var payload map[string]string
	if err := json.Unmarshal(decoded, &payload); err != nil {
		return nil, err
	}
	
	return payload, nil
}
