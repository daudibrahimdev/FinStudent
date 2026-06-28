const fs = require('fs');
let txt = fs.readFileSync('docs/transactions.html', 'utf8');
txt = txt.replace(/\\'/g, "'");
fs.writeFileSync('docs/transactions.html', txt);
fs.writeFileSync('src/transactions.html', txt);
console.log('Fixed syntax error in transactions.html!');
