var fs = require('fs');
var pdfjsLib = require('pdfjs-dist');
var moment = require('moment');

var pdfPath = './pdf/ON_Mailer.pdf';
var margin = 0.74 * 72; //0.74 inch in pt, according to pdf ruler

function findDate(str) {
  return str.match(/(January|Feburary|March|April|May|June|July|August|September|October|November|December) \d{1,2}/g);
}

async function parsePdf() {
  let doc = await pdfjsLib.getDocument(pdfPath);
  var numPages = doc.numPages;
  var coupons = [];
  
  async function parsePage(pageNum) {
    let page = await doc.getPage(pageNum);
    let viewport = page.getViewport(1.0);
    let content = await page.getTextContent();
    let objs = content.items.map(item => {
      objTransformed = pdfjsLib.Util.transform(viewport.transform, item.transform);
      return {x: Math.round(objTransformed[4] * 10) / 10, y: Math.round(objTransformed[5] * 10) / 10, text:item.str};
    });
    //select only English and crop out margin
    rightside = objs.filter(item=>(item.x > viewport.width/2 && item.x < (0.75* viewport.width - 0.5 * margin) && item.y > margin && item.y < viewport.height - margin));
    //order by y first then x
    rightside.sort((a, b) => (a.y == b.y) ? a.x - b.x : a.y - b.y);
    rightside = rightside.map(x=>x.text.replace(/®|©/g,' ')).join('').split('*').slice(1);
    rightside = [...new Set(rightside)];
    let descriptions = rightside.map(x=>x.substring(0,x.indexOf('!')));
    let dates = rightside.map(x => findDate(x));
    let codes = objs.filter(item => (item.x < viewport.width/2 && item.x > margin && item.y > margin && item.y < viewport.height - margin && item.text.match(/^[0-9]{9}$/g)));
    codes = codes.sort((a, b) => a.y - b.y).map(x=>x.text);
    codes = [...new Set(codes)];
    var output = [];
    for (var i = 0; i < descriptions.length; i++){
      let beginDate = moment(dates[i][0], "MMMM DD");
      let endDate = moment(dates[i][1], "MMMM DD");
      if (endDate.isBefore(beginDate)) endDate.add(1,"year");
      output.push({
        coupon: codes[i],
        beignDate: beginDate,
        endDate: endDate,
        description: descriptions[i]
      });
    }
    return output;
  }
  
  for (var i = 1; i <= numPages; i++) {
    let x = await parsePage(i);
    coupons = coupons.concat(x);
  }
  return coupons;
}

module.exports = {parsePdf};