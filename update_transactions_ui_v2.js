const fs = require('fs');

let html = fs.readFileSync('docs/transactions.html', 'utf8');

// 1. Replace the Kategori Grid with a Button
const oldCatGrid = `
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

const newCatBtn = `
                    <!-- Kategori (Pop-up Button) -->
                    <div class="mb-5">
                      <label class="form-label text-muted fw-semibold">Kategori Transaksi</label>
                      <input type="hidden" id="category" required>
                      <button type="button" class="btn btn-light border w-100 d-flex justify-content-between align-items-center rounded-4 p-3 shadow-sm hover-lift-premium" data-bs-toggle="modal" data-bs-target="#categoryModal" id="btnSelectCategory">
                        <div class="d-flex align-items-center">
                          <div class="icon-shape icon-md bg-white shadow-sm text-primary rounded-circle me-3 border" id="selectedCatIconBox">
                            <i class="ti ti-category fs-4" id="selectedCatIcon"></i>
                          </div>
                          <div class="text-start">
                            <h6 class="mb-0 fw-bold text-dark" id="selectedCatTitle">Pilih Kategori</h6>
                            <small class="text-muted" id="selectedCatSubtitle">Ketuk untuk memilih</small>
                          </div>
                        </div>
                        <i class="ti ti-chevron-right text-muted"></i>
                      </button>
                    </div>`;

html = html.replace(oldCatGrid.trim(), newCatBtn.trim());

// 2. Add the Modals just before <!-- Libs JS -->
const modalsHTML = `
<!-- Category Selection Modal -->
<div class="modal fade" id="categoryModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content rounded-4 border-0 shadow-premium glass-effect">
      <div class="modal-header border-0 bg-primary text-white p-4">
        <h5 class="modal-title text-white fw-bold"><i class="ti ti-category me-2"></i>Pilih Kategori</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body p-4 bg-light">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="fw-bold mb-0 text-muted" id="catModalSubtitle">Kategori Tersedia</h6>
          <button type="button" class="btn btn-sm btn-outline-primary rounded-pill fw-semibold hover-lift-premium" data-bs-toggle="modal" data-bs-target="#manageCategoryModal" id="btnAddCategoryBtn">
            <i class="ti ti-plus me-1"></i>Kategori Baru
          </button>
        </div>
        <div class="row g-3" id="modalCategoryGrid">
          <!-- Rendered via JS -->
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Manage Custom Category Modal -->
<div class="modal fade" id="manageCategoryModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content rounded-4 border-0 shadow-lg">
      <div class="modal-header border-0 pb-0">
        <h5 class="modal-title fw-bold" id="manageCatTitle">Tambah Kategori Baru</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#categoryModal" aria-label="Close"></button>
      </div>
      <div class="modal-body p-4">
        <form id="manageCatForm">
          <input type="hidden" id="manageCatId">
          <div class="mb-4">
            <label class="form-label text-muted fw-semibold">Nama Kategori</label>
            <input type="text" class="form-control form-control-lg rounded-3" id="manageCatLabel" placeholder="Cth: Nongkrong Cafe" required autocomplete="off">
          </div>
          <div class="mb-4">
            <label class="form-label text-muted fw-semibold d-flex justify-content-between">
              <span>Pilih Icon</span>
              <span id="selectedIconPreview" class="text-primary"><i class="ti ti-circle fs-4"></i></span>
            </label>
            <input type="hidden" id="manageCatIcon" required>
            <div class="card bg-light border-0 rounded-4 p-3" style="max-height: 200px; overflow-y: auto;">
              <div class="row g-2" id="iconPickerGrid">
                <!-- Icons rendered via JS -->
              </div>
            </div>
          </div>
          <div class="d-flex gap-2 mt-4">
            <button type="button" class="btn btn-light rounded-pill w-100 fw-bold hover-lift" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#categoryModal">Batal</button>
            <button type="submit" class="btn btn-primary rounded-pill w-100 fw-bold hover-lift-premium shadow-sm">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
`;

if (!html.includes('id="categoryModal"')) {
  html = html.replace('<!-- Libs JS -->', modalsHTML + '\n<!-- Libs JS -->');
}

// 3. Remove the old script completely
const startScript = '<!-- Transactions UI Injection Script -->';
const endScript = '</script>';

if (html.includes(startScript)) {
  const startIndex = html.indexOf(startScript);
  const endIndex = html.indexOf(endScript, startIndex) + endScript.length;
  html = html.substring(0, Math.max(0, startIndex)) + html.substring(endIndex);
}

// 4. Inject the NEW Script
const newScript = `
<!-- Transactions UI Injection Script V2 -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  const typeRadios = document.querySelectorAll('input[name="typeRadio"]');
  const typeHidden = document.getElementById('type');
  const natureRadios = document.querySelectorAll('input[name="natureRadio"]');
  const natureHidden = document.getElementById('nature');
  const natureGroup = document.getElementById('natureGroup');
  const categoryHidden = document.getElementById('category');
  
  const modalCategoryGrid = document.getElementById('modalCategoryGrid');
  const catModalSubtitle = document.getElementById('catModalSubtitle');
  
  const selectedCatIcon = document.getElementById('selectedCatIcon');
  const selectedCatIconBox = document.getElementById('selectedCatIconBox');
  const selectedCatTitle = document.getElementById('selectedCatTitle');
  const selectedCatSubtitle = document.getElementById('selectedCatSubtitle');
  const btnSelectCategory = document.getElementById('btnSelectCategory');
  
  // Icon list for custom categories
  const availableIcons = [
    'ti-coffee', 'ti-shopping-cart', 'ti-car', 'ti-building', 'ti-device-gamepad',
    'ti-heart', 'ti-plane', 'ti-book', 'ti-pizza', 'ti-shirt', 'ti-devices', 'ti-home',
    'ti-paw', 'ti-music', 'ti-camera', 'ti-tools', 'ti-cut', 'ti-baby-carriage', 'ti-school', 'ti-briefcase'
  ];
  
  // Manage modal elements
  const manageCatForm = document.getElementById('manageCatForm');
  const manageCatId = document.getElementById('manageCatId');
  const manageCatLabel = document.getElementById('manageCatLabel');
  const manageCatIcon = document.getElementById('manageCatIcon');
  const selectedIconPreview = document.getElementById('selectedIconPreview');
  const iconPickerGrid = document.getElementById('iconPickerGrid');
  const manageCatTitle = document.getElementById('manageCatTitle');
  
  let categoryModalInstance = null;
  if(typeof bootstrap !== 'undefined') {
    categoryModalInstance = new bootstrap.Modal(document.getElementById('categoryModal'));
  }

  // Handle Type changes
  typeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      typeHidden.value = this.value;
      if (this.value === 'pemasukan') {
        natureGroup.style.display = 'none';
      } else {
        natureGroup.style.display = 'block';
      }
      resetSelection();
      renderModalCategoryGrid();
    });
  });

  // Handle Nature changes
  natureRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      natureHidden.value = this.value;
      resetSelection();
      renderModalCategoryGrid();
    });
  });

  function resetSelection() {
    categoryHidden.value = '';
    selectedCatTitle.innerText = 'Pilih Kategori';
    selectedCatSubtitle.innerText = 'Ketuk untuk memilih';
    selectedCatIcon.className = 'ti ti-category fs-4';
    selectedCatIconBox.className = 'icon-shape icon-md bg-white shadow-sm text-primary rounded-circle me-3 border';
    btnSelectCategory.classList.remove('border-primary', 'border-success', 'border-warning');
  }

  function renderModalCategoryGrid() {
    if (typeof FinCategories === 'undefined') return;
    
    modalCategoryGrid.innerHTML = '';
    const currentType = typeHidden.value;
    const currentNature = natureHidden.value;
    
    let items = [];
    let badgeClass = '';
    let iconColor = '';
    
    if (currentType === 'pemasukan') {
      items = FinCategories.pemasukan;
      catModalSubtitle.innerText = 'Kategori Pemasukan';
      badgeClass = 'bg-success-subtle text-success';
      iconColor = 'text-success';
    } else {
      if(currentNature === 'keinginan') {
        items = FinCategories.keinginan;
        catModalSubtitle.innerText = 'Kategori Keinginan';
        badgeClass = 'bg-warning-subtle text-warning';
        iconColor = 'text-warning';
      } else {
        items = FinCategories.kebutuhan;
        catModalSubtitle.innerText = 'Kategori Kebutuhan';
        badgeClass = 'bg-primary-subtle text-primary';
        iconColor = 'text-primary';
      }
    }

    items.forEach(item => {
      const col = document.createElement('div');
      col.className = 'col-4 col-sm-3';
      
      const card = document.createElement('div');
      card.className = 'card h-100 border-0 shadow-sm hover-lift-premium text-center position-relative';
      card.style.borderRadius = '16px';
      card.style.cursor = 'pointer';
      
      // If selected
      if (categoryHidden.value === item.value) {
        card.classList.add('border', 'border-2');
        if(currentType === 'pemasukan') card.classList.add('border-success');
        else if(currentNature === 'keinginan') card.classList.add('border-warning');
        else card.classList.add('border-primary');
      }

      let deleteBtnHtml = '';
      if (item.isCustom) {
        deleteBtnHtml = \`
          <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle p-1 m-1 shadow" style="width:24px; height:24px; line-height: 1;" onclick="event.stopPropagation(); deleteCustomCat('\${item.id}')">
            <i class="ti ti-x" style="font-size: 12px;"></i>
          </button>\`;
      }
      
      card.innerHTML = \`
        \${deleteBtnHtml}
        <div class="card-body p-3 d-flex flex-column align-items-center justify-content-center">
          <div class="icon-shape icon-lg \${badgeClass} rounded-circle mb-2">
            <i class="ti \${item.icon} fs-3"></i>
          </div>
          <div class="fw-semibold" style="font-size: 0.75rem; line-height: 1.2;">\${item.label}</div>
        </div>
      \`;
      
      card.addEventListener('click', () => {
        categoryHidden.value = item.value;
        selectedCatTitle.innerText = item.label;
        selectedCatSubtitle.innerText = currentType === 'pemasukan' ? 'Pemasukan' : (currentNature === 'kebutuhan' ? 'Kebutuhan' : 'Keinginan');
        selectedCatIcon.className = \`ti \${item.icon} fs-4 text-white\`;
        
        let boxBg = 'bg-primary';
        let btnBorder = 'border-primary';
        if(currentType === 'pemasukan') { boxBg = 'bg-success'; btnBorder = 'border-success'; }
        else if(currentNature === 'keinginan') { boxBg = 'bg-warning'; btnBorder = 'border-warning'; selectedCatIcon.classList.remove('text-white'); selectedCatIcon.classList.add('text-dark'); }
        
        selectedCatIconBox.className = \`icon-shape icon-md \${boxBg} shadow-sm rounded-circle me-3\`;
        btnSelectCategory.classList.remove('border-primary', 'border-success', 'border-warning');
        btnSelectCategory.classList.add(btnBorder);
        
        btnSelectCategory.classList.remove('is-invalid'); // clear invalid state
        
        if (categoryModalInstance) categoryModalInstance.hide();
        renderModalCategoryGrid(); // re-render to show selection
      });
      
      col.appendChild(card);
      modalCategoryGrid.appendChild(col);
    });
  }
  
  // Global delete function
  window.deleteCustomCat = function(id) {
    if(confirm('Hapus kategori kustom ini?')) {
      if(typeof LocalStore !== 'undefined') {
        LocalStore.deleteCustomCategory(id);
        if (categoryHidden.value && document.getElementById('manageCatId').value === id) {
          resetSelection();
        }
        renderModalCategoryGrid();
      }
    }
  }

  // Render Icon Picker
  function renderIconPicker() {
    iconPickerGrid.innerHTML = '';
    availableIcons.forEach(icon => {
      const col = document.createElement('div');
      col.className = 'col-2 text-center';
      
      const btn = document.createElement('div');
      btn.className = 'p-2 rounded-circle hover-lift cursor-pointer icon-choice';
      btn.innerHTML = \`<i class="ti \${icon} fs-4 text-secondary"></i>\`;
      
      btn.addEventListener('click', () => {
        document.querySelectorAll('.icon-choice').forEach(c => {
          c.classList.remove('bg-primary', 'text-white');
          c.querySelector('i').classList.replace('text-white', 'text-secondary');
        });
        btn.classList.add('bg-primary');
        btn.querySelector('i').classList.replace('text-secondary', 'text-white');
        manageCatIcon.value = icon;
        selectedIconPreview.innerHTML = \`<i class="ti \${icon} fs-4"></i>\`;
      });
      
      col.appendChild(btn);
      iconPickerGrid.appendChild(col);
    });
  }

  document.getElementById('btnAddCategoryBtn').addEventListener('click', () => {
    manageCatId.value = '';
    manageCatLabel.value = '';
    manageCatIcon.value = 'ti-star';
    manageCatTitle.innerText = 'Tambah Kategori Baru';
    selectedIconPreview.innerHTML = \`<i class="ti ti-star fs-4"></i>\`;
    renderIconPicker();
  });

  manageCatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const label = manageCatLabel.value.trim();
    const icon = manageCatIcon.value || 'ti-star';
    if(!label) return;
    
    const catType = typeHidden.value;
    const catNature = natureHidden.value;
    const natureVal = catType === 'pemasukan' ? 'pemasukan' : catNature;
    
    const newCat = {
      id: manageCatId.value || null,
      value: label,
      label: label,
      icon: icon,
      nature: natureVal,
      isPeriodic: false,
      isCustom: true
    };
    
    if(typeof LocalStore !== 'undefined') {
      LocalStore.saveCustomCategory(newCat);
      
      // Close manage modal, open category modal
      const mModal = bootstrap.Modal.getInstance(document.getElementById('manageCategoryModal'));
      if(mModal) mModal.hide();
      
      if(categoryModalInstance) categoryModalInstance.show();
      
      renderModalCategoryGrid();
    }
  });

  // Form Validation Override
  const form = document.getElementById('transactionForm');
  form.addEventListener('submit', function(e) {
    if (!categoryHidden.value) {
      e.preventDefault();
      e.stopPropagation();
      btnSelectCategory.classList.add('is-invalid', 'border-danger', 'bg-danger-subtle');
      selectedCatTitle.innerText = 'Pilih Kategori Dulu!';
      selectedCatTitle.classList.add('text-danger');
      setTimeout(() => {
        btnSelectCategory.classList.remove('is-invalid', 'bg-danger-subtle');
        selectedCatTitle.classList.remove('text-danger');
        if(!categoryHidden.value) selectedCatTitle.innerText = 'Pilih Kategori';
      }, 2000);
    }
  }, true);

  setTimeout(() => {
    renderModalCategoryGrid();
  }, 100);
});
</script>
`;

if (!html.includes('<!-- Transactions UI Injection Script V2 -->')) {
  html = html.replace('</body>', newScript + '\n</body>');
}

fs.writeFileSync('docs/transactions.html', html);
console.log('transactions.html updated successfully with Category Modals & Custom Cats!');
