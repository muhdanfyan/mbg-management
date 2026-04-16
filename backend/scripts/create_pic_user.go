package main

import (
	"fmt"
	"os"

	"github.com/muhdanfyan/mbg-management/backend/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	dsn := "kassaone:Piblajar2020@tcp(127.0.0.1:3306)/mbg_management?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Printf("Error connecting to DB: %v\n", err)
		os.Exit(1)
	}

	email := "pic.panakkukang@mbg.com"
	password := "mbg12345"
	name := "PIC Dapur Panakkukang"
	kitchenID := uint(1) // Dapur Panakkukang

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	user := models.User{
		ID:         "101", // Custom ID for this user
		Email:      email,
		Password:   string(hashedPassword),
		FullName:   name,
		Role:       "PIC Dapur",
		Department: "Operasional",
		Position:   "Kitchen PIC",
		KitchenID:  &kitchenID,
	}

	var existingUser models.User
	if err := db.Where("email = ?", email).First(&existingUser).Error; err == nil {
		fmt.Printf("User with email %s already exists. Updating kitchen ID...\n", email)
		db.Model(&existingUser).Update("kitchen_id", kitchenID)
	} else {
		if err := db.Create(&user).Error; err != nil {
			fmt.Printf("Error creating user: %v\n", err)
		} else {
			fmt.Printf("Successfully created user: %s (%s) for Kitchen ID %d\n", name, email, kitchenID)
		}
	}
}
