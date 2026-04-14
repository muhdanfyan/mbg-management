# Development History & System Understanding

This document tracks the evolution of the MBG Management System, capturing key architectural decisions, feature implementations, and the logic behind them. It serves as a centralized "memory" for the system's management and for future development agents.

## [2026-04-14] Phase: Profit Sharing & BEP Automation
**Objective:** Automate the complex financial distributions between Investors and Wahdah stakeholders.

### Key Changes:
- **New Module: Bagi Hasil**: Implemented a comprehensive UI for recording rental income, calculating splits, and tracking remittances.
- **Automated BEP Flipping**: 
    - **Logic:** Once the `accumulated_profit` reaches the `initial_capital`, the system automatically swaps the investor and DPP shares.
    - **Rationale:** To ensure investors get their capital back faster (high initial share) while rewarding the management/institution later (high post-BEP share).
- **Remittance Tracking**: Added proof-of-payment (Evidence URL) capability to every payout detail.
- **Backend Models**: Added `RentalRecord`, `ProfitDistribution`, `PayoutDetail`, and `Remittance` to handle the new lifecycle.

### Management Context:
The system has transitioned from a simple "Kitchen Monitoring" tool to a "Financial Distribution Middleman". Accuracy in `BEPStatus` is critical as it directly affects the payout calculations for all stakeholders.

---

## [Previously] Phase: YWMP Data Synchronization
**Objective:** Integrate ground-level data from Google Sites (Wadah Merah Putih) into the management dashboard.

### Key Changes:
- **Fleet Syncing**: Automated mapping of vehicles (102 Titik) to SPPG locations.
- **Infrastructure Audit**: Automated syncing of building size, status, and roadway access.
- **PIC Mapping**: Linking PJ Dapur and Landlords to the centralized Stakeholder system.

---

## [Initial] Phase: Core Infrastructure
**Objective:** Establishing the foundation for kitchen and personnel management.

### Key Changes:
- **Dapur & Route Management**: Tracking kitchen capacity, status, and delivery routes.
- **HR & Recruitment**: Applicant tracking system (ATS) for kitchen staff and managers.
- **Procurement**: Purchase order and equipment tracking for new kitchen setups.
