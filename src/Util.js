const fs = require('fs-extra');
const md5File = require('md5-file/promise');
const axios = require('axios');
const fs = require('fs-extra');

async function fileExist(name) {
    return fs.access(name, fs.constants.F_OK).then(() => true).catch(() => false);
}

async function sameFile(file1, file2) {
    let md51 = await md5File(file1);
    let md52 = await md5File(file2);
    return md51 === md52;
}

async function downloadFile(pdfUrl) {
    var result = await axios.get(pdfUrl,{responseType: 'arraybuffer'});
    await fs.writeFile(outputFilename, result.data);
}
module.exports = {fileExist, sameFile, downloadFile};