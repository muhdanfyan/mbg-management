import json
import subprocess

# Approximate Coordinates Mapping
COORD_MAP = {
    "jakabaring": (-2.9904, 104.7567),
    "ngemplak": (-7.6749, 110.4287), 
    "sleman": (-7.7214, 110.3664),
    "denpasar": (-8.6705, 115.2126),
    "pontianak": (-0.0263, 109.3425),
    "singkawang": (0.9083, 108.9860),
    "tojo barat": (-1.3323, 121.2291),
    "maiwa": (-3.8378, 119.8459),
    "biringkanaya": (-5.1051, 119.5164),
    "manggala": (-5.1614, 119.4891),
    "bacukiki": (-4.0101, 119.6415),
    "murhum": (-5.4676, 122.6039),
    "pamboang": (-3.5011, 118.8874),
    "budong budong": (-2.1128, 119.2486),
    "topoyo": (-2.0724, 119.2842),
    "cimanggis": (-6.3688, 106.8837),
    "biringbulu": (-5.3971, 120.0456),
    "pitumpanua": (-3.7461, 120.3541),
    "mamajang": (-5.1584, 119.4182),
    "pondidaha": (-3.8967, 122.2594),
    "konawe": (-3.8647, 122.0628),
    "merauke": (-8.4991, 140.4042),
    "cibaliung": (-6.6800, 105.7483),
    "bontang": (0.1332, 117.5028),
    "mawasangka": (-5.3582, 122.4277),
    "baras": (-1.3660, 119.3496),
    "sibulue": (-4.6294, 120.3745),
    "baraka": (-3.4721, 119.8821),
    "malili": (-2.6253, 121.0567),
    "amali": (-4.4251, 120.1065),
    "tana lili": (-2.5714, 120.4851),
    "tobadak": (-2.2472, 119.4007),
    "herlang": (-5.4418, 120.3667),
    "malangke": (-2.6841, 120.3458),
    "mentawa baru": (-2.5401, 112.9247),
    "sinjai": (-5.2289, 120.0886),
    "nubatukan": (-8.3614, 123.4116),
    "bungoro": (-4.8143, 119.5532),
    "bojongsari": (-6.3888, 106.7461),
    "jati agung": (-5.3216, 105.2921),
    "lambuya": (-3.9241, 122.1154),
    "mare": (-4.7891, 120.3541),
    "palaran": (-0.5694, 117.1528),
    "wonggeduku": (-3.8981, 122.1856),
    "sei beduk": (1.0456, 104.0321),
    "cikeusik": (-6.7456, 105.8671),
    "jekan raya": (-2.2084, 113.8828),
    "pangkajene": (-4.8436, 119.5398),
    "kelapa dua": (-6.2341, 106.6341),
    "lalabata": (-4.3478, 119.8821),
    "baguala": (-3.6341, 128.2341),
    "masalle": (-3.4121, 119.7821),
    "gandangbatu": (-3.1121, 119.8821),
    "plaju": (-3.0041, 104.7841),
    "sumur": (-6.6541, 105.5541),
    "libureng": (-4.8441, 120.1241),
    "namrole": (-3.8541, 126.7241),
    "batu ampar": (-1.2141, 116.8341),
    "kuta selatan": (-8.8041, 115.1741),
    "gianyar": (-8.5441, 115.3241),
    "sukasada": (-8.1441, 115.1041),
    "arut selatan": (-2.6841, 111.6241),
    "baamang": (-2.5041, 112.9541),
    "alalak": (-3.2641, 114.5841),
    "sambaliung": (2.1541, 117.4841),
    "dampal selatan": (0.5841, 120.3241),
    "bungku selatan": (-2.7841, 122.1841),
    "mepanga": (0.5841, 120.5841),
    "sigi biromaru": (-0.9841, 119.8841),
    "palu timur": (-0.8941, 119.8841),
    "tonra": (-4.8841, 120.3841),
    "cina": (-4.6841, 120.2841),
    "cenrana": (-4.4441, 120.3841),
    "liukang": (-4.8441, 119.0841),
    "pitu riase": (-3.6841, 120.1841),
    "bungin": (-3.5841, 119.8441),
    "larompong": (-3.5441, 120.3441),
    "bua": (-3.0441, 120.2441),
    "rampi": (-2.0441, 120.1441),
    "towuti": (-2.7441, 121.3441),
    "rantepao": (-2.9741, 119.8941),
    "rantebua": (-3.0341, 120.0841),
    "sendana": (-3.4841, 118.9141),
    "simboro": (-2.6741, 118.8841),
    "namlea": (-3.2541, 127.0941),
    "manokwari": (-0.8641, 134.0641),
}

def get_coords(name):
    name_lower = name.lower()
    for key, coords in COORD_MAP.items():
        if key in name_lower:
            return coords
    return (-2.0, 118.0)

def main():
    # Fetch SPPGs via mysql CLI
    cmd_sppg = "mysql -u kassaone -pPiblajar2020 -e 'USE mbg_management; SELECT sppg_id, name, location FROM sppgs;' -B"
    res_sppg = subprocess.check_output(cmd_sppg, shell=True).decode('utf-8').splitlines()
    
    # Skip header
    sppgs = []
    for line in res_sppg[1:]:
        parts = line.split('\t')
        if len(parts) >= 2:
            sppgs.append({'id': parts[0], 'name': parts[1], 'loc': parts[2] if len(parts) > 2 else ""})

    # Fetch existing Dapurs via mysql CLI
    cmd_dapur = "mysql -u kassaone -pPiblajar2020 -e 'USE mbg_management; SELECT id, sppg_id, name FROM dapurs;' -B"
    res_dapur = subprocess.check_output(cmd_dapur, shell=True).decode('utf-8').splitlines()
    
    existing_dapurs_id = {}
    existing_dapurs_name = {}
    for line in res_dapur[1:]:
        parts = line.split('\t')
        if len(parts) >= 3:
            did, sid, dname = parts[0], parts[1], parts[2]
            if sid != 'NULL' and sid: existing_dapurs_id[sid] = did
            existing_dapurs_name[dname] = did

    sql_commands = ["USE mbg_management;"]

    for s in sppgs:
        sid, sname, sloc = s['id'], s['name'], s['loc']
        lat, lng = get_coords(sname)
        
        # Determine if update or insert
        target_id = None
        if sid in existing_dapurs_id:
            target_id = existing_dapurs_id[sid]
        elif sid in existing_dapurs_name: # Handle case where ID is the name
            target_id = existing_dapurs_name[sid]
        elif sname in existing_dapurs_name:
            target_id = existing_dapurs_name[sname]
            
        if target_id:
            sql = f"UPDATE dapurs SET name = '{sname}', lat = {lat}, lng = {lng}, sppg_id = '{sid}', status = 'Dalam Pembangunan' WHERE id = {target_id};"
        else:
            sql = f"INSERT INTO dapurs (name, type, address, lat, lng, capacity, status, region, sppg_id, created_at, updated_at) VALUES ('{sname}', 'BANGUN_SENDIRI', '{sloc or sname}', {lat}, {lng}, 1000, 'Dalam Pembangunan', 'Nasional', '{sid}', NOW(), NOW());"
        
        sql_commands.append(sql)

    # Output to a file
    with open('/Users/pondokit/Herd/mbg-management/backend/sync_data.sql', 'w') as f:
        f.write('\n'.join(sql_commands))
    
    print(f"Generated {len(sql_commands)-1} SQL commands in sync_data.sql")

if __name__ == "__main__":
    main()
