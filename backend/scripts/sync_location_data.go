package main

import (
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"os"
	"strings"

	"github.com/muhdanfyan/mbg-management/backend/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	// Setup Database Connection
	dsn := "root:@tcp(127.0.0.1:3306)/mbg_management?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// AutoMigrate to ensure columns exist
	db.AutoMigrate(&models.Dapur{}, &models.Sppg{})

	// Open CSV file
	file, err := os.Open("../Investor MBG.csv")
	if err != nil {
		log.Fatal("Failed to open CSV:", err)
	}
	defer file.Close()

	reader := csv.NewReader(file)
	// Skip header or empty lines until we find data
	// The CSV structure from previous view:
	// 0: NO, 1: ID SPPG, 2: PROVINSI, 3: KABUPATEN/KOTA, 4: KECAMATAN, ...

	count := 0
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatal(err)
		}

		if len(record) < 4 || record[1] == "" || record[1] == "ID SPPG" {
			continue
		}

		sppgID := strings.TrimSpace(record[1])
		province := strings.TrimSpace(record[2])
		city := strings.TrimSpace(record[3])

		if sppgID == "" || province == "" {
			continue
		}

		fmt.Printf("Updating %s: %s, %s\n", sppgID, province, city)

		// Update Dapur
		db.Model(&models.Dapur{}).Where("sppg_id = ?", sppgID).Updates(map[string]interface{}{
			"province": province,
			"city":     city,
			"region":   city, // Set region to city for backward compatibility
		})

		// Update Sppg
		db.Model(&models.Sppg{}).Where("sppg_id = ?", sppgID).Updates(map[string]interface{}{
			"province": province,
			"city":     city,
			"location": fmt.Sprintf("%s, %s", province, city),
		})

		count++
	}

	fmt.Printf("Successfully synced %d points.\n", count)
}
