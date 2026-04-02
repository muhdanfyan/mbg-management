package models

import (
	"time"

	"gorm.io/gorm"
)

type DapurType string

const (
	TypeInvestor      DapurType = "INVESTOR"
	TypeBangunSendiri DapurType = "BANGUN_SENDIRI"
)

type Dapur struct {
	ID              uint                  `gorm:"primaryKey" json:"id"`
	Name            string                `gorm:"not null" json:"name"`
	Type            DapurType             `gorm:"not null;type:varchar(50)" json:"type"`
	Address         string                `json:"address"`
	Lat             float64               `json:"lat"`
	Lng             float64               `json:"lng"`
	Capacity        int                   `json:"capacity"`
	Status          string                `json:"status"`
	Region          string                `json:"region"`
	InvestorShare   float64               `json:"investor_share"` // ratio, e.g. 0.60
	DPPShare        float64               `json:"dpp_share"`      // ratio, e.g. 0.40
	DailyRentalRate   float64               `gorm:"default:6000000" json:"daily_rental_rate"`
	PortionCount      int64                 `json:"portion_count"`
	PortionTarget     int64                 `json:"portion_target"`
	InitialCapital    float64               `json:"initial_capital"`
	AccumulatedProfit float64               `gorm:"default:0" json:"accumulated_profit"`
	BEPStatus         string                `gorm:"default:'PRE-BEP';type:varchar(50)" json:"bep_status"`
	KoperasiID        uint                  `json:"koperasi_id"`
	Koperasi        Koperasi              `gorm:"foreignKey:KoperasiID" json:"koperasi"`
	Investors       []InvestorParticipant `gorm:"foreignKey:KitchenID" json:"investors"`
	Routes          []Route               `gorm:"foreignKey:KitchenID" json:"routes"`
	SppgID          string                `gorm:"type:varchar(50);index" json:"sppg_id"`
	SppgDetail      *Sppg                  `gorm:"foreignKey:SppgID;references:SppgID" json:"sppg_detail"`
	CreatedAt       time.Time             `json:"created_at"`
	UpdatedAt       time.Time             `json:"updated_at"`
	DeletedAt       gorm.DeletedAt        `gorm:"index" json:"-"`
}

type InvestorParticipant struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	KitchenID        uint           `json:"kitchen_id"`
	Kitchen          Dapur          `gorm:"foreignKey:KitchenID" json:"kitchen"`
	Name             string         `json:"name"` // Peserta
	InvestmentAmount float64        `json:"investment_amount"`
	SharePercentage  float64        `json:"share_percentage"` // e.g. 68.00
	SahamRatio       string         `json:"saham_ratio"`      // e.g. "75% : 25%"
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

type Koperasi struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	Address   string         `json:"address"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Route struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	KitchenID uint           `json:"kitchen_id"`
	RouteName string         `json:"route_name"`
	Vehicle   string         `json:"vehicle"`
	Driver    string         `json:"driver"`
	Status    string         `json:"status"`
	ETA       string         `json:"eta"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
