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

async function scrapePage(browser, target) {
    const page = await browser.newPage();
    console.log(`Navigating to ${target.url}...`);
    try {
        await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Find the embedded iframe
         // The google site embed is typically inside an iframe.
        let iframeSrc = await page.evaluate(() => {
            const iframes = document.querySelectorAll('iframe');
            for(let i=0; i<iframes.length; i++){
                if(iframes[i].src.includes('script.google.com') || iframes[i].src.includes('googleusercontent.com')) {
                    return iframes[i].src;
                }
            }
            return null;
        });
        
        // Sometimes it's double wrapped
        if (!iframeSrc) {
             const innerSrc = await page.evaluate(() => {
                 const iframe = document.querySelector('iframe');
                 if(iframe) return iframe.src;
                 return null;
             });
             if(innerSrc) {
                 await page.goto(innerSrc, { waitUntil: 'networkidle2' });
                 iframeSrc = await page.evaluate(() => {
                    const iframes = document.querySelectorAll('iframe');
                    for(let i=0; i<iframes.length; i++){
                        if(iframes[i].src.includes('script.google') || iframes[i].src.includes('googleusercontent')) return iframes[i].src;
                    }
                    return null;
                });
             }
        }

        if(!iframeSrc) {
             console.log(`Failed to find iframe for ${target.name}`);
             return;
        }

        console.log(`Found iFrame for ${target.name}: ${iframeSrc}`);
        const dataPage = await browser.newPage();
        await dataPage.goto(iframeSrc, { waitUntil: 'networkidle2' });
        
        // Wait for table to load
        await dataPage.waitForSelector('table', {timeout: 10000}).catch(() => {});
        
        // Try to select 'All' or '150' from the dropdown to show all rows
        await dataPage.evaluate(() => {
            const selects = document.querySelectorAll('select');
            selects.forEach(select => {
                if(select.name.includes('length')) {
                    // Try to find an option with value -1 (All) or> 100
                    let bestOption = select.options[0].value;
                    let maxVal = 0;
                    for(let i=0; i<select.options.length; i++) {
                        let val = parseInt(select.options[i].value);
                        if(val === -1) {
                            bestOption = '-1';
                            break;
                        }
                        if(val > maxVal) { maxVal = val; bestOption = select.options[i].value; }
                    }
                    select.value = bestOption;
                    select.dispatchEvent(new Event('change'));
                }
            });
        });

        await dataPage.waitForTimeout(2000); // Wait for DataTables to re-render

        // Extract the table structured data including links
        const extractedData = await dataPage.evaluate(() => {
            const results = [];
            const table = document.querySelector('table');
            if(!table) return [];
            
            const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText.trim());
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
               const cells = row.querySelectorAll('td');
               const rowObj = {};
               const links = [];
               
               cells.forEach((cell, idx) => {
                   const key = headers[idx] || `col_${idx}`;
                   rowObj[key] = cell.innerText.trim();
                   
                   // Extract buttons / links
                   const aTags = cell.querySelectorAll('a');
                   aTags.forEach(a => {
                       if(a.href && !a.href.includes('javascript:')) {
                           links.push({
                               text: a.innerText.trim() || 'link',
                               url: a.href,
                               column: key
                           });
                       }
                   });
               });
               
               if(links.length > 0) rowObj['_links'] = links;
               
               // Only add if not an empty row
               if(Object.keys(rowObj).length > 1) {
                   results.push(rowObj);
               }
            });
            return results;
        });

        const outPath = path.join(__dirname, '..', target.name);
        fs.writeFileSync(outPath, JSON.stringify(extractedData, null, 2));
        console.log(`Saved ${extractedData.length} records to ${target.name}`);
        
        await dataPage.close();

    } catch (err) {
        console.error(`Error processing ${target.name}:`, err.message);
    } finally {
        await page.close();
    }
}

(async () => {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });
    
    for(let target of TARGETS) {
        await scrapePage(browser, target);
    }
    
    await browser.close();
    console.log("All done.");
})();
