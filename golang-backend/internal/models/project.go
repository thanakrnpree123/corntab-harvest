
package models

import (
	"time"

	"gorm.io/gorm"
)

type Project struct {
	ID          string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Name        string    `json:"name" gorm:"type:varchar(100);not null"`
	Description string    `json:"description" gorm:"type:varchar(500)"`
	CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
	Jobs        []Job     `json:"jobs,omitempty" gorm:"foreignKey:ProjectID"`
}

func (p *Project) BeforeCreate(tx *gorm.DB) (err error) {
	if p.ID == "" {
		p.ID = generateUUID()
	}
	return
}
