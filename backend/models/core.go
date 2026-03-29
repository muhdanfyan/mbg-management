package models

import (
	"time"

	"gorm.io/gorm"
)

type FinancialRecord struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	DapurID          uint           `json:"dapur_id"`
	Dapur            Dapur          `gorm:"foreignKey:DapurID" json:"dapur"`
	Period           time.Time      `json:"period"`
	TotalPortions    int64          `json:"total_portions"`
	RentalIncome     float64        `json:"rental_income"`
	SelisihBahanBaku float64        `json:"selisih_bahan_baku"`
	Status           string         `json:"status"` // PENDING, APPROVED
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}
