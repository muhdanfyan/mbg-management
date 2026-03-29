-- Seed Data for Financial Logic Testing (Corrected Table Names)
-- Based on pemahaman_alur_keuangan_mbg.md

-- 1. Ensure we have kitchens with different types (Table: dapurs)
UPDATE dapurs SET type = 'Investor', investor_share = 0.60 WHERE id = 1; -- Dapur Panakkukang
UPDATE dapurs SET type = 'Bangun Sendiri' WHERE id = 2; -- Dapur Antang (Sample)

-- 2. Add Transactions to demonstrate Cash Flow (Table: transactions)
INSERT INTO transactions (date, type, category, amount, status, created_at, updated_at) VALUES
('2026-03-01', 'income', 'BGN Dana Awal', 3000000000, 'approved', NOW(), NOW()),
('2026-03-02', 'expense', 'Pembelian Bahan Baku', 1200000000, 'approved', NOW(), NOW()),
('2026-03-05', 'expense', 'Gaji Personel', 150000000, 'approved', NOW(), NOW()),
('2026-03-10', 'expense', 'Sewa Dapur (DPP)', 144000000, 'approved', NOW(), NOW());

-- 3. Add Financial Records for Dapur Panakkukang (Table: financial_records)
-- Expected Net Sisa Bersih calculation logic in backend:
-- Amount after management split (60:20:20) happens on Sisa Bersih = SelisihBahanBaku - 15,000,000
INSERT INTO financial_records (dapur_id, period, total_portions, rental_income, selisih_bahan_baku, status, created_at, updated_at) VALUES
(1, '2026-03-01 00:00:00', 200000, 144000000, 50000000, 'APPROVED', NOW(), NOW());

-- 4. Add Loans (Table: loans)
INSERT INTO loans (number, lender, amount, interest_rate, monthly_payment, remaining_balance, status, start_date, end_date, created_at, updated_at) VALUES
('LOAN-BSI-001', 'Bank Syariah Indonesia', 5000000000, 5.5, 150000000, 4850000000, 'active', '2026-01-01', '2028-01-01', NOW(), NOW());
