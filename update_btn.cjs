const fs = require("fs");
let code = fs.readFileSync("src/components/Tutorial/TutorialOverlay.tsx", "utf8");

code = code.replace(
  /btn\.style\.textAlign = "center";/,
  `btn.style.textAlign = "center";
              btn.style.minHeight = "44px";
              btn.style.padding = "8px 16px";`
);

fs.writeFileSync("src/components/Tutorial/TutorialOverlay.tsx", code);
console.log("Done");

