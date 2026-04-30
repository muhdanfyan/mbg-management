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

	targetSppgs := []string{
		"UEML6X5N", // Sleman
		"EGAVAPDL", // Ngemplak
		"H7X98XS6", // Pontianak Selatan
		"LPQK8YBH", // Singkawang Tengah
		"MEABZPQY", // Tojo Barat
		"C4TPC1C5", // Pamboang
		"VMEUI185", // Jakabaring
		"BCRG3NFS", // Manggala
		"LPMWQIT3", // Budong Budong
	}

	fmt.Println("=== HASIL AUDIT DATABASE vs SPREADSHEET ===\n")

	for _, id := range targetSppgs {
		var kitchen models.Dapur
		err := db.Preload("Investors").Where("sppg_id = ?", id).First(&kitchen).Error
		if err != nil {
			fmt.Printf("[MISSING] ID %s: Tidak ditemukan di database!\n", id)
			continue
		}

		fmt.Printf("[%s] %s\n", id, kitchen.Name)
		fmt.Printf("  - Status: %s\n", kitchen.Status)
		fmt.Printf("  - Modal Awal (Initial Capital): Rp %.0f\n", kitchen.InitialCapital)
		
		if len(kitchen.Investors) > 0 {
			fmt.Println("  - Investor Terdaftar:")
			for _, inv := range kitchen.Investors {
				fmt.Printf("    * %s (Saham: %.2f%%)\n", inv.Name, inv.SharePercentage)
			}
		} else {
			fmt.Println("  - Investor: [BELUM ADA DATA INVESTOR]")
		}
		fmt.Println("")
	}
}
