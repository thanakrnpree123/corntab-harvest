
package routes

import (
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
	
	"crontab/internal/config"
	"crontab/internal/handlers"
	"crontab/internal/middleware"
	"crontab/pkg/scheduler"
)

// SetupRoutes configures all API routes
func SetupRoutes(e *echo.Echo, db *gorm.DB, cfg *config.Config, scheduler *scheduler.Scheduler) {
	// API group
	api := e.Group("/api")
	
	// Public routes
	authHandler := handlers.NewAuthHandler(db)
	api.POST("/auth/register", authHandler.Register)
	api.POST("/auth/login", authHandler.Login)
	api.POST("/auth/validate", authHandler.ValidateToken)
	
	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(db))
	
	// Projects
	projectHandler := handlers.NewProjectHandler(db)
	protected.GET("/projects", projectHandler.GetAllProjects)
	protected.GET("/projects/:id", projectHandler.GetProjectByID)
	protected.POST("/projects", projectHandler.CreateProject)
	protected.PUT("/projects/:id", projectHandler.UpdateProject)
	protected.DELETE("/projects/:id", projectHandler.DeleteProject)
	
	// Jobs
	jobHandler := handlers.NewJobHandler(db, scheduler)
	protected.GET("/jobs", jobHandler.GetAllJobs)
	protected.GET("/jobs/project/:projectId", jobHandler.GetJobsByProject)
	protected.GET("/jobs/:id", jobHandler.GetJobByID)
	protected.POST("/jobs", jobHandler.CreateJob)
	protected.PUT("/jobs/:id", jobHandler.UpdateJob)
	protected.DELETE("/jobs/:id", jobHandler.DeleteJob)
	protected.GET("/jobs/:id/logs", jobHandler.GetJobLogs)
	protected.POST("/jobs/:id/logs", jobHandler.CreateJobLog)
	
	// Health check
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{"status": "ok"})
	})
}
