const fs = require('fs');

const files = ['docs/transactions.html', 'src/transactions.html'];

files.forEach(file => {
    if(!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    const targetOld = '<textarea class="form-control bg-gray-100 border-0" id="description" rows="2" placeholder="Contoh: Belanja sembako mingguan"></textarea>';
    const targetNew = '<textarea class="form-control form-control-lg rounded-3 bg-light border-0" id="description" rows="2" placeholder="Contoh: Beli sabun cuci muka"></textarea>';
    
    if(content.includes(targetOld)) {
        content = content.replace(targetOld, targetNew);
        fs.writeFileSync(file, content);
        console.log(`Updated description textarea in ${file}`);
    } else {
        console.log(`Could not find the target string in ${file}`);
    }
});
