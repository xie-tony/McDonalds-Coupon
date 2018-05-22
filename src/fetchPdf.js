var puppeteer = require('puppeteer');

const McdonaldUrl = 'https://www4.mcdonalds.ca/coupons/';
const outputFilename = './pdf/ON_Mailer.pdf';

async function fetch() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto(McdonaldUrl, {waitUntil: 'networkidle0'});
    
    await page.click('.desktop #province');
    await page.select('.desktop #provinceorig', 'ON');
    
    const pdfForm = await page.$('#theForm');
    const pdfElement = await pdfForm.getProperty('action');
    const pdfUrl = await pdfElement.jsonValue();
    //console.log(pdfUrl);
    browser.close();
    return pdfUrl
}

module.exports = {fetch};