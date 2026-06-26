const fs = require('fs');
let code = fs.readFileSync('docs/assets/js/vendors/chart.js', 'utf8');
code += '\ndocument.addEventListener("shown.bs.tab", function(e) { window.dispatchEvent(new Event("resize")); });\n';
fs.writeFileSync('docs/assets/js/vendors/chart.js', code);
console.log('Modified chart.js');
