const fs = require('fs');

const files = ['docs/transactions.html', 'src/transactions.html'];

files.forEach(file => {
    if(!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    const merchantBlock = `
                    <!-- Tempat Beli / Merchant -->
                    <div class="mb-4" id="merchantGroup">
                      <label for="merchant" class="form-label text-muted fw-semibold">Kamu belinya dimana? (Contoh : Indomaret)</label>
                      <input type="text" class="form-control form-control-lg rounded-3 bg-light border-0" id="merchant" placeholder="Opsional" autocomplete="off" />
                    </div>
`;

    // Remove the misplaced merchant block
    content = content.replace(merchantBlock, '');

    // The description block looks like this:
    /*
                    <!-- Deskripsi -->
                    <div class="mb-5">
                      <label for="description" class="form-label text-muted">Catatan (Opsional)</label>
                      <textarea class="form-control bg-gray-100 border-0" id="description" rows="2" placeholder="Contoh: Belanja sembako mingguan"></textarea>
                    </div>
    */
    
    // We want to insert the merchant block right BEFORE the description block.
    // So we search for <!-- Deskripsi -->
    
    const target = '<!-- Deskripsi -->';
    if(content.includes(target)) {
        content = content.replace(target, merchantBlock.trim() + '\n\n                    ' + target);
        fs.writeFileSync(file, content);
        console.log(`Fixed merchant placement in ${file}`);
    } else {
        console.log(`Could not find description block in ${file}`);
    }
});
