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

	// Data from spreadsheets
	updates := []struct {
		SppgID         string
		InitialCapital float64
		Investors      []struct {
			Name  string
			Share float64
		}
	}{
		{
			SppgID:         "UEML6X5N", // Sleman
			InitialCapital: 250000000,
			Investors: []struct {
				Name  string
				Share float64
			}{{Name: "Abu Ayyub", Share: 100}},
		},
		{
			SppgID:         "EGAVAPDL", // Ngemplak
			InitialCapital: 250000000,
			Investors: []struct {
				Name  string
				Share float64
			}{{Name: "Abu Ayyub", Share: 100}},
		},
		{
			SppgID:         "H7X98XS6", // Pontianak Selatan
			InitialCapital: 250000000,
			Investors: []struct {
				Name  string
				Share float64
			}{{Name: "Raditya", Share: 100}},
		},
		{
			SppgID:         "LPQK8YBH", // Singkawang Tengah
			InitialCapital: 250000000,
			Investors: []struct {
				Name  string
				Share float64
			}{{Name: "Tri", Share: 100}},
		},
		{
			SppgID:         "MEABZPQY", // Tojo Barat
			InitialCapital: 250000000,
			Investors: []struct {
				Name  string
				Share float64
			}{{Name: "Rizal", Share: 100}},
		},
		{
			SppgID:         "C4TPC1C5", // Pamboang
			InitialCapital: 1250000000,
			Investors: []struct {
				Name  string
				Share float64
			}{
				{Name: "Hairil Muhammad", Share: 40},
				{Name: "Muh. Mush'ab", Share: 40},
				{Name: "A. Debbi", Share: 10},
				{Name: "Multazam", Share: 10},
			},
		},
		{
			SppgID:         "VMEUI185", // Jakabaring
			InitialCapital: 250000000,
			Investors: []struct {
				Name  string
				Share float64
			}{{Name: "BSI (Pool)", Share: 100}},
		},
		{
			SppgID:         "BCRG3NFS", // Manggala
			InitialCapital: 250000000,
			Investors: []struct {
				Name  string
				Share float64
			}{{Name: "BSI (Pool)", Share: 100}},
		},
		{
			SppgID:         "LPMWQIT3", // Budong Budong
			InitialCapital: 250000000,
			Investors: []struct {
				Name  string
				Share float64
			}{{Name: "BSI (Pool)", Share: 100}},
		},
	}

	fmt.Println("Starting final data synchronization...")

	for _, up := range updates {
		var kitchen models.Dapur
		if err := db.Where("sppg_id = ?", up.SppgID).First(&kitchen).Error; err == nil {
			// Update Kitchen
			db.Model(&kitchen).Updates(map[string]interface{}{
				"initial_capital": up.InitialCapital,
				"status":          "active",
			})

			// Update/Insert Investors
			// Clear existing to avoid duplicates during this sync
			db.Where("kitchen_id = ?", kitchen.ID).Delete(&models.InvestorParticipant{})
			
			for _, inv := range up.Investors {
				db.Create(&models.InvestorParticipant{
					KitchenID:        kitchen.ID,
					Name:             inv.Name,
					InvestmentAmount: (inv.Share / 100) * up.InitialCapital,
					SharePercentage:  inv.Share,
					SahamRatio:       "75% : 25%", // Default standard
				})
			}
			fmt.Printf("✓ Synced %s (%s)\n", kitchen.Name, up.SppgID)
		} else {
			fmt.Printf("✗ Skip %s: Not found\n", up.SppgID)
		}
	}

	fmt.Println("\nSynchronization completed successfully!")
}
