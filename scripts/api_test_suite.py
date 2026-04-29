import urllib.request
import urllib.parse
import json
import uuid

BASE_URL = "http://localhost:8080/api"
HEADERS = {
    "Content-Type": "application/json",
    "X-User-Role": "Super Admin"
}

def make_request(method, endpoint, data=None):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, method=method, headers=HEADERS)
    if data:
        json_data = json.dumps(data).encode('utf-8')
        req.data = json_data
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode('utf-8')
            if not res_data:
                return response.getcode(), {}
            try:
                return response.getcode(), json.loads(res_data)
            except json.JSONDecodeError:
                return response.getcode(), {"raw": res_data}
    except urllib.error.HTTPError as e:
        res_data = e.read().decode('utf-8')
        return e.code, json.loads(res_data) if res_data else {"error": str(e)}
    except Exception as e:
        print(f"Exception during request: {e}")
        return 0, {"error": str(e)}

def test_crud(entity_name, endpoint, sample_data, update_field, update_value):
    print(f"\n--- Testing CRUD for {entity_name} ---")
    
    # 1. CREATE
    print(f"Creating {entity_name}...")
    status, body = make_request("POST", endpoint, sample_data)
    if status not in [200, 201]:
        print(f"FAILED: Create {entity_name} returned {status}")
        print(body)
        return None
    
    item_id = body.get('id')
    print(f"PASSED: Created {entity_name} with ID {item_id}")
    
    # 2. READ
    print(f"Reading {entity_name}...")
    status, body = make_request("GET", f"{endpoint}/{item_id}")
    if status != 200:
        print(f"FAILED: Read {entity_name} returned {status}")
        return item_id
    print(f"PASSED: Read {entity_name} successfully")
    
    # 3. UPDATE
    print(f"Updating {entity_name}...")
    sample_data[update_field] = update_value
    status, body = make_request("PUT", f"{endpoint}/{item_id}", sample_data)
    if status != 200:
        print(f"FAILED: Update {entity_name} returned {status}")
        return item_id
    print(f"PASSED: Updated {entity_name} successfully")
    
    # 4. DELETE
    print(f"Deleting {entity_name}...")
    status, body = make_request("DELETE", f"{endpoint}/{item_id}")
    if status != 200:
        print(f"FAILED: Delete {entity_name} returned {status}")
        return item_id
    print(f"PASSED: Deleted {entity_name} successfully")
    
    return True

def run_all_tests():
    # Kitchen Test
    kitchen_data = {
        "name": f"Test Kitchen {uuid.uuid4().hex[:4]}",
        "type": "INVESTOR",
        "address": "Jl. Testing No. 123",
        "lat": -5.14,
        "lng": 119.41,
        "capacity": 500,
        "status": "AKTIF",
        "region": "Makassar, Sulawesi Selatan",
        "sppg_id": f"TEST-{uuid.uuid4().hex[:6].upper()}"
    }
    test_crud("Kitchen", "/kitchens", kitchen_data, "name", "Updated Kitchen Name")
    
    # Route Test
    route_data = {
        "kitchen_id": 1,
        "route_name": "Test Route A",
        "vehicle": "Box Truck",
        "driver": "Driver Test",
        "status": "scheduled",
        "eta": "08:00"
    }
    test_crud("Route", "/routes", route_data, "route_name", "Updated Route B")
    
    # Department Test
    dept_data = {"name": f"Dept {uuid.uuid4().hex[:4]}"}
    test_crud("Department", "/departments", dept_data, "name", "Updated Dept Name")

if __name__ == "__main__":
    run_all_tests()
