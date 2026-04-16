package main

import (
	"fmt"
	"os"

	"github.com/muhdanfyan/mbg-management/backend/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	dsn := "kassaone:Piblajar2020@tcp(127.0.0.1:3306)/mbg_management?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}

	var kitchens []models.Dapur
	db.Find(&kitchens)

	fmt.Println("Existing Kitchens:")
	for _, k := range kitchens {
		fmt.Printf("ID: %d, Name: %s\n", k.ID, k.Name)
	}

	if len(kitchens) == 0 {
		fmt.Println("No kitchens found.")
	}
}
