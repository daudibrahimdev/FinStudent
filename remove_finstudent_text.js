const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.html')) results.push(file);
        }
    });
    return results;
}

const files = walk('docs').concat(walk('src'));
let changed = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const target = '<span class="fw-bold fs-4 site-logo-text">FinStudent</span>';
    
    if (content.includes(target)) {
        content = content.split(target).join('');
        fs.writeFileSync(file, content);
        changed++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Total files updated: ${changed}`);
