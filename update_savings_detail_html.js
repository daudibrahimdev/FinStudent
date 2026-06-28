const fs = require('fs');

let html = fs.readFileSync('docs/savings.html', 'utf8');

const modalStartTag = '<!-- Target Detail Modal -->';
const scriptStartTag = '<style>';

const startIndex = html.indexOf(modalStartTag);
const endIndex = html.indexOf(scriptStartTag);

if (startIndex === -1 || endIndex === -1) {
    console.error('Tags not found');
    process.exit(1);
}

const newModalHTML = `
  <!-- Target Detail Modal -->
  <div class="modal fade" id="targetDetailModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content rounded-4 border-0 overflow-hidden shadow-premium glass-effect">
        <div class="modal-header border-0 bg-primary text-white p-4 align-items-center">
          <div>
            <h4 class="modal-title text-white mb-1 fw-bold" id="detailTargetName">Nama Target</h4>
            <p class="mb-0 text-white-50 small" id="detailTargetDate">Deadline: -</p>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button type="button" class="btn btn-light btn-sm rounded-pill text-primary fw-bold px-3 hover-lift-premium" id="btnEditTarget" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#editTargetModal">
              <i class="ti ti-edit me-1"></i> Edit
            </button>
            <button type="button" class="btn-close btn-close-white ms-2" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
        </div>
        <div class="modal-body p-0 bg-light">
          <div class="row g-0 h-100">
            
            <!-- Sisi Kiri (Ringkasan) -->
            <div class="col-lg-5 p-4 p-md-5 border-end-lg bg-white h-100 d-flex flex-column justify-content-center">
              <div class="text-center py-4">
                <div class="fs-1 fw-bold text-primary mb-1" id="detailCurrentAmount">Rp 0</div>
                <div class="text-muted small mb-4">Terkumpul dari <span id="detailTotalAmount" class="fw-semibold text-dark">Rp 0</span></div>
                
                <div class="progress mb-2" style="height: 18px; border-radius: 12px; background-color: var(--ds-gray-200);">
                  <div class="progress-bar bg-primary progress-bar-striped progress-bar-animated" id="detailProgressBar" role="progressbar" style="width: 0%"></div>
                </div>
                <div class="d-flex justify-content-between text-muted small fw-bold mb-4">
                  <span>0%</span>
                  <span id="detailProgressText">0%</span>
                </div>
                
                <div class="p-3 bg-light rounded-4 text-start border border-light-subtle shadow-sm">
                  <div class="text-muted small fw-semibold mb-1">Kekurangan / Sisa Target</div>
                  <div class="fs-4 fw-bolder text-warning" id="detailRemainingAmount">Rp 0</div>
                </div>
              </div>
            </div>

            <!-- Sisi Kanan (Aksi & Riwayat) -->
            <div class="col-lg-7 p-4 p-md-5 d-flex flex-column h-100" style="max-height: 80vh; overflow-y: auto;">
              
              <!-- Form Tambah Tabungan -->
              <div class="card border-0 shadow-sm rounded-4 mb-4 flex-shrink-0">
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
                  
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <div class="form-floating">
                        <input type="text" inputmode="numeric" class="form-control rounded-3 fw-bold text-center" id="detailActionAmount" placeholder="Rp 0">
                        <label for="detailActionAmount" class="w-100 text-center" style="left:0;">Nominal (Rp)</label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-floating">
                        <input type="date" class="form-control rounded-3" id="detailActionDate">
                        <label for="detailActionDate">Tanggal</label>
                      </div>
                    </div>
                  </div>
                  
                  <div class="form-floating mb-4">
                    <input type="text" class="form-control rounded-3" id="detailActionDesc" placeholder="Catatan (Opsional)">
                    <label for="detailActionDesc">Catatan (Opsional)</label>
                  </div>
                  
                  <button type="button" class="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-sm hover-lift-premium" id="btnSaveTransaction">
                    <i class="ti ti-check me-2"></i>Konfirmasi
                  </button>
                </div>
              </div>

              <!-- Riwayat Tabungan -->
              <div class="card border-0 shadow-sm rounded-4 flex-grow-1">
                <div class="card-body p-4 d-flex flex-column h-100">
                  <h6 class="fw-bold mb-3 d-flex align-items-center gap-2">
                    <i class="ti ti-history text-muted"></i>Riwayat Tabungan Target
                  </h6>
                  <div id="targetTransactionHistory" class="mobile-tx-feed p-0 flex-grow-1" style="min-height: 200px;">
                    <!-- Diisi js -->
                    <div class="text-center text-muted small py-4">Belum ada transaksi</div>
                  </div>
                  
                  <!-- Pagination -->
                  <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top" id="targetTxPagination">
                    <div class="text-muted small" id="targetTxPageInfo">Menampilkan 0-0 dari 0</div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-light rounded-pill px-3 fw-semibold hover-lift" id="btnPrevTxPage" disabled>Sebelumnya</button>
                      <button class="btn btn-sm btn-light rounded-pill px-3 fw-semibold hover-lift" id="btnNextTxPage" disabled>Selanjutnya</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Target Modal -->
  <div class="modal fade" id="editTargetModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content rounded-4 border-0 shadow-lg p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="fw-bold mb-0">Edit Target</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#targetDetailModal" aria-label="Close"></button>
        </div>
        <div class="form-floating mb-3">
          <input type="text" class="form-control rounded-3 fw-bold" id="editTargetName" placeholder="Nama">
          <label for="editTargetName">Nama Target</label>
        </div>
        <div class="form-floating mb-3">
          <input type="text" inputmode="numeric" class="form-control rounded-3 fw-bold text-primary" id="editTargetAmount" placeholder="Nominal">
          <label for="editTargetAmount">Total Target (Rp)</label>
        </div>
        <div class="form-floating mb-4">
          <input type="date" class="form-control rounded-3 fw-bold" id="editTargetDate">
          <label for="editTargetDate">Deadline Selesai</label>
        </div>
        <button type="button" class="btn btn-primary rounded-pill w-100 fw-bold py-2 hover-lift mb-2" id="btnUpdateTarget">Simpan Perubahan</button>
        <button type="button" class="btn btn-light rounded-pill w-100 fw-semibold py-2 hover-lift mb-3" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#targetDetailModal">Batal</button>
        
        <hr class="my-2 mb-3">
        <button type="button" class="btn btn-outline-danger rounded-pill w-100 fw-bold py-2 hover-lift" id="btnDeleteTarget">
          <i class="ti ti-trash me-2"></i>Hapus Target Permanen
        </button>
      </div>
    </div>
  </div>

  <!-- Edit Transaction Modal -->
  <div class="modal fade" id="editTransactionModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content rounded-4 border-0 shadow-lg p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h5 class="fw-bold mb-0">Edit Riwayat</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#targetDetailModal" aria-label="Close"></button>
        </div>
        <div class="form-floating mb-3">
          <input type="date" class="form-control rounded-3" id="editTxDate">
          <label for="editTxDate">Tanggal</label>
        </div>
        <div class="form-floating mb-3">
          <input type="text" inputmode="numeric" class="form-control rounded-3 fw-bold text-center" id="editTxAmount" placeholder="Rp 0">
          <label for="editTxAmount" class="w-100 text-center" style="left:0;">Nominal (Rp)</label>
        </div>
        <div class="form-floating mb-4">
          <input type="text" class="form-control rounded-3" id="editTxDesc" placeholder="Catatan">
          <label for="editTxDesc">Catatan (Opsional)</label>
        </div>
        <input type="hidden" id="editTxId">
        <button type="button" class="btn btn-primary rounded-pill w-100 fw-bold py-2 hover-lift mb-2" id="btnUpdateTx">Simpan Perubahan</button>
        <button type="button" class="btn btn-light rounded-pill w-100 fw-bold py-2 text-danger hover-lift mb-2" id="btnDeleteTx">
          <i class="ti ti-trash me-2"></i>Hapus Riwayat
        </button>
        <button type="button" class="btn btn-light rounded-pill w-100 fw-semibold py-2 hover-lift" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#targetDetailModal">Kembali</button>
      </div>
    </div>
  </div>
`;

const newHtml = html.substring(0, startIndex) + newModalHTML + '\n\n  ' + html.substring(endIndex);

fs.writeFileSync('docs/savings.html', newHtml);
console.log('savings.html updated');
