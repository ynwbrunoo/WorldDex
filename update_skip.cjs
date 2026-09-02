const fs = require("fs");
let code = fs.readFileSync("src/components/Tutorial/TutorialOverlay.tsx", "utf8");
code = code.replace(
  /skipBtn\.style\.cursor = "pointer";/,
  `skipBtn.style.cursor = "pointer";
            skipBtn.style.outline = "none";
            skipBtn.style.boxShadow = "none";
            skipBtn.tabIndex = -1; // Prevent driver.js from auto-focusing this specific button`
);
fs.writeFileSync("src/components/Tutorial/TutorialOverlay.tsx", code);

