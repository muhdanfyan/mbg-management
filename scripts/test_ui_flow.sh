#!/bin/bash

# MBG UI Flow - CLI Automated Test
# Status: NOSS Strategy Implementation

# Configuration
BASE_URL="http://localhost:8080/api"
if [ ! -z "$1" ]; then
    BASE_URL="$1"
fi

echo "🚀 Starting MBG UI Flow Test (NOSS Mode)..."
echo "Target: $BASE_URL"
echo "------------------------------------------"

# Function: Step Logger
log_step() {
    echo -e "\n🔹 [STEP] $1"
}

# Function: Assertion
assert_json() {
    local response=$1
    local pattern=$2
    local message=$3
    if echo "$response" | grep -q "$pattern"; then
        echo "✅ PASSED: $message"
    else
        echo "❌ FAILED: $message"
        echo "   Response: $response"
        exit 1
    fi
}

# Function: JSON Array Length
get_json_length() {
    echo "$1" | jq '. | length'
}

# 1. Login Simulation (Public Access)
log_step "Login as Super Admin"
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"superadmin@mbg.com", "password":"pass123"}')

assert_json "$LOGIN_RES" "Super Admin" "Login successful"

# 2. Kitchen Scoping Test (RBAC PIC Dapur)
log_step "Verify Kitchen Scoping (PIC Dapur Role)"
# Mocking a PIC for Kitchen ID 1
KITCHEN_RES=$(curl -s -X GET "$BASE_URL/kitchens" \
    -H "X-User-Role: PIC Dapur" \
    -H "X-Kitchen-ID: 1")

COUNT=$(get_json_length "$KITCHEN_RES")
echo "Found $COUNT kitchen(s) in scoped response."
if [ "$COUNT" -eq 1 ]; then
    echo "✅ PASSED: Scoped access returns exactly 1 kitchen"
else
    echo "❌ FAILED: Scoped access returned $COUNT kitchens instead of 1"
    exit 1
fi

# 3. Financial Record Integrity
log_step "Checking Financial Records Access"
FIN_RES=$(curl -s -X GET "$BASE_URL/financial-records" \
    -H "X-User-Role: Super Admin")

if [[ "$FIN_RES" == "["* ]]; then
    echo "✅ PASSED: Financial records endpoint returns a valid JSON array"
else
    echo "❌ FAILED: Financial records endpoint did not return a JSON array"
    echo "   Response: $FIN_RES"
    exit 1
fi

# 4. Data Leakage Verification (Negative Test)
log_step "Verify Data Leakage (Cross-Kitchen Access)"
LEAK_RES=$(curl -s -X GET "$BASE_URL/kitchens" \
    -H "X-User-Role: PIC Dapur" \
    -H "X-Kitchen-ID: 2")

LEAK_NAME=$(echo "$LEAK_RES" | jq -r '.[0].name')
if [[ "$LEAK_NAME" == "Dapur Panakkukang" ]]; then
    echo "❌ FAILED: Data leakage detected! Kitchen 1 data visible to Kitchen 2 scope."
    exit 1
else
    echo "✅ PASSED: No cross-kitchen leakage detected."
fi

echo "------------------------------------------"
echo "🎉 All UI flow tests PASSED (CLI Verification Complete)"
