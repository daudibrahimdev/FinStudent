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
    const target = './assets/images/brand/logo/logo-icon.svg';
    const replacement = './assets/images/logo/finstudent-logo.svg" style="height: 32px; width: auto; object-fit: contain;';
    
    const target2 = '../assets/images/brand/logo/logo-icon.svg';
    const replacement2 = '../assets/images/logo/finstudent-logo.svg" style="height: 32px; width: auto; object-fit: contain;';

    if (content.includes(target) || content.includes(target2)) {
        content = content.split(target).join(replacement);
        content = content.split(target2).join(replacement2);
        fs.writeFileSync(file, content);
        changed++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Total files updated: ${changed}`);
