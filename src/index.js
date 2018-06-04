const fetch = require('./fetchPdf.js');
const parse = require('./parsePdf.js');
const util = require('./Util.js');
const fs = require('fs-extra');
const md5File = require('md5-file');
const Koa = require('koa');
const Router = require('koa-router');
const moment = require('moment');

var app = new Koa();
var router = new Router();


const pdfPath = './cache/pdf/ON_Mailer.pdf';
const cachePath = './cache/json/ON_Cache.json';

var cached = [];
var cachedTime = moment("1900-01-01"); //just an old date

async function fetchAndParse() {
    let url = await fetch.fetch();
    let fileExist = await util.fileExist(pdfPath);
    if (fileExist) await fs.rename(pdfPath, pdfPath+'.bak');
    await util.downloadFile(url, pdfPath);
    if (fileExist && util.sameFile(pdfPath, pdfPath+'.bak')){
        console.log('No new coupons found');
        cachedTime = moment();
        return cached;
    }
    let text = await parse.parsePdf(pdfPath);
    console.log('New coupons fetched');
    if (text != []){
        cached = text;
        cachedTime = moment();
        util.saveFile(cachePath, {time: cachedTime.format(), coupons: text});
    }
    return text;
}

router.get('/', async ctx => {
    let endOfDay = moment().endOf('day');
    let yesterday = moment().subtract(1, 'day');
    let text = [];
    if (yesterday.isSameOrBefore(cachedTime)){
        cached = cached.filter(x=> moment(x.endDate).isSameOrAfter(endOfDay));
        if (cached != []) text = cached;
    } else {
        text = await fetchAndParse();
    }
    ctx.status = 200;
    ctx.body = text;
});

util.fileExist(cachePath).then(async exist => {
    if (exist) {
        let cacheJson = await util.readFromFile(cachePath);
        cached = cacheJson.coupons;
        cachedTime = moment(cacheJson.time);
    } else {
        fetchAndParse();
    }
})

app.use(router.routes())
   .use(router.allowedMethods());

app.listen(3060, () => console.log('App listening on 3060'));
