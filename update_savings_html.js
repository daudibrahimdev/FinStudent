const fs = require('fs');

let html = fs.readFileSync('docs/savings.html', 'utf8');

const startIndex = html.indexOf('<div class="custom-container">');
const endTag = '<!-- Libs JS -->';
const endIndex = html.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
    console.error('Tags not found', startIndex, endIndex);
    process.exit(1);
}

const customContainerContent = `
      <div class="custom-container">
        <!-- Header -->
        <div class="row mb-6 g-6">
          <div class="col-12">
            <div class="bg-primary p-6 p-md-8 rounded-4 position-relative overflow-hidden shadow">
              <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4" style="z-index: 2; position: relative;">
                <div>
                  <h1 class="text-white mb-1">Rajin Menabung</h1>
                  <p class="text-white-50 mb-0">Nabung dikit-dikit, lama-lama jadi bukit! Buat target dan wujudkan mimpimu.</p>
                </div>
                <button type="button" class="btn btn-white btn-lg rounded-pill shadow-sm text-primary fw-bold px-4 hover-lift" data-bs-toggle="modal" data-bs-target="#wizardModal">
                  <i class="ti ti-plus me-2"></i>Buat Target Baru
                </button>
              </div>
              <div class="position-absolute end-0 bottom-0 opacity-25" style="transform: translate(10%, 20%); z-index: 1; pointer-events: none;">
                <i class="ti ti-pig-money" style="font-size: 15rem;"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Target Cards Container -->
        <div class="row g-4" id="targetCardsContainer">
          <!-- Digenerate oleh app.js -->
        </div>

        <!-- Empty State (Hidden by default) -->
        <div id="emptyStateContainer" class="text-center py-10 d-none">
          <img src="./assets/images/mochi1.gif" alt="Empty" style="max-width: 200px; opacity: 0.8;" class="mb-4">
          <h4 class="text-muted mb-2">Belum ada target menabung</h4>
          <p class="text-muted-50 mb-4">Yuk, mulai rajin menabung untuk masa depanmu!</p>
          <button type="button" class="btn btn-primary rounded-pill px-5 shadow-sm" data-bs-toggle="modal" data-bs-target="#wizardModal">Buat Target Pertamamu</button>
        </div>
        
      </div>
    </div>
  </div>

  <!-- Wizard Modal (Multi-step) -->
  <div class="modal fade" id="wizardModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
        
        <!-- Progress Indicator -->
        <div class="bg-light p-3 border-bottom d-flex justify-content-center gap-2" id="wizardProgress">
          <div class="progress-dot active"></div>
          <div class="progress-dot"></div>
          <div class="progress-dot"></div>
          <div class="progress-dot"></div>
        </div>

        <div class="modal-body p-0 position-relative" style="min-height: 400px; display: flex; flex-direction: column;">
          
          <!-- Step 1 -->
          <div class="wizard-step active p-5 p-md-8 text-center d-flex flex-column justify-content-center flex-grow-1" id="step1">
            <div class="mb-4"><img src="./assets/images/mochi1.gif" alt="Mochi" style="height: 120px; object-fit: contain;"></div>
            <h3 class="mb-4">Apa nama target kamu?</h3>
            <div class="form-floating mb-4 mx-auto w-100" style="max-width: 400px;">
              <input type="text" class="form-control form-control-lg rounded-pill px-4 text-center fw-bold fs-4" id="targetName" placeholder="Contoh: Beli Laptop Baru" style="height: 70px;">
              <label for="targetName" class="text-center w-100" style="left: 0;">Nama Target</label>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="wizard-step d-none p-5 p-md-8 text-center d-flex flex-column justify-content-center flex-grow-1" id="step2">
            <div class="mb-4"><img src="./assets/images/mochi1.gif" alt="Mochi" style="height: 120px; object-fit: contain;"></div>
            <h3 class="mb-4">Berapa total uang yang ingin kamu kumpulkan?</h3>
            <div class="form-floating mb-4 mx-auto w-100" style="max-width: 400px;">
              <input type="text" inputmode="numeric" class="form-control form-control-lg rounded-pill px-4 text-center fw-bold text-primary" id="targetAmount" placeholder="Rp 0" style="height: 70px; font-size: 2rem;">
              <label for="targetAmount" class="text-center w-100" style="left: 0;">Total Target (Rp)</label>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="wizard-step d-none p-5 p-md-8 text-center d-flex flex-column justify-content-center flex-grow-1" id="step3">
            <div class="mb-4"><img src="./assets/images/mochi1.gif" alt="Mochi" style="height: 120px; object-fit: contain;"></div>
            <h3 class="mb-4">Target ini harus selesai kapan?</h3>
            <div class="form-floating mb-4 mx-auto w-100" style="max-width: 400px;">
              <input type="date" class="form-control form-control-lg rounded-pill px-4 text-center fw-bold fs-4" id="targetDate" style="height: 70px;">
              <label for="targetDate" class="text-center w-100" style="left: 0;">Tanggal Selesai</label>
            </div>
          </div>

          <!-- Step 4 (Success) -->
          <div class="wizard-step d-none p-5 p-md-8 text-center d-flex flex-column justify-content-center flex-grow-1" id="step4">
            <div class="mb-4"><img src="./assets/images/mochihappy.gif" alt="Mochi Happy" style="height: 160px; object-fit: contain;"></div>
            <h2 class="mb-2 text-success fw-bolder">YAY!</h2>
            <h4 class="mb-4">Target menabung kamu sudah dibuat!</h4>
            <p class="text-muted mb-0 fs-5">Nabung dikit-dikit, lama-lama jadi bukit ⛰️</p>
          </div>

        </div>

        <!-- Wizard Footer -->
        <div class="modal-footer border-0 p-4 pt-0 d-flex justify-content-between align-items-center" id="wizardFooter">
          <button type="button" class="btn btn-light rounded-pill px-4 fw-semibold" id="btnPrevWizard" data-bs-dismiss="modal">Batal</button>
          <button type="button" class="btn btn-primary rounded-pill px-5 shadow-sm fw-bold" id="btnNextWizard">Lanjut <i class="ti ti-arrow-right ms-2"></i></button>
        </div>
      </div>
    </div>
  </div>

  <!-- Target Detail Modal -->
  <div class="modal fade" id="targetDetailModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content rounded-4 border-0 overflow-hidden shadow-lg">
        <div class="modal-header border-0 bg-primary text-white p-4">
          <div>
            <h4 class="modal-title text-white mb-1 fw-bold" id="detailTargetName">Nama Target</h4>
            <p class="mb-0 text-white-50 small" id="detailTargetDate">Deadline: -</p>
          </div>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-4 p-md-5 bg-light">
          <div class="row g-4">
            <div class="col-md-5">
              <div class="card bg-white border-0 shadow-sm h-100 rounded-4">
                <div class="card-body text-center d-flex flex-column justify-content-center py-5">
                  <div class="fs-1 fw-bold text-primary mb-1" id="detailCurrentAmount">Rp 0</div>
                  <div class="text-muted small mb-4">Terkumpul dari <span id="detailTotalAmount" class="fw-semibold">Rp 0</span></div>
                  
                  <div class="progress mb-2" style="height: 16px; border-radius: 12px; background-color: var(--ds-gray-200);">
                    <div class="progress-bar bg-primary progress-bar-striped progress-bar-animated" id="detailProgressBar" role="progressbar" style="width: 0%"></div>
                  </div>
                  <div class="d-flex justify-content-between text-muted small fw-bold">
                    <span>0%</span>
                    <span id="detailProgressText">0%</span>
                  </div>
                  <div class="mt-4 pt-4 border-top">
                    <button type="button" class="btn btn-outline-danger btn-sm rounded-pill w-100" id="btnDeleteTarget">
                      <i class="ti ti-trash me-2"></i>Hapus Target
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-7">
              <div class="card border-0 shadow-sm h-100 rounded-4">
                <div class="card-body p-4">
                  <h5 class="mb-4 fw-bold">Tambah / Tarik Dana</h5>
                  <ul class="nav nav-pills nav-fill mb-4 bg-light p-1 rounded-pill" id="detailActionPills" role="tablist">
                    <li class="nav-item" role="presentation">
                      <button class="nav-link active rounded-pill fw-semibold" id="tab-simpan" data-bs-toggle="pill" data-type="simpan" type="button" role="tab">Simpan</button>
                    </li>
                    <li class="nav-item" role="presentation">
                      <button class="nav-link rounded-pill fw-semibold text-danger" id="tab-tarik" data-bs-toggle="pill" data-type="tarik" type="button" role="tab">Tarik</button>
                    </li>
                  </ul>
                  <div class="form-floating mb-3">
                    <input type="text" inputmode="numeric" class="form-control form-control-lg rounded-3 fw-bold fs-4 text-center" id="detailActionAmount" placeholder="Rp 0">
                    <label for="detailActionAmount" class="text-center w-100" style="left:0">Nominal (Rp)</label>
                  </div>
                  <button type="button" class="btn btn-primary w-100 rounded-pill py-3 fw-bold fs-5 shadow-sm" id="btnSaveTransaction">Konfirmasi</button>
                  
                  <hr class="my-4">
                  <h6 class="fw-bold mb-3">Riwayat Transaksi Target</h6>
                  <div id="targetTransactionHistory" class="mobile-tx-feed p-0" style="max-height: 200px; overflow-y: auto;">
                    <!-- Diisi js -->
                    <div class="text-center text-muted small py-3">Belum ada transaksi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <style>
    .progress-dot {
      width: 10px; height: 10px; border-radius: 50%;
      background-color: var(--ds-gray-300);
      transition: all 0.3s ease;
    }
    .progress-dot.active {
      background-color: var(--ds-primary);
      transform: scale(1.3);
    }
    .wizard-step {
      opacity: 0;
      animation: fadeIn 0.4s forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .hover-lift {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .hover-lift:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.15) !important;
    }
    .target-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
      border: 1px solid var(--ds-gray-200);
    }
    .target-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0,0,0,0.08) !important;
      border-color: var(--ds-primary);
    }
    
    #detailActionPills .nav-link { transition: all 0.2s ease; }
    #detailActionPills .nav-link.active[data-type="tarik"] { background-color: rgba(220,53,69,0.1) !important; color: #dc3545 !important; }
    #detailActionPills .nav-link.active[data-type="simpan"] { background-color: rgba(16,185,129,0.1) !important; color: #10b981 !important; }
  </style>

  `;

const newHtml = html.substring(0, startIndex) + customContainerContent + html.substring(endIndex);

fs.writeFileSync('docs/savings.html', newHtml);
console.log('savings.html updated');
