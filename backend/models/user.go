package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID         string         `gorm:"primaryKey;type:varchar(100)" json:"id"`
	Email      string         `gorm:"uniqueIndex;type:varchar(255);not null" json:"email"`
	Password   string         `gorm:"not null" json:"-"`
	FullName   string         `json:"full_name"`
	Role       string         `json:"role"`
	Department string         `json:"department"`
	Position   string         `json:"position"`
	Phone      string         `json:"phone"`
	AvatarURL  string         `json:"avatar_url"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}
