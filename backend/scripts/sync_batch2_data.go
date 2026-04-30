package main

import (
	"fmt"
	"os"

	"github.com/muhdanfyan/mbg-management/backend/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "root:@tcp(127.0.0.1:3306)/mbg_management?charset=utf8mb4&parseTime=True&loc=Local"
	}
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}

	// Batch 2 from Spreadsheet 2 (Monitoring Investor)
	updates := []struct {
		SppgID         string
		InitialCapital float64
		Investors      []struct {
			Name  string
			Share float64
		}
	}{
		{
			SppgID:         "0XT0LFKV", // Murhum
			InitialCapital: 1250000000,
			Investors: []struct {
				Name  string
				Share float64
			}{
				{Name: "Yusuf", Share: 68},
				{Name: "Saiful Randi", Share: 28},
				{Name: "Mun. Mush'ab", Share: 4},
			},
		},
		{
			SppgID:         "JJEKQLLO", // Mawasangka Timur
			InitialCapital: 400000000,
			Investors: []struct {
				Name  string
				Share float64
			}{{Name: "Darman", Share: 100}},
		},
		{
			SppgID:         "0AZDNY3K", // Bacukiki
			InitialCapital: 1250000000,
			Investors: []struct {
				Name  string
				Share float64
			}{
				{Name: "Saharuddin", Share: 33.40},
				{Name: "Munir Laise S.Kep", Share: 8.00},
				{Name: "Fahrul Arrawiyan", Share: 8.00},
				{Name: "Darwis", Share: 12.80},
				{Name: "Hasan Basri SKM", Share: 8.00},
				{Name: "Nurbaya", Share: 30.80},
			},
		},
		{
			SppgID:         "RORIFHYC", // Biringbulu
			InitialCapital: 1250000000,
			Investors: []struct {
				Name  string
				Share float64
			}{
				{Name: "Multazam", Share: 72.00},
				{Name: "Nurbaya", Share: 20.00},
				{Name: "Nur Khalik", Share: 8.00},
			},
		},
		{
			SppgID:         "OFJF8V9V", // Tana Lili
			InitialCapital: 1250000000,
			Investors: []struct {
				Name  string
				Share float64
			}{{Name: "Murtoyo", Share: 100}},
		},
		{
			SppgID:         "9QU8GW6O", // Mai Angke
			InitialCapital: 575000000,
			Investors: []struct {
				Name  string
				Share float64
			}{
				{Name: "Juki", Share: 2.40},
				{Name: "Koperasi Ikrah", Share: 4.00},
				{Name: "Abu Zerrin", Share: 12.00},
				{Name: "Sudirman", Share: 4.80},
				{Name: "Andi Mangkau", Share: 2.40},
				{Name: "Wahyu", Share: 12.00},
				{Name: "Muh. Shaban", Share: 1.60},
				{Name: "Didi Haryono", Share: 3.20},
				{Name: "Ramadan", Share: 1.20},
				{Name: "Agustam", Share: 0.80},
				{Name: "DPP", Share: 55.60},
			},
		},
		{
			SppgID:         "X7FYUGVU", // Sendana
			InitialCapital: 215000000,
			Investors: []struct {
				Name  string
				Share float64
			}{
				{Name: "Nasrullah", Share: 0.40},
				{Name: "Kaltara", Share: 2.02},
				{Name: "A. Pahangngan", Share: 2.00},
				{Name: "Mahyudin", Share: 0.80},
				{Name: "Taslim", Share: 0.80},
				{Name: "Firdaus", Share: 0.40},
				{Name: "Muslimin", Share: 0.80},
				{Name: "DPD Palopo", Share: 1.20},
				{Name: "DPP", Share: 91.58},
			},
		},
	}

	fmt.Println("Syncing Batch 2 (Detailed Investors)...")

	for _, up := range updates {
		var kitchen models.Dapur
		if err := db.Where("sppg_id = ?", up.SppgID).First(&kitchen).Error; err == nil {
			db.Model(&kitchen).Updates(map[string]interface{}{
				"initial_capital": up.InitialCapital,
			})
			db.Where("kitchen_id = ?", kitchen.ID).Delete(&models.InvestorParticipant{})
			for _, inv := range up.Investors {
				db.Create(&models.InvestorParticipant{
					KitchenID:        kitchen.ID,
					Name:             inv.Name,
					InvestmentAmount: (inv.Share / 100) * up.InitialCapital,
					SharePercentage:  inv.Share,
					SahamRatio:       "70% : 30%", // Standard ratio from image 2
				})
			}
			fmt.Printf("✓ Updated %s\n", kitchen.Name)
		} else {
			fmt.Printf("✗ Missing %s\n", up.SppgID)
		}
	}

	fmt.Println("Full Synchronization Complete!")
}
