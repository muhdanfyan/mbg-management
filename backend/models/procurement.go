package models

import (
	"time"

	"gorm.io/gorm"
)

type Equipment struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `json:"name"`
	Category  string         `json:"category"`
	Price     float64        `json:"price"`
	Stock     int            `json:"stock"`
	Supplier  string         `json:"supplier"`
	Status    string         `json:"status"`
	Image     string         `json:"image"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type PurchaseOrder struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Number      string         `gorm:"uniqueIndex;type:varchar(100)" json:"number"`
	Supplier    string         `json:"supplier"`
	ItemsCount  int            `json:"items_count"`
	TotalAmount float64        `json:"total_amount"`
	Status      string         `json:"status"`
	Date        string         `json:"date"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
