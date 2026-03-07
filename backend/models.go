package main

import (
	"time"

	"gorm.io/gorm"
)

type DapurType string

const (
	TypeInvestor     DapurType = "INVESTOR"
	TypeBangunSendiri DapurType = "BANGUN_SENDIRI"
)

type Dapur struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	Name              string         `gorm:"size:255;not null" json:"name"`
	Type              DapurType      `gorm:"type:varchar(50);not null" json:"type"`
	InvestorShare     float64        `json:"investor_share"` // e.g., 0.60 or 0.75
	DPPShare          float64        `json:"dpp_share"`      // e.g., 0.40 or 0.25
	DailyRentalRate   float64        `gorm:"default:6000000" json:"daily_rental_rate"`
	PortionCount      int            `json:"portion_count"`
	KoperasiID        uint           `json:"koperasi_id"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

type Koperasi struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"size:255;not null" json:"name"`
	Address   string         `json:"address"`
	Dapurs    []Dapur        `gorm:"foreignKey:KoperasiID" json:"dapurs"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

type FinancialRecord struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	DapurID           uint           `json:"dapur_id"`
	Period            time.Time      `json:"period"` // Month/Year
	TotalPortions     int            `json:"total_portions"`
	
	// Operational (Rp 5.000/portion)
	TotalOperational  float64        `json:"total_operational"`
	RentalIncome      float64        `json:"rental_income"` // Usually 144M
	
	// Bahan Baku (Rp 10.000/portion)
	BudgetBahanBaku   float64        `json:"budget_bahan_baku"`
	ActualBahanBaku   float64        `json:"actual_bahan_baku"`
	SelisihBahanBaku  float64        `json:"selisih_bahan_baku"`
	
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}
