const fs = require('fs');

const jsFiles = ['docs/assets/js/app.js', 'src/assets/js/app.js'];
jsFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // In duplicate selection logic:
    // c.value=i.amortization_days,b()),document.getElementById("description").value=i.description||""
    // Let's replace it to also fill merchant.
    
    const targetOld = 'document.getElementById("description").value=i.description||""';
    const targetNew = 'document.getElementById("description").value=i.description||""; if(document.getElementById("merchant")) document.getElementById("merchant").value=i.merchant||""';
    
    if (content.includes(targetOld)) {
        content = content.replace(targetOld, targetNew);
        fs.writeFileSync(file, content);
        console.log(`Patched duplicate logic in ${file}`);
    }
});
