const fs = require('fs');
const path = require('path');

function patchIndexHtml(filePath) {
  if (!fs.existsSync(filePath)) { console.log('File not found: ' + filePath); return; }
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add id to Daily Survival label so JS can change it dynamically
  content = content.replace(
    '<div class="fw-semibold">Daily Survival</div>',
    '<div class="fw-semibold" id="dailySurvivalLabel">Daily Survival</div>'
  );

  // 2. Add onboarding.js script tag before </body>
  if (!content.includes('onboarding.js')) {
    content = content.replace(
      '  <script src="./assets/js/app.js"></script>\n</body>',
      '  <script src="./assets/js/app.js"></script>\n  <script src="./assets/js/onboarding.js"></script>\n</body>'
    );
  }

  fs.writeFileSync(filePath, content);
  console.log('Patched: ' + filePath);
}

patchIndexHtml(path.join(__dirname, 'docs', 'index.html'));
patchIndexHtml(path.join(__dirname, 'src', 'index.html'));
