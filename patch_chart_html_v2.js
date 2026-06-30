const fs = require('fs');
const path = require('path');

const replacementLogic = `
                <div class="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <!-- Metric Dropdown -->
                  <div class="dropdown">
                    <button class="btn btn-white border shadow-sm dropdown-toggle d-flex align-items-center gap-3 px-4 py-2 text-start" type="button" id="metricDropdownBtn" data-bs-toggle="dropdown" aria-expanded="false" style="border-radius: 14px; min-width: 220px;">
                      <div class="bg-warning-subtle text-warning rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 42px; height: 42px;" id="activeMetricIcon">
                        <i class="ti ti-arrow-up-right fs-4"></i>
                      </div>
                      <div class="flex-grow-1">
                        <div class="text-muted small fw-bold text-uppercase" id="activeMetricLabel" style="letter-spacing: 0.5px; font-size: 0.7rem;">PENGELUARAN</div>
                        <div class="fs-4 fw-bolder text-dark mt-1" id="activeMetricAmount" style="line-height: 1.2;">Rp 0</div>
                      </div>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-start shadow-lg border-0 mt-2 p-2" aria-labelledby="metricDropdownBtn" style="border-radius: 14px; min-width: 250px; z-index: 1050;">
                      <li>
                        <a class="dropdown-item d-flex align-items-center gap-3 rounded-3 px-3 py-2 mb-1 metric-select-btn transition-all" href="#" data-metric="pemasukan">
                          <div class="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 36px; height: 36px;">
                            <i class="ti ti-arrow-down-left fs-5"></i>
                          </div>
                          <div>
                            <div class="fw-bold text-dark fs-6">Pemasukan</div>
                            <div class="text-muted small fw-medium mt-1" id="drpIncome">Rp 0</div>
                          </div>
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item d-flex align-items-center gap-3 rounded-3 px-3 py-2 mb-1 metric-select-btn active bg-light transition-all" href="#" data-metric="pengeluaran">
                          <div class="bg-warning-subtle text-warning rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 36px; height: 36px;">
                            <i class="ti ti-arrow-up-right fs-5"></i>
                          </div>
                          <div>
                            <div class="fw-bold text-dark fs-6">Pengeluaran</div>
                            <div class="text-muted small fw-medium mt-1" id="drpExpense">Rp 0</div>
                          </div>
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item d-flex align-items-center gap-3 rounded-3 px-3 py-2 metric-select-btn transition-all" href="#" data-metric="tabungan">
                          <div class="bg-info-subtle text-info rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 36px; height: 36px;">
                            <i class="ti ti-pig-money fs-5"></i>
                          </div>
                          <div>
                            <div class="fw-bold text-dark fs-6">Tabungan Masuk</div>
                            <div class="text-muted small fw-medium mt-1" id="drpSavings">Rp 0</div>
                          </div>
                        </a>
                      </li>
                    </ul>
                  </div>

                  <!-- Time Filter Dropdown -->
                  <div class="dropdown">
                    <button class="btn btn-light d-flex align-items-center gap-2 px-3 py-2 border-0 shadow-sm" type="button" id="timeFilterDropdownBtn" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside" style="border-radius: 10px; background: var(--ds-gray-100);">
                      <i class="ti ti-calendar text-primary fs-4"></i>
                      <span class="fw-semibold text-secondary" id="activeTimeLabel">Bulan Ini</span>
                      <i class="ti ti-chevron-down ms-1 text-muted"></i>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 p-3" aria-labelledby="timeFilterDropdownBtn" style="border-radius: 14px; min-width: 290px; z-index: 1050;">
                      <h6 class="dropdown-header px-1 text-uppercase text-muted fw-bold mb-2" style="letter-spacing: 0.5px; font-size: 0.75rem;">Rentang Cepat</h6>
                      <div class="d-flex flex-wrap gap-2 mb-3">
                        <button class="btn btn-sm btn-outline-primary time-preset-btn active flex-grow-1 fw-medium" data-range="this_month" style="border-radius: 8px;">Bulan Ini</button>
                        <button class="btn btn-sm btn-outline-secondary time-preset-btn flex-grow-1 fw-medium" data-range="last_month" style="border-radius: 8px;">Bulan Lalu</button>
                        <button class="btn btn-sm btn-outline-secondary time-preset-btn w-100 fw-medium" data-range="this_year" style="border-radius: 8px;">Sepanjang Tahun Ini</button>
                      </div>
                      
                      <h6 class="dropdown-header px-1 text-uppercase text-muted fw-bold mb-2 border-top pt-3" style="letter-spacing: 0.5px; font-size: 0.75rem;">Kustom Tanggal</h6>
                      <div class="d-flex flex-column gap-2 mb-3">
                        <div class="d-flex align-items-center bg-gray-100 rounded-3 px-2 py-1 border border-gray-200">
                           <span class="text-muted small fw-medium ms-1 me-2" style="min-width: 40px;">Dari</span>
                           <input type="date" id="chartStartDate" class="form-control form-control-sm border-0 bg-transparent shadow-none px-1 text-dark fw-medium">
                        </div>
                        <div class="d-flex align-items-center bg-gray-100 rounded-3 px-2 py-1 border border-gray-200">
                           <span class="text-muted small fw-medium ms-1 me-2" style="min-width: 40px;">Hingga</span>
                           <input type="date" id="chartEndDate" class="form-control form-control-sm border-0 bg-transparent shadow-none px-1 text-dark fw-medium">
                        </div>
                      </div>
                      <button id="applyCustomDateBtn" class="btn btn-primary w-100 py-2 fw-bold" style="border-radius: 10px;">Terapkan Kustom</button>
                    </div>
                  </div>
                </div>

                <div class="mt-4 pt-2"></div>
                <div id="mainCashflowChart" style="min-height: 350px;"></div>
`;

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    const startString = `<div class="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">`;
    let startIndex = content.indexOf(startString);
    
    if (startIndex === -1) {
        // Maybe it's missing the flex-wrap gap-2 ? Let's check with broader search
        startIndex = content.indexOf('<div class="mb-4 d-flex justify-content-between');
    }

    if (startIndex === -1) {
        console.log("Could not find start index in " + filePath);
        return;
    }
    
    let endString = `<div id="mainCashflowChart"></div>`;
    let endIndex = content.indexOf(endString, startIndex);
    if (endIndex === -1) {
       endIndex = content.indexOf('<div id="mainCashflowChart"');
    }

    if (startIndex !== -1 && endIndex !== -1) {
        // Include the end string length to replace it entirely
        let fullEndIndex = endIndex + endString.length;
        if(content.substring(endIndex, fullEndIndex) !== endString) {
           fullEndIndex = content.indexOf('</div>', endIndex) + 6;
        }

        const pre = content.substring(0, startIndex);
        const post = content.substring(fullEndIndex);
        content = pre + replacementLogic + "\n" + post;
        fs.writeFileSync(filePath, content);
        console.log('Successfully patched HTML in ' + filePath);
    } else {
        console.log('Could not find replace targets in ' + filePath);
    }
}

processFile(path.join(__dirname, 'docs', 'index.html'));
processFile(path.join(__dirname, 'src', 'index.html'));
