
package models

import (
	"time"

	"gorm.io/gorm"
)

type JobStatus string

const (
	JobStatusIdle    JobStatus = "idle"
	JobStatusRunning JobStatus = "running"
	JobStatusSuccess JobStatus = "success"
	JobStatusFailed  JobStatus = "failed"
	JobStatusPaused  JobStatus = "paused"
)

type Job struct {
	ID            string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Name          string    `json:"name" gorm:"type:varchar(100);not null"`
	Command       string    `json:"command" gorm:"type:varchar(500);not null"`
	Schedule      string    `json:"schedule" gorm:"type:varchar(100);not null"`
	Description   string    `json:"description" gorm:"type:varchar(500)"`
	Status        JobStatus `json:"status" gorm:"type:varchar(10);default:'idle'"`
	LastRun       time.Time `json:"lastRun" gorm:"default:null"`
	NextRun       time.Time `json:"nextRun" gorm:"default:null"`
	Tags          string    `json:"tags" gorm:"type:varchar(255)"`
	FailCount     int       `json:"failCount" gorm:"default:0"`
	SuccessCount  int       `json:"successCount" gorm:"default:0"`
	ProjectID     string    `json:"projectId" gorm:"type:varchar(36);not null"`
	CreatedAt     time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt     time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
	Timezone      string    `json:"timezone" gorm:"type:varchar(50);default:'UTC'"`
	UseLocalTime  bool      `json:"useLocalTime" gorm:"default:false"`
	Logs          []JobLog  `json:"logs,omitempty" gorm:"foreignKey:JobID"`
	AverageRuntime float64   `json:"averageRuntime" gorm:"-"` // Calculated field
}

func (j *Job) BeforeCreate(tx *gorm.DB) (err error) {
	if j.ID == "" {
		j.ID = generateUUID()
	}
	if j.Status == "" {
		j.Status = JobStatusIdle
	}
	return
}
