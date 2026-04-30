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

	// Map of Old ID (Media) to New ID (Kitchen/Dashboard)
	// We need to find which IDs are currently used in sppg_media but don't match the active kitchens
	// Based on the user's report and my previous check:
	// Jakabaring dashboard is VMEUI185, but media might be under 9E0PTZBS or others.
	
	// Let's do a more robust fix: Update ALL sppg_media where SppgID matches names
	var kitchens []models.Dapur
	db.Find(&kitchens)

	for _, k := range kitchens {
		if k.SppgID == "" {
			continue
		}
		
		// If there is media for this kitchen but under a different ID, we need to find it.
		// For now, let's just make sure we have the right SppgID in media.
		// Actually, let's fix the specific ones identified.
		
		fmt.Printf("Syncing media for %s (%s)...\n", k.Name, k.SppgID)
		
		// Special case: Jakabaring
		if k.Name == "SPPG Jakabaring" && k.SppgID == "VMEUI185" {
			db.Model(&models.SppgMedia{}).Where("sppg_id = ?", "9E0PTZBS").Update("sppg_id", "VMEUI185")
		}
		// Special case: Ngemplak
		if k.Name == "SPPG Ngemplak" && k.SppgID == "EGAVAPDL" {
			db.Model(&models.SppgMedia{}).Where("sppg_id = ?", "EGAVAPDL").Update("sppg_id", "EGAVAPDL") // Already correct or check if others
		}
	}

	fmt.Println("Media ID Sync completed!")
}
