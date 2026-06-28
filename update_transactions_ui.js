const fs = require('fs');

let html = fs.readFileSync('docs/transactions.html', 'utf8');

// 1. Replace Tipe Transaksi
const typeOld = `
                    <!-- Tipe Transaksi (Modern Dropdown) -->
                    <div class="mb-4">
                      <label for="type" class="form-label text-muted fw-semibold">Tipe Transaksi</label>
                      <div class="custom-styled-select select-expense" id="typeSelectWrapper">
                        <select class="form-select" id="type" required>
                          <option value="pengeluaran">🔻 Pengeluaran</option>
                          <option value="pemasukan">🔺 Pemasukan</option>
                        </select>
                      </div>
                    </div>`;

const typeNew = `
                    <!-- Tipe Transaksi (Segmented Control) -->
                    <div class="mb-4">
                      <label class="form-label text-muted fw-semibold">Tipe Transaksi</label>
                      <div class="d-flex bg-light rounded-pill p-1 shadow-sm" role="group">
                        <input type="radio" class="btn-check" name="typeRadio" id="typePengeluaran" value="pengeluaran" checked>
                        <label class="btn btn-outline-danger border-0 rounded-pill w-100 fw-bold hover-lift-premium" for="typePengeluaran">
                          <i class="ti ti-arrow-down-right me-1"></i> Pengeluaran
                        </label>
                        
                        <input type="radio" class="btn-check" name="typeRadio" id="typePemasukan" value="pemasukan">
                        <label class="btn btn-outline-success border-0 rounded-pill w-100 fw-bold hover-lift-premium" for="typePemasukan">
                          <i class="ti ti-arrow-up-right me-1"></i> Pemasukan
                        </label>
                      </div>
                      <input type="hidden" id="type" value="pengeluaran">
                    </div>`;

// 2. Replace Sifat Pengeluaran
const natureOld = `
                    <!-- Sifat Pengeluaran (Modern Dropdown) -->
                    <div class="mb-4" id="natureGroup">
                      <label for="nature" class="form-label text-muted fw-semibold">Sifat Pengeluaran</label>
                      <div class="custom-styled-select select-kebutuhan" id="natureSelectWrapper">
                        <select class="form-select" id="nature" required>
                          <option value="kebutuhan">🎯 Kebutuhan</option>
                          <option value="keinginan">🛒 Keinginan</option>
                        </select>
                      </div>
                    </div>`;

const natureNew = `
                    <!-- Sifat Pengeluaran (Segmented Control) -->
                    <div class="mb-4" id="natureGroup">
                      <label class="form-label text-muted fw-semibold">Sifat Pengeluaran</label>
                      <div class="d-flex bg-light rounded-pill p-1 shadow-sm" role="group">
                        <input type="radio" class="btn-check" name="natureRadio" id="natureKebutuhan" value="kebutuhan" checked>
                        <label class="btn btn-outline-primary border-0 rounded-pill w-100 fw-bold hover-lift-premium" for="natureKebutuhan">
                          <i class="ti ti-target me-1"></i> Kebutuhan
                        </label>
                        
                        <input type="radio" class="btn-check" name="natureRadio" id="natureKeinginan" value="keinginan">
                        <label class="btn btn-outline-warning border-0 rounded-pill w-100 fw-bold hover-lift-premium" for="natureKeinginan">
                          <i class="ti ti-shopping-cart me-1"></i> Keinginan
                        </label>
                      </div>
                      <input type="hidden" id="nature" value="kebutuhan">
                    </div>`;

// 3. Replace Tanggal & Kategori Row
const catOld = `
                    <div class="row">
                      <div class="col-md-6 mb-4">
                        <!-- Tanggal -->
                        <label for="date" class="form-label text-muted">Tanggal</label>
                        <input type="date" class="form-control" id="date" required />
                      </div>
                      <div class="col-md-6 mb-4">
                        <!-- Kategori (dynamic) -->
                        <label for="category" class="form-label text-muted">Kategori</label>
                        <select class="form-select" id="category" required></select>
                      </div>
                    </div>`;

const catNew = `
                    <!-- Tanggal -->
                    <div class="mb-4">
                      <label for="date" class="form-label text-muted fw-semibold">Tanggal Transaksi</label>
                      <input type="date" class="form-control form-control-lg rounded-3 bg-light border-0" id="date" required />
                    </div>

                    <!-- Kategori (Premium Grid) -->
                    <div class="mb-4">
                      <label class="form-label text-muted fw-semibold d-flex justify-content-between">
                        <span>Pilih Kategori</span>
                        <span id="selectedCategoryText" class="badge bg-primary rounded-pill px-3 py-1 fw-bold" style="display: none;">Dipilih</span>
                      </label>
                      <input type="hidden" id="category" required>
                      <div class="row g-3" id="categoryGrid">
                        <!-- Kategori akan dirender di sini via JavaScript -->
                      </div>
                    </div>`;

// Perform replacements
html = html.replace(typeOld.trim(), typeNew.trim());
html = html.replace(natureOld.trim(), natureNew.trim());
html = html.replace(catOld.trim(), catNew.trim());

// 4. Inject Logic Script before </body>
const scriptInject = `
<!-- Transactions UI Injection Script -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  const typeRadios = document.querySelectorAll('input[name="typeRadio"]');
  const typeHidden = document.getElementById('type');
  const natureRadios = document.querySelectorAll('input[name="natureRadio"]');
  const natureHidden = document.getElementById('nature');
  const natureGroup = document.getElementById('natureGroup');
  const categoryGrid = document.getElementById('categoryGrid');
  const categoryHidden = document.getElementById('category');
  const selectedCategoryText = document.getElementById('selectedCategoryText');
  
  // Sync Radios to Hidden Inputs
  typeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      typeHidden.value = this.value;
      if (this.value === 'pemasukan') {
        natureGroup.style.display = 'none';
      } else {
        natureGroup.style.display = 'block';
      }
      renderCategoryGrid();
    });
  });

  natureRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      natureHidden.value = this.value;
      renderCategoryGrid();
    });
  });

  // Category Render Logic
  function renderCategoryGrid() {
    if (typeof FinCategories === 'undefined') return;
    
    categoryGrid.innerHTML = '';
    const currentType = typeHidden.value;
    const currentNature = natureHidden.value;
    
    let items = [];
    let activeColorClass = '';
    
    if (currentType === 'pemasukan') {
      items = FinCategories.pemasukan;
      activeColorClass = 'btn-outline-success';
    } else {
      items = currentNature === 'keinginan' ? FinCategories.keinginan : FinCategories.kebutuhan;
      activeColorClass = currentNature === 'keinginan' ? 'btn-outline-warning' : 'btn-outline-primary';
    }
    
    // Clear previous selection if type changes
    categoryHidden.value = '';
    selectedCategoryText.style.display = 'none';

    items.forEach(item => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-4';
      
      const card = document.createElement('div');
      card.className = 'card h-100 border-1 shadow-sm hover-lift-premium cursor-pointer text-center p-3 category-card';
      card.style.borderRadius = '16px';
      card.style.transition = 'all 0.2s ease';
      card.dataset.value = item.value;
      
      card.innerHTML = \`
        <div class="mb-2">
          <i class="ti \${item.icon}" style="font-size: 2rem; color: var(--ds-gray-500);"></i>
        </div>
        <div class="fw-semibold small" style="line-height: 1.2;">\${item.label}</div>
      \`;
      
      card.addEventListener('click', () => {
        // Remove active from all
        document.querySelectorAll('.category-card').forEach(c => {
          c.classList.remove('border-primary', 'border-warning', 'border-success', 'bg-primary-subtle', 'bg-warning-subtle', 'bg-success-subtle');
          c.style.borderColor = 'var(--ds-border-color)';
          const icon = c.querySelector('i');
          icon.style.color = 'var(--ds-gray-500)';
        });
        
        // Add active to this
        let borderClass = 'border-primary';
        let bgClass = 'bg-primary-subtle';
        let iconColor = 'var(--ds-primary)';
        
        if (currentType === 'pemasukan') {
          borderClass = 'border-success'; bgClass = 'bg-success-subtle'; iconColor = 'var(--ds-success)';
        } else if (currentNature === 'keinginan') {
          borderClass = 'border-warning'; bgClass = 'bg-warning-subtle'; iconColor = 'var(--ds-warning)';
        }
        
        card.classList.add(borderClass, bgClass);
        card.style.borderColor = iconColor;
        card.querySelector('i').style.color = iconColor;
        
        categoryHidden.value = item.value;
        selectedCategoryText.innerText = item.label;
        selectedCategoryText.style.display = 'inline-block';
        selectedCategoryText.className = \`badge rounded-pill px-3 py-1 fw-bold \${currentType === 'pemasukan' ? 'bg-success' : (currentNature === 'keinginan' ? 'bg-warning text-dark' : 'bg-primary')}\`;
        
        // Trigger validation clear for category if needed
        categoryHidden.dispatchEvent(new Event('change'));
      });
      
      col.appendChild(card);
      categoryGrid.appendChild(col);
    });
  }
  
  // Initial render
  setTimeout(() => {
    renderCategoryGrid();
    
    // Override form validation behavior since hidden inputs don't trigger native HTML5 popup
    const form = document.getElementById('transactionForm');
    form.addEventListener('submit', function(e) {
      if (!categoryHidden.value) {
        e.preventDefault();
        e.stopPropagation();
        selectedCategoryText.innerText = 'Pilih Kategori!';
        selectedCategoryText.className = 'badge bg-danger rounded-pill px-3 py-1 fw-bold';
        selectedCategoryText.style.display = 'inline-block';
        
        // highlight grid
        categoryGrid.classList.add('border', 'border-danger', 'rounded-3', 'p-2');
        setTimeout(() => categoryGrid.classList.remove('border', 'border-danger', 'rounded-3', 'p-2'), 2000);
      }
    }, true);
  }, 100);
});
</script>
`;

if (!html.includes('<!-- Transactions UI Injection Script -->')) {
  html = html.replace('</body>', scriptInject + '\n</body>');
}

fs.writeFileSync('docs/transactions.html', html);
console.log('transactions.html updated successfully with Premium UI grid!');
