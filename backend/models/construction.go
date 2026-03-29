package models

import (
	"time"

	"gorm.io/gorm"
)

type Contract struct {
	ID            uint             `gorm:"primaryKey" json:"id"`
	Number        string           `gorm:"uniqueIndex;type:varchar(100)" json:"number"`
	ProjectName   string           `json:"project_name"`
	SppgID        string           `gorm:"index;type:varchar(50)" json:"sppg_id"`
	VendorName    string           `json:"vendor_name"`
	Vendor        string           `json:"vendor"`
	Kitchen       string           `json:"kitchen"`
	Value         float64          `json:"value"`
	TotalValue    float64          `json:"total_value"`
	Progress      int              `json:"progress"`
	Status        string           `json:"status"`
	PaymentStatus string           `json:"payment_status"`
	StartDate     string           `json:"start_date"`
	EndDate       string           `json:"end_date"`
	Updates       []ProgressUpdate `gorm:"foreignKey:ContractID" json:"updates"`
	CreatedAt     time.Time        `json:"created_at"`
	UpdatedAt     time.Time        `json:"updated_at"`
	DeletedAt     gorm.DeletedAt   `gorm:"index" json:"-"`
}

type ProgressUpdate struct {
	ID                 uint           `gorm:"primaryKey" json:"id"`
	ContractID         uint           `json:"contract_id"`
	TaskName           string         `json:"task_name"`
	Description        string         `json:"description"`
	Date               string         `json:"date"`
	ProgressPercentage int            `json:"progress_percentage"`
	PhotoURL           string         `json:"photo_url"`
	Percentage         int            `json:"percentage"` // fallback
	Notes              string         `json:"notes"`      // fallback
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
}
