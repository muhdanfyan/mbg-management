const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'wadah_merah_putih_data');
const files = fs.readdirSync(dir).filter(f => f.endsWith('_raw.txt'));

// Create a report of how many got processed
const report = {};

for (let file of files) {
   let raw = fs.readFileSync(path.join(dir, file), 'utf-8');
   try {
       let json = JSON.parse(raw);
       let data = [];
       // Structure from Google Apps Script output
       if (json.rows) {
           data = json.rows.map(row => {
               let obj = row.cells || {};
               // Extract button links if map is present
               const links = [];
               for(let key in row) {
                   if(typeof row[key] === 'object' && row[key] !== null) {
                       if(row[key].url) {
                           links.push({ label: key, url: row[key].url });
                       } else if(Array.isArray(row[key])) { // array of links e.g. maps
                           // do nothing complex for now
                       }
                   }
               }
               if(links.length > 0) obj['_links'] = links;
               return obj;
           });
       } else if (Array.isArray(json)) {
           data = json;
       }
       
       let outName = file.replace('_raw.txt', '');
       fs.writeFileSync(path.join(dir, outName), JSON.stringify(data, null, 2));
       report[outName] = data.length;
       console.log(`[SUCCESS] Parsed ${data.length} records into ${outName}`);
   } catch(e) {
       console.error(`[FAILED] parsing ${file}`, e.message);
   }
}

// Special check for running data
if(!report['data_running.json']) {
    console.log("[MISSING] data_running.json was not successfully intercepted in the raw captures.");
}
