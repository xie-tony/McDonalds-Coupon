var fs = require('fs');
var pdfjsLib = require('pdfjs-dist');

var pdfPath = './pdf/ON_Mailer.pdf';
var margin = 0.74 * 72; //0.74 inch in pt, according to pdf ruler

async function parsePdf() {
  let doc = await pdfjsLib.getDocument(pdfPath);
  var numPages = doc.numPages;
  var texts = [];

  async function parsePage(pageNum) {
    let page = await doc.getPage(pageNum);
    let viewport = page.getViewport(1.0);
    let content = await page.getTextContent();
    let objs = content.items.map(item => {
      objTransformed = pdfjsLib.Util.transform(viewport.transform, item.transform);
      return {page: pageNum, x: Math.round(objTransformed[4] * 10) / 10, y: Math.round(objTransformed[5] * 10) / 10, text:item.str};
    });
    //select only English and crop out margin
    objs = objs.filter(item=>(item.x > viewport.width/2 && item.x < (0.75* viewport.width - 0.5 * margin) && item.y > margin && item.y < viewport.height - margin));
    //order by y first then x
    objs.sort((a, b) => (a.y == b.y) ? a.x - b.x : a.y - b.y);
    return objs;
  }
  for (var i = 1; i <= numPages; i++) {
    let x = await parsePage(i);
    texts = texts.concat(x);
  }
  return texts;
}

module.exports = {parsePdf};