const fs = require('fs');

let appJs = fs.readFileSync('docs/assets/js/savings.js', 'utf8');

appJs = appJs.replace(/\balert\(([^)]+)\)/g, 'await CustomAlert.alert($1)');
appJs = appJs.replace(/\bconfirm\(([^)]+)\)/g, '(await CustomAlert.confirm($1))');

fs.writeFileSync('docs/assets/js/savings.js', appJs);
console.log('Refactored savings.js');
