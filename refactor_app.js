const fs = require('fs');

let appJs = fs.readFileSync('docs/assets/js/app.js', 'utf8');

// Replace alert("something") with await CustomAlert.alert("something")
appJs = appJs.replace(/\balert\(([^)]+)\)/g, 'await CustomAlert.alert($1)');

// Replace confirm("something") with (await CustomAlert.confirm("something"))
appJs = appJs.replace(/\bconfirm\(([^)]+)\)/g, '(await CustomAlert.confirm($1))');

fs.writeFileSync('docs/assets/js/app.js', appJs);
console.log('Refactored app.js');
