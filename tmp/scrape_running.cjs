const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeRunning() {
    const pageUrl = "https://sites.google.com/view/wadah-merah-putih/running";
    const outputDir = path.join(__dirname, '..', 'wadah_merah_putih_data');
    let interceptedText = null;
    
    console.log("Starting Chrome...");
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });
    
    const page = await browser.newPage();
    
    page.on('response', async (res) => {
        const url = res.url();
        if ((url.includes('script.google.com') || url.includes('script.googleusercontent.com')) && res.status() === 200) {
            try {
                const text = await res.text();
                // Check if it's the right array payload
                if(text && text.includes('"rows"') && text.includes('"cells"')) {
                       console.log("INTERCEPTED: " + url);
                       interceptedText = text;
                       fs.writeFileSync(path.join(outputDir, 'data_running.json_raw.txt'), text);
                }
            } catch(e) {}
        }
    });

    console.log(`Navigating to ${pageUrl}...`);
    await page.goto(pageUrl, { waitUntil: 'networkidle0', timeout: 60000 });
    
    // Sometimes we need to wait explicitly for google app scripts to fire json requests
    console.log("Waiting 10 seconds for inner iframes to fetch JSON...");
    await new Promise(r => setTimeout(r, 10000));
    
    await browser.close();
    
    if (interceptedText) {
        try {
            let json = JSON.parse(interceptedText);
            let data = [];
            if (json.rows) {
               data = json.rows.map(row => {
                   let obj = row.cells || {};
                   const links = [];
                   for(let key in row) {
                       if(typeof row[key] === 'object' && row[key] !== null) {
                           if(row[key].url) {
                               links.push({ label: key, url: row[key].url });
                           }
                       }
                   }
                   if(links.length > 0) obj['_links'] = links;
                   return obj;
               });
            }
            fs.writeFileSync(path.join(outputDir, 'data_running.json'), JSON.stringify(data, null, 2));
            console.log(`[SUCCESS] Parsed ${data.length} records into data_running.json`);
        } catch(e) {
            console.error("Parse failed");
        }
    } else {
        console.log("Failed to intercept data_running payload");
    }
}

scrapeRunning();
