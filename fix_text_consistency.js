const fs = require('fs');

const files = ['docs/transactions.html', 'src/transactions.html'];

files.forEach(file => {
    if(!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    const targetLabelOld = 'Kamu belinya dimana? (Contoh : Indomaret)';
    const targetLabelNew = 'Kamu belinya dimana? (Opsional)';
    
    const targetPlaceholderOld = 'placeholder="Opsional"';
    const targetPlaceholderNew = 'placeholder="Contoh : Indomaret"';
    
    if(content.includes(targetLabelOld) && content.includes(targetPlaceholderOld)) {
        content = content.replace(targetLabelOld, targetLabelNew);
        content = content.replace(targetPlaceholderOld, targetPlaceholderNew);
        fs.writeFileSync(file, content);
        console.log(`Updated text consistency in ${file}`);
    } else {
        console.log(`Could not find the target strings in ${file}`);
    }
});
