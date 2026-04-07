#!/bin/bash
# Cloudflare Subdomain Creation Script
# Usage: ./create_subdomain.sh [dev|api-dev]

ZONE_ID="YOUR_ZONE_ID" # Replace with actual Zone ID
API_TOKEN="YOUR_API_TOKEN" # Replace with actual API Token
DOMAIN="mbgone.site"
SERVER_IP="103.126.117.20"

create_record() {
    local name=$1
    echo "Creating A record for ${name}.${DOMAIN}..."
    curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
         -H "Authorization: Bearer ${API_TOKEN}" \
         -H "Content-Type: application/json" \
         --data "{\"type\":\"A\",\"name\":\"${name}\",\"content\":\"${SERVER_IP}\",\"ttl\":1,\"proxied\":true}"
}

if [ "$ZONE_ID" == "YOUR_ZONE_ID" ] || [ "$API_TOKEN" == "YOUR_API_TOKEN" ]; then
    echo "Error: Please set ZONE_ID and API_TOKEN in the script or environment variables."
    exit 1
fi

create_record "dev"
create_record "api-dev"
