
package handlers

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
	
	"crontab/internal/models"
	"crontab/pkg/scheduler"
)

type JobHandler struct {
	db        *gorm.DB
	scheduler *scheduler.Scheduler
}

func NewJobHandler(db *gorm.DB, scheduler *scheduler.Scheduler) *JobHandler {
	return &JobHandler{
		db:        db,
		scheduler: scheduler,
	}
}

// GetAllJobs godoc
// @Summary Get all jobs
// @Description Retrieves all jobs
// @Tags jobs
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "success"
// @Router /jobs [get]
func (h *JobHandler) GetAllJobs(c echo.Context) error {
	var jobs []models.Job
	
	// Check if filtering by project ID
	projectID := c.QueryParam("projectId")
	query := h.db
	
	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}
	
	if err := query.Find(&jobs).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Failed to fetch jobs: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    jobs,
	})
}

// GetJobByID godoc
// @Summary Get job by ID
// @Description Retrieves a job by its ID
// @Tags jobs
// @Accept json
// @Produce json
// @Param id path string true "Job ID"
// @Success 200 {object} map[string]interface{} "success"
// @Failure 404 {object} map[string]interface{} "error"
// @Router /jobs/{id} [get]
func (h *JobHandler) GetJobByID(c echo.Context) error {
	id := c.Param("id")
	
	var job models.Job
	if err := h.db.Preload("Logs", func(db *gorm.DB) *gorm.DB {
		return db.Order("start_time DESC").Limit(10)
	}).First(&job, "id = ?", id).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"error":   "Job not found",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    job,
	})
}

// GetJobsByProject godoc
// @Summary Get jobs by project ID
// @Description Retrieves all jobs for a specific project
// @Tags jobs
// @Accept json
// @Produce json
// @Param projectId path string true "Project ID"
// @Success 200 {object} map[string]interface{} "success"
// @Router /jobs/project/{projectId} [get]
func (h *JobHandler) GetJobsByProject(c echo.Context) error {
	projectID := c.Param("projectId")
	
	var jobs []models.Job
	if err := h.db.Where("project_id = ?", projectID).Find(&jobs).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Failed to fetch jobs: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    jobs,
	})
}

// CreateJob godoc
// @Summary Create a new job
// @Description Creates a new job
// @Tags jobs
// @Accept json
// @Produce json
// @Param job body models.Job true "Job details"
// @Success 201 {object} map[string]interface{} "success"
// @Failure 400 {object} map[string]interface{} "error"
// @Router /jobs [post]
func (h *JobHandler) CreateJob(c echo.Context) error {
	job := new(models.Job)
	if err := c.Bind(job); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Invalid request data: " + err.Error(),
		})
	}

	// Set default values
	now := time.Now()
	job.CreatedAt = now
	job.UpdatedAt = now
	
	if job.Status == "" {
		job.Status = models.JobStatusIdle
	}
	
	if job.Timezone == "" {
		job.Timezone = "UTC"
	}

	if err := h.db.Create(job).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Failed to create job: " + err.Error(),
		})
	}
	
	// If the job is active, schedule it
	if job.Status != models.JobStatusPaused {
		h.scheduler.ScheduleJob(job)
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"success": true,
		"data":    job,
		"message": "Job created successfully",
	})
}

// UpdateJob godoc
// @Summary Update a job
// @Description Updates an existing job
// @Tags jobs
// @Accept json
// @Produce json
// @Param id path string true "Job ID"
// @Param job body models.Job true "Job details"
// @Success 200 {object} map[string]interface{} "success"
// @Failure 404 {object} map[string]interface{} "error"
// @Router /jobs/{id} [put]
func (h *JobHandler) UpdateJob(c echo.Context) error {
	id := c.Param("id")
	
	var existingJob models.Job
	if err := h.db.First(&existingJob, "id = ?", id).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"error":   "Job not found",
		})
	}

	// Bind the request body to update the job
	updatedJob := new(models.Job)
	if err := c.Bind(updatedJob); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Invalid request data: " + err.Error(),
		})
	}

	// Preserve fields that shouldn't be updated directly
	originalStatus := existingJob.Status
	
	// Update allowed fields
	existingJob.Name = updatedJob.Name
	existingJob.Command = updatedJob.Command
	existingJob.Schedule = updatedJob.Schedule
	existingJob.Description = updatedJob.Description
	existingJob.Status = updatedJob.Status
	existingJob.Timezone = updatedJob.Timezone
	existingJob.UseLocalTime = updatedJob.UseLocalTime
	existingJob.UpdatedAt = time.Now()

	if err := h.db.Save(&existingJob).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Failed to update job: " + err.Error(),
		})
	}
	
	// If schedule or status changed, update the scheduler
	if updatedJob.Schedule != "" || originalStatus != updatedJob.Status {
		h.scheduler.ScheduleJob(&existingJob)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    existingJob,
		"message": "Job updated successfully",
	})
}

// DeleteJob godoc
// @Summary Delete a job
// @Description Deletes an existing job
// @Tags jobs
// @Accept json
// @Produce json
// @Param id path string true "Job ID"
// @Success 200 {object} map[string]interface{} "success"
// @Failure 404 {object} map[string]interface{} "error"
// @Router /jobs/{id} [delete]
func (h *JobHandler) DeleteJob(c echo.Context) error {
	id := c.Param("id")
	
	var job models.Job
	if err := h.db.First(&job, "id = ?", id).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"error":   "Job not found",
		})
	}

	if err := h.db.Delete(&job).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Failed to delete job: " + err.Error(),
		})
	}
	
	// Note: The scheduler will automatically remove the job in its next refresh

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Job deleted successfully",
	})
}

// GetJobLogs godoc
// @Summary Get logs for a job
// @Description Retrieves logs for a specific job
// @Tags jobs
// @Accept json
// @Produce json
// @Param id path string true "Job ID"
// @Success 200 {object} map[string]interface{} "success"
// @Failure 404 {object} map[string]interface{} "error"
// @Router /jobs/{id}/logs [get]
func (h *JobHandler) GetJobLogs(c echo.Context) error {
	jobID := c.Param("id")
	
	var logs []models.JobLog
	if err := h.db.Where("job_id = ?", jobID).Order("start_time DESC").Find(&logs).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Failed to fetch logs: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    logs,
	})
}

// CreateJobLog godoc
// @Summary Create a new log for a job
// @Description Creates a new log entry for a job
// @Tags jobs
// @Accept json
// @Produce json
// @Param id path string true "Job ID"
// @Param log body models.JobLog true "Log details"
// @Success 201 {object} map[string]interface{} "success"
// @Failure 400 {object} map[string]interface{} "error"
// @Router /jobs/{id}/logs [post]
func (h *JobHandler) CreateJobLog(c echo.Context) error {
	jobID := c.Param("id")
	
	// Check if job exists
	var job models.Job
	if err := h.db.First(&job, "id = ?", jobID).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"error":   "Job not found",
		})
	}

	// Bind the log data
	log := new(models.JobLog)
	if err := c.Bind(log); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "Invalid request data: " + err.Error(),
		})
	}

	// Set the job ID
	log.JobID = jobID
	log.CreatedAt = time.Now()

	if err := h.db.Create(log).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "Failed to create log: " + err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"success": true,
		"data":    log,
	})
}
