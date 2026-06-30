/**
 * FinStudent Onboarding System v1.0
 * Handles the 3-step onboarding modal and algorithm card updates.
 */

const ONBOARDING_KEY = 'finStudent_onboarding_v1';

// ─── Data Store ───────────────────────────────────────────────
window.OnboardingData = {
  get() {
    const raw = localStorage.getItem(ONBOARDING_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  save(data) {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
  },
  isCompleted() {
    const d = this.get();
    return d !== null && d.skipped !== true && d.income > 0;
  }
};

// ─── Modal HTML Injection ─────────────────────────────────────
window.initOnboardingModal = function () {
  if (document.getElementById('onboardingModal')) return;

  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="modal fade" id="onboardingModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered modal-lg" style="max-width: min(680px, 92vw);">
        <div class="modal-content rounded-4 border-0 shadow-lg overflow-hidden" style="min-height: 480px;">

          <!-- Mochi Header -->
          <div class="d-flex flex-column align-items-center pt-4 pb-2 px-4" style="background: linear-gradient(160deg, #f0edff 0%, #e8f5ff 100%);">
            <img src="./assets/images/mochi1.gif" alt="Mochi" 
                 style="height: 140px; width: auto; object-fit: contain;" 
                 class="mb-2">
            <!-- Step Dots -->
            <div class="d-flex gap-2 mb-2" id="obStepDots">
              <span class="ob-dot active" data-step="1"></span>
              <span class="ob-dot" data-step="2"></span>
              <span class="ob-dot" data-step="3"></span>
            </div>
          </div>

          <!-- Step Content -->
          <div class="modal-body px-4 pb-0 pt-4" style="min-height: 200px; position: relative; overflow: hidden;">

            <!-- Step 1 -->
            <div class="ob-step" id="obStep1">
              <h5 class="fw-bold text-center mb-1" style="font-size: 1.1rem;">Bagaimana cara kamu menerima<br>uang jajan / penghasilan?</h5>
              <p class="text-center text-muted mb-4" style="font-size: 0.85rem;">Pilih salah satu di bawah ini</p>
              <div class="d-flex justify-content-center gap-3 flex-wrap">
                <button class="ob-freq-btn btn fw-semibold px-3 py-3 rounded-4 flex-grow-1 border" data-freq="harian" style="max-width: 150px; border-color: var(--bs-border-color);">
                  <div class="ob-freq-icon mx-auto mb-2 d-flex align-items-center justify-content-center rounded-circle" style="width:48px;height:48px;background:rgba(98,75,255,0.1);">
                    <i class="ti ti-sun" style="font-size:1.5rem;color:#624bff;"></i>
                  </div>
                  <div class="fw-semibold" style="font-size:0.82rem;">Harian</div>
                </button>
                <button class="ob-freq-btn btn fw-semibold px-3 py-3 rounded-4 flex-grow-1 border" data-freq="mingguan" style="max-width: 150px; border-color: var(--bs-border-color);">
                  <div class="ob-freq-icon mx-auto mb-2 d-flex align-items-center justify-content-center rounded-circle" style="width:48px;height:48px;background:rgba(98,75,255,0.1);">
                    <i class="ti ti-calendar-week" style="font-size:1.5rem;color:#624bff;"></i>
                  </div>
                  <div class="fw-semibold" style="font-size:0.82rem;">Mingguan</div>
                </button>
                <button class="ob-freq-btn btn fw-semibold px-3 py-3 rounded-4 flex-grow-1 border" data-freq="bulanan" style="max-width: 150px; border-color: var(--bs-border-color);">
                  <div class="ob-freq-icon mx-auto mb-2 d-flex align-items-center justify-content-center rounded-circle" style="width:48px;height:48px;background:rgba(98,75,255,0.1);">
                    <i class="ti ti-calendar-month" style="font-size:1.5rem;color:#624bff;"></i>
                  </div>
                  <div class="fw-semibold" style="font-size:0.82rem;">Bulanan</div>
                </button>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="ob-step d-none" id="obStep2">
              <h5 class="fw-bold text-center mb-1" style="font-size: 1.1rem;" id="obStep2Title">Berapa total pemasukan kamu<br>di periode tersebut?</h5>
              <p class="text-center text-muted mb-4" style="font-size: 0.85rem;">Masukkan nominal rata-rata yang kamu terima</p>
              <div class="input-group input-group-lg rounded-3 overflow-hidden shadow-sm border" style="border-color: var(--bs-border-color) !important;">
                <span class="input-group-text bg-transparent fw-bold text-primary border-0">Rp</span>
                <input type="text" class="form-control bg-transparent border-0 fw-bold text-end" id="obIncomeInput"
                       inputmode="numeric" placeholder="0" style="font-size: 1.3rem; outline: none; box-shadow: none; color: var(--bs-body-color);">
              </div>
              <div class="text-center mt-2 text-muted small" id="obIncomeFormatted"></div>
            </div>

            <!-- Step 3 -->
            <div class="ob-step d-none" id="obStep3">
              <h5 class="fw-bold text-center mb-1" style="font-size: 1.05rem;">Apa saja pengeluaran<br>tetap kamu tiap bulan?</h5>
              <p class="text-center text-muted mb-3" style="font-size: 0.82rem;">Kos, kuota, tagihan rutin, dll. Bisa lewati jika tidak ada.</p>

              <!-- Item list -->
              <div id="obFixedList" style="max-height: 160px; overflow-y: auto; padding-right: 2px;">
                <!-- rendered by JS -->
              </div>

              <!-- Add item trigger -->
              <button type="button" class="btn btn-outline-primary w-100 rounded-3 mt-2 fw-semibold d-flex align-items-center justify-content-center gap-2" id="obAddFixedBtn" style="border-style: dashed; font-size: 0.85rem; padding: 10px;">
                <i class="ti ti-plus" style="font-size:1rem;"></i>
                Tambah Pengeluaran Tetap
              </button>

              <!-- Total summary -->
              <div class="d-flex justify-content-between align-items-center mt-3 px-1" id="obFixedTotalRow" style="display:none!important;">
                <span class="text-muted small fw-semibold">Total Pengeluaran Tetap</span>
                <span class="fw-bold text-danger" id="obFixedTotal" style="font-size:0.95rem;">Rp 0</span>
              </div>

              <!-- Inline add form (hidden initially) -->
              <div id="obFixedForm" class="rounded-4 border p-3 mt-3 d-none" style="border-color: var(--bs-border-color); background: var(--bs-card-bg);">
                <!-- Category pick button -->
                <button type="button" class="btn btn-light border w-100 d-flex align-items-center gap-3 rounded-3 mb-2" id="obCatPickBtn" style="border-color: var(--bs-border-color) !important; padding: 10px 14px;">
                  <div class="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width:40px;height:40px;background:rgba(98,75,255,0.1);" id="obCatIconWrap">
                    <i class="ti ti-category" style="font-size:1.2rem;color:#624bff;" id="obCatIcon"></i>
                  </div>
                  <div class="text-start">
                    <div class="fw-semibold" style="font-size:0.85rem;" id="obCatTitle">Pilih Kategori</div>
                    <div class="text-muted" style="font-size:0.75rem;" id="obCatSub">Ketuk untuk memilih</div>
                  </div>
                  <i class="ti ti-chevron-right ms-auto text-muted"></i>
                </button>
                <!-- Description -->
                <input type="text" class="form-control rounded-3 mb-2" id="obFixedDesc" placeholder="Deskripsi (cth: Kos Bulan Juli)" autocomplete="off" style="font-size: 0.88rem; border-color: var(--bs-border-color); background: transparent; color: var(--bs-body-color);">
                <!-- Amount -->
                <div class="input-group rounded-3 overflow-hidden border" style="border-color: var(--bs-border-color) !important;">
                  <span class="input-group-text bg-transparent fw-bold text-danger border-0" style="font-size:0.9rem;">Rp</span>
                  <input type="text" class="form-control bg-transparent border-0 fw-bold" id="obFixedAmountInput" inputmode="numeric" placeholder="0" style="font-size: 1rem; outline:none; box-shadow:none; color: var(--bs-body-color);">
                </div>
                <!-- Actions -->
                <div class="d-flex gap-2 mt-2">
                  <button type="button" class="btn btn-light border flex-grow-1 rounded-3 fw-semibold" id="obFixedCancelBtn" style="font-size:0.82rem;">Batal</button>
                  <button type="button" class="btn btn-primary flex-grow-1 rounded-3 fw-semibold" id="obFixedSaveBtn" style="font-size:0.82rem;">Simpan</button>
                </div>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="modal-footer border-0 d-flex justify-content-between px-4 pb-4 pt-3">
            <button type="button" class="btn btn-link text-muted text-decoration-none px-0" id="obSkipBtn" style="font-size: 0.85rem;">
              Lewati untuk sekarang
            </button>
            <button type="button" class="btn btn-primary px-5 rounded-pill fw-bold" id="obNextBtn" disabled>
              Lanjut <i class="ti ti-arrow-right ms-1"></i>
            </button>
          </div>

        </div>
      </div>
    </div>

    <style>
      .ob-dot {
        width: 8px; height: 8px; border-radius: 99px;
        background: #d1d5db; display: inline-block;
        transition: all 0.3s ease;
      }
      .ob-dot.active {
        width: 22px; background: #624bff;
      }
      .ob-freq-btn {
        background: var(--bs-card-bg, #fff);
        transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
        color: var(--bs-body-color, #1e293b);
      }
      .ob-freq-btn:hover {
        border-color: #624bff !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(98, 75, 255, 0.12);
      }
      .ob-freq-btn.selected {
        background: rgba(98, 75, 255, 0.06) !important;
        border-color: #624bff !important;
        color: #624bff !important;
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(98, 75, 255, 0.18);
      }
      .ob-freq-btn.selected .ob-freq-icon {
        background: rgba(98, 75, 255, 0.18) !important;
      }
      .ob-step {
        animation: obFadeIn 0.3s ease;
      }
      @keyframes obFadeIn {
        from { opacity: 0; transform: translateX(20px); }
        to   { opacity: 1; transform: translateX(0); }
      }
    </style>
  `;
  document.body.appendChild(modal);
};

// ─── Modal Controller ─────────────────────────────────────────
window.showOnboardingModal = function () {
  window.initOnboardingModal();

  const modalEl = document.getElementById('onboardingModal');
  const bsModal = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });

  let currentStep = 1;
  let selectedFreq = null;
  let incomeVal = 0;
  let fixedItems = []; // [{category, categoryIcon, desc, amount}]
  let obCatSelected = null; // currently picked category in form

  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const goToStep = (step) => {
    currentStep = step;
    document.querySelectorAll('.ob-step').forEach((el, i) => {
      el.classList.toggle('d-none', i + 1 !== step);
    });
    document.querySelectorAll('.ob-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i < step);
    });
    // Reset next btn state
    const nextBtn = document.getElementById('obNextBtn');
    if (step === 1) {
      nextBtn.disabled = !selectedFreq;
      nextBtn.innerHTML = 'Lanjut <i class="ti ti-arrow-right ms-1"></i>';
    } else if (step === 2) {
      nextBtn.disabled = incomeVal <= 0;
      nextBtn.innerHTML = 'Lanjut <i class="ti ti-arrow-right ms-1"></i>';
    } else {
      nextBtn.disabled = false;
      nextBtn.innerHTML = 'Selesai <i class="ti ti-check ms-1"></i>';
    }
  };

  // Step 2 title based on frequency
  const updateStep2Title = () => {
    const titles = { harian: 'Berapa uang jajan kamu<br>per hari?', mingguan: 'Berapa total uang jajan<br>kamu per minggu?', bulanan: 'Berapa total pemasukan kamu<br>di periode ini?' };
    const el = document.getElementById('obStep2Title');
    if (el && selectedFreq) el.innerHTML = titles[selectedFreq] || titles['bulanan'];
  };

  // Frequency buttons
  modalEl.querySelectorAll('.ob-freq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modalEl.querySelectorAll('.ob-freq-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedFreq = btn.dataset.freq;
      document.getElementById('obNextBtn').disabled = false;
    });
  });

  // Income input formatting
  const obIncomeInput = document.getElementById('obIncomeInput');
  const obIncomeFormatted = document.getElementById('obIncomeFormatted');
  obIncomeInput.addEventListener('input', (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    incomeVal = parseInt(raw) || 0;
    e.target.value = raw ? parseInt(raw).toLocaleString('id-ID') : '';
    obIncomeFormatted.textContent = incomeVal > 0 ? fmt(incomeVal) : '';
    document.getElementById('obNextBtn').disabled = incomeVal <= 0;
  });

  // ── Step 3: Fixed Expense Item Builder ────────────────────────
  const renderFixedList = () => {
    const list = document.getElementById('obFixedList');
    const totalRow = document.getElementById('obFixedTotalRow');
    const totalEl = document.getElementById('obFixedTotal');
    if (!list) return;

    if (fixedItems.length === 0) {
      list.innerHTML = `<div class="text-center text-muted py-2" style="font-size:0.82rem;"><i class="ti ti-inbox me-1"></i>Belum ada item. Klik tombol di bawah untuk menambah.</div>`;
      totalRow.style.display = 'none';
    } else {
      list.innerHTML = fixedItems.map((item, idx) => `
        <div class="d-flex align-items-center gap-2 py-2 border-bottom" style="border-color: var(--bs-border-color) !important;">
          <div class="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width:36px;height:36px;background:rgba(98,75,255,0.1);">
            <i class="ti ${item.categoryIcon}" style="font-size:1rem;color:#624bff;"></i>
          </div>
          <div class="flex-grow-1 min-width-0">
            <div class="fw-semibold" style="font-size:0.82rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.desc || item.category}</div>
            <div class="text-muted" style="font-size:0.75rem;">${item.category}</div>
          </div>
          <div class="fw-bold text-danger flex-shrink-0" style="font-size:0.85rem;">${fmt(item.amount)}</div>
          <button class="btn btn-sm p-0 ms-1 text-muted ob-del-item" data-idx="${idx}" style="font-size:1rem; line-height:1;"><i class="ti ti-x"></i></button>
        </div>
      `).join('');
      const total = fixedItems.reduce((s, i) => s + i.amount, 0);
      totalEl.textContent = fmt(total);
      totalRow.style.display = 'flex';
    }

    // Bind delete buttons
    list.querySelectorAll('.ob-del-item').forEach(btn => {
      btn.addEventListener('click', () => {
        fixedItems.splice(parseInt(btn.dataset.idx), 1);
        renderFixedList();
      });
    });
  };

  const showFixedForm = () => {
    obCatSelected = null;
    document.getElementById('obCatTitle').textContent = 'Pilih Kategori';
    document.getElementById('obCatSub').textContent = 'Ketuk untuk memilih';
    document.getElementById('obCatIcon').className = 'ti ti-category';
    document.getElementById('obCatIcon').style.color = '#624bff';
    document.getElementById('obFixedDesc').value = '';
    document.getElementById('obFixedAmountInput').value = '';
    document.getElementById('obFixedForm').classList.remove('d-none');
    document.getElementById('obAddFixedBtn').classList.add('d-none');
  };

  const hideFixedForm = () => {
    document.getElementById('obFixedForm').classList.add('d-none');
    document.getElementById('obAddFixedBtn').classList.remove('d-none');
  };

  // Build category picker modal (inline in onboarding modal)
  const buildCatPicker = () => {
    if (document.getElementById('obCatPickerOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'obCatPickerOverlay';
    overlay.style.cssText = 'position:absolute;inset:0;z-index:10;background:var(--bs-modal-bg,#fff);border-radius:inherit;overflow-y:auto;padding:1rem;';
    
    // Append inside modal content
    modalEl.querySelector('.modal-content').style.position = 'relative';
    modalEl.querySelector('.modal-content').appendChild(overlay);

    const renderCatGrid = () => {
      const allCats = FinCategories.kebutuhan;
      overlay.innerHTML = `
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div class="d-flex align-items-center gap-2">
            <button type="button" class="btn btn-sm btn-light border rounded-3" id="obCatBack"><i class="ti ti-arrow-left"></i></button>
            <span class="fw-bold" style="font-size:0.95rem;">Pilih Kategori</span>
          </div>
          <button type="button" class="btn btn-sm btn-outline-primary rounded-pill fw-semibold" id="obAddCatBtn" style="font-size: 0.8rem;"><i class="ti ti-plus"></i> Kategori Baru</button>
        </div>
        <div class="row g-2" id="obCatGrid">
          ${allCats.map(cat => `
            <div class="col-6">
              <div class="position-relative h-100">
                <button type="button" class="ob-cat-pick-btn btn w-100 border rounded-3 d-flex align-items-center gap-2 text-start h-100" data-val="${cat.value}" data-icon="${cat.icon}" style="padding:10px 12px; border-color: var(--bs-border-color); background: var(--bs-card-bg); color: var(--bs-body-color);">
                  <span class="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width:34px;height:34px;background:rgba(98,75,255,0.1);"><i class="ti ${cat.icon}" style="color:#624bff;"></i></span>
                  <span class="fw-semibold" style="font-size:0.78rem; line-height:1.3; padding-right: ${cat.isCustom ? '20px' : '0'};">${cat.label}</span>
                </button>
                ${cat.isCustom ? `<button class="btn btn-sm p-0 position-absolute text-muted ob-del-cat" data-id="${cat.id}" style="right:8px; top:50%; transform:translateY(-50%); font-size:1.1rem; z-index:2;"><i class="ti ti-x"></i></button>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Back button
      overlay.querySelector('#obCatBack').addEventListener('click', () => overlay.remove());
      
      // Go to add category form
      overlay.querySelector('#obAddCatBtn').addEventListener('click', renderCatForm);

      // Cat buttons
      overlay.querySelectorAll('.ob-cat-pick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          obCatSelected = { value: btn.dataset.val, icon: btn.dataset.icon };
          document.getElementById('obCatTitle').textContent = btn.dataset.val;
          document.getElementById('obCatSub').textContent = 'Ketuk untuk mengubah';
          const iconEl = document.getElementById('obCatIcon');
          iconEl.className = 'ti ' + btn.dataset.icon;
          iconEl.style.color = '#624bff';
          overlay.remove();
        });
      });

      // Delete custom cat buttons
      overlay.querySelectorAll('.ob-del-cat').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation(); // prevent clicking the category
          if(confirm('Hapus kategori kustom ini? Data transaksi terkait tidak akan terhapus.')) {
            LocalStore.deleteCustomCategory(btn.dataset.id);
            renderCatGrid();
          }
        });
      });
    };

    const renderCatForm = () => {
      const availableIcons = ['ti-star','ti-home','ti-car','ti-coffee','ti-shopping-cart','ti-building','ti-device-tv','ti-bolt','ti-book','ti-gift','ti-heart','ti-music','ti-pizza','ti-camera','ti-plane'];
      let selectedIcon = availableIcons[0];
      
      overlay.innerHTML = `
        <div class="d-flex align-items-center gap-2 mb-3">
          <button type="button" class="btn btn-sm btn-light border rounded-3" id="obFormBack"><i class="ti ti-arrow-left"></i></button>
          <span class="fw-bold" style="font-size:0.95rem;">Kategori Baru</span>
        </div>
        <div class="mb-3">
          <label class="form-label text-muted fw-semibold small">Nama Kategori</label>
          <input type="text" class="form-control rounded-3" id="obNewCatName" placeholder="Cth: Nongkrong Cafe" style="border-color: var(--bs-border-color); background: transparent; color: var(--bs-body-color);" autocomplete="off">
        </div>
        <div class="mb-4">
          <label class="form-label text-muted fw-semibold small">Pilih Icon</label>
          <div class="row g-2 text-center" id="obIconPicker">
            ${availableIcons.map(icon => `
              <div class="col-2">
                <div class="p-2 rounded-circle cursor-pointer ob-icon-choice ${icon === selectedIcon ? 'bg-primary text-white' : 'text-secondary'}" data-icon="${icon}" style="transition: all 0.2s;">
                  <i class="ti ${icon} fs-4"></i>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <button type="button" class="btn btn-primary w-100 rounded-pill fw-bold py-2" id="obSaveCatBtn">Simpan Kategori</button>
      `;

      overlay.querySelector('#obFormBack').addEventListener('click', renderCatGrid);
      
      overlay.querySelectorAll('.ob-icon-choice').forEach(btn => {
        btn.addEventListener('click', () => {
          overlay.querySelectorAll('.ob-icon-choice').forEach(c => {
            c.classList.remove('bg-primary', 'text-white');
            c.classList.add('text-secondary');
          });
          btn.classList.add('bg-primary', 'text-white');
          btn.classList.remove('text-secondary');
          selectedIcon = btn.dataset.icon;
        });
      });

      overlay.querySelector('#obSaveCatBtn').addEventListener('click', () => {
        const nameInput = overlay.querySelector('#obNewCatName');
        const name = nameInput.value.trim();
        if(!name) {
          nameInput.style.borderColor = '#ef4444';
          return;
        }
        const newCat = {
          value: name,
          label: name,
          icon: selectedIcon,
          nature: 'kebutuhan',
          isPeriodic: true,
          isCustom: true
        };
        LocalStore.saveCustomCategory(newCat);
        renderCatGrid(); // Go back to grid which will now include the new category
      });
    };

    // Start by rendering the grid
    renderCatGrid();
  };

  document.getElementById('obAddFixedBtn').addEventListener('click', showFixedForm);
  document.getElementById('obFixedCancelBtn').addEventListener('click', hideFixedForm);
  document.getElementById('obCatPickBtn').addEventListener('click', buildCatPicker);

  // Amount input format
  document.getElementById('obFixedAmountInput').addEventListener('input', (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    e.target.value = raw ? parseInt(raw).toLocaleString('id-ID') : '';
  });

  // Save item
  document.getElementById('obFixedSaveBtn').addEventListener('click', () => {
    const desc = document.getElementById('obFixedDesc').value.trim();
    const rawAmt = document.getElementById('obFixedAmountInput').value.replace(/[^0-9]/g, '');
    const amount = parseInt(rawAmt) || 0;
    if (!obCatSelected) { document.getElementById('obCatPickBtn').style.borderColor = '#ef4444'; return; }
    document.getElementById('obCatPickBtn').style.borderColor = '';
    if (amount <= 0) { document.getElementById('obFixedAmountInput').style.borderColor = '#ef4444'; return; }
    document.getElementById('obFixedAmountInput').style.borderColor = '';
    fixedItems.push({ category: obCatSelected.value, categoryIcon: obCatSelected.icon, desc: desc || obCatSelected.value, amount });
    hideFixedForm();
    renderFixedList();
  });

  // Next button
  document.getElementById('obNextBtn').addEventListener('click', () => {
    if (currentStep === 1) {
      updateStep2Title();
      goToStep(2);
    } else if (currentStep === 2) {
      goToStep(3);
      renderFixedList();
    } else {
      const fixedExpense = fixedItems.reduce((s, i) => s + i.amount, 0);
      OnboardingData.save({ frequency: selectedFreq, income: incomeVal, fixedExpense, fixedItems, skipped: false });
      
      if (typeof LocalStore !== 'undefined') {
        let nextPaydayDate = new Date();
        if (selectedFreq === 'weekly') {
          nextPaydayDate.setDate(nextPaydayDate.getDate() + 7);
        } else {
          nextPaydayDate.setMonth(nextPaydayDate.getMonth() + 1);
        }
        LocalStore.saveSetup({
          balance: incomeVal,
          nextPayday: nextPaydayDate.toISOString().split('T')[0]
        });
      }

      bsModal.hide();
      if (typeof window.updateAlgorithmCards === 'function') window.updateAlgorithmCards();
      
      setTimeout(() => window.location.reload(), 300);
    }
  });

  // Skip button
  document.getElementById('obSkipBtn').addEventListener('click', () => {
    OnboardingData.save({ frequency: null, income: 0, fixedExpense: 0, fixedItems: [], skipped: true });
    bsModal.hide();
    if (typeof window.updateAlgorithmCards === 'function') window.updateAlgorithmCards();
  });

  // Reset state on open
  selectedFreq = null; incomeVal = 0; fixedItems = []; obCatSelected = null;
  if (obIncomeInput) obIncomeInput.value = '';
  if (obIncomeFormatted) obIncomeFormatted.textContent = '';
  modalEl.querySelectorAll('.ob-freq-btn').forEach(b => b.classList.remove('selected'));
  goToStep(1);

  bsModal.show();
};

// ─── Algorithm Cards Update ──────────────────────────────────
window.updateAlgorithmCards = async function () {
  const ob = OnboardingData.get();
  const notFilled = !ob || ob.skipped || ob.income <= 0;

  // IDs to update
  const leakEl       = document.getElementById('leakAmount');
  const leakDescEl   = document.getElementById('leakDesc');
  const predEl       = document.getElementById('predictionStatus');
  const predDescEl   = document.getElementById('predictionDesc');
  const dailyEl      = document.getElementById('dailyLimit');
  const dailyDescEl  = document.getElementById('dailyDesc');
  const healthEl     = document.getElementById('healthStatus');
  const healthDescEl = document.getElementById('healthDesc');
  const dailyLabelEl = document.getElementById('dailySurvivalLabel');

  const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  const PROMPT = '— <small class="text-muted d-block mt-1" style="font-size:0.7rem; font-weight: 400;">Klik untuk isi data awal</small>';

  if (notFilled) {
    [leakEl, predEl, dailyEl, healthEl].forEach(el => { if (el) el.innerHTML = PROMPT; });
    [leakDescEl, predDescEl, dailyDescEl, healthDescEl].forEach(el => { if (el) el.textContent = 'Lengkapi data onboarding agar algoritma bisa berjalan.'; });
    return;
  }

  // ── Fetch transactions
  let txs = [], savings = [];
  let setupData = null;
  try {
    txs = await ApiService.getTransactions();
    savings = await ApiService.getSavings();
    setupData = await ApiService.getSetupData();
  } catch (e) { console.error('Algorithm cards fetch error', e); return; }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const dayOfMonth = now.getDate();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const daysElapsed = dayOfMonth;
  const daysRemaining = totalDaysInMonth - dayOfMonth;

  // Filter transactions strictly to current month and year
  const monthTxs = txs.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const expenditures = monthTxs.filter(t => t.type === 'pengeluaran');
  const isDataSparse = expenditures.length < 3; // flag for sparse data early in month

  let totalPemasukan = 0, totalPengeluaran = 0, totalTersier = 0;
  monthTxs.forEach(t => {
    const amt = parseFloat(t.amount) || 0;
    if (t.type === 'pemasukan') totalPemasukan += amt;
    if (t.type === 'pengeluaran') {
      totalPengeluaran += amt;
      if (t.nature === 'keinginan') totalTersier += amt;
    }
  });

  // Current balance calculation
  let currentBalance = parseFloat(setupData?.balance || 0);
  txs.forEach(t => {
    const amt = parseFloat(t.amount) || 0;
    if (t.type === 'pemasukan') currentBalance += amt;
    if (t.type === 'pengeluaran') currentBalance -= amt;
  });
  savings.forEach(s => {
    const amt = parseFloat(s.amount) || 0;
    if (s.type === 'simpan') currentBalance -= amt;
    if (s.type === 'tarik') currentBalance += amt;
  });

  const { frequency, income: obIncome, fixedExpense: obFixed } = ob;

  // ── A. Daily Survival ──────────────────────────────────────
  if (dailyEl && dailyDescEl) {
    if (frequency === 'harian') {
      // Mode harian: batas pengeluaran = onboardingIncome (reset tiap hari)
      if (dailyLabelEl) dailyLabelEl.textContent = 'Target Nabung Harian';
      dailyEl.innerHTML = fmt(obIncome);
      dailyDescEl.textContent = `Batas maks pengeluaran hari ini: ${fmt(obIncome)}. Sisakan sebagian agar tidak habis 100%.`;
    } else {
      if (dailyLabelEl) dailyLabelEl.textContent = 'Daily Survival';
      let sisa = daysRemaining;
      if (frequency === 'mingguan') {
        // Sisa hari dalam minggu ini
        const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
        sisa = Math.max(1, 7 - dayOfWeek);
      }
      const limit = Math.max(0, (currentBalance - obFixed)) / Math.max(1, sisa);
      dailyEl.innerHTML = fmt(limit);
      dailyDescEl.textContent = `Batas aman pengeluaran per hari agar kamu tidak minus. Masih ada ${sisa} hari tersisa.`;
    }
  }

  // ── B. Prediksi Akhir Bulan ────────────────────────────────
  if (predEl && predDescEl) {
    if (daysElapsed > 0) {
      // SMOOTHING ALGORITHM: blend historical average with expected daily budget to prevent early-month spikes
      const expectedDaily = Math.max(0, (obIncome - obFixed) / totalDaysInMonth);
      const effectiveDays = Math.max(daysElapsed, 3);
      const actualAvg = totalPengeluaran / effectiveDays;
      const weight = daysElapsed / totalDaysInMonth;
      const blendedAvg = (actualAvg * weight) + (expectedDaily * (1 - weight));

      const prediction = currentBalance - (blendedAvg * daysRemaining) - obFixed;
      const isPositive = prediction >= 0;
      predEl.innerHTML = `
        <span style="color: ${isPositive ? '#10b981' : '#ef4444'}; font-size: 1.1rem;">
          ${fmt(Math.abs(prediction))}
        </span>
        <small class="d-flex align-items-center justify-content-start gap-1 mt-1 fw-semibold" style="font-size: 0.75rem; color: ${isPositive ? '#10b981' : '#ef4444'};">
          <i class="ti ${isPositive ? 'ti-trending-up' : 'ti-trending-down'}"></i>
          ${isPositive ? 'Surplus' : 'Potensi Defisit'}
        </small>`;
      predDescEl.innerHTML = `Proyeksi saldo akhir bulan: ${fmt(prediction)}.` + (isDataSparse ? ' <span class="text-warning" style="font-size:0.75rem;"><br/>(Akurasi rendah: data masih sedikit)</span>' : '');
    } else {
      predEl.innerHTML = '—';
      predDescEl.textContent = 'Belum cukup data hari ini untuk proyeksi.';
    }
  }

  // ── C. Money Leak ──────────────────────────────────────────
  if (leakEl && leakDescEl) {
    const threshold = 0.15 * obIncome;
    const isLeaking = totalTersier > threshold;
    leakEl.innerHTML = `
      <span class="d-flex align-items-center gap-2" style="color: ${isLeaking ? '#ef4444' : '#10b981'}; font-size: 1.05rem;">
        <span class="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width:28px;height:28px;background:${isLeaking ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)'}">
          <i class="ti ${isLeaking ? 'ti-alert-triangle' : 'ti-shield-check'}" style="font-size:0.85rem;"></i>
        </span>
        <span class="fw-bold">${isLeaking ? 'Terdeteksi!' : 'Aman'}</span>
      </span>
      <small class="d-block mt-1 fw-normal" style="font-size: 0.72rem; color: var(--ds-gray-500);">
        ${fmt(totalTersier)} / batas ${fmt(threshold)}
      </small>`;
    leakDescEl.textContent = isLeaking
      ? `Pengeluaran keinginan (${fmt(totalTersier)}) melebihi 15% pemasukan (${fmt(threshold)}). Coba kurangi jajan!`
      : `Pengeluaran keinginan masih dalam batas aman 15% (${fmt(threshold)}).`;
  }

  // ── D. Health Status ────────────────────────────────────────
  if (healthEl && healthDescEl) {
    if (daysElapsed > 0 && obIncome > 0) {
      // SMOOTHING ALGORITHM: blend historical average with expected daily budget to prevent early-month spikes
      const expectedDaily = Math.max(0, (obIncome - obFixed) / totalDaysInMonth);
      const effectiveDays = Math.max(daysElapsed, 3);
      const actualAvg = totalPengeluaran / effectiveDays;
      const weight = daysElapsed / totalDaysInMonth;
      const blendedAvg = (actualAvg * weight) + (expectedDaily * (1 - weight));
      
      const projectedMonthExpense = totalPengeluaran + (blendedAvg * daysRemaining) + obFixed;
      const burnRate = projectedMonthExpense / obIncome;

      let statusText = 'Sehat';
      let statusColor = '#10b981';
      let statusIconClass = 'ti-heart-filled';
      let statusBg = 'rgba(16,185,129,0.12)';
      if (burnRate > 1.15) {
        statusText = 'Bahaya'; statusColor = '#ef4444'; statusIconClass = 'ti-flame'; statusBg = 'rgba(239,68,68,0.12)';
      } else if (burnRate > 1.0) {
        statusText = 'Waspada'; statusColor = '#f59e0b'; statusIconClass = 'ti-alert-circle'; statusBg = 'rgba(245,158,11,0.12)';
      }
      healthEl.innerHTML = `
        <span class="d-flex align-items-center gap-2" style="color: ${statusColor}; font-size: 1.05rem;">
          <span class="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width:28px;height:28px;background:${statusBg}">
            <i class="ti ${statusIconClass}" style="font-size:0.85rem;"></i>
          </span>
          <span class="fw-bold">${statusText}</span>
        </span>
        <small class="d-block mt-1 fw-normal" style="font-size: 0.72rem; color: var(--ds-gray-500);">
          Burn rate: ${burnRate.toFixed(2)}x
        </small>`;
      healthDescEl.innerHTML = `Rasio burn rate: ${burnRate.toFixed(2)}. ${burnRate <= 1.0 ? 'Pengeluaranmu sesuai jalur!' : burnRate <= 1.15 ? 'Sedikit di atas batas kewajaran.' : 'Segera rem pengeluaranmu!'}` + (isDataSparse ? ' <span class="text-warning" style="font-size:0.75rem;"><br/>(Akurasi rendah: data masih sedikit)</span>' : '');
    } else {
      healthEl.innerHTML = '—';
      healthDescEl.textContent = 'Belum cukup data transaksi bulan ini.';
    }
  }
};

// ─── Auto-init on dashboard ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Only run on index.html (check for the algorithm card IDs)
  if (!document.getElementById('leakAmount')) return;

  const ob = OnboardingData.get();

  // Bind card clicks → open onboarding if not filled
  ['leakAmount', 'predictionStatus', 'dailyLimit', 'healthStatus'].forEach(id => {
    const card = document.getElementById(id)?.closest('.fin-card');
    if (card) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const current = OnboardingData.get();
        if (!current || current.skipped || current.income <= 0) {
          window.showOnboardingModal();
        }
      });
    }
  });

  // Auto show if never done onboarding
  const shouldEdit = window.location.search.includes('edit_onboarding=1');
  if (!ob || shouldEdit) {
    // Show modal automatically for first time users or edit mode
    setTimeout(showOnboardingModal, 500);
    if (shouldEdit) {
      // Remove param to prevent infinite loops on reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  // Update the cards (will show "—" prompts if not filled)
  window.updateAlgorithmCards();
});
