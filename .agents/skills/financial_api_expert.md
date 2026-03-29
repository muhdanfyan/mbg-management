---
name: financial_api_expert
description: Expert skill for implementing and verifying MBG financial logic.
---
# Financial API Expert Skill

Use this skill to ensure the MBG backend correctly implements the complex revenue splits.

## Core Logic Requirements

### 1. Sewa Dapur (Rental)
- **Daily Rate:** Rp 6.000.000.
- **Monthly (24 days):** Rp 144.000.000.
- **Investor Type:** 
    - Split (e.g., 60:40) between Investor and DPP.
    - DPP part is divided again: 75% for DPP, 25% for YWMP.
- **BSI Type:**
    - Per portion calculation: Rp 1.600 for DPP, Rp 400 for YWMP.

### 2. Selisih Bahan Baku (Raw Material Margin)
- **Base:** (Budget - Actual).
- **Fixed Costs Deduction:** Subtract Rp 15.000.000 (Head, Accountant, Nutritionist, PIC).
- **Net Split (60:20:20):**
    - 60% DPP Wahdah.
    - 20% DPD.
    - 20% Koperasi.

### 3. Multi-Investor Participant
- **Relationship:** One Dapur can have multiple `InvestorParticipant`s.
- **Distribution:** Profit split (Investor part) is shared among participants based on their `share_percentage`.
- **Logic:** `calculateSplits` must iterate through participants to calculate individual payouts.

## Sharia Compliance (Terminology)
- **Interest Rate:** NEVER use this term. Use **Nisbah / Margin (%)**.
- **Loan:** Use for benevolent loans (Qardh). 
- **Profit Sharing:** Ensure logic represents a ratio (split) rather than a fixed interest fee.

## Verification Steps
- Check `main.go` -> `calculateSplits` function.
- Verify zero-guards (e.g., if net margin is negative).
- Ensure currency types use `float64` or `int64` (decimal precision).
- Confirm "Margin/Nisbah" usage in both UI and code identifiers.
