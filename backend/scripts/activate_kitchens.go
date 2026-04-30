package main

import (
	"fmt"
	"os"

	"github.com/muhdanfyan/mbg-management/backend/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	// Try to get DSN from environment or default to local
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "root:@tcp(127.0.0.1:3306)/mbg_management?charset=utf8mb4&parseTime=True&loc=Local"
	}
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}

	targetSppgIDs := []string{
		"BCRG3NFS",
		"H7X98XS6",
		"MEABZPQY",
		"LPMWQIT3",
		"C4TPC1C5",
		"LPQK8YBH",
		"UEML6X5N",
		"VMEUI185",
		"EGAVAPDL",
	}

	for _, id := range targetSppgIDs {
		var kitchen models.Dapur
		result := db.Where("sppg_id = ?", id).First(&kitchen)
		if result.Error != nil {
			fmt.Printf("Kitchen with SPPG ID %s not found in DB\n", id)
			continue
		}

		// Update status to OPERATIONAL
		db.Model(&kitchen).Update("status", "active")
		fmt.Printf("Updated %s (%s) to OPERATIONAL\n", id, kitchen.Name)
	}

	fmt.Println("Activation completed!")
}
