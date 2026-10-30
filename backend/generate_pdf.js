const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');

puppeteer.use(StealthPlugin());

(async () => {
    console.log("[PDF Generator] Launching browser...");
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1200, height: 800 });

    const htmlPath = 'file:///' + path.resolve(__dirname, 'handbook.html').replace(/\\/g, '/');
    console.log(`[PDF Generator] Loading page: ${htmlPath}`);

    await page.goto(htmlPath, { waitUntil: 'networkidle0' });

    // Emulate print media style
    await page.emulateMediaType('print');

    const pdfPath = path.resolve(__dirname, 'handbook.pdf');
    console.log(`[PDF Generator] Printing PDF to: ${pdfPath}`);

    await page.pdf({
        path: pdfPath,
        format: 'A4',
        margin: {
            top: '15mm',
            bottom: '15mm',
            left: '15mm',
            right: '15mm'
        },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<span style="font-size: 8px; font-family: Arial; color: #9ca3af; margin-left: 20px;">ClientsMine Developer Handbook</span>',
        footerTemplate: '<div style="font-size: 8px; font-family: Arial; color: #9ca3af; width: 100%; text-align: center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
    });

    console.log("[PDF Generator] PDF generated successfully!");
    await browser.close();
})();
