const fs = require("fs");

const s = fs.readFileSync("C:/Users/39327/Desktop/har toscana/3har.har", "utf8");
const terms = ["pwm.im-cdn.it/image", "im-cdn.it/image", '"mimeType":"image/', '"encoding":"base64"'];
for (const term of terms) {
  const at = s.indexOf(term);
  console.log(term, at);
  if (at >= 0) console.log(s.slice(Math.max(0, at - 300), at + 500));
}
