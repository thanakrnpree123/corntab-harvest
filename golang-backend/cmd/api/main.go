
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	echoSwagger "github.com/swaggo/echo-swagger"

	"crontab/internal/config"
	"crontab/internal/routes"
	"crontab/internal/models"
	"crontab/pkg/logger"
	"crontab/pkg/scheduler"
)

// @title CronTab API
// @version 1.0
// @description API Server for CronTab application
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@crontab.app

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:3000
// @BasePath /api
// @schemes http https
func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize configuration
	cfg := config.New()
	
	// Initialize logger
	logger := logger.New(cfg)
	
	// Connect to database
	db, err := models.SetupDatabase(cfg)
	if err != nil {
		logger.Fatal("Failed to connect to database", "error", err)
	}
	
	// Auto migrate database models
	if err := models.MigrateDatabase(db); err != nil {
		logger.Fatal("Failed to migrate database", "error", err)
	}

	// Initialize Echo server
	e := echo.New()
	e.HideBanner = true
	
	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())
	e.Use(middleware.SecureWithConfig(middleware.SecureConfig{
		XSSProtection:         "1; mode=block",
		ContentTypeNosniff:    "nosniff",
		XFrameOptions:         "SAMEORIGIN",
		HSTSMaxAge:            31536000,
		ContentSecurityPolicy: "default-src 'self'",
	}))
	
	// Swagger documentation
	e.GET("/swagger/*", echoSwagger.WrapHandler)
	
	// Initialize job scheduler
	scheduler := scheduler.New(db, logger)
	go scheduler.Start()
	defer scheduler.Stop()
	
	// Setup routes
	routes.SetupRoutes(e, db, cfg, scheduler)
	
	// Start server
	go func() {
		port := cfg.GetString("PORT", "3000")
		if err := e.Start(fmt.Sprintf(":%s", port)); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", "error", err)
		}
	}()
	
	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit
	
	logger.Info("Shutting down server...")
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	if err := e.Shutdown(ctx); err != nil {
		logger.Fatal("Server shutdown failed", "error", err)
	}
	
	logger.Info("Server gracefully stopped")
}
