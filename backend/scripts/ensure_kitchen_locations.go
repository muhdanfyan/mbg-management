package main

import (
	"fmt"
	"log"
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

	var kitchens []models.Dapur
	db.Find(&kitchens)

	fmt.Printf("Menganalisis %d titik dapur...\n", len(kitchens))

	count := 0
	for _, k := range kitchens {
		province := k.Province
		city := k.City

		// Jika data masih kosong, coba tentukan dari Region atau Name
		if province == "" || city == "" {
			// Logic sederhana untuk inferensi lokasi dari data yang ada jika koordinat tersedia
			// Namun karena kita sudah punya data CSV yang sangat akurat, kita prioritaskan itu.
			// Untuk data yang "liar" (tidak ada di CSV), kita bersihkan format Region-nya.
			
			if k.Region != "" {
				city = k.Region
				// Default ke Sulawesi Selatan jika tidak diketahui (pusat operasional MBG)
				province = "SULAWESI SELATAN"
			} else if strings.Contains(strings.ToLower(k.Name), "sleman") {
				province = "YOGYAKARTA"
				city = "KABUPATEN SLEMAN"
			} else if strings.Contains(strings.ToLower(k.Name), "makassar") {
				province = "SULAWESI SELATAN"
				city = "KOTA MAKASSAR"
			}
		}

		// Pastikan format rapi (Uppercase)
		province = strings.ToUpper(province)
		city = strings.ToUpper(city)

		if province != "" {
			db.Model(&k).Updates(map[string]interface{}{
				"province": province,
				"city":     city,
				"region":   city,
			})
			count++
		}
	}

	fmt.Printf("Selesai! %d dapur telah disesuaikan lokasi Provinsi & Kabupatennya.\n", count)
}
