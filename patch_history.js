const fs = require('fs');

const jsFiles = ['docs/assets/js/app.js', 'src/assets/js/app.js'];
jsFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // In history desktop view (table):
    // <td><strong>${n.description||"-"}</strong></td>
    // we want to add:
    // <td><strong>${n.description||"-"}</strong>${n.merchant ? '<br><small class="text-muted"><i class="ti ti-map-pin"></i> ' + n.merchant + '</small>' : ''}</td>
    
    const oldHtml1 = '<td><strong>${n.description||"-"}</strong></td>';
    const newHtml1 = '<td><strong>${n.description||"-"}</strong>${n.merchant ? \'<br><small class="text-muted"><i class="ti ti-map-pin"></i> \' + n.merchant + \'</small>\' : \'\'}</td>';
    
    if (content.includes(oldHtml1)) {
        content = content.replace(oldHtml1, newHtml1);
        console.log(`Patched table logic in ${file}`);
    }

    fs.writeFileSync(file, content);
});
