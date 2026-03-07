package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var db *gorm.DB

func initDB() {
	// DSN: user:password@tcp(127.0.0.1:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local
	dsn := "kassaone:Piblajar2020@tcp(103.191.92.247:3306)/mbg_management?charset=utf8mb4&parseTime=True&loc=Local"
	var err error
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Auto Migration
	db.AutoMigrate(&Dapur{}, &Koperasi{}, &FinancialRecord{})
}

func main() {
	initDB()

	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	// Financial Logic Endpoints
	r.GET("/api/dashboard/summary", getDashboardSummary)
	r.GET("/api/dapur/:id/report", getDapurReport)

	r.Run(":8080")
}

type DashboardSummary struct {
	TotalNationalIncome float64 `json:"total_national_income"`
	TotalSewa           float64 `json:"total_sewa"`
	TotalSelisih        float64 `json:"total_selisih"`
}

func getDashboardSummary(c *gin.Context) {
	var records []FinancialRecord
	db.Find(&records)

	var summary DashboardSummary
	for _, rec := range records {
		summary.TotalSewa += rec.RentalIncome
		summary.TotalSelisih += rec.SelisihBahanBaku
	}
	summary.TotalNationalIncome = summary.TotalSewa + summary.TotalSelisih

	c.JSON(http.StatusOK, summary)
}

func getDapurReport(c *gin.Context) {
	id := c.Param("id")
	var dapur Dapur
	if err := db.Preload("Koperasi").First(&dapur, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dapur not found"})
		return
	}

	var latestRecord FinancialRecord
	db.Where("dapur_id = ?", id).Order("period desc").First(&latestRecord)

	// Business Logic for Splits
	report := calculateSplits(dapur, latestRecord)

	c.JSON(http.StatusOK, report)
}

type FinancialReport struct {
	DapurName     string  `json:"dapur_name"`
	Type          string  `json:"type"`
	RentalIncome  float64 `json:"rental_income"`
	InvestorShare float64 `json:"investor_share"`
	DPPShareSewa  float64 `json:"dpp_share_sewa"`
	YWMPShareSewa float64 `json:"ywmp_share_sewa"`

	SelisihBahanBaku float64 `json:"selisih_bahan_baku"`
	SisaBersih       float64 `json:"sisa_bersih"`
	DPPShareSelisih  float64 `json:"dpp_share_selisih"`
	DPDShareSelisih  float64 `json:"dpd_share_selisih"`
	KopShareSelisih  float64 `json:"kop_share_selisih"`
}

func calculateSplits(d Dapur, r FinancialRecord) FinancialReport {
	report := FinancialReport{
		DapurName:        d.Name,
		Type:             string(d.Type),
		RentalIncome:     r.RentalIncome,
		SelisihBahanBaku: r.SelisihBahanBaku,
	}

	// 1. Sewa Split
	if d.Type == TypeInvestor {
		// e.g., 60:40 or 75:25
		investorPart := r.RentalIncome * d.InvestorShare
		dppPool := r.RentalIncome * d.DPPShare

		report.InvestorShare = investorPart
		report.DPPShareSewa = dppPool * 0.75
		report.YWMPShareSewa = dppPool * 0.25
	} else if d.Type == TypeBangunSendiri {
		// Rp 2.000 / portion split 1600:400
		report.DPPShareSewa = float64(r.TotalPortions) * 1600
		report.YWMPShareSewa = float64(r.TotalPortions) * 400
		report.InvestorShare = 0
	}

	// 2. Selisih split (Net after 15M deduction)
	netSelisih := r.SelisihBahanBaku - 15000000
	if netSelisih < 0 {
		netSelisih = 0
	}
	report.SisaBersih = netSelisih
	report.DPPShareSelisih = netSelisih * 0.60
	report.DPDShareSelisih = netSelisih * 0.20
	report.KopShareSelisih = netSelisih * 0.20

	return report
}
