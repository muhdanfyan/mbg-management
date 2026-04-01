package main

import (
	"fmt"
	"net/http"
	"os"
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

	// Auto Migration
	err = db.AutoMigrate(
		&models.User{}, &models.Dapur{}, &models.Koperasi{}, &models.Route{},
		&models.Sppg{}, &models.SppgMedia{},
		&models.Employee{}, &models.Vacancy{}, &models.Applicant{},
		&models.Contract{}, &models.ProgressUpdate{},
		&models.Transaction{}, &models.Loan{},
		&models.Equipment{}, &models.PurchaseOrder{},
		&models.FinancialRecord{}, &models.InvestorParticipant{},
		&models.SppgInfrastructure{}, &models.SppgStakeholder{},
		&models.SppgReadiness{}, &models.OperationalFleet{},
		&models.Stakeholder{},
		&models.Department{}, &models.Position{},
	)
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
			var kitchens []models.Dapur
			db.Preload("Routes").
				Preload("SppgDetail.Infrastructure").
				Preload("SppgDetail.Stakeholder.Pj").
				Preload("SppgDetail.Stakeholder.Landlord").
				Preload("SppgDetail.Readiness").
				Preload("SppgDetail.Fleets").
				Find(&kitchens)
			c.JSON(http.StatusOK, kitchens)
		})

		api.GET("/routes", func(c *gin.Context) {
			var routes []models.Route
			db.Find(&routes)
			c.JSON(http.StatusOK, routes)
		})

		api.GET("/employees", func(c *gin.Context) {
			var emps []models.Employee
			db.Preload("Position").Preload("Department").Find(&emps)
			c.JSON(http.StatusOK, emps)
		})

		api.GET("/vacancies", func(c *gin.Context) {
			var v []models.Vacancy
			db.Preload("Applicants").Find(&v)
			c.JSON(http.StatusOK, v)
		})

		api.GET("/contracts", func(c *gin.Context) {
			var ct []models.Contract
			db.Preload("Updates").Find(&ct)
			c.JSON(http.StatusOK, ct)
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
			var e []models.Equipment
			db.Find(&e)
			c.JSON(http.StatusOK, e)
		})

		api.GET("/purchase-orders", func(c *gin.Context) {
			var po []models.PurchaseOrder
			db.Find(&po)
			c.JSON(http.StatusOK, po)
		})

		api.GET("/progress-updates", func(c *gin.Context) {
			var pu []models.ProgressUpdate
			db.Find(&pu)
			c.JSON(http.StatusOK, pu)
		})

		api.GET("/sppgs", func(c *gin.Context) {
			var sppgs []models.Sppg
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
			var inv []models.InvestorParticipant
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
	r.Run(":" + port)
}

func getDashboardSummary(c *gin.Context) {
	var summary struct {
		TotalIncome          float64 `json:"total_income"`
		TotalExpense         float64 `json:"total_expense"`
		CashFlow             float64 `json:"cash_flow"`
		TotalDapur           int64   `json:"total_dapur"`
		TotalEmployees       int64   `json:"total_employees"`
		ConstructionProgress float64 `json:"construction_progress"`
	}

	// Calculate from transactions for better accuracy
	var transactions []models.Transaction
	db.Find(&transactions)

	for _, t := range transactions {
		if t.Type == "income" {
			summary.TotalIncome += t.Amount
		} else {
			summary.TotalExpense += t.Amount
		}
	}
	summary.CashFlow = summary.TotalIncome - summary.TotalExpense

	db.Model(&models.Dapur{}).Count(&summary.TotalDapur)
	db.Model(&models.Employee{}).Count(&summary.TotalEmployees)

	var contracts []models.Contract
	db.Find(&contracts)
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
		"dapur_name":         d.Name,
		"type":               d.Type,
		"rental_income":      r.RentalIncome,
		"investor_share":     investorPool,
		"investor_payouts":   investorPayouts,
		"dpp_share_sewa":     dppShareSewa,
		"ywmp_share_sewa":    ywmpShareSewa,
		"selisih_bahan_baku": r.SelisihBahanBaku,
		"sisa_bersih":        netSelisih,
		"dpp_share_selisih":  netSelisih * 0.60,
		"dpd_share_selisih":  netSelisih * 0.20,
		"kop_share_selisih":  netSelisih * 0.20,
	}
}
