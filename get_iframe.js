const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://sites.google.com/view/wadah-merah-putih/running', {waitUntil: 'networkidle2'});
    const iframes = await page.$$eval('iframe', frames => frames.map(f => f.src));
    console.log("IFRAMES:", iframes);
    await browser.close();
})();
