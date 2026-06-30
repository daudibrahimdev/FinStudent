const fs = require('fs');

const file = 'docs/assets/js/analytics.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Change filteredExpenses logic to also keep filteredAllTransactions
content = content.replace(`let filteredExpenses = [];`, `let filteredExpenses = [];
    let filteredAllTransactions = [];
    let activeRule = null;
    let rulePage = 1;
    let ruleChart = null;
    const ruleSummaryContainer = document.getElementById('ruleSummaryContainer');
    const ruleTransactionsContainer = document.getElementById('ruleTransactionsContainer');
    const btnBackToRuleList = document.getElementById('btnBackToRuleList');`);

content = content.replace(`filteredExpenses = expenses.filter(tx => {`, `filteredExpenses = expenses.filter(tx => {
                const date = new Date(tx.date);
                return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
            });
            filteredAllTransactions = allTransactions.filter(tx => {`);

content = content.replace(`filteredExpenses = [...expenses];`, `filteredExpenses = [...expenses];
            filteredAllTransactions = [...allTransactions];`);

// Add processAndRenderRule to applyFilter
content = content.replace(`processAndRenderMerchant();`, `processAndRenderMerchant();
        processAndRenderRule();`);
        
// Reset Rule view in applyFilter
content = content.replace(`resetMerchantView();`, `resetMerchantView();
        resetRuleView();`);

// Add resize listener for rule tab
content = content.replace(`document.getElementById('kategori-tab').addEventListener('shown.bs.tab', function (e) {`, `document.getElementById('rule-tab').addEventListener('shown.bs.tab', function (e) {
        if(ruleChart) {
            setTimeout(() => ruleChart.windowResize(), 10);
        }
    });
    document.getElementById('kategori-tab').addEventListener('shown.bs.tab', function (e) {`);

// Add Rule logic at the end before `// Run Initializer`
const ruleLogic = `
    // ==========================================
    // RULE 50/30/20 LOGIC
    // ==========================================
    
    const resetRuleView = () => {
        activeRule = null;
        rulePage = 1;
        ruleSummaryContainer.style.display = 'block';
        ruleTransactionsContainer.style.display = 'none';
        btnBackToRuleList.style.display = 'none';
    };

    const processAndRenderRule = () => {
        let kebutuhan = 0;
        let keinginan = 0;
        let tabungan = 0;
        let total = 0;

        filteredAllTransactions.forEach(tx => {
            const amt = parseFloat(tx.amount || 0);
            if (tx.type === 'pengeluaran') {
                if (tx.nature === 'keinginan') {
                    keinginan += amt;
                    total += amt;
                } else {
                    kebutuhan += amt;
                    total += amt;
                }
            } else if (tx.type === 'simpan') {
                tabungan += amt;
                total += amt;
            }
        });

        const data = [
            { name: 'Kebutuhan', amount: kebutuhan, percentage: total > 0 ? (kebutuhan/total)*100 : 0, color: '#624bff', id: 'kebutuhan' },
            { name: 'Keinginan', amount: keinginan, percentage: total > 0 ? (keinginan/total)*100 : 0, color: '#f59e0b', id: 'keinginan' },
            { name: 'Tabungan', amount: tabungan, percentage: total > 0 ? (tabungan/total)*100 : 0, color: '#10b981', id: 'simpan' }
        ];

        renderRuleChart(data, total);
        renderRuleCards(data);
    };

    const renderRuleChart = (data, totalAmount) => {
        const chartElement = document.querySelector("#ruleDonutChart");
        chartElement.innerHTML = ''; 

        if(totalAmount === 0) {
            chartElement.innerHTML = '<div class="d-flex h-100 justify-content-center align-items-center text-muted py-5">Tidak ada data untuk Rule 50/30/20.</div>';
            return;
        }

        const series = data.map(item => item.amount);
        const labels = data.map(item => item.name);
        const chartColors = data.map(item => item.color);

        const options = {
            series: series,
            labels: labels,
            chart: {
                type: 'donut',
                height: 350,
                background: 'transparent',
                events: {
                    dataPointSelection: (event, chartContext, config) => {
                        const selectedIdx = config.dataPointIndex;
                        if(selectedIdx >= 0) {
                            showRuleTransactions(data[selectedIdx].id, data[selectedIdx].name);
                        }
                    }
                }
            },
            colors: chartColors,
            plotOptions: {
                pie: { donut: { size: '75%', labels: { show: true, name: { show: true, fontSize: '14px', fontFamily: 'inherit', color: undefined, offsetY: -10 }, value: { show: true, fontSize: '20px', fontFamily: 'inherit', fontWeight: 700, color: undefined, formatter: function (val) { return formatCurrency(val); } }, total: { show: true, showAlways: true, label: 'Total Alokasi', fontSize: '14px', fontFamily: 'inherit', color: undefined, formatter: function (w) { return formatCurrency(totalAmount); } } } } }
            },
            dataLabels: { enabled: true, formatter: function (val) { return Math.round(val) + "%"; }, dropShadow: { enabled: false } },
            legend: { show: true, position: 'bottom', horizontalAlign: 'center', fontSize: '13px', fontFamily: 'inherit', markers: { radius: 12 }, itemMargin: { horizontal: 10, vertical: 5 } },
            stroke: { show: true, colors: 'transparent', width: 2 },
            theme: { mode: document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light' }
        };

        ruleChart = new ApexCharts(chartElement, options);
        ruleChart.render();
    };

    const renderRuleCards = (data) => {
        const listContainer = document.getElementById('ruleCardsList');
        listContainer.innerHTML = '';
        
        data.forEach((item) => {
            const col = document.createElement('div');
            col.className = 'col-12 col-md-4';
            col.innerHTML = \`
                <div class="card border shadow-none rounded-4 cursor-pointer hover-lift h-100 rule-card" data-rule="\${item.id}" data-name="\${item.name}">
                    <div class="card-body p-3 d-flex align-items-center gap-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 45px; height: 45px; background-color: \${item.color}20; color: \${item.color};">
                            <i class="ti \${item.id === 'simpan' ? 'ti-pig-money' : item.id === 'kebutuhan' ? 'ti-home' : 'ti-star'} fs-4"></i>
                        </div>
                        <div class="flex-grow-1 min-w-0">
                            <h6 class="mb-1 fw-bold text-truncate">\${item.name}</h6>
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge rounded-pill text-bg-light fs-xs fw-semibold" style="color: \${item.color} !important;">\${Math.round(item.percentage)}%</span>
                                <span class="text-muted small fw-medium text-truncate">\${formatCurrency(item.amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            \`;
            listContainer.appendChild(col);
        });

        document.querySelectorAll('.rule-card').forEach(card => {
            card.addEventListener('click', function() {
                showRuleTransactions(this.getAttribute('data-rule'), this.getAttribute('data-name'));
            });
        });
    };

    const showRuleTransactions = (ruleId, ruleName) => {
        activeRule = ruleId; 
        rulePage = 1;
        
        ruleSummaryContainer.style.display = 'none';
        ruleTransactionsContainer.style.display = 'block';
        btnBackToRuleList.style.display = 'inline-flex';
        
        document.getElementById('ruleTransactionsTitle').textContent = \`Transaksi: \${ruleName}\`;
        
        renderRuleTransactionsList();
        ruleTransactionsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const renderRuleTransactionsList = () => {
        const txList = document.getElementById('ruleTransactionsList');
        const pagination = document.getElementById('rulePagination');
        
        const filteredTxs = filteredAllTransactions.filter(tx => {
            if (activeRule === 'simpan') return tx.type === 'simpan';
            if (activeRule === 'kebutuhan') return tx.type === 'pengeluaran' && tx.nature !== 'keinginan';
            if (activeRule === 'keinginan') return tx.type === 'pengeluaran' && tx.nature === 'keinginan';
            return false;
        }).sort((a,b) => new Date(b.date) - new Date(a.date));
                                            
        const totalItems = filteredTxs.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        
        if (rulePage > totalPages && totalPages > 0) rulePage = totalPages;
        
        const startIndex = (rulePage - 1) * ITEMS_PER_PAGE;
        const paginatedTxs = filteredTxs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        
        txList.innerHTML = '';
        if(paginatedTxs.length === 0) {
            txList.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-muted">Tidak ada transaksi.</td></tr>';
        } else {
            paginatedTxs.forEach(tx => {
                const isSaving = tx.type === 'simpan';
                txList.innerHTML += \`
                    <tr>
                        <td class="ps-4"><div class="fw-medium">\${formatDate(tx.date)}</div></td>
                        <td>
                            <div class="fw-medium text-truncate" style="max-width: 200px;">\${tx.description || '-'}</div>
                            <div class="small text-muted"><i class="ti \${isSaving ? 'ti-pig-money' : 'ti-tags'} me-1"></i>\${isSaving ? 'Tabungan' : (tx.category || 'Lainnya')}</div>
                        </td>
                        <td class="fw-bold \${isSaving ? 'text-success' : 'text-danger'}">
                            \${isSaving ? '+' : '-'}\${formatCurrency(tx.amount)}
                        </td>
                    </tr>
                \`;
            });
        }
        
        pagination.innerHTML = '';
        if (totalPages > 1) {
            pagination.innerHTML += \`<li class="page-item \${rulePage === 1 ? 'disabled' : ''}"><a class="page-link rule-page-btn" href="#" data-page="\${rulePage - 1}"><i class="ti ti-chevron-left"></i></a></li>\`;
            for(let i=1; i<=totalPages; i++) {
                if(i === 1 || i === totalPages || (i >= rulePage - 1 && i <= rulePage + 1)) {
                    pagination.innerHTML += \`<li class="page-item \${rulePage === i ? 'active' : ''}"><a class="page-link rule-page-btn" href="#" data-page="\${i}">\${i}</a></li>\`;
                } else if(i === rulePage - 2 || i === rulePage + 2) {
                    pagination.innerHTML += \`<li class="page-item disabled"><a class="page-link" href="#">...</a></li>\`;
                }
            }
            pagination.innerHTML += \`<li class="page-item \${rulePage === totalPages ? 'disabled' : ''}"><a class="page-link rule-page-btn" href="#" data-page="\${rulePage + 1}"><i class="ti ti-chevron-right"></i></a></li>\`;
            
            document.querySelectorAll('.rule-page-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    rulePage = parseInt(e.currentTarget.getAttribute('data-page'));
                    renderRuleTransactionsList();
                });
            });
        }
    };

    btnBackToRuleList.addEventListener('click', (e) => {
        e.preventDefault();
        resetRuleView();
    });

    // Run Initializer
`;

content = content.replace(`// Run Initializer`, ruleLogic);

fs.writeFileSync(file, content);
console.log('Added Rule 50/30/20 logic.');
