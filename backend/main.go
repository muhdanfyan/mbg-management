package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/muhdanfyan/mbg-management/backend/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var db *gorm.DB

func initDB() {
	// DSN for VPS/Local MySQL
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "kassaone:Piblajar2020@tcp(127.0.0.1:3306)/mbg_management?charset=utf8mb4&parseTime=True&loc=Local"
	}

	var err error
	// Try to connect up to 5 times
	for i := 0; i < 5; i++ {
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			break
		}
		fmt.Printf("Failed to connect database (attempt %d/5): %v\n", i+1, err)
		time.Sleep(3 * time.Second)
	}

	if err != nil {
		fmt.Printf("Fatal: Could not connect to database after 5 attempts: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Successfully connected to database")

	// Auto Migration - Split into chunks to ensure new tables are created even if complex relations fail
	_ = db.AutoMigrate(&models.User{}, &models.Koperasi{}, &models.Department{}, &models.Position{})
	_ = db.AutoMigrate(&models.Sppg{}, &models.SppgMedia{}, &models.SppgInfrastructure{}, &models.SppgStakeholder{}, &models.SppgReadiness{}, &models.OperationalFleet{}, &models.Stakeholder{})
	_ = db.AutoMigrate(&models.Dapur{}, &models.Route{}, &models.InvestorParticipant{}) // Probabilistic fail point
	_ = db.AutoMigrate(&models.Employee{}, &models.Vacancy{}, &models.Applicant{})
	_ = db.AutoMigrate(&models.Contract{}, &models.ProgressUpdate{})
	_ = db.AutoMigrate(&models.Transaction{}, &models.Loan{}, &models.Equipment{}, &models.PurchaseOrder{}, &models.FinancialRecord{})
	
	// New Financial/Sharing Modules (Critical for current task)
	err = db.AutoMigrate(&models.RentalRecord{}, &models.ProfitDistribution{}, &models.PayoutDetail{}, &models.Remittance{})
	if err != nil {
		fmt.Printf("Failed to auto-migrate: %v\n", err)
		// We might still want to continue if some tables exist, but usually failure here is bad
	}

	// Seed Data
	var deptCount int64
	if err := db.Model(&models.Department{}).Count(&deptCount).Error; err == nil && deptCount == 0 {
		depts := []string{"HR", "Finance", "IT", "Production", "Logistics", "Marketing"}
		for _, name := range depts {
			db.Create(&models.Department{Name: name})
		}
	}

	var posCount int64
	if err := db.Model(&models.Position{}).Count(&posCount).Error; err == nil && posCount == 0 {
		positions := []string{"Manager", "Supervisor", "Staff", "Field Officer", "Driver", "Security"}
		for _, name := range positions {
			db.Create(&models.Position{Name: name})
		}
	}

	// Ensure Super Admin exists with correct password
	var adminCount int64
	db.Model(&models.User{}).Where("email = ?", "superadmin@mbg.com").Count(&adminCount)
	
	// Create or Update Super Admin with 'pass123'
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("pass123"), bcrypt.DefaultCost)
	adminUser := models.User{
		ID:         "1",
		Email:      "superadmin@mbg.com",
		Password:   string(hashedPassword),
		FullName:   "Super Admin",
		Role:       "Super Admin",
		Department: "IT",
		Position:   "Administrator",
	}

	if adminCount == 0 {
		db.Create(&adminUser)
	} else {
		db.Model(&models.User{}).Where("email = ?", "superadmin@mbg.com").Updates(models.User{
			Password: string(hashedPassword),
		})
	}

	// Seed PIC Dapur Account
	hashedDapur, _ := bcrypt.GenerateFromPassword([]byte("mbg12345"), bcrypt.DefaultCost)
	dapurUser := models.User{
		ID:         "2",
		Email:      "dapur@mbg.com",
		Password:   string(hashedDapur),
		FullName:   "Demo PIC Dapur",
		Role:       "PIC Dapur",
		Department: "Operasional",
		Position:   "Kitchen Lead",
	}
	var countDapur int64
	db.Model(&models.User{}).Where("email = ?", "dapur@mbg.com").Count(&countDapur)
	if countDapur == 0 {
		db.Create(&dapurUser)
	}

	// Seed Investor Account
	hashedInvestor, _ := bcrypt.GenerateFromPassword([]byte("mbg12345"), bcrypt.DefaultCost)
	investorUser := models.User{
		ID:         "3",
		Email:      "investor@mbg.com",
		Password:   string(hashedInvestor),
		FullName:   "Demo Investor",
		Role:       "Investor",
		Department: "Investment",
		Position:   "Investor",
	}
	var countInvestor int64
	db.Model(&models.User{}).Where("email = ?", "investor@mbg.com").Count(&countInvestor)
	if countInvestor == 0 {
		db.Create(&investorUser)
	}

	// Seed Operator Koperasi Account
	hashedKoperasi, _ := bcrypt.GenerateFromPassword([]byte("mbg12345"), bcrypt.DefaultCost)
	koperasiUser := models.User{
		ID:         "4",
		Email:      "koperasi@mbg.com",
		Password:   string(hashedKoperasi),
		FullName:   "Demo Operator Koperasi",
		Role:       "Operator Koperasi",
		Department: "Audit & Logistik",
		Position:   "Koperasi Lead",
	}
	var countKoperasi int64
	db.Model(&models.User{}).Where("email = ?", "koperasi@mbg.com").Count(&countKoperasi)
	if countKoperasi == 0 {
		db.Create(&koperasiUser)
	}
}

// Middleware to check roles
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role := c.GetHeader("X-User-Role")
		if role == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Role header missing"})
			c.Abort()
			return
		}

		isAllowed := false
		for _, r := range allowedRoles {
			if r == role {
				isAllowed = true
				break
			}
		}

		if !isAllowed {
			c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized role"})
			c.Abort()
			return
		}
		c.Next()
	}
}

func main() {
	initDB()

	r := gin.Default()

	// CORS Middleware (Allow all for development)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong", "version": "v1.0.3-fixed-routes"})
	})

	// --- API Groups ---
	api := r.Group("/api")
	{
		// GET endpoints (Read)
		api.GET("/kitchens", func(c *gin.Context) {
			kitchens := []models.Dapur{}
			db.Preload("Routes").
				Preload("Investors").
				Preload("SppgDetail.Infrastructure").
				Preload("SppgDetail.Stakeholder.Pj").
				Preload("SppgDetail.Stakeholder.Landlord").
				Preload("SppgDetail.Readiness").
				Preload("SppgDetail.Fleets").
				Find(&kitchens)
			c.JSON(http.StatusOK, kitchens)
		})

		api.GET("/contracts", func(c *gin.Context) {
			kitchenID := c.Query("kitchen_id")
			contracts := []models.Contract{}
			q := db.Order("created_at desc")
			if kitchenID != "" {
				// We might need to map Contract to Kitchen via a field or SPPG_ID
				// For now, filtering by kitchen_id if the field exists
				q = q.Where("kitchen_id = ?", kitchenID)
			}
			q.Find(&contracts)
			c.JSON(http.StatusOK, contracts)
		})

		api.GET("/employees", func(c *gin.Context) {
			var emps []models.Employee
			db.Preload("Position").Preload("Department").Find(&emps)
			c.JSON(http.StatusOK, emps)
		})

		api.GET("/financial-records", func(c *gin.Context) {
			kitchenID := c.Query("kitchen_id")
			records := []models.FinancialRecord{}
			q := db.Preload("Dapur").Order("period desc")
			if kitchenID != "" {
				q = q.Where("dapur_id = ?", kitchenID)
			}
			q.Find(&records)
			c.JSON(http.StatusOK, records)
		})

		api.GET("/routes", func(c *gin.Context) {
			var routes []models.Route
			db.Find(&routes)
			c.JSON(http.StatusOK, routes)
		})

		api.GET("/vacancies", func(c *gin.Context) {
			var v []models.Vacancy
			db.Preload("Applicants").Find(&v)
			c.JSON(http.StatusOK, v)
		})

		api.GET("/transactions", func(c *gin.Context) {
			var t []models.Transaction
			db.Find(&t)
			c.JSON(http.StatusOK, t)
		})

		api.GET("/loans", func(c *gin.Context) {
			var l []models.Loan
			db.Find(&l)
			c.JSON(http.StatusOK, l)
		})

		api.GET("/equipment", func(c *gin.Context) {
			kitchenID := c.Query("kitchen_id")
			items := []models.Equipment{}
			q := db.Order("created_at desc")
			if kitchenID != "" {
				q = q.Where("kitchen_id = ?", kitchenID)
			}
			q.Find(&items)
			c.JSON(http.StatusOK, items)
		})

		api.GET("/purchase-orders", func(c *gin.Context) {
			kitchenID := c.Query("kitchen_id")
			orders := []models.PurchaseOrder{}
			q := db.Order("date desc")
			if kitchenID != "" {
				q = q.Where("kitchen_id = ?", kitchenID)
			}
			q.Find(&orders)
			c.JSON(http.StatusOK, orders)
		})

		api.GET("/progress-updates", func(c *gin.Context) {
			var pu []models.ProgressUpdate
			db.Find(&pu)
			c.JSON(http.StatusOK, pu)
		})

		api.GET("/sppgs", func(c *gin.Context) {
			sppgs := []models.Sppg{}
			db.Preload("Media").
				Preload("Infrastructure").
				Preload("Stakeholder.Pj").
				Preload("Stakeholder.Landlord").
				Preload("Readiness").
				Preload("Fleets").
				Find(&sppgs)
			c.JSON(http.StatusOK, sppgs)
		})

		// --- CRUD Endpoints ---

		// Kitchens
		api.POST("/kitchens", func(c *gin.Context) {
			var k models.Dapur
			if err := c.ShouldBindJSON(&k); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON: " + err.Error()})
				return
			}
			if err := db.Create(&k).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create kitchen: " + err.Error()})
				return
			}
			c.JSON(http.StatusOK, k)
		})
		api.PUT("/kitchens/:id", func(c *gin.Context) {
			id := c.Param("id")
			var k models.Dapur
			if err := db.First(&k, id).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Kitchen not found"})
				return
			}
			if err := c.ShouldBindJSON(&k); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON: " + err.Error()})
				return
			}
			// Explicitly save the updated model and catch errors
			if err := db.Save(&k).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update kitchen: " + err.Error()})
				return
			}
			c.JSON(http.StatusOK, k)
		})
		api.DELETE("/kitchens/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&models.Dapur{}, id)
			c.JSON(http.StatusOK, gin.H{"message": "Kitchen deleted"})
		})

		// Routes
		api.POST("/routes", func(c *gin.Context) {
			var r models.Route
			if err := c.ShouldBindJSON(&r); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			db.Create(&r)
			c.JSON(http.StatusOK, r)
		})
		api.PUT("/routes/:id", func(c *gin.Context) {
			id := c.Param("id")
			var r models.Route
			if err := db.First(&r, id).Error; err != nil {
				c.JSON(404, gin.H{"error": "Route not found"})
				return
			}
			c.ShouldBindJSON(&r)
			db.Save(&r)
			c.JSON(http.StatusOK, r)
		})
		api.DELETE("/routes/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&models.Route{}, id)
			c.JSON(http.StatusOK, gin.H{"message": "Route deleted"})
		})

		// HR - Employees
		api.POST("/employees", func(c *gin.Context) {
			var e models.Employee
			if err := c.ShouldBindJSON(&e); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			db.Create(&e)
			c.JSON(http.StatusOK, e)
		})
		api.PUT("/employees/:id", func(c *gin.Context) {
			id := c.Param("id")
			var e models.Employee
			if err := db.First(&e, id).Error; err != nil {
				c.JSON(404, gin.H{"error": "Employee not found"})
				return
			}
			c.ShouldBindJSON(&e)
			db.Save(&e)
			c.JSON(http.StatusOK, e)
		})
		api.DELETE("/employees/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&models.Employee{}, id)
			c.JSON(http.StatusOK, gin.H{"message": "Employee deleted"})
		})

		// Departments
		api.GET("/departments", func(c *gin.Context) {
			var depts []models.Department
			db.Find(&depts)
			c.JSON(http.StatusOK, depts)
		})
		api.POST("/departments", func(c *gin.Context) {
			var d models.Department
			if err := c.ShouldBindJSON(&d); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			db.Create(&d)
			c.JSON(http.StatusOK, d)
		})
		api.DELETE("/departments/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&models.Department{}, id)
			c.JSON(http.StatusOK, gin.H{"message": "Department deleted"})
		})

		// Positions
		api.GET("/positions", func(c *gin.Context) {
			var pos []models.Position
			db.Find(&pos)
			c.JSON(http.StatusOK, pos)
		})
		api.POST("/positions", func(c *gin.Context) {
			var p models.Position
			if err := c.ShouldBindJSON(&p); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			db.Create(&p)
			c.JSON(http.StatusOK, p)
		})
		api.DELETE("/positions/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&models.Position{}, id)
			c.JSON(http.StatusOK, gin.H{"message": "Position deleted"})
		})

		// HR - Vacancies
		api.POST("/vacancies", func(c *gin.Context) {
			var v models.Vacancy
			if err := c.ShouldBindJSON(&v); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			db.Create(&v)
			c.JSON(http.StatusOK, v)
		})
		api.PUT("/vacancies/:id", func(c *gin.Context) {
			id := c.Param("id")
			var v models.Vacancy
			if err := db.First(&v, id).Error; err != nil {
				c.JSON(404, gin.H{"error": "Vacancy not found"})
				return
			}
			c.ShouldBindJSON(&v)
			db.Save(&v)
			c.JSON(http.StatusOK, v)
		})
		api.DELETE("/vacancies/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&models.Vacancy{}, id)
			c.JSON(http.StatusOK, gin.H{"message": "Vacancy deleted"})
		})

		// Construction - Contracts
		api.POST("/contracts", func(c *gin.Context) {
			var ct models.Contract
			if err := c.ShouldBindJSON(&ct); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			db.Create(&ct)
			c.JSON(http.StatusOK, ct)
		})
		api.PUT("/contracts/:id", func(c *gin.Context) {
			id := c.Param("id")
			var ct models.Contract
			if err := db.First(&ct, id).Error; err != nil {
				c.JSON(404, gin.H{"error": "Contract not found"})
				return
			}
			c.ShouldBindJSON(&ct)
			db.Save(&ct)
			c.JSON(http.StatusOK, ct)
		})
		api.DELETE("/contracts/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&models.Contract{}, id)
			c.JSON(http.StatusOK, gin.H{"message": "Contract deleted"})
		})

		// Progress Updates
		api.POST("/progress-updates", func(c *gin.Context) {
			var pu models.ProgressUpdate
			if err := c.ShouldBindJSON(&pu); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			db.Create(&pu)
			c.JSON(http.StatusOK, pu)
		})
		api.PUT("/progress-updates/:id", func(c *gin.Context) {
			id := c.Param("id")
			var pu models.ProgressUpdate
			if err := db.First(&pu, id).Error; err != nil {
				c.JSON(404, gin.H{"error": "Progress Update not found"})
				return
			}
			c.ShouldBindJSON(&pu)
			db.Save(&pu)
			c.JSON(http.StatusOK, pu)
		})
		api.DELETE("/progress-updates/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&models.ProgressUpdate{}, id)
			c.JSON(http.StatusOK, gin.H{"message": "Progress Update deleted"})
		})

		// Procurement - Equipment
		api.POST("/equipment", func(c *gin.Context) {
			var eq models.Equipment
			if err := c.ShouldBindJSON(&eq); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			db.Create(&eq)
			c.JSON(http.StatusOK, eq)
		})
		api.PUT("/equipment/:id", func(c *gin.Context) {
			id := c.Param("id")
			var eq models.Equipment
			if err := db.First(&eq, id).Error; err != nil {
				c.JSON(404, gin.H{"error": "Equipment not found"})
				return
			}
			c.ShouldBindJSON(&eq)
			db.Save(&eq)
			c.JSON(http.StatusOK, eq)
		})
		api.DELETE("/equipment/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&models.Equipment{}, id)
			c.JSON(http.StatusOK, gin.H{"message": "Equipment deleted"})
		})

		// Procurement - POs
		api.POST("/purchase-orders", func(c *gin.Context) {
			var po models.PurchaseOrder
			if err := c.ShouldBindJSON(&po); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			db.Create(&po)
			c.JSON(http.StatusOK, po)
		})
		api.PUT("/purchase-orders/:id", func(c *gin.Context) {
			id := c.Param("id")
			var po models.PurchaseOrder
			if err := db.First(&po, id).Error; err != nil {
				c.JSON(404, gin.H{"error": "Purchase Order not found"})
				return
			}
			c.ShouldBindJSON(&po)
			db.Save(&po)
			c.JSON(http.StatusOK, po)
		})
		api.DELETE("/purchase-orders/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&models.PurchaseOrder{}, id)
			c.JSON(http.StatusOK, gin.H{"message": "Purchase Order deleted"})
		})

		// Transactions CRUD
		api.POST("/transactions", func(c *gin.Context) {
			var t models.Transaction
			if err := c.ShouldBindJSON(&t); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			db.Create(&t)
			c.JSON(http.StatusOK, t)
		})
		api.PUT("/transactions/:id", func(c *gin.Context) {
			id := c.Param("id")
			var t models.Transaction
			if err := db.First(&t, id).Error; err != nil {
				c.JSON(404, gin.H{"error": "Transaction not found"})
				return
			}
			c.ShouldBindJSON(&t)
			db.Save(&t)
			c.JSON(http.StatusOK, t)
		})
		api.DELETE("/transactions/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&models.Transaction{}, id)
			c.JSON(http.StatusOK, gin.H{"message": "Transaction deleted"})
		})

		// Loans CRUD
		api.POST("/loans", func(c *gin.Context) {
			var l models.Loan
			if err := c.ShouldBindJSON(&l); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			db.Create(&l)
			c.JSON(http.StatusOK, l)
		})
		api.PUT("/loans/:id", func(c *gin.Context) {
			id := c.Param("id")
			var l models.Loan
			if err := db.First(&l, id).Error; err != nil {
				c.JSON(404, gin.H{"error": "Loan not found"})
				return
			}
			c.ShouldBindJSON(&l)
			db.Save(&l)
			c.JSON(http.StatusOK, l)
		})
		api.DELETE("/loans/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&models.Loan{}, id)
			c.JSON(http.StatusOK, gin.H{"message": "Loan deleted"})
		})

		// Dashboard & Reports
		api.GET("/dashboard/summary", getDashboardSummary)
		api.GET("/dapur/:id/report", getDapurReport)
		api.GET("/dapur/:id/growth", func(c *gin.Context) {
			id := c.Param("id")
			var records []models.FinancialRecord
			if err := db.Where("dapur_id = ?", id).Order("period asc").Find(&records).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "No records found"})
				return
			}

			type GrowthPoint struct {
				Date      string  `json:"date"`
				Profit    float64 `json:"profit"`
				TotalAcc  float64 `json:"total_acc"`
			}
			var growth []GrowthPoint
			acc := 0.0
			for _, r := range records {
				// We assume investor profit is the metric for BEP
				// Using calculateSplits logic simplified here or just the profit stored
				// For chart, let's use the raw material margin + rental income portion
				payout := r.RentalIncome + r.SelisihBahanBaku 
				acc += payout
				growth = append(growth, GrowthPoint{
					Date:     r.Period.Format("2006-01-02"),
					Profit:   payout,
					TotalAcc: acc,
				})
			}
			c.JSON(http.StatusOK, growth)
		})

		// Authentication
		api.POST("/auth/login", func(c *gin.Context) {
			var login struct {
				Email    string `json:"email"`
				Password string `json:"password"`
			}
			if err := c.ShouldBindJSON(&login); err != nil {
				c.JSON(400, gin.H{"error": "Invalid input"})
				return
			}
			var user models.User
			if err := db.Where("email = ?", login.Email).First(&user).Error; err != nil {
				c.JSON(401, gin.H{"error": "Invalid credentials"})
				return
			}

			// Compare hashed password
			if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(login.Password)); err != nil {
				c.JSON(401, gin.H{"error": "Invalid credentials"})
				return
			}

			c.JSON(http.StatusOK, user)
		})

		// --- Financial Reporting & Audit (Expansion Phase) ---

		// 1. PIC Dapur: Submit Financial Record (10-day termin)
		api.POST("/financial-records", RequireRole("PIC Dapur", "Super Admin"), func(c *gin.Context) {
			var fr models.FinancialRecord
			if err := c.ShouldBindJSON(&fr); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			fr.Status = "PENDING"
			fr.Period = time.Now()
			if err := db.Create(&fr).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create record: " + err.Error()})
				return
			}
			c.JSON(http.StatusOK, fr)
		})

		// 2. Administrator: Approve Financial Record & Update BEP
		api.PUT("/financial-records/:id/approve", RequireRole("Super Admin"), func(c *gin.Context) {
			id := c.Param("id")
			var fr models.FinancialRecord
			if err := db.Preload("Dapur").First(&fr, id).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
				return
			}

			if fr.Status == "APPROVED" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Already approved"})
				return
			}

			// Update status
			fr.Status = "APPROVED"
			db.Save(&fr)

			// Calculate investor portion from this record
			splits := calculateSplits(fr.Dapur, fr)
			investorShare := 0.0
			if val, ok := splits["investor_share"].(float64); ok {
				investorShare = val
			}

			// Update Dapur's Accumulated Profit
			db.Model(&models.Dapur{}).Where("id = ?", fr.DapurID).
				UpdateColumn("accumulated_profit", gorm.Expr("accumulated_profit + ?", investorShare))

			// Check for BEP transition
			var d models.Dapur
			db.First(&d, fr.DapurID)
			if d.InitialCapital > 0 && d.AccumulatedProfit >= d.InitialCapital && d.BEPStatus == "PRE-BEP" {
				// Logic flip: 75:25 -> 25:75, 60:40 -> 40:60
				newInvShare := d.DPPShare
				newDPPShare := d.InvestorShare
				db.Model(&d).Updates(map[string]interface{}{
					"bep_status":     "POST-BEP",
					"investor_share": newInvShare,
					"dpp_share":      newDPPShare,
				})
			}

			c.JSON(http.StatusOK, gin.H{"message": "Approved and BEP updated", "record": fr})
		})

		// 3. Operator Koperasi: Audit Daily Spending
		api.POST("/audit-spending", RequireRole("Operator Koperasi", "Super Admin"), func(c *gin.Context) {
			var input struct {
				DapurID   uint    `json:"dapur_id" binding:"required"`
				Spending  float64 `json:"spending" binding:"required"`
				Portions  int64   `json:"portions" binding:"required"`
				Note      string  `json:"note"`
			}
			if err := c.ShouldBindJSON(&input); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			// Validation: Hard cap of Rp 10,000 / portion
			portionCost := input.Spending / float64(input.Portions)
			if portionCost > 10000 {
				c.JSON(http.StatusBadRequest, gin.H{
					"error":        "Spending exceeds Rp 10,000 per portion cap",
					"portion_cost": portionCost,
				})
				return
			}

			// 1. Save as a transaction for ledger
			transaction := models.Transaction{
				Date:     time.Now().Format("2006-01-02"),
				Type:     "expense",
				Category: "Audit Belanja Bahan",
				Amount:   input.Spending,
				Status:   "Audited",
			}
			db.Create(&transaction)

			// 2. IMPORTANT: Update the FinancialRecord for Profit Sharing
			// We find the latest PENDING record for this kitchen to apply the margin
			var fr models.FinancialRecord
			if err := db.Where("dapur_id = ? AND status = ?", input.DapurID, "PENDING").Order("created_at desc").First(&fr).Error; err == nil {
				// Budget is Portions * 10,000. Margin is Budget - Spending.
				// We update the SelisihBahanBaku to the REAL margin.
				budget := float64(input.Portions) * 10000
				realMargin := budget - input.Spending
				db.Model(&fr).Update("selisih_bahan_baku", realMargin)
			}

			c.JSON(http.StatusOK, gin.H{
				"message":      "Audit successful and margin updated",
				"portion_cost": portionCost,
				"transaction":  transaction,
			})
		})

		// 4. Admin: Trigger SPPG Sync from YWMP JSON data
		api.POST("/sync-sppg", RequireRole("Super Admin"), func(c *gin.Context) {
			err := SyncSppgData(db)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Sync failed: " + err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "SPPG Data synchronized successfully"})
		})

		// User Management
		api.GET("/users", func(c *gin.Context) {
			var users []models.User
			db.Find(&users)
			c.JSON(http.StatusOK, users)
		})

		api.POST("/users", func(c *gin.Context) {
			var input struct {
				models.User
				Password string `json:"password"`
			}
			if err := c.ShouldBindJSON(&input); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			hashed, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
			input.User.Password = string(hashed)

			if err := db.Create(&input.User).Error; err != nil {
				c.JSON(500, gin.H{"error": "Failed to create user"})
				return
			}
			c.JSON(http.StatusOK, input.User)
		})

		api.PUT("/users/:id", func(c *gin.Context) {
			id := c.Param("id")
			var user models.User
			if err := db.First(&user, "id = ?", id).Error; err != nil {
				c.JSON(404, gin.H{"error": "User not found"})
				return
			}

			var input struct {
				FullName   string `json:"full_name"`
				Email      string `json:"email"`
				Role       string `json:"role"`
				Department string `json:"department"`
				Position   string `json:"position"`
				Password   string `json:"password"`
			}
			if err := c.ShouldBindJSON(&input); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			user.FullName = input.FullName
			user.Email = input.Email
			user.Role = input.Role
			user.Department = input.Department
			user.Position = input.Position

			if input.Password != "" {
				hashed, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
				user.Password = string(hashed)
			}

			db.Save(&user)
			c.JSON(http.StatusOK, user)
		})

		api.DELETE("/users/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&models.User{}, "id = ?", id)
			c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
		})

		// Investors Management
		api.GET("/investors", func(c *gin.Context) {
			inv := []models.InvestorParticipant{}
			db.Preload("Kitchen").Find(&inv)
			c.JSON(http.StatusOK, inv)
		})
		api.POST("/investors", func(c *gin.Context) {
			var inv models.InvestorParticipant
			if err := c.ShouldBindJSON(&inv); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			db.Create(&inv)
			c.JSON(http.StatusOK, inv)
		})
		api.DELETE("/investors/:id", func(c *gin.Context) {
			id := c.Param("id")
			db.Delete(&models.InvestorParticipant{}, id)
			c.JSON(http.StatusOK, gin.H{"message": "Investor deleted"})
		})

		// Rental Records
		api.GET("/rental-records", func(c *gin.Context) {
			kitchenID := c.Query("kitchen_id")
			records := []models.RentalRecord{}
			q := db.Order("date desc")
			if kitchenID != "" {
				q = q.Where("kitchen_id = ?", kitchenID)
			}
			q.Find(&records)
			c.JSON(http.StatusOK, records)
		})

		api.POST("/rental-records", func(c *gin.Context) {
			var r models.RentalRecord
			if err := c.ShouldBindJSON(&r); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			if err := db.Create(&r).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, r)
		})

		// Payout Management
		api.POST("/calculate-payout", func(c *gin.Context) {
			var input struct {
				KitchenID uint    `json:"kitchen_id"`
				Pool      float64 `json:"pool"`
				Period    string  `json:"period"`
			}
			if err := c.ShouldBindJSON(&input); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			var d models.Dapur
			if err := db.Preload("Investors").First(&d, input.KitchenID).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Kitchen not found"})
				return
			}

			// Simulation of splits
			res := calculateSplits(d, models.FinancialRecord{
				RentalIncome: input.Pool,
			})
			c.JSON(http.StatusOK, res)
		})

		api.POST("/payouts", func(c *gin.Context) {
			var p models.ProfitDistribution
			if err := c.ShouldBindJSON(&p); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			if err := db.Transaction(func(tx *gorm.DB) error {
				if err := tx.Create(&p).Error; err != nil {
					return fmt.Errorf("failed to create distribution: %w", err)
				}

				// Update Dapur status if needed
				if p.Status == "EXECUTED" {
					var d models.Dapur
					if err := tx.First(&d, p.KitchenID).Error; err != nil {
						return fmt.Errorf("dapur not found for ID %d: %w", p.KitchenID, err)
					}
					
					if err := tx.Model(&d).UpdateColumn("accumulated_profit", gorm.Expr("accumulated_profit + ?", p.InvestorSplit)).Error; err != nil {
						return fmt.Errorf("failed to update accumulated profit: %w", err)
					}
					
					// Check for BEP transition
					if d.InitialCapital > 0 && d.AccumulatedProfit >= d.InitialCapital && d.BEPStatus == "PRE-BEP" {
						// Logic flip: 75:25 -> 25:75, 60:40 -> 40:60
						newInvShare := d.DPPShare
						newDPPShare := d.InvestorShare
						if err := tx.Model(&d).Updates(map[string]interface{}{
							"bep_status":     "POST-BEP",
							"investor_share": newInvShare,
							"dpp_share":      newDPPShare,
						}).Error; err != nil {
							return fmt.Errorf("failed to update BEP status: %w", err)
						}
					}
				}
				return nil
			}); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Payout error: " + err.Error()})
				return
			}
			c.JSON(http.StatusOK, p)
		})

		api.GET("/payouts", func(c *gin.Context) {
			kitchenID := c.Query("kitchen_id")
			payouts := []models.ProfitDistribution{}
			q := db.Preload("Details.Remittance").Order("created_at desc")
			if kitchenID != "" {
				q = q.Where("kitchen_id = ?", kitchenID)
			}
			q.Find(&payouts)
			c.JSON(http.StatusOK, payouts)
		})

		api.PUT("/payout-details/:id/remit", func(c *gin.Context) {
			id := c.Param("id")
			var rem models.Remittance
			if err := c.ShouldBindJSON(&rem); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			if err := db.Transaction(func(tx *gorm.DB) error {
				if err := tx.Create(&rem).Error; err != nil {
					return err
				}
				return tx.Model(&models.PayoutDetail{}).Where("id = ?", id).Updates(map[string]interface{}{
					"status":        "PAID",
					"remittance_id": rem.ID,
				}).Error
			}); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, rem)
		})
	}

	// Serve Static Files - Priority: dist then public
	logoPath := "./dist/logo-wahdah.png"
	if _, err := os.Stat(logoPath); os.IsNotExist(err) {
		if _, err := os.Stat("../public/logo-wahdah.png"); err == nil {
			logoPath = "../public/logo-wahdah.png"
		}
	}
	r.StaticFile("/logo-wahdah.png", logoPath)
	r.StaticFile("/favicon.ico", "./dist/favicon.ico")
	r.Static("/assets", "./dist/assets")
	r.StaticFile("/vite.svg", "./dist/vite.svg")

	r.NoRoute(func(c *gin.Context) {
		c.File("./dist/index.html")
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run("0.0.0.0:" + port)
}

// Helper Functions for SPPG Syncing
func parseMoney(s string) float64 {
	s = strings.ReplaceAll(s, "Rp", "")
	s = strings.ReplaceAll(s, ".", "")
	s = strings.ReplaceAll(s, ",", ".")
	s = strings.ReplaceAll(s, "\n", "")
	s = strings.TrimSpace(s)
	if strings.Contains(s, "tahun") {
		s = strings.Split(s, "per")[0]
		s = strings.TrimSpace(s)
	}
	val, _ := strconv.ParseFloat(s, 64)
	return val
}

func parseArea(s string) float64 {
	parts := strings.Split(s, ":")
	if len(parts) > 1 {
		s = parts[1]
	}
	s = strings.ReplaceAll(s, "m²", "")
	s = strings.ReplaceAll(s, "m2", "")
	s = strings.TrimSpace(s)
	val, _ := strconv.ParseFloat(s, 64)
	return val
}

func parseBankInfo(s string) (bank, number, name string) {
	s = strings.ReplaceAll(s, "\n", " ")
	parts := strings.Fields(s)
	if len(parts) >= 1 {
		bank = parts[0]
	}
	if len(parts) >= 2 {
		number = parts[1]
	}
	if len(parts) >= 3 {
		name = strings.Join(parts[2:], " ")
	}
	return
}

func SyncSppgData(db *gorm.DB) error {
	dataDir := "wadah_merah_putih_data"

	// 1. Sync Titik 49 (Infrastructure & Stakeholders)
	path49 := filepath.Join(dataDir, "data_titik_49.json")
	content49, err := os.ReadFile(path49)
	if err == nil {
		var raw49 []map[string]interface{}
		if err := json.Unmarshal(content49, &raw49); err == nil {
			for _, item := range raw49 {
				sppgID, _ := item["ID SPPG"].(string)
				if sppgID == "" {
					continue
				}
				infra := models.SppgInfrastructure{SppgID: sppgID}
				lahanBangunanVal, _ := item["LAHAN & BANGUNAN"].(string)
				lines := strings.Split(lahanBangunanVal, "\n")
				for _, line := range lines {
					if strings.Contains(strings.ToLower(line), "lahan") {
						infra.LandArea = parseArea(line)
					}
					if strings.Contains(strings.ToLower(line), "bangunan") {
						infra.BuildingArea = parseArea(line)
					}
				}
				infra.BuildingStatus, _ = item["STATUS BANGUNAN DAN LAHAN"].(string)
				aksesJalanVal, _ := item["AKSES JALAN"].(string)
				infra.RoadAccessSize, _ = strconv.ParseFloat(strings.TrimSpace(strings.Split(aksesJalanVal, "meter")[0]), 64)
				infra.AllowedVehicles = strings.ReplaceAll(aksesJalanVal, "\n", " ")
				infra.BuildingCondition, _ = item["KONDISI BANGUNAN"].(string)
				db.Where(models.SppgInfrastructure{SppgID: sppgID}).Assign(infra).FirstOrCreate(&infra)

				// PJ Dapur
				pjName, _ := item["PJ DAPUR"].(string)
				pjPhone, _ := item["WA PJ DAPUR"].(string)
				pjBankRaw, _ := item["REKENING PJ DAPUR"].(string)
				bank, num, accName := parseBankInfo(pjBankRaw)
				var pj models.Stakeholder
				db.Where(models.Stakeholder{Name: pjName, Role: "PJ_DAPUR"}).Assign(models.Stakeholder{
					Phone: pjPhone, BankName: bank, BankAccountNumber: num, BankAccountName: accName,
				}).FirstOrCreate(&pj)

				// Landlord
				llNameRaw, _ := item["PEMILIK BANGUNAN/LAHAN"].(string)
				llName := strings.Split(llNameRaw, "\n")[0]
				llBankRaw, _ := item["REKENING PEMILIK BANGUNAN/LAHAN"].(string)
				lbank, lnum, laccName := parseBankInfo(llBankRaw)
				var landlord models.Stakeholder
				db.Where(models.Stakeholder{Name: llName, Role: "LANDLORD"}).Assign(models.Stakeholder{
					BankName: lbank, BankAccountNumber: lnum, BankAccountName: laccName,
				}).FirstOrCreate(&landlord)

				stake := models.SppgStakeholder{SppgID: sppgID}
				stake.PjID = pj.ID
				stake.LandlordID = landlord.ID
				stake.AnnualRentCost = parseMoney(item["BERAPA"].(string))
				db.Where(models.SppgStakeholder{SppgID: sppgID}).Assign(stake).FirstOrCreate(&stake)
			}
		}
	}

	// 2. Sync Mobil 102 Titik
	pathMobil := filepath.Join(dataDir, "data_mobil_102_titik.json")
	contentMobil, err := os.ReadFile(pathMobil)
	if err == nil {
		var rawMobil []map[string]interface{}
		if err := json.Unmarshal(contentMobil, &rawMobil); err == nil {
			for _, item := range rawMobil {
				sppgID, _ := item["ID SPPG"].(string)
				if sppgID == "" {
					continue
				}
				db.Unscoped().Where("sppg_id = ?", sppgID).Delete(&models.OperationalFleet{})
				if m1, ok := item["MOBIL 1"].(string); ok && m1 != "" {
					db.Create(&models.OperationalFleet{SppgID: sppgID, FleetType: "Mobil 1", VehicleDescription: m1})
				}
				if m2, ok := item["MOBIL 2"].(string); ok && m2 != "" {
					db.Create(&models.OperationalFleet{SppgID: sppgID, FleetType: "Mobil 2", VehicleDescription: m2})
				}
			}
		}
	}

	// 3. Sync Readiness
	for _, f := range []string{"data_running.json", "data_titik_5.json", "data_sppg.json"} {
		path := filepath.Join(dataDir, f)
		content, err := os.ReadFile(path)
		if err == nil {
			var raw []map[string]interface{}
			if err := json.Unmarshal(content, &raw); err == nil {
				for _, item := range raw {
					sppgID, ok := item["ID_SPPG"].(string)
					if !ok {
						sppgID, ok = item["ID SPPG"].(string)
					}
					if !ok || sppgID == "" {
						continue
					}
					readiness := models.SppgReadiness{SppgID: sppgID}
					check := func(key string) bool {
						val, ok := item[key].(string)
						if !ok {
							return false
						}
						return strings.Contains(val, "✅")
					}
					readiness.HasIpal = check("IPAL")
					readiness.HasGas = check("GAS")
					readiness.HasListrik = check("LISTRIK")
					readiness.HasWaterFilter = check("FILTER AIR")
					readiness.HasExhaust = check("EXHAUST FAN")
					readiness.HasHalalCert = check("SERTIFIKAT HALAL")
					runningVal, _ := item["RUNNING"].(string)
					readiness.IsReadyToRun = strings.Contains(runningVal, "✅") || item["KETERANGAN"] == "SIAP RUNNING"
					db.Where(models.SppgReadiness{SppgID: sppgID}).Assign(readiness).FirstOrCreate(&readiness)
				}
			}
		}
	}

	// 4. Sync Photos/Media from foto.txt
	pathFoto := filepath.Join(dataDir, "foto.txt")
	contentFoto, err := os.ReadFile(pathFoto)
	if err == nil {
		var rawFoto struct {
			Data []struct {
				ID_SPPG            string   `json:"ID_SPPG"`
				FOTO_PREVIEW_LINKS []string `json:"FOTO_PREVIEW_LINKS"`
			} `json:"data"`
		}
		if err := json.Unmarshal(contentFoto, &rawFoto); err == nil {
			for _, item := range rawFoto.Data {
				if item.ID_SPPG == "" {
					continue
				}
				db.Unscoped().Where("sppg_id = ?", item.ID_SPPG).Delete(&models.SppgMedia{})
				for _, link := range item.FOTO_PREVIEW_LINKS {
					db.Create(&models.SppgMedia{
						SppgID:     item.ID_SPPG,
						PreviewURL: link,
						MediaType:  "image",
					})
				}
			}
		}
	}

	return nil
}

func getDashboardSummary(c *gin.Context) {
	kitchenID := c.Query("kitchen_id")
	var summary struct {
		TotalIncome          float64 `json:"total_income"`
		TotalExpense         float64 `json:"total_expense"`
		CashFlow             float64 `json:"cash_flow"`
		TotalDapur           int64   `json:"total_dapur"`
		TotalEmployees       int64   `json:"total_employees"`
		ConstructionProgress float64 `json:"construction_progress"`
		TotalSewaNasional    float64 `json:"total_sewa_nasional"`
		TotalPayout          float64 `json:"total_payout"`
	}

	// Calculate from transactions for better accuracy
	var transactions []models.Transaction
	q := db.Model(&models.Transaction{})
	if kitchenID != "" {
		// Note: we might need kitchen_id in Transaction model too, but for summary, 
		// if scoped, we'll filter related records. Assuming Transaction has kitchen_id or similar.
		q = q.Where("kitchen_id = ?", kitchenID)
	}
	q.Find(&transactions)

	for _, t := range transactions {
		if t.Type == "income" {
			summary.TotalIncome += t.Amount
		} else {
			summary.TotalExpense += t.Amount
		}
	}
	summary.CashFlow = summary.TotalIncome - summary.TotalExpense

	// Calculate national rent and payouts
	frQ := db.Model(&models.FinancialRecord{})
	poQ := db.Model(&models.PayoutDetail{})
	if kitchenID != "" {
		frQ = frQ.Where("dapur_id = ?", kitchenID)
		poQ = poQ.Joins("JOIN profit_distributions ON profit_distributions.id = payout_details.distribution_id").Where("profit_distributions.kitchen_id = ?", kitchenID)
	}
	frQ.Select("SUM(rental_income)").Scan(&summary.TotalSewaNasional)
	poQ.Where("payout_details.status = ?", "PAID").Select("SUM(payout_details.amount)").Scan(&summary.TotalPayout)

	if kitchenID != "" {
		summary.TotalDapur = 1
	} else {
		db.Model(&models.Dapur{}).Count(&summary.TotalDapur)
	}
	db.Model(&models.Employee{}).Count(&summary.TotalEmployees)

	var contracts []models.Contract
	cQ := db.Model(&models.Contract{})
	if kitchenID != "" {
		cQ = cQ.Where("kitchen_id = ?", kitchenID)
	}
	cQ.Find(&contracts)
	if len(contracts) > 0 {
		var totalProgress int
		for _, ct := range contracts {
			totalProgress += ct.Progress
		}
		summary.ConstructionProgress = float64(totalProgress) / float64(len(contracts))
	}

	c.JSON(http.StatusOK, summary)
}

func getDapurReport(c *gin.Context) {
	id := c.Param("id")
	var dapur models.Dapur
	if err := db.Preload("Koperasi").Preload("Investors").First(&dapur, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dapur not found"})
		return
	}

	var latestRecord models.FinancialRecord
	db.Where("dapur_id = ?", id).Order("period desc").First(&latestRecord)

	report := calculateSplits(dapur, latestRecord)
	c.JSON(http.StatusOK, report)
}

func calculateSplits(d models.Dapur, r models.FinancialRecord) gin.H {
	investorPool := 0.0
	dppShareSewa := 0.0
	ywmpShareSewa := 0.0

	// Use investor_share and dpp_share from the Dapur model (updated by BEP logic)
	if d.Type == models.TypeInvestor {
		investorPool = r.RentalIncome * d.InvestorShare
		dppPool := r.RentalIncome * d.DPPShare
		dppShareSewa = dppPool * 0.75
		ywmpShareSewa = dppPool * 0.25
	} else if d.Type == models.TypeBangunSendiri {
		dppShareSewa = float64(r.TotalPortions) * 1600
		ywmpShareSewa = float64(r.TotalPortions) * 400
	}

	// Calculate individual investor payouts
	var investorPayouts []gin.H
	if d.Type == models.TypeInvestor && len(d.Investors) > 0 {
		for _, inv := range d.Investors {
			payout := investorPool * (inv.SharePercentage / 100.0)
			investorPayouts = append(investorPayouts, gin.H{
				"name":             inv.Name,
				"share_percentage": inv.SharePercentage,
				"payout":           payout,
				"saham_ratio":      inv.SahamRatio,
			})
		}
	}

	netSelisih := r.SelisihBahanBaku - 15000000
	if netSelisih < 0 {
		netSelisih = 0
	}

	return gin.H{
		"dapur_id":           d.ID,
		"dapur_name":         d.Name,
		"type":               d.Type,
		"bep_status":         d.BEPStatus,
		"accumulated_profit": d.AccumulatedProfit,
		"initial_capital":    d.InitialCapital,
		"rental_income":      r.RentalIncome,
		"investor_share":     investorPool,
		"investor_payouts":   investorPayouts,
		"dpp_share_sewa":     dppShareSewa,
		"ywmp_share_sewa":    ywmpShareSewa,
		"total_portions":    r.TotalPortions,
		"selisih_bahan_baku": r.SelisihBahanBaku,
		"sisa_bersih":        netSelisih,
		"dpp_share_selisih":  netSelisih * 0.60,
		"dpd_share_selisih":  netSelisih * 0.20,
		"kop_share_selisih":  netSelisih * 0.20,
	}
}
