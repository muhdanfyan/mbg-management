/**
 * Verification Script: Mandate Compliance Logic
 * Checks the 60:20:20 split and fixed cost deductions.
 */

function calculatePayout({ pool, portions, dayCount = 1 }) {
    // 1. Fixed Cost Audit (6jt/hari)
    const auditFixedCost = 6000000 * dayCount;
    
    // 2. Honor Staff (6jt/bulan -> approx 200rb/hari or handled monthly)
    // For this simulation, we assume monthly honor is subtracted from total monthly pool.
    const staffFixedCost = 6000000; 
    
    const totalFixedCosts = auditFixedCost + staffFixedCost;
    const netMargin = Math.max(0, pool - totalFixedCosts);
    
    // 3. 60:20:20 Split
    const dpp = netMargin * 0.6;
    const dpd = netMargin * 0.2;
    const kop = netMargin * 0.2;
    
    return {
        input_pool: pool,
        fixed_costs: totalFixedCosts,
        net_margin: netMargin,
        distribution: {
            dpp,
            dpd,
            kop
        }
    };
}

// Scenario 1: Monthly Calculation
// Pool: 250,000,000
// Days: 30
const scenario1 = calculatePayout({ pool: 250000000, dayCount: 30 });
console.log("Scenario 1 (Monthly):", JSON.stringify(scenario1, null, 2));

// Assertions
const expectedFixed = (6000000 * 30) + 6000000; // 186,000,000
if (scenario1.fixed_costs === expectedFixed) {
    console.log("✅ Fixed Cost Logic: PASSED");
} else {
    console.log("❌ Fixed Cost Logic: FAILED (Expected " + expectedFixed + ", got " + scenario1.fixed_costs + ")");
}

const expectedNet = 250000000 - expectedFixed; // 64,000,000
const expectedDPP = expectedNet * 0.6; // 38,400,000
if (scenario1.distribution.dpp === expectedDPP) {
    console.log("✅ 60:20:20 Split Logic: PASSED");
} else {
    console.log("❌ 60:20:20 Split Logic: FAILED");
}
