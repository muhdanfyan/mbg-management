const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'wadah_merah_putih_data');
const files = fs.readdirSync(dir).filter(f => f.endsWith('_raw.txt'));

for (let file of files) {
   let raw = fs.readFileSync(path.join(dir, file), 'utf-8');
   try {
       let json = JSON.parse(raw);
       let data = [];
       // It could be json.rows, etc.
       if (json.rows) {
           data = json.rows.map(row => {
               let obj = row.cells || {};
               // Attempt to get links from maps or buttons
               if (row.maps) {
                  for (let key in row.maps) {
                     if(!obj['_links']) obj['_links']=[];
                     obj['_links'].push({label: key, url: row.maps[key]});
                  }
               }
               return obj;
           });
       } else if (Array.isArray(json)) {
           data = json;
       }
       
       let outName = file.replace('_raw.txt', '');
       fs.writeFileSync(path.join(dir, outName), JSON.stringify(data, null, 2));
       console.log(`Parsed ${data.length} records into ${outName}`);
   } catch(e) {
       console.error("Failed parsing", file, e);
   }
}
