package models

import (
	"time"

	"gorm.io/gorm"
)

// SppgInfrastructure menyimpan dimensi fisik dan properti tanah
type SppgInfrastructure struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	SppgID            string         `gorm:"uniqueIndex;type:varchar(50)" json:"sppg_id"`
	LandArea          float64        `json:"land_area"`     // m2
	BuildingArea      float64        `json:"building_area"` // m2
	BuildingStatus    string         `json:"building_status"` // Sewa / Bangun Sendiri
	RoadAccessSize    float64        `json:"road_access_size"` // meter
	AllowedVehicles   string         `json:"allowed_vehicles"` // e.g. "Pick up, Truk sedang"
	BuildingCondition string         `json:"building_condition"` // Renovasi / Baru
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
}

// Stakeholder menyimpan data personal & finansial pihak ketiga (PJ, Pemilik Lahan, dsb)
type Stakeholder struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	Name              string         `gorm:"not null" json:"name"`
	Phone             string         `json:"phone"`
	Role              string         `json:"role"` // e.g. "PJ_DAPUR", "LANDLORD"
	BankName          string         `json:"bank_name"`
	BankAccountNumber string         `json:"bank_account_number"`
	BankAccountName   string         `json:"bank_account_name"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
}

// SppgStakeholder menyimpan parameter penyaluran pencairan tunjangan
type SppgStakeholder struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	SppgID         string         `gorm:"uniqueIndex;type:varchar(50)" json:"sppg_id"`
	PjID           uint           `json:"pj_id"`
	Pj             Stakeholder    `gorm:"foreignKey:PjID" json:"pj"`
	LandlordID     uint           `json:"landlord_id"`
	Landlord       Stakeholder    `gorm:"foreignKey:LandlordID" json:"landlord"`
	AnnualRentCost float64        `json:"annual_rent_cost"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

// OperationalFleet menyimpan logistik armada
type OperationalFleet struct {
	ID                 uint           `gorm:"primaryKey" json:"id"`
	SppgID             string         `gorm:"index;type:varchar(50)" json:"sppg_id"`
	FleetType          string         `json:"fleet_type"` // Mobil 1 / Mobil 2
	VehicleDescription string         `json:"vehicle_description"` // mis. "SUZUKI CARRY (DP 8652 YX)"
	PhotoMediaID       string         `json:"photo_media_id"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
}

// SppgReadiness menyimpan checklist persiapan operasi
type SppgReadiness struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	SppgID         string         `gorm:"uniqueIndex;type:varchar(50)" json:"sppg_id"`
	HasIpal        bool           `json:"has_ipal"`
	HasGas         bool           `json:"has_gas"`
	HasListrik     bool           `json:"has_listrik"`
	HasWaterFilter bool           `json:"has_water_filter"`
	HasExhaust     bool           `json:"has_exhaust"`
	HasHalalCert   bool           `json:"has_halal_cert"`
	IsReadyToRun   bool           `json:"is_ready_to_run"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}
