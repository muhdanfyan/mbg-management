const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TARGETS = [
    { name: "data_running.json", url: "https://sites.google.com/view/wadah-merah-putih/running" },
    { name: "data_mobil_102_titik.json", url: "https://sites.google.com/view/wadah-merah-putih/mobil-102-titik" },
    { name: "data_titik_49.json", url: "https://sites.google.com/view/wadah-merah-putih/titik-49" },
    { name: "data_wilayah.json", url: "https://sites.google.com/view/wadah-merah-putih/wilayah" },
    { name: "data_titik_5.json", url: "https://sites.google.com/view/wadah-merah-putih/titik-5" }
];

async function scrapePage(browser, target, outputDir) {
    const page = await browser.newPage();
    console.log(`Navigating to ${target.url}...`);
    
    // We will save any big JSON response intercept
    let interceptedData = null;
    
    page.on('response', async (res) => {
        const url = res.url();
        if ((url.includes('script.google.com') || url.includes('script.googleusercontent.com')) && res.status() === 200) {
            try {
                const text = await res.text();
                if(text) {
                    // It's possible Google Apps script returns it inside a JS execution block or raw JSON
                    if(text.includes('{') || text.includes('[')) {
                       interceptedData = text;
                       fs.writeFileSync(path.join(outputDir, target.name + '_raw.txt'), text);
                    }
                }
            } catch(e) {}
        }
    });

    try {
        await page.goto(target.url, { waitUntil: 'networkidle0', timeout: 45000 });
        await new Promise(r => setTimeout(r, 5000));
        
        console.log(`Finished loading ${target.name}`);
        
    } catch (err) {
        console.error(`[ERROR] Processing ${target.name}:`, err.message);
    } finally {
        await page.close();
    }
}

(async () => {
    const outputDir = path.join(__dirname, '..', 'wadah_merah_putih_data');
    if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log("Starting Puppeteer Interceptor Scraper...");
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    for(let target of TARGETS) {
        await scrapePage(browser, target, outputDir);
    }
    
    await browser.close();
    console.log("All tasks completed.");
})();
