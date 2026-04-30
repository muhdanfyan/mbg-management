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

	var sppgs []models.Sppg
	db.Preload("Media").Find(&sppgs)

	fmt.Println("SPPG Media Counts:")
	for _, s := range sppgs {
		fmt.Printf("ID: %s, Name: %s, MediaCount: %d\n", s.SppgID, s.Name, len(s.Media))
	}
}
