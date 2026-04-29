package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

type Employee struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Number       string         `gorm:"uniqueIndex;type:varchar(100)" json:"number"`
	Name         string         `json:"name"`
	PositionID   uint           `json:"position_id"`
	Position     Position       `gorm:"foreignKey:PositionID" json:"position_detail"`
	DepartmentID uint           `json:"department_id"`
	Department   Department     `gorm:"foreignKey:DepartmentID" json:"department_detail"`
	KitchenID    *uint          `json:"kitchen_id"`
	Kitchen      Dapur          `gorm:"foreignKey:KitchenID" json:"kitchen_detail"`
	// Keeping these for legacy/simple display if needed, but we'll use IDs
	PositionName   string    `gorm:"column:position" json:"position"` 
	DepartmentName string    `gorm:"column:department" json:"department"`
	HireDate       string    `json:"hire_date"`
	Salary         float64   `json:"salary"`
	Status         string    `json:"status"`
	Photo          string    `json:"photo"` // Emoji or URL
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

type Department struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"uniqueIndex;type:varchar(100)" json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Position struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"uniqueIndex;type:varchar(100)" json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate hook to generate Employee Number
func (e *Employee) BeforeCreate(tx *gorm.DB) (err error) {
	if e.Number == "" {
		var count int64
		tx.Model(&Employee{}).Unscoped().Count(&count)
		year := time.Now().Year()
		e.Number = fmt.Sprintf("EMP-%d-%03d", year, count+1)
	}
	return
}

type Vacancy struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `json:"title"`
	Department  string         `json:"department"`
	Category    string         `json:"category"`
	Type        string         `json:"type"` // Full-time, Part-time, Contract
	Description string         `json:"description"`
	Status      string         `json:"status"`
	Posted      string         `json:"posted"`
	Deadline    string         `json:"deadline"`
	Applicants  []Applicant    `gorm:"foreignKey:VacancyID" json:"applicants_list"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type Applicant struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	VacancyID     uint           `json:"vacancy_id"`
	Name          string         `json:"name"`
	Email         string         `json:"email"`
	Status        string         `json:"status"`
	InterviewDate string         `json:"interview_date"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}
