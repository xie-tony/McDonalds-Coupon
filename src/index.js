const fetch = require('./fetchPdf.js');
const parse = require('./parsePdf.js');
const util = require('./Util.js');
const fs = require('fs-extra');
const md5File = require('md5-file');

const pdfPath = './pdf/ON_Mailer.pdf';
async function fetchAndParse() {
    let url = await fetch.fetch();
    let fileExist = await util.fileExist(pdfPath);
    if (fileExist) await fs.rename(pdfPath, pdfPath+'bak');
    await util.downloadFile(url, pdfPath);
    if (fileExist && util.sameFile(pdfPath, pdfPath+'bak')){
        console.log('No new coupons found');
        return;
    }
    let text = await parse.parsePdf(pdfPath);
    console.log(JSON.stringify(text));
    return text;
}

fetchAndParse();