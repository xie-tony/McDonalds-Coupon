var puppeteer = require('puppeteer');
var axios = require('axios');
var fs = require('fs');

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
    await browser.close();
    
    var result = await axios.get(pdfUrl,{responseType: 'arraybuffer'});
    fs.writeFileSync(outputFilename, result.data);
    return pdfUrl
}

module.exports = {fetch};