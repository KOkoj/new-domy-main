const fs = require("fs");
const path = require("path");

const root = "C:/Users/39327/Desktop/har toscana";

for (let i = 1; i <= 15; i += 1) {
  const file = path.join(root, `${i}har.har`);
  const s = fs.readFileSync(file, "utf8");
  const urls = s.match(/https:\\\/\\\/pwm\.im-cdn\.it\\\/image[^"\\]+/g) || [];
  console.log(JSON.stringify({
    i,
    len: s.length,
    next: s.includes("__NEXT_DATA__"),
    detail: s.includes("detailData"),
    img: s.includes("pwm.im-cdn.it/image"),
    html: s.indexOf("<!DOCTYPE html"),
    textHtml: s.indexOf('"text": "<!DOCTYPE html'),
    imageUrls: urls.slice(0, 3).map((url) => url.replace(/\\\//g, "/")),
  }));
}
