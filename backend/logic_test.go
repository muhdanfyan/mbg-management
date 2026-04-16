	package main

	import (
		"github.com/muhdanfyan/mbg-management/backend/models"
		"testing"

		"github.com/stretchr/testify/assert"
	)

	func TestCalculateSplits_PreBEP(t *testing.T) {
		dapur := models.Dapur{
			Type:              models.TypeInvestor,
			InvestorShare:     0.75, // 75% for Investor
			DPPShare:          0.25, // 25% for DPP (which splits 75% DPP / 25% YWMP)
			BEPStatus:         "PRE-BEP",
			InitialCapital:    100000000,
			AccumulatedProfit: 10000000,
			Investors: []models.InvestorParticipant{
				{Name: "Investor A", SharePercentage: 100, InvestmentAmount: 100000000},
			},
		}

		record := models.FinancialRecord{
			RentalIncome: 10000000, // 10 million
			TotalPortions: 2000,
			SelisihBahanBaku: 20000000, // 20 million
		}

		result := calculateSplits(dapur, record)

		// Investor Share = 10,000,000 * 0.75 = 7,500,000
		assert.Equal(t, 7500000.0, result["investor_share"])
		
		// DPP Pool = 10,000,000 * 0.25 = 2,500,000
		// dppShareSewa = 2,500,000 * 0.75 = 1,875,000
		// ywmpShareSewa = 2,500,000 * 0.25 = 625,000
		assert.Equal(t, 1875000.0, result["dpp_share_sewa"])
		assert.Equal(t, 625000.0, result["ywmp_share_sewa"])

		// Selisih Bahan = 20,000,000 - 15,000,000 = 5,000,000
		assert.Equal(t, 5000000.0, result["sisa_bersih"])
		assert.Equal(t, 3000000.0, result["dpp_share_selisih"]) // 60%
		assert.Equal(t, 1000000.0, result["dpd_share_selisih"]) // 20%
		assert.Equal(t, 1000000.0, result["kop_share_selisih"]) // 20%
	}

	func TestCalculateSplits_PostBEP(t *testing.T) {
		dapur := models.Dapur{
			Type:              models.TypeInvestor,
			InvestorShare:     0.25, // 25% for Investor (flipped)
			DPPShare:          0.75, // 75% for DPP
			BEPStatus:         "POST-BEP",
			InitialCapital:    100000000,
			AccumulatedProfit: 100000000,
			Investors: []models.InvestorParticipant{
				{Name: "Investor A", SharePercentage: 100},
			},
		}

		record := models.FinancialRecord{
			RentalIncome: 10000000,
		}

		result := calculateSplits(dapur, record)

		// Investor Share = 10,000,000 * 0.25 = 2,500,000
		assert.Equal(t, 2500000.0, result["investor_share"])
		
		// DPP Pool = 10,000,000 * 0.75 = 7,500,000
		// dppShareSewa = 7,500,000 * 0.75 = 5,625,000
		// ywmpShareSewa = 7,500,000 * 0.25 = 1,875,000
		assert.Equal(t, 5625000.0, result["dpp_share_sewa"])
		assert.Equal(t, 1875000.0, result["ywmp_share_sewa"])
	}

	func TestCalculateSplits_BangunSendiri(t *testing.T) {
		dapur := models.Dapur{
			Type: models.TypeBangunSendiri,
		}

		record := models.FinancialRecord{
			TotalPortions: 1000,
		}

		result := calculateSplits(dapur, record)

		// 1000 portions * 1600 = 1,600,000
		// 1000 portions * 400 = 400,000
		assert.Equal(t, 1600000.0, result["dpp_share_sewa"])
		assert.Equal(t, 400000.0, result["ywmp_share_sewa"])
	}
