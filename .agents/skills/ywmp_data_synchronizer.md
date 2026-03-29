# Skill: YWMP Data Synchronizer

Expert in bridging external Google Sites (Wadah Merah Putih) data into the MBG Management System via Puppeteer interception and GORM normalization.

## 1. Capabilities
- **Browser-Level Interception**: Ability to capture raw JSON payloads from Google Apps Script endpoints by intercepting HTTPS requests, bypassing UI limitations and row pagination (e.g., scraping all 102 points at once).
- **Data Normalization Logic**: Specialist in parsing irregular strings (e.g., bank accounts "BSI 000000 NAME") and mapping them into relational models (Stakeholders, Infrastructure, Fleets).
- **Relational Integrity Seeding**: Capable of cross-referencing `sppg_id` across multiple datasets to create a unified 360-degree view of a Dapur location.

## 2. Tools & Assets
- **Scraping Engine**: Puppeteer-based node scripts (`scrape_all.cjs`).
- **Seeder Engine**: Golang-based sync scripts (`sync_wadah_data.go`).
- **Target Models**: `Stakeholder`, `SppgInfrastructure`, `SppgStakeholder`, `OperationalFleet`, `SppgReadiness`.

## 3. Workflow
1. **Extraction**: Run Puppeteer interception to refresh local `wadah_merah_putih_data/*.json` files.
2. **Analysis**: Compare extracted keys with `database_schema_mbg.md` to identify structural gaps.
3. **Refinement**: Update GORM models and migrate database using `AutoMigrate`.
4. **Injection**: Execute Golang sync script to populate the MySQL database.

## 4. Guidelines
- **Unique Identifier**: Always use `sppg_id` as the source of truth for mapping.
- **Normalization**: Clean currency and area symbols (Rp, m2) before database insertion.
- **Audit Trail**: Maintain `sync_wadah_data.go` as a repeatable seeder.
