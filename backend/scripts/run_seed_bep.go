package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	dsn := "kassaone:Piblajar2020@tcp(127.0.0.1:3306)/mbg_management?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	content, err := os.ReadFile("seed_bep.sql")
	if err != nil {
		log.Fatal(err)
	}

	queries := strings.Split(string(content), ";")
	for _, query := range queries {
		query = strings.TrimSpace(query)
		if query == "" {
			continue
		}
		_, err := db.Exec(query)
		if err != nil {
			fmt.Printf("Error executing query: %v\nQuery: %s\n", err, query)
		} else {
			fmt.Printf("Executed: %s...\n", query[:30])
		}
	}
	fmt.Println("Seeding completed successfully!")
}
