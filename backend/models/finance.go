package models

import (
	"time"

	"gorm.io/gorm"
)

type Transaction struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Date      string         `json:"date"`
	Type      string         `json:"type"` // income, expense
	Category  string         `json:"category"`
	Amount    float64        `json:"amount"`
	Status    string         `json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Loan struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	Number           string         `gorm:"uniqueIndex;type:varchar(100)" json:"number"`
	Lender           string         `json:"lender"`
	Amount           float64        `json:"amount"`
	MarginRate       float64        `json:"margin_rate"`
	MonthlyPayment   float64        `json:"monthly_payment"`
	RemainingBalance float64        `json:"remaining_balance"`
	Status           string         `json:"status"`
	StartDate        string         `json:"start_date"`
	EndDate          string         `json:"end_date"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}
