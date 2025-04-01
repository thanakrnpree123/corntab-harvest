
package scheduler

import (
	"fmt"
	"sync"
	"time"
	
	"github.com/robfig/cron/v3"
	"gorm.io/gorm"
	
	"crontab/internal/models"
	"crontab/pkg/logger"
)

// Scheduler manages cron jobs in the system
type Scheduler struct {
	cron      *cron.Cron
	db        *gorm.DB
	logger    *logger.Logger
	jobIDs    map[string]cron.EntryID
	mutex     sync.Mutex
	isRunning bool
}

// New creates a new Scheduler instance
func New(db *gorm.DB, logger *logger.Logger) *Scheduler {
	cronOptions := cron.WithSeconds()
	return &Scheduler{
		cron:      cron.New(cronOptions),
		db:        db,
		logger:    logger,
		jobIDs:    make(map[string]cron.EntryID),
		isRunning: false,
	}
}

// Start initializes and starts the scheduler
func (s *Scheduler) Start() {
	s.logger.Info("Starting scheduler")
	
	// Load all active jobs from database
	s.LoadJobs()
	
	// Start the cron scheduler
	s.cron.Start()
	s.isRunning = true
	
	s.logger.Info("Scheduler started successfully")
	
	// Check for new or updated jobs periodically
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()
	
	for range ticker.C {
		s.RefreshJobs()
	}
}

// Stop stops the scheduler
func (s *Scheduler) Stop() {
	if !s.isRunning {
		return
	}
	
	s.logger.Info("Stopping scheduler")
	s.cron.Stop()
	s.isRunning = false
}

// LoadJobs loads all active jobs from the database
func (s *Scheduler) LoadJobs() {
	var jobs []models.Job
	
	// Get jobs that aren't paused
	result := s.db.Where("status != ?", models.JobStatusPaused).Find(&jobs)
	if result.Error != nil {
		s.logger.Error("Failed to load jobs: %v", result.Error)
		return
	}
	
	s.logger.Info("Loading %d jobs from database", len(jobs))
	
	for _, job := range jobs {
		s.ScheduleJob(&job)
	}
}

// RefreshJobs checks for new or updated jobs in the database
func (s *Scheduler) RefreshJobs() {
	s.logger.Debug("Refreshing job schedules")
	
	var jobs []models.Job
	
	// Get all jobs
	result := s.db.Find(&jobs)
	if result.Error != nil {
		s.logger.Error("Failed to refresh jobs: %v", result.Error)
		return
	}
	
	s.mutex.Lock()
	defer s.mutex.Unlock()
	
	// Track which jobs should remain scheduled
	activeJobs := make(map[string]bool)
	
	for _, job := range jobs {
		if job.Status != models.JobStatusPaused {
			activeJobs[job.ID] = true
			
			// If it's not scheduled, add it
			if _, exists := s.jobIDs[job.ID]; !exists {
				s.scheduleJobInternal(&job)
			}
		} else {
			// If it's paused but scheduled, remove it
			if entryID, exists := s.jobIDs[job.ID]; exists {
				s.cron.Remove(entryID)
				delete(s.jobIDs, job.ID)
				s.logger.Debug("Removed paused job from scheduler: %s", job.Name)
			}
		}
	}
	
	// Remove jobs that no longer exist or are paused
	for jobID := range s.jobIDs {
		if !activeJobs[jobID] {
			if entryID, exists := s.jobIDs[jobID]; exists {
				s.cron.Remove(entryID)
				delete(s.jobIDs, jobID)
				s.logger.Debug("Removed job from scheduler: %s", jobID)
			}
		}
	}
}

// ScheduleJob adds a job to the scheduler
func (s *Scheduler) ScheduleJob(job *models.Job) {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	
	s.scheduleJobInternal(job)
}

// scheduleJobInternal is the internal implementation of ScheduleJob (not thread-safe)
func (s *Scheduler) scheduleJobInternal(job *models.Job) {
	// Remove existing job if it's already scheduled
	if entryID, exists := s.jobIDs[job.ID]; exists {
		s.cron.Remove(entryID)
		delete(s.jobIDs, job.ID)
	}
	
	// Only schedule if the job isn't paused
	if job.Status == models.JobStatusPaused {
		s.logger.Debug("Skipping scheduling of paused job: %s", job.Name)
		return
	}
	
	// Create a job executor with appropriate timezone
	jobFn := s.createJobExecutor(job)
	
	// Schedule the job
	entryID, err := s.cron.AddFunc(job.Schedule, jobFn)
	if err != nil {
		s.logger.Error("Failed to schedule job %s: %v", job.Name, err)
		return
	}
	
	// Store the entry ID for future reference
	s.jobIDs[job.ID] = entryID
	s.logger.Info("Scheduled job: %s with schedule %s", job.Name, job.Schedule)
	
	// Update the next run time in the database
	entry := s.cron.Entry(entryID)
	if !entry.Next.IsZero() {
		s.db.Model(&models.Job{}).Where("id = ?", job.ID).Update("next_run", entry.Next)
	}
}

// createJobExecutor returns a function that executes the job
func (s *Scheduler) createJobExecutor(job *models.Job) func() {
	return func() {
		s.executeJob(job.ID)
	}
}

// executeJob runs a job and records its result
func (s *Scheduler) executeJob(jobID string) {
	var job models.Job
	if err := s.db.First(&job, "id = ?", jobID).Error; err != nil {
		s.logger.Error("Failed to find job %s: %v", jobID, err)
		return
	}
	
	// Create a new log entry
	jobLog := models.JobLog{
		JobID:     job.ID,
		StartTime: time.Now(),
		Status:    models.JobStatusRunning,
	}
	
	// Start by marking job as running
	s.db.Model(&job).Updates(map[string]interface{}{
		"status":   models.JobStatusRunning,
		"last_run": jobLog.StartTime,
	})
	
	// Save initial log
	if err := s.db.Create(&jobLog).Error; err != nil {
		s.logger.Error("Failed to create job log for %s: %v", job.Name, err)
	}
	
	s.logger.Info("Executing job: %s (%s)", job.Name, job.ID)
	
	// Execute the command (this is simplified - in a real system you'd use os/exec or similar)
	output, err := s.runCommand(job.Command)
	
	// Record end time and calculate duration
	jobLog.EndTime = time.Now()
	jobLog.Duration = jobLog.EndTime.Sub(jobLog.StartTime).Seconds()
	jobLog.Output = output
	
	// Update status based on result
	if err != nil {
		jobLog.Status = models.JobStatusFailed
		jobLog.Error = err.Error()
		
		// Update job in db
		s.db.Model(&job).Updates(map[string]interface{}{
			"status":      models.JobStatusFailed,
			"fail_count":  gorm.Expr("fail_count + 1"),
		})
		
		s.logger.Error("Job failed: %s - %v", job.Name, err)
	} else {
		jobLog.Status = models.JobStatusSuccess
		
		// Update job in db
		s.db.Model(&job).Updates(map[string]interface{}{
			"status":         models.JobStatusIdle,
			"success_count":  gorm.Expr("success_count + 1"),
		})
		
		s.logger.Info("Job completed successfully: %s", job.Name)
	}
	
	// Update log entry
	s.db.Save(&jobLog)
	
	// Calculate and update average runtime
	var avgRuntime float64
	s.db.Model(&models.JobLog{}).
		Where("job_id = ? AND status = ?", job.ID, models.JobStatusSuccess).
		Select("AVG(duration)").
		Scan(&avgRuntime)
	
	s.db.Model(&job).Update("average_runtime", avgRuntime)
	
	// Update the next run time
	if entryID, exists := s.jobIDs[job.ID]; exists {
		entry := s.cron.Entry(entryID)
		if !entry.Next.IsZero() {
			s.db.Model(&job).Update("next_run", entry.Next)
		}
	}
}

// runCommand simulates running a command (in a real app, this would use os/exec)
func (s *Scheduler) runCommand(command string) (string, error) {
	// This is a simplified simulation
	s.logger.Debug("Simulating command execution: %s", command)
	
	// Simulate success most of the time, occasional failure
	if time.Now().Unix()%10 == 0 {
		return "", fmt.Errorf("simulated command failure")
	}
	
	time.Sleep(time.Duration(100+time.Now().UnixNano()%1000) * time.Millisecond)
	return fmt.Sprintf("Command executed successfully: %s", command), nil
}
