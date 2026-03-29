package models

import (
	"time"

	"gorm.io/gorm"
)

type Sppg struct {
	ID        uint             `gorm:"primaryKey" json:"id"`
	SppgID    string           `gorm:"uniqueIndex;type:varchar(50)" json:"sppg_id"` // Contoh: VMEUI185
	Name      string           `gorm:"not null" json:"name"`
	Location       string             `gorm:"type:text" json:"location"`
	Progress       string             `json:"progress"`                                         // Contoh: "100.00%"
	Media          []SppgMedia        `gorm:"foreignKey:SppgID;references:SppgID" json:"media"` // Relasi One-to-Many
	Infrastructure *SppgInfrastructure `gorm:"foreignKey:SppgID;references:SppgID" json:"infrastructure"`
	Stakeholder    *SppgStakeholder    `gorm:"foreignKey:SppgID;references:SppgID" json:"stakeholder"`
	Readiness      *SppgReadiness      `gorm:"foreignKey:SppgID;references:SppgID" json:"readiness"`
	Fleets         []OperationalFleet `gorm:"foreignKey:SppgID;references:SppgID" json:"fleets"`
	CreatedAt      time.Time          `json:"created_at"`
	UpdatedAt      time.Time          `json:"updated_at"`
	DeletedAt      gorm.DeletedAt     `gorm:"index" json:"-"`
}

type SppgMedia struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	SppgID     string    `gorm:"index;type:varchar(50)" json:"sppg_id"`
	PreviewURL string    `gorm:"type:text" json:"preview_url"`
	MediaType  string    `gorm:"type:varchar(20);default:'image'" json:"media_type"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
