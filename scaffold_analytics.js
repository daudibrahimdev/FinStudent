const fs = require('fs');

const file = 'docs/analytics.html';
let content = fs.readFileSync(file, 'utf8');

const startMarker = '<div class="custom-container">';
const endMarker = '<!-- Libs JS -->';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);

    const middle = `      <div class="custom-container">
        <!-- Header & Month Picker -->
        <div class="row mb-4">
          <div class="col-12 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h1 class="mb-1 h2">Analitik Keuangan</h1>
              <p class="text-muted mb-0">Lihat ringkasan pengeluaran dan kebiasaan belanja Anda.</p>
            </div>
            
            <div class="dropdown">
              <button class="btn btn-outline-primary dropdown-toggle rounded-3 px-4 py-2 shadow-sm d-flex align-items-center gap-2 justify-content-center" type="button" id="monthPickerDropdownBtn" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside" style="min-width: 160px; white-space: nowrap;">
                <i class="ti ti-calendar fs-5"></i><span id="monthPickerLabel" class="fw-semibold">Pilih Bulan</span>
              </button>
              <div class="dropdown-menu dropdown-menu-end p-3 shadow-lg rounded-4 border-0 mt-2" style="min-width: 280px; max-width: 100vw; background-color: var(--ds-card-bg);" aria-labelledby="monthPickerDropdownBtn">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <button type="button" class="btn btn-sm btn-light rounded-circle" id="mpPrevYear"><i class="ti ti-chevron-left"></i></button>
                  <h6 class="mb-0 fw-bold" id="mpCurrentYear">2026</h6>
                  <button type="button" class="btn btn-sm btn-light rounded-circle" id="mpNextYear"><i class="ti ti-chevron-right"></i></button>
                </div>
                <div class="row g-2 text-center" id="mpMonthsGrid"></div>
                <div class="d-flex justify-content-between mt-3 pt-3 border-top" style="border-color: var(--ds-border-color) !important;">
                  <a href="javascript:void(0)" class="text-primary fw-semibold text-decoration-none px-2 py-1 rounded hover-primary" id="mpClearBtn">Semua</a>
                  <a href="javascript:void(0)" class="text-primary fw-semibold text-decoration-none px-2 py-1 rounded hover-primary" id="mpThisMonthBtn">Bulan Ini</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <ul class="nav nav-pills mb-4" id="analyticsTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active rounded-pill px-4" id="kategori-tab" data-bs-toggle="pill" data-bs-target="#kategori" type="button" role="tab" aria-controls="kategori" aria-selected="true">Kategori</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link rounded-pill px-4" id="merchant-tab" data-bs-toggle="pill" data-bs-target="#merchant" type="button" role="tab" aria-controls="merchant" aria-selected="false">Merchant</button>
          </li>
        </ul>

        <div class="tab-content" id="analyticsTabsContent">
          <!-- KATEGORI TAB -->
          <div class="tab-pane fade show active" id="kategori" role="tabpanel" aria-labelledby="kategori-tab">
            
            <div class="card border-0 shadow-sm rounded-4 mb-4">
              <div class="card-body p-4 position-relative">
                <button id="btnBackToCategoryList" class="btn btn-sm btn-light position-absolute top-0 start-0 m-3" style="display: none; z-index: 10;"><i class="ti ti-arrow-left me-1"></i> Kembali</button>
                
                <div id="chartTitleContainer" class="text-center mb-3">
                  <h5 class="fw-bold mb-0">Distribusi Kategori</h5>
                  <p class="text-muted small">Klik kategori pada grafik untuk melihat transaksi detail.</p>
                </div>
                
                <div class="d-flex justify-content-center">
                  <div id="categoryDonutChart" style="min-height: 350px; width: 100%; max-width: 500px;"></div>
                </div>
              </div>
            </div>

            <!-- List Kategori Default -->
            <div id="categorySummaryContainer">
               <h5 class="fw-bold mb-3">Rincian Kategori</h5>
               <div class="row g-3" id="categoryCardsList">
                 <!-- Digenerate oleh JS -->
               </div>
            </div>

            <!-- List Transaksi Kategori Tertentu (Disembunyikan secara default) -->
            <div id="categoryTransactionsContainer" style="display: none;">
              <div class="d-flex justify-content-between align-items-center mb-3">
                 <h5 class="fw-bold mb-0" id="categoryTransactionsTitle">Transaksi</h5>
              </div>
              
              <div class="card border-0 shadow-sm rounded-4">
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table mb-0 align-middle text-nowrap">
                      <thead class="table-light">
                        <tr>
                          <th class="ps-4">Tanggal</th>
                          <th>Deskripsi</th>
                          <th>Nominal</th>
                        </tr>
                      </thead>
                      <tbody id="categoryTransactionsList">
                        <!-- Digenerate oleh JS -->
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <!-- Pagination -->
              <div class="d-flex justify-content-center mt-4">
                <nav aria-label="Page navigation">
                  <ul class="pagination pagination-sm" id="categoryPagination">
                  </ul>
                </nav>
              </div>

            </div>

          </div>
          
          <!-- MERCHANT TAB -->
          <div class="tab-pane fade" id="merchant" role="tabpanel" aria-labelledby="merchant-tab">
            <!-- Isi Merchant -->
            <div class="card border-0 shadow-sm rounded-4 mb-4">
              <div class="card-body p-4 position-relative">
                <button id="btnBackToMerchantList" class="btn btn-sm btn-light position-absolute top-0 start-0 m-3" style="display: none; z-index: 10;"><i class="ti ti-arrow-left me-1"></i> Kembali</button>
                
                <div class="text-center mb-3">
                  <h5 class="fw-bold mb-0">Top Merchant</h5>
                  <p class="text-muted small">Tempat Anda paling sering menghabiskan uang.</p>
                </div>
                
                <div class="d-flex justify-content-center">
                  <div id="merchantDonutChart" style="min-height: 350px; width: 100%; max-width: 500px;"></div>
                </div>
              </div>
            </div>

            <!-- List Merchant Default -->
            <div id="merchantSummaryContainer">
               <h5 class="fw-bold mb-3">Rincian Merchant</h5>
               <div class="row g-3" id="merchantCardsList">
                 <!-- Digenerate oleh JS -->
               </div>
            </div>

            <!-- List Transaksi Merchant Tertentu (Disembunyikan secara default) -->
            <div id="merchantTransactionsContainer" style="display: none;">
              <div class="d-flex justify-content-between align-items-center mb-3">
                 <h5 class="fw-bold mb-0" id="merchantTransactionsTitle">Transaksi</h5>
              </div>
              
              <div class="card border-0 shadow-sm rounded-4">
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table mb-0 align-middle text-nowrap">
                      <thead class="table-light">
                        <tr>
                          <th class="ps-4">Tanggal</th>
                          <th>Deskripsi</th>
                          <th>Nominal</th>
                        </tr>
                      </thead>
                      <tbody id="merchantTransactionsList">
                        <!-- Digenerate oleh JS -->
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <!-- Pagination -->
              <div class="d-flex justify-content-center mt-4">
                <nav aria-label="Page navigation">
                  <ul class="pagination pagination-sm" id="merchantPagination">
                  </ul>
                </nav>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
\n\n`;

    let newContent = before + middle + after;
    // Replace savings.js with analytics.js
    newContent = newContent.replace('<script src="./assets/js/savings.js"></script>', '<script src="./assets/js/analytics.js"></script>');
    fs.writeFileSync(file, newContent);
    console.log('Replaced analytics.html content.');
} else {
    console.log('Markers not found!');
}
