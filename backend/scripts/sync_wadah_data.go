package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/muhdanfyan/mbg-management/backend/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	// DSN for Local MySQL
	dsn := "kassaone:Piblajar2020@tcp(127.0.0.1:3306)/mbg_management?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect database: %v", err)
	}

	dataDir := "../wadah_merah_putih_data"

	// 1. Sync Titik 49 (Infrastructure & Stakeholders)
	syncTitik49(db, filepath.Join(dataDir, "data_titik_49.json"))

	// 2. Sync Mobil 102 Titik (Fleets)
	syncMobil(db, filepath.Join(dataDir, "data_mobil_102_titik.json"))

	// 3. Sync Running & Titik 5 (Readiness)
	syncReadiness(db, filepath.Join(dataDir, "data_running.json"))
	syncReadiness(db, filepath.Join(dataDir, "data_titik_5.json"))
    syncReadiness(db, filepath.Join(dataDir, "data_sppg.json"))

	fmt.Println("Synchronization completed!")
}

func parseMoney(s string) float64 {
	s = strings.ReplaceAll(s, "Rp", "")
	s = strings.ReplaceAll(s, ".", "")
	s = strings.ReplaceAll(s, ",", ".")
    s = strings.ReplaceAll(s, "\n", "")
	s = strings.TrimSpace(s)
    
    // Check if it's per year
    if strings.Contains(s, "tahun") {
        s = strings.Split(s, "per")[0]
        s = strings.TrimSpace(s)
    }

	val, _ := strconv.ParseFloat(s, 64)
	return val
}

func parseArea(s string) float64 {
    // Expected "Lahan : 467 m2" or similar
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

func syncTitik49(db *gorm.DB, path string) {
	fmt.Printf("Syncing Titik 49 from %s...\n", path)
	content, err := os.ReadFile(path)
	if err != nil {
		fmt.Printf("Error reading file %s: %v\n", path, err)
		return
	}

	var rawData []map[string]interface{}
	if err := json.Unmarshal(content, &rawData); err != nil {
		fmt.Printf("Error unmarshaling JSON %s: %v\n", path, err)
		return
	}

	for _, item := range rawData {
		sppgID, ok := item["ID SPPG"].(string)
		if !ok || sppgID == "" {
			continue
		}

		// Update Infrastructure
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

		// --- Stakeholder Management (Long-term Option) ---
		
		// 1. PJ Dapur
		pjName, _ := item["PJ DAPUR"].(string)
		pjPhone, _ := item["WA PJ DAPUR"].(string)
		pjBankRaw, _ := item["REKENING PJ DAPUR"].(string)
		bank, num, accName := parseBankInfo(pjBankRaw)
		
		var pj models.Stakeholder
		db.Where(models.Stakeholder{Name: pjName, Role: "PJ_DAPUR"}).Assign(models.Stakeholder{
			Phone:             pjPhone,
			BankName:          bank,
			BankAccountNumber: num,
			BankAccountName:   accName,
		}).FirstOrCreate(&pj)

		// 2. Landlord
		llNameRaw, _ := item["PEMILIK BANGUNAN/LAHAN"].(string)
		llName := strings.Split(llNameRaw, "\n")[0]
		llBankRaw, _ := item["REKENING PEMILIK BANGUNAN/LAHAN"].(string)
		lbank, lnum, laccName := parseBankInfo(llBankRaw)

		var landlord models.Stakeholder
		db.Where(models.Stakeholder{Name: llName, Role: "LANDLORD"}).Assign(models.Stakeholder{
			BankName:          lbank,
			BankAccountNumber: lnum,
			BankAccountName:   laccName,
		}).FirstOrCreate(&landlord)

		// 3. Link to SppgStakeholder
		stake := models.SppgStakeholder{SppgID: sppgID}
		stake.PjID = pj.ID
		stake.LandlordID = landlord.ID
		stake.AnnualRentCost = parseMoney(item["BERAPA"].(string))

		db.Where(models.SppgStakeholder{SppgID: sppgID}).Assign(stake).FirstOrCreate(&stake)
	}
}

func syncMobil(db *gorm.DB, path string) {
	fmt.Printf("Syncing Mobil from %s...\n", path)
	content, err := os.ReadFile(path)
	if err != nil {
		fmt.Printf("Error reading file %s: %v\n", path, err)
		return
	}

	var rawData []map[string]interface{}
	if err := json.Unmarshal(content, &rawData); err != nil {
		fmt.Printf("Error unmarshaling JSON %s: %v\n", path, err)
		return
	}

	for _, item := range rawData {
		sppgID, ok := item["ID SPPG"].(string)
		if !ok || sppgID == "" {
			continue
		}

		// Clear old fleets for this SPPG (or update? Let's clear and re-add for simplicity in this seeder)
		db.Unscoped().Where("sppg_id = ?", sppgID).Delete(&models.OperationalFleet{})

		if m1, ok := item["MOBIL 1"].(string); ok && m1 != "" {
			db.Create(&models.OperationalFleet{
				SppgID:             sppgID,
				FleetType:          "Mobil 1",
				VehicleDescription: m1,
			})
		}
		if m2, ok := item["MOBIL 2"].(string); ok && m2 != "" {
			db.Create(&models.OperationalFleet{
				SppgID:             sppgID,
				FleetType:          "Mobil 2",
				VehicleDescription: m2,
			})
		}
	}
}

func syncReadiness(db *gorm.DB, path string) {
	fmt.Printf("Syncing Readiness from %s...\n", path)
    if _, err := os.Stat(path); os.IsNotExist(err) {
        return
    }
	content, err := os.ReadFile(path)
	if err != nil {
		fmt.Printf("Error reading file %s: %v\n", path, err)
		return
	}

	var rawData []map[string]interface{}
	if err := json.Unmarshal(content, &rawData); err != nil {
		fmt.Printf("Error unmarshaling JSON %s: %v\n", path, err)
		return
	}

	for _, item := range rawData {
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
            if !ok { return false }
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
