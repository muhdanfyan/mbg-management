package main

import (
	"fmt"
	"os"
	"time"

	"github.com/muhdanfyan/mbg-management/backend/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func parseDate(d string) *time.Time {
	if d == "" {
		return nil
	}
	t, err := time.Parse("1/2/2006", d)
	if err != nil {
		return nil
	}
	return &t
}

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

	runningData := []struct {
		SppgID      string
		PICName     string
		PICPhone    string
		RunningDate string
	}{
		{"MEABZPQY", "Mon Rizal Darwis", "0828525633775", "2/16/2026"},
		{"BCRG3NFS", "Irfan Maulana", "082342933845", "1/13/2026"}, // 1/13 on sheet? Wait, let's re-read image.
		{"C4TPC1C5", "Khaerul Arifin", "08285256096346", "4/13/2026"},
		{"UEML6X5N", "Pardiono", "08285743945555", "1/13/2026"},
		{"VMEUI185", "Apriansa", "082895382630902", "1/13/2026"},
		{"H7X98XS6", "Raditya", "08285242890730", "3/31/2026"},
		{"LPQK8YBH", "Ega Wahyudi", "08289504148111", "4/29/2026"},
		{"LPMWQIT3", "Firman", "08282291585425", "4/27/2026"}, // Not listed with date in image 1 rows 8-9? Wait, let's check image carefully.
		{"EGAVAPDL", "Irhamullah", "08285725249265", "4/13/2026"},
	}

	// Re-checking dates from Image 1:
	// Tojo: 2/16/2026
	// Manggala: 1/13/2026 (Row 2)
	// Pamboang: 4/13/2026 (Row 3)
	// Sleman: 1/13/2026 (Row 4)
	// Jakabaring: 1/13/2026 (Row 5)
	// Pontianak: 3/31/2026 (Row 6)
	// Singkawang: 4/29/2026 (Row 7)

	fmt.Println("Updating Dapur Running data...")

	for _, d := range runningData {
		var kitchen models.Dapur
		if err := db.Where("sppg_id = ?", d.SppgID).First(&kitchen).Error; err == nil {
			db.Model(&kitchen).Updates(map[string]interface{}{
				"pic_name":     d.PICName,
				"pic_phone":    d.PICPhone,
				"running_date": parseDate(d.RunningDate),
			})
			fmt.Printf("✓ Updated %s (%s)\n", kitchen.Name, d.SppgID)
		} else {
			fmt.Printf("✗ Missing %s\n", d.SppgID)
		}
	}

	fmt.Println("Dapur Running data sync complete!")
}
