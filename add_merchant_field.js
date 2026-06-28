const fs = require('fs');

// 1. Update HTML files
const htmlFiles = ['docs/transactions.html', 'src/transactions.html'];
const newFieldHtml = `
                    <!-- Tempat Beli / Merchant -->
                    <div class="mb-4" id="merchantGroup">
                      <label for="merchant" class="form-label text-muted fw-semibold">Kamu belinya dimana? (Contoh : Indomaret)</label>
                      <input type="text" class="form-control form-control-lg rounded-3 bg-light border-0" id="merchant" placeholder="Opsional" autocomplete="off" />
                    </div>
`;

htmlFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Insert after category selection (btnSelectCategory container)
    // The exact HTML is:
    // </button>
    // </div>
    // 
    // <!-- Amortisasi
    
    const insertPointStr = '</button>\n                    </div>';
    
    if (content.includes('id="merchant"')) {
        console.log(`Merchant field already exists in ${file}`);
    } else {
        const parts = content.split('id="btnSelectCategory"');
        if (parts.length > 1) {
            const endOfDivIdx = parts[1].indexOf('</div>') + 6;
            const insertPoint = parts[0].length + 'id="btnSelectCategory"'.length + endOfDivIdx;
            
            content = content.substring(0, insertPoint) + '\n' + newFieldHtml + content.substring(insertPoint);
            fs.writeFileSync(file, content);
            console.log(`Updated ${file}`);
        }
    }
});

// 2. Update app.js
const jsFiles = ['docs/assets/js/app.js', 'src/assets/js/app.js', 'app-beautified.js'];
jsFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    const oldPayload = 'description:document.getElementById("description").value,is_periodic:g,amortization_days:v';
    const newPayload = 'description:document.getElementById("description").value,merchant:(document.getElementById("merchant")?document.getElementById("merchant").value:null),is_periodic:g,amortization_days:v';
    
    if (content.includes(oldPayload)) {
        content = content.replace(oldPayload, newPayload);
        
        // Also update the form reset logic
        // r.reset(),p.value="",m.value="",
        // we can just rely on r.reset() to clear the merchant field since it's part of the form
        
        fs.writeFileSync(file, content);
        console.log(`Patched ${file} with payload update`);
    } else if (content.includes('merchant:')) {
        console.log(`Already patched ${file}`);
    } else {
        console.log(`Could not find payload target in ${file}`);
    }
});
