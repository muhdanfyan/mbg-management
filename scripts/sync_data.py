import json
import os
import re

DATA_DIR = "/Users/pondokit/Herd/mbg-management/wadah_merah_putih_data"

def clean_val(v):
    if v is None: return ""
    return str(v).strip().replace("'", "''")

def clean_money(s):
    if not s: return 0.0
    # Extract numbers from e.g. "Rp50.000.000"
    nums = "".join(re.findall(r'\d+', str(s)))
    try:
        return float(nums)
    except:
        return 0.0

def parse_area(s):
    if not s: return 0.0
    match = re.search(r'(\d+)', str(s))
    if match:
        return float(match.group(1))
    return 0.0

def sync_all_files():
    files = [f for f in os.listdir(DATA_DIR) if f.endswith(".json") and not f.endswith("_raw.txt")]
    
    # Master dictionary keyed by ID SPPG
    master_data = {}

    for filename in files:
        path = os.path.join(DATA_DIR, filename)
        try:
            with open(path, "r") as f:
                data = json.load(f)
            
            if not isinstance(data, list): continue

            for item in data:
                id_sppg = clean_val(item.get("ID SPPG", ""))
                if not id_sppg: continue
                
                if id_sppg not in master_data:
                    master_data[id_sppg] = {}
                
                # Merge data (new fields override if not empty)
                for k, v in item.items():
                    if v: master_data[id_sppg][k] = v
        except Exception as e:
            print(f"Error reading {filename}: {e}")

    sql_statements = []
    
    for id_sppg, item in master_data.items():
        name = clean_val(item.get("NAMA SPPG", ""))
        location = clean_val(item.get("LOKASI", "")).replace("\n", " ")
        address = clean_val(item.get("ALAMAT", ""))
        maps_url = clean_val(item.get("MAPS", ""))
        progress = clean_val(item.get("PROGRES PEMBANGUNAN", item.get("PEMBANGUNAN", "0%")))
        if "%" not in progress: progress += "%"
        
        lat, lng = 0.0, 0.0
        if "@" in maps_url:
            parts = maps_url.split("@")[1].split(",")
            if len(parts) >= 2:
                try:
                    lat = float(parts[0])
                    lng = float(parts[1])
                except: pass

        # 1. SPPGS
        sql_statements.append(f"INSERT INTO sppgs (sppg_id, name, location, progress, created_at, updated_at) "
                              f"VALUES ('{id_sppg}', '{name}', '{location}', '{progress}', NOW(), NOW()) "
                              f"ON DUPLICATE KEY UPDATE name='{name}', location='{location}', progress='{progress}', updated_at=NOW();")

        # 2. DAPURS
        sql_statements.append(f"INSERT INTO dapurs (name, type, address, lat, lng, sppg_id, status, created_at, updated_at) "
                              f"VALUES ('{name}', 'INVESTOR', '{address}', {lat}, {lng}, '{id_sppg}', 'AKTIF', NOW(), NOW()) "
                              f"ON DUPLICATE KEY UPDATE address='{address}', lat={lat}, lng={lng}, updated_at=NOW();")

        # 3. STAKEHOLDERS (PJ & Landlord)
        pj_name = clean_val(item.get("PJ DAPUR", ""))
        wa_num = "".join(re.findall(r'\d+', clean_val(item.get("WA PJ DAPUR", item.get("WA", "")))))
        pj_rek = clean_val(item.get("REKENING PJ DAPUR", ""))
        
        bank_name, acc_num, acc_name = "", "", ""
        if pj_rek:
            rek_parts = pj_rek.split("\n")
            if len(rek_parts) >= 3:
                bank_name, acc_num, acc_name = clean_val(rek_parts[0]), clean_val(rek_parts[1]), clean_val(rek_parts[2])

        if pj_name and pj_name != "-":
            sql_statements.append(f"INSERT INTO stakeholders (name, phone, role, bank_name, bank_account_number, bank_account_name, created_at, updated_at) "
                                  f"VALUES ('{pj_name}', '{wa_num}', 'PJ_DAPUR', '{bank_name}', '{acc_num}', '{acc_name}', NOW(), NOW()) "
                                  f"ON DUPLICATE KEY UPDATE phone='{wa_num}', bank_account_number='{acc_num}', updated_at=NOW();")

        landlord_name = clean_val(item.get("PEMILIK BANGUNAN/LAHAN", ""))
        if landlord_name and landlord_name != "-":
            sql_statements.append(f"INSERT INTO stakeholders (name, role, created_at, updated_at) "
                                  f"VALUES ('{landlord_name}', 'LANDLORD', NOW(), NOW()) "
                                  f"ON DUPLICATE KEY UPDATE updated_at=NOW();")

        # 4. INFRASTRUCTURE & RENT
        infra_raw = clean_val(item.get("LAHAN & BANGUNAN", ""))
        land_area = 0.0
        building_area = 0.0
        if "Lahan" in infra_raw:
            parts = infra_raw.split("\n")
            for p in parts:
                if "Lahan" in p: land_area = parse_area(p)
                if "Bangunan" in p: building_area = parse_area(p)
        
        road_access = clean_val(item.get("AKSES JALAN", ""))
        road_size = 0.0
        match_road = re.search(r'(\d+)', road_access)
        if match_road: road_size = float(match_road.group(1))

        annual_rent = clean_money(item.get("BERAPA", item.get("HARGA SEWA/BELI BANGUNAN DAN/ATAU LAHAN", "0")))

        sql_statements.append(f"INSERT INTO sppg_infrastructures (sppg_id, land_area, building_area, road_access_size, allowed_vehicles, building_condition, created_at, updated_at) "
                              f"VALUES ('{id_sppg}', {land_area}, {building_area}, {road_size}, '{road_access.replace(chr(10), ' ')}', '{clean_val(item.get('KONDISI BANGUNAN', ''))}', NOW(), NOW()) "
                              f"ON DUPLICATE KEY UPDATE land_area={land_area}, building_area={building_area}, road_access_size={road_size}, updated_at=NOW();")

        # 5. MEDIA (From Infrastructure Photos)
        media_raw = clean_val(item.get("FOTO DAN VIDEO AKSES JALAN MASUK DARI JALAN POROS", ""))
        if media_raw and media_raw != "-":
            # Split by comma or space
            media_links = re.split(r',|\s+', media_raw)
            for link in media_links:
                link = link.strip()
                if link.startswith("http"):
                    sql_statements.append(f"INSERT INTO sppg_media (sppg_id, preview_url, media_type, created_at, updated_at) "
                                          f"VALUES ('{id_sppg}', '{link}', 'image', NOW(), NOW());")

        # 6. FLEETS
        for i in ["1", "2"]:
            m_key = f"MOBIL {i}"
            f_key = f"FOTO MOBIL {i}"
            val = clean_val(item.get(m_key, ""))
            foto = clean_val(item.get(f_key, ""))
            if val and val != "-" and "Belum" not in val:
                sql_statements.append(f"INSERT INTO operational_fleets (sppg_id, fleet_type, vehicle_description, photo_media_id, created_at, updated_at) "
                                      f"VALUES ('{id_sppg}', 'Mobil {i}', '{val}', '{foto}', NOW(), NOW()) "
                                      f"ON DUPLICATE KEY UPDATE vehicle_description='{val}', updated_at=NOW();")
                # Also add fleet photo to media gallery
                if foto.startswith("http"):
                    sql_statements.append(f"INSERT INTO sppg_media (sppg_id, preview_url, media_type, created_at, updated_at) "
                                          f"VALUES ('{id_sppg}', '{foto}', 'image', NOW(), NOW());")

    with open("sync_complete.sql", "w") as f:
        f.write("SET FOREIGN_KEY_CHECKS = 0;\n")
        f.write("\n".join(sql_statements))
        f.write("\nSET FOREIGN_KEY_CHECKS = 1;")
    
    print(f"Generated {len(sql_statements)} SQL statements for ALL JSON files.")

if __name__ == "__main__":
    sync_all_files()
