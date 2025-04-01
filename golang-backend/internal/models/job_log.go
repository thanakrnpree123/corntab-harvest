
package models

import (
	"time"

	"gorm.io/gorm"
)

type JobLog struct {
	ID        string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
	JobID     string    `json:"jobId" gorm:"type:varchar(36);not null"`
	Status    JobStatus `json:"status" gorm:"type:varchar(10);not null"`
	StartTime time.Time `json:"startTime" gorm:"not null"`
	EndTime   time.Time `json:"endTime"`
	Duration  float64   `json:"duration"` // in seconds
	Output    string    `json:"output" gorm:"type:text"`
	Error     string    `json:"error" gorm:"type:text"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

func (l *JobLog) BeforeCreate(tx *gorm.DB) (err error) {
	if l.ID == "" {
		l.ID = generateUUID()
	}
	return
}
