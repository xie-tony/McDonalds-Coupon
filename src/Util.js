const fs = require('fs-extra');
const md5File = require('md5-file/promise');
const axios = require('axios');

async function fileExist(name) {
    return fs.access(name, fs.constants.F_OK).then(() => true).catch(() => false);
}

async function sameFile(file1, file2) {
    let md51 = await md5File(file1);
    let md52 = await md5File(file2);
    return md51 === md52;
}

async function downloadFile(pdfUrl, outputFilename) {
    var result = await axios.get(pdfUrl,{responseType: 'arraybuffer'});
    await fs.outputFile(outputFilename, result.data);
}

async function saveFile(fileName, text){
    return fs.outputJson(fileName, text);
}

async function readFromFile(fileName){
    return fs.readJson(fileName);
}
module.exports = {fileExist, sameFile, downloadFile, saveFile, readFromFile};