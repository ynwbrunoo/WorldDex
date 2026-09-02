const fs = require("fs");
const path = require("path");
const dir = "src/i18n/locales";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));

for (const file of files) {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, "utf8");
  content = content.replace(/"prev": "⬅ /g, "\"prev\": \"← ");
  fs.writeFileSync(fp, content, "utf8");
}
console.log("Done");

