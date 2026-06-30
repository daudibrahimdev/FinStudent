const fs = require('fs');
const path = require('path');

const replacementLogic = `
                <div class="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <!-- heading -->
                  <h5 class="mb-0">Arus Keuangan</h5>
                  <!-- Filter Rentang Waktu -->
                  <div class="d-flex align-items-center gap-2">
                    <select id="chartTimeFilter" class="form-select form-select-sm" style="width: auto;">
                      <option value="this_month" selected>Bulan Ini</option>
                      <option value="last_month">Bulan Lalu</option>
                      <option value="this_year">Tahun Ini</option>
                      <option value="custom">Kustom...</option>
                    </select>
                    <div id="customDateRangeInputs" class="d-none align-items-center gap-2">
                      <input type="date" id="chartStartDate" class="form-control form-control-sm">
                      <span class="text-muted">-</span>
                      <input type="date" id="chartEndDate" class="form-control form-control-sm">
                      <button id="applyCustomDateBtn" class="btn btn-sm btn-primary py-1 px-2"><i class="ti ti-check"></i></button>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-100 p-3 rounded-3 mb-3">
                  <ul class="nav nav-pills-white nav-fill" id="chartMetricTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                      <button class="nav-link" id="btn-pemasukan" type="button" data-metric="pemasukan">
                        <span class="d-flex flex-column">
                          <span class="d-flex align-items-center gap-2">
                            <span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                fill="currentColor"
                                class="icon icon-tabler icons-tabler-filled icon-tabler-circle text-primary">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path
                                  d="M7 3.34a10 10 0 1 1 -4.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 4.995 -8.336z" />
                              </svg></span><span>Pemasukan</span>
                          </span>
                          <span class="text-start fs-3 fw-semibold mt-2" id="summaryIncome">Rp 0</span>
                        </span>
                      </button>
                    </li>
                    <li class="nav-item" role="presentation">
                      <button class="nav-link active" id="btn-pengeluaran" type="button" data-metric="pengeluaran">
                        <span class="d-flex flex-column">
                          <span class="d-flex align-items-center gap-2">
                            <span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                fill="currentColor"
                                class="icon icon-tabler icons-tabler-filled icon-tabler-circle text-warning">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path
                                  d="M7 3.34a10 10 0 1 1 -4.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 4.995 -8.336z" />
                              </svg></span><span>Pengeluaran</span>
                          </span>
                          <span class="text-start fs-3 fw-semibold mt-2" id="summaryExpense">Rp 0</span>
                        </span>
                      </button>
                    </li>
                    <li class="nav-item" role="presentation">
                      <button class="nav-link" id="btn-tabungan" type="button" data-metric="tabungan">
                        <span class="d-flex flex-column">
                          <span class="d-flex align-items-center gap-2">
                            <span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                fill="currentColor"
                                class="icon icon-tabler icons-tabler-filled icon-tabler-circle text-success">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path
                                  d="M7 3.34a10 10 0 1 1 -4.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 4.995 -8.336z" />
                              </svg></span><span>Tabungan</span>
                          </span>
                          <span class="text-start fs-3 fw-semibold mt-2" id="summarySavings">Rp 0</span>
                        </span>
                      </button>
                    </li>
                  </ul>
                </div>
                <div id="mainCashflowChart"></div>
`;

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    const startString = `<div class="mb-4">
                  <!-- heading -->
                  <h5 class="mb-0">Arus Keuangan</h5>
                </div>`;
    
    // We need to find where the old tabs ended.
    const endString = `</div>
              </div>
            </div>
          </div>
          <div class="col-xl-4 col-12">`;

    let startIndex = content.indexOf('<div class="mb-4">');
    // find heading
    let h5Index = content.indexOf('<h5 class="mb-0">Arus Keuangan</h5>', startIndex);
    if (h5Index === -1) {
        console.log("Could not find Arus Keuangan heading in " + filePath);
        return;
    }
    
    let endIndex = content.indexOf('<div class="col-xl-4 col-12">', startIndex);
    
    // Backtrack to find the end of the previous div.
    let beforeCol = content.substring(0, endIndex);
    let lastDivEnd = beforeCol.lastIndexOf('</div>');
    let secondLastDivEnd = beforeCol.lastIndexOf('</div>', lastDivEnd - 1);
    let thirdLastDivEnd = beforeCol.lastIndexOf('</div>', secondLastDivEnd - 1);

    if (startIndex !== -1 && endIndex !== -1) {
        const pre = content.substring(0, startIndex);
        const post = content.substring(thirdLastDivEnd);
        content = pre + replacementLogic + "\n              " + post;
        fs.writeFileSync(filePath, content);
        console.log('Successfully patched HTML in ' + filePath);
    } else {
        console.log('Could not find replace targets in ' + filePath);
    }
}

processFile(path.join(__dirname, 'docs', 'index.html'));
processFile(path.join(__dirname, 'src', 'index.html'));
