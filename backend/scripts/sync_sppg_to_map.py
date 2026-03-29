import mysql.connector
import re

# Database connection
db_config = {
    'host': '127.0.0.1',
    'user': 'kassaone',
    'password': 'Piblajar2020',
    'database': 'mbg_management'
}

# Coordinate mapping (Approximate center of regions/cities)
COORD_MAP = {
    "jakabaring": (-2.9904, 104.7567),
    "ngemplak": (-7.6749, 110.4287), # Sleman
    "sleman": (-7.7214, 110.3664),
    "denpasar": (-8.6705, 115.2126),
    "pontianak": (-0.0263, 109.3425),
    "singkawang": (0.9083, 108.9860),
    "tojo barat": (-1.3323, 121.2291), # Sulteng
    "maiwa": (-3.8378, 119.8459), # Enrekang
    "biringkanaya": (-5.1051, 119.5164), # Makassar
    "manggala": (-5.1614, 119.4891), # Makassar
    "bacukiki": (-4.0101, 119.6415),
    "murhum": (-5.4676, 122.6039), # Bau-bau
    "pamboang": (-3.5011, 118.8874), # Majene
    "budong budong": (-2.1128, 119.2486), # Mamuju Tengah
    "topoyo": (-2.0724, 119.2842), # Mamuju Tengah
    "cimanggis": (-6.3688, 106.8837), # Depok
    "biringbulu": (-5.3971, 120.0456), # Gowa
    "pitumpanua": (-3.7461, 120.3541), # Wajo
    "mamajang": (-5.1584, 119.4182), # Makassar
    "pondidaha": (-3.8967, 122.2594), # Konawe
    "konawe": (-3.8647, 122.0628),
    "merauke": (-8.4991, 140.4042),
    "cibaliung": (-6.6800, 105.7483), # Pandeglang
    "bontang": (0.1332, 117.5028),
    "mawasangka": (-5.3582, 122.4277), # Buton Tengah
    "baras": (-1.3660, 119.3496), # Pasangkayu
    "sibulue": (-4.6294, 120.3745), # Bone
    "baraka": (-3.4721, 119.8821), # Enrekang
    "malili": (-2.6253, 121.0567), # Luwu Timur
    "amali": (-4.4251, 120.1065), # Bone
    "tana lili": (-2.5714, 120.4851), # Luwu Utara
    "tobadak": (-2.2472, 119.4007), # Mamuju Tengah
    "herlang": (-5.4418, 120.3667), # Bulukumba
    "malangke": (-2.6841, 120.3458), # Luwu Utara
    "mentawa baru": (-2.5401, 112.9247), # Sampit
    "sinjai": (-5.2289, 120.0886),
    "nubatukan": (-8.3614, 123.4116), # Lembata
    "bungoro": (-4.8143, 119.5532), # Pangkep
    "bojongsari": (-6.3888, 106.7461), # Depok
    "jati agung": (-5.3216, 105.2921), # Lampung Selatan
    "lambuya": (-3.9241, 122.1154), # Konawe
    "mare": (-4.7891, 120.3541), # Bone
    "palaran": (-0.5694, 117.1528), # Samarinda
    "wonggeduku": (-3.8981, 122.1856), # Konawe
    "sei beduk": (1.0456, 104.0321), # Batam
    "cikeusik": (-6.7456, 105.8671), # Pandeglang
    "jekan raya": (-2.2084, 113.8828), # Palangkaraya
    "pangkajene": (-4.8436, 119.5398),
    "kelapa dua": (-6.2341, 106.6341), # Tangerang
    "lalabata": (-4.3478, 119.8821), # Soppeng
    "baguala": (-3.6341, 128.2341), # Ambon
    "masalle": (-3.4121, 119.7821), # Enrekang
    "gandangbatu": (-3.1121, 119.8821), # Tana Toraja
    "plaju": (-3.0041, 104.7841), # Palembang
    "sumur": (-6.6541, 105.5541), # Pandeglang
    "libureng": (-4.8441, 120.1241), # Bone
    "namrole": (-3.8541, 126.7241), # Buru Selatan
    "batu ampar": (-1.2141, 116.8341), # Balikpapan
    "kuta selatan": (-8.8041, 115.1741), # Bali
    "gianyar": (-8.5441, 115.3241),
    "sukasada": (-8.1441, 115.1041), # Buleleng
    "arut selatan": (-2.6841, 111.6241), # Pangkalan Bun
    "baamang": (-2.5041, 112.9541), # Sampit
    "alalak": (-3.2641, 114.5841), # Banjarmasin
    "sambaliung": (2.1541, 117.4841), # Berau
    "dampal selatan": (0.5841, 120.3241), # Tolitoli
    "bungku selatan": (-2.7841, 122.1841), # Morowali
    "mepanga": (0.5841, 120.5841), # Parigi Moutong
    "sigi biromaru": (-0.9841, 119.8841),
    "palu timur": (-0.8941, 119.8841),
    "tonra": (-4.8841, 120.3841), # Bone
    "cina": (-4.6841, 120.2841), # Bone
    "cenrana": (-4.4441, 120.3841), # Bone
    "liukang": (-4.8441, 119.0841), # Pangkep
    "pitu riase": (-3.6841, 120.1841), # Sidrap
    "bungin": (-3.5841, 119.8441), # Enrekang
    "larompong": (-3.5441, 120.3441), # Luwu
    "bua": (-3.0441, 120.2441), # Luwu
    "rampi": (-2.0441, 120.1441), # Luwu Utara
    "towuti": (-2.7441, 121.3441), # Luwu Timur
    "rantepao": (-2.9741, 119.8941), # Toraja Utara
    "rantebua": (-3.0341, 120.0841), # Toraja Utara
    "sendana": (-3.4841, 118.9141), # Majene
    "simboro": (-2.6741, 118.8841), # Mamuju
    "namlea": (-3.2541, 127.0941), # Buru
    "manokwari": (-0.8641, 134.0641),
}

def get_coords(name):
    name_lower = name.lower()
    for key, coords in COORD_MAP.items():
        if key in name_lower:
            return coords
    # Default to a generic central Indonesia point if not found
    return (-2.0, 118.0)

def main():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # 1. Fetch all SPPGs
        cursor.execute("SELECT sppg_id, name, location FROM sppgs")
        sppgs = cursor.fetchall()

        # 2. Fetch existing Dapurs to map by SppgID or Name
        cursor.execute("SELECT id, sppg_id, name FROM dapurs")
        existing_dapurs = cursor.fetchall()
        
        # Create lookup maps
        dapur_by_id = {d['sppg_id']: d for d in existing_dapurs if d['sppg_id']}
        dapur_by_name = {d['name']: d for d in existing_dapurs}

        updates = 0
        inserts = 0

        for sppg in sppgs:
            sid = sppg['sppg_id']
            sname = sppg['name']
            
            lat, lng = get_coords(sname)
            
            # Check if exists by ID or existing "ID as name"
            if sid in dapur_by_id:
                # Update existing link
                target_id = dapur_by_id[sid]['id']
                cursor.execute(
                    "UPDATE dapurs SET name = %s, lat = %s, lng = %s, sppg_id = %s WHERE id = %s",
                    (sname, lat, lng, sid, target_id)
                )
                updates += 1
            elif sid in dapur_by_name:
                # Dapur was named using the ID
                target_id = dapur_by_name[sid]['id']
                cursor.execute(
                    "UPDATE dapurs SET name = %s, lat = %s, lng = %s, sppg_id = %s WHERE id = %s",
                    (sname, lat, lng, sid, target_id)
                )
                updates += 1
            elif sname in dapur_by_name:
                # Match by name
                target_id = dapur_by_name[sname]['id']
                cursor.execute(
                    "UPDATE dapurs SET lat = %s, lng = %s, sppg_id = %s WHERE id = %s",
                    (lat, lng, sid, target_id)
                )
                updates += 1
            else:
                # Create NEW Dapur entry for Map
                cursor.execute(
                    "INSERT INTO dapurs (name, type, address, lat, lng, capacity, status, region, sppg_id, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())",
                    (sname, 'BANGUN_SENDIRI', sppg['location'] or sname, lat, lng, 1000, 'Dalam Pembangunan', 'Nasional', sid)
                )
                inserts += 1

        conn.commit()
        print(f"Success: {updates} updated, {inserts} inserted. Total: {updates + inserts} SPPGs synced to map.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    main()
