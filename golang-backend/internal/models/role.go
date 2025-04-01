
package models

import (
	"time"

	"gorm.io/gorm"
)

type Role struct {
	ID          string   `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Name        string   `json:"name" gorm:"type:varchar(50);uniqueIndex;not null"`
	Permissions []string `json:"permissions" gorm:"-"` // Stored as JSON in the database
	PermissionsJSON string `json:"-" gorm:"column:permissions;type:text"`
	CreatedAt   time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
	Users       []User    `json:"users,omitempty" gorm:"foreignKey:RoleID"`
}

func (r *Role) BeforeCreate(tx *gorm.DB) (err error) {
	if r.ID == "" {
		r.ID = generateUUID()
	}
	return
}
