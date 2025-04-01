
package handlers

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
	
	"crontab/internal/models"
)

type ProjectHandler struct {
	db *gorm.DB
}

func NewProjectHandler(db *gorm.DB) *ProjectHandler {
	return &ProjectHandler{db: db}
}

// GetAllProjects godoc
// @Summary Get all projects
// @Description Retrieves all projects
// @Tags projects
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "success"
// @Router /projects [get]
func (h *ProjectHandler) GetAllProjects(c echo.Context) error {
	var projects []models.Project
	
	if err := h.db.Find(&projects).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Failed to fetch projects: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    projects,
	})
}

// GetProjectByID godoc
// @Summary Get project by ID
// @Description Retrieves a project by its ID
// @Tags projects
// @Accept json
// @Produce json
// @Param id path string true "Project ID"
// @Success 200 {object} map[string]interface{} "success"
// @Failure 404 {object} map[string]interface{} "error"
// @Router /projects/{id} [get]
func (h *ProjectHandler) GetProjectByID(c echo.Context) error {
	id := c.Param("id")
	
	var project models.Project
	if err := h.db.Preload("Jobs").First(&project, "id = ?", id).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"error":   "Project not found",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    project,
	})
}

// CreateProject godoc
// @Summary Create a new project
// @Description Creates a new project
// @Tags projects
// @Accept json
// @Produce json
// @Param project body models.Project true "Project details"
// @Success 201 {object} map[string]interface{} "success"
// @Failure 400 {object} map[string]interface{} "error"
// @Router /projects [post]
func (h *ProjectHandler) CreateProject(c echo.Context) error {
	project := new(models.Project)
	if err := c.Bind(project); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Invalid request data: " + err.Error(),
		})
	}

	// Set creation time
	now := time.Now()
	project.CreatedAt = now
	project.UpdatedAt = now

	if err := h.db.Create(project).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Failed to create project: " + err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"success": true,
		"data":    project,
		"message": "Project created successfully",
	})
}

// UpdateProject godoc
// @Summary Update a project
// @Description Updates an existing project
// @Tags projects
// @Accept json
// @Produce json
// @Param id path string true "Project ID"
// @Param project body models.Project true "Project details"
// @Success 200 {object} map[string]interface{} "success"
// @Failure 404 {object} map[string]interface{} "error"
// @Router /projects/{id} [put]
func (h *ProjectHandler) UpdateProject(c echo.Context) error {
	id := c.Param("id")
	
	var existingProject models.Project
	if err := h.db.First(&existingProject, "id = ?", id).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"error":   "Project not found",
		})
	}

	// Bind the request body to update the project
	updatedProject := new(models.Project)
	if err := c.Bind(updatedProject); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Invalid request data: " + err.Error(),
		})
	}

	// Update only allowed fields
	existingProject.Name = updatedProject.Name
	existingProject.Description = updatedProject.Description
	existingProject.UpdatedAt = time.Now()

	if err := h.db.Save(&existingProject).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Failed to update project: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    existingProject,
		"message": "Project updated successfully",
	})
}

// DeleteProject godoc
// @Summary Delete a project
// @Description Deletes an existing project
// @Tags projects
// @Accept json
// @Produce json
// @Param id path string true "Project ID"
// @Success 200 {object} map[string]interface{} "success"
// @Failure 404 {object} map[string]interface{} "error"
// @Router /projects/{id} [delete]
func (h *ProjectHandler) DeleteProject(c echo.Context) error {
	id := c.Param("id")
	
	var project models.Project
	if err := h.db.First(&project, "id = ?", id).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"error":   "Project not found",
		})
	}

	if err := h.db.Delete(&project).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Failed to delete project: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Project deleted successfully",
	})
}
