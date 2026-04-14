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

type RentalRecord struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	KitchenID uint           `json:"kitchen_id"`
	Date      string         `json:"date"`
	Amount    float64        `json:"amount"`
	Period    string         `json:"period"` // e.g. "2024-04" atau "Minggu 1"
	Status    string         `json:"status"` // PENDING, APPROVED
	Notes     string         `json:"notes"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type ProfitDistribution struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	KitchenID     uint           `json:"kitchen_id"`
	Period        string         `json:"period"`
	TotalPool     float64        `json:"total_pool"`
	InvestorSplit float64        `json:"investor_split"` // Nominal untuk investor
	DPPSplit      float64        `json:"dpp_split"`      // Nominal untuk DPP
	YWMPSplit     float64        `json:"ywmp_split"`     // Nominal untuk YWMP
	IsPostBEP     bool           `json:"is_post_bep"`    // Status saat kalkulasi dilakukan
	Status        string         `json:"status"`         // DRAFT, EXECUTED
	Details       []PayoutDetail `gorm:"foreignKey:DistributionID" json:"details"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type PayoutDetail struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	DistributionID uint           `json:"distribution_id"`
	RecipientName  string         `json:"recipient_name"`
	Role           string         `json:"role"` // INVESTOR, DPP, YWMP, DPD, KOPERASI
	Amount         float64        `json:"amount"`
	Percentage     float64        `json:"percentage"`
	Status         string         `json:"status"` // PENDING, PAID
	RemittanceID   *uint          `json:"remittance_id"`
	Remittance     *Remittance    `gorm:"foreignKey:RemittanceID" json:"remittance"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

type Remittance struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	PayoutID      uint           `json:"payout_id"`
	PaidAt        string         `json:"paid_at"`
	PaymentMethod string         `json:"payment_method"`
	EvidenceURL   string         `json:"evidence_url"`
	Notes         string         `json:"notes"`
	Status        string         `json:"status"` // COMPLETED
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}
