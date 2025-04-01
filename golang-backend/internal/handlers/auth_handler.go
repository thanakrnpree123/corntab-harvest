
package handlers

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
	
	"crontab/internal/models"
)

type AuthHandler struct {
	db *gorm.DB
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{db: db}
}

// RegisterRequest represents the request format for registration
type RegisterRequest struct {
	Name     string `json:"name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

// LoginRequest represents the request format for login
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// TokenRequest represents the request format for token validation
type TokenRequest struct {
	Token string `json:"token" validate:"required"`
}

// Register godoc
// @Summary Register a new user
// @Description Registers a new user with the system
// @Tags auth
// @Accept json
// @Produce json
// @Param user body RegisterRequest true "User registration details"
// @Success 201 {object} map[string]interface{} "success"
// @Failure 400 {object} map[string]interface{} "error"
// @Router /auth/register [post]
func (h *AuthHandler) Register(c echo.Context) error {
	req := new(RegisterRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Invalid request data: " + err.Error(),
		})
	}

	// Check if email already exists
	var existingUser models.User
	if err := h.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Email already exists",
		})
	}

	// Find user role
	var userRole models.Role
	if err := h.db.Where("name = ?", "user").First(&userRole).Error; err != nil {
		// Create user role if it doesn't exist
		permissions := []string{"view", "create", "update"}
		permissionsJSON, _ := models.MarshalPermissions(permissions)
		
		userRole = models.Role{
			Name:           "user",
			Permissions:    permissions,
			PermissionsJSON: permissionsJSON,
		}
		
		if err := h.db.Create(&userRole).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{
				"success": false,
				"error":   "Failed to create user role: " + err.Error(),
			})
		}
	}

	// Create new user
	hashedPassword := h.hashPassword(req.Password)
	user := models.User{
		Name:      req.Name,
		Email:     req.Email,
		Password:  hashedPassword,
		RoleID:    userRole.ID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := h.db.Create(&user).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Failed to create user: " + err.Error(),
		})
	}

	// Remove password from response
	user.Password = ""

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"success": true,
		"data":    user,
		"message": "Registration successful",
	})
}

// Login godoc
// @Summary Log in a user
// @Description Authenticates a user and returns a token
// @Tags auth
// @Accept json
// @Produce json
// @Param credentials body LoginRequest true "Login credentials"
// @Success 200 {object} map[string]interface{} "success"
// @Failure 401 {object} map[string]interface{} "error"
// @Router /auth/login [post]
func (h *AuthHandler) Login(c echo.Context) error {
	req := new(LoginRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Invalid request data: " + err.Error(),
		})
	}

	// Find user by email
	var user models.User
	if err := h.db.Preload("Role").Where("email = ?", req.Email).First(&user).Error; err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"success": false,
			"error":   "User not found",
		})
	}

	// Verify password
	hashedPassword := h.hashPassword(req.Password)
	if hashedPassword != user.Password {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"success": false,
			"error":   "Invalid password",
		})
	}

	// Generate token
	token := h.generateToken(user)

	// Remove password from response
	user.Password = ""

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"user":  user,
			"token": token,
		},
		"message": "Login successful",
	})
}

// ValidateToken godoc
// @Summary Validate a token
// @Description Validates a user's authentication token
// @Tags auth
// @Accept json
// @Produce json
// @Param token body TokenRequest true "Token to validate"
// @Success 200 {object} map[string]interface{} "success"
// @Failure 401 {object} map[string]interface{} "error"
// @Router /auth/validate [post]
func (h *AuthHandler) ValidateToken(c echo.Context) error {
	req := new(TokenRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Invalid request data: " + err.Error(),
		})
	}

	// Parse token
	payload, err := h.parseToken(req.Token)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"success": false,
			"error":   "Invalid token: " + err.Error(),
		})
	}

	// Find user by ID
	var user models.User
	if err := h.db.Preload("Role").Where("id = ? AND email = ?", payload["id"], payload["email"]).First(&user).Error; err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"success": false,
			"error":   "User not found",
		})
	}

	// Remove password from response
	user.Password = ""

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"user":    user,
			"isValid": true,
		},
		"message": "Token is valid",
	})
}

// Helper functions

// hashPassword creates a SHA-256 hash of a password
func (h *AuthHandler) hashPassword(password string) string {
	hash := sha256.Sum256([]byte(password))
	return hex.EncodeToString(hash[:])
}

// generateToken creates a simple token for the user
func (h *AuthHandler) generateToken(user models.User) string {
	payload := map[string]string{
		"id":    user.ID,
		"email": user.Email,
		"role":  user.RoleID,
	}
	
	jsonPayload, _ := json.Marshal(payload)
	return base64.StdEncoding.EncodeToString(jsonPayload)
}

// parseToken decodes a token into its payload
func (h *AuthHandler) parseToken(token string) (map[string]string, error) {
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
