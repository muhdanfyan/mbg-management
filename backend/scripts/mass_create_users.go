package main

import (
	"fmt"
	"os"
	"regexp"
	"strings"

	"github.com/muhdanfyan/mbg-management/backend/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func sanitize(s string) string {
	s = strings.ToLower(s)
	reg, _ := regexp.Compile("[^a-z0-9]+")
	return reg.ReplaceAllString(s, "")
}

func main() {
	dsn := "kassaone:Piblajar2020@tcp(127.0.0.1:3306)/mbg_management?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Printf("Error connecting to DB: %v\n", err)
		os.Exit(1)
	}

	var kitchens []models.Dapur
	db.Find(&kitchens)

	fmt.Printf("Found %d kitchens. Generating users...\n", len(kitchens))

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("mbg12345"), bcrypt.DefaultCost)
	passStr := string(hashedPassword)

	picCount := 0
	kopCount := 0

	for _, k := range kitchens {
		cleanName := sanitize(k.Name)
		kID := k.ID

		// 1. Create PIC User
		picEmail := fmt.Sprintf("pic.%s@mbg.com", cleanName)
		picUser := models.User{
			ID:         fmt.Sprintf("K%d_PIC", kID),
			Email:      picEmail,
			Password:   passStr,
			FullName:   fmt.Sprintf("PIC %s", k.Name),
			Role:       "PIC Dapur",
			Department: "Operasional",
			Position:   "Kitchen PIC",
			KitchenID:  &kID,
		}

		if err := db.Where("email = ?", picEmail).First(&models.User{}).Error; err != nil {
			if err := db.Create(&picUser).Error; err == nil {
				picCount++
			}
		}

		// 2. Create Koperasi User
		kopEmail := fmt.Sprintf("kop.%s@mbg.com", cleanName)
		kopUser := models.User{
			ID:         fmt.Sprintf("K%d_KOP", kID),
			Email:      kopEmail,
			Password:   passStr,
			FullName:   fmt.Sprintf("Operator Koperasi %s", k.Name),
			Role:       "Operator Koperasi",
			Department: "Audit & Logistik",
			Position:   "Unit Auditor",
			KitchenID:  &kID,
		}

		if err := db.Where("email = ?", kopEmail).First(&models.User{}).Error; err != nil {
			if err := db.Create(&kopUser).Error; err == nil {
				kopCount++
			}
		}
	}

	fmt.Printf("Success! Created %d PIC users and %d Koperasi users.\n", picCount, kopCount)
	fmt.Println("Total new users added to database.")
}
