
package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Name      string    `json:"name" gorm:"type:varchar(100);not null"`
	Email     string    `json:"email" gorm:"type:varchar(100);uniqueIndex;not null"`
	Password  string    `json:"password,omitempty" gorm:"type:varchar(100);not null"`
	Avatar    string    `json:"avatar" gorm:"type:varchar(255)"`
	RoleID    string    `json:"roleId" gorm:"type:varchar(36);not null"`
	Role      Role      `json:"role,omitempty" gorm:"foreignKey:RoleID"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == "" {
		u.ID = generateUUID()
	}
	return
}
