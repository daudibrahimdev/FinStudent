const fs = require('fs');
const path = require('path');

const appendLogic = `
// --- DYNAMIC CHART BINDINGS ---
document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('mainCashflowChart')) {
        let allTxs = [];
        let allSavs = [];
        try {
            if (typeof ApiService !== 'undefined') {
                allTxs = await ApiService.getTransactions();
                allSavs = await ApiService.getSavings();
            }
        } catch(e){ console.error('Error fetching data for dynamic chart', e); }

        // Initial render
        if (typeof window.renderDynamicCashflowChart === 'function') {
            window.renderDynamicCashflowChart(allTxs, allSavs);
        }

        // Bind metric buttons
        const btnPem = document.getElementById('btn-pemasukan');
        const btnPen = document.getElementById('btn-pengeluaran');
        const btnTab = document.getElementById('btn-tabungan');
        const btns = [btnPem, btnPen, btnTab];
        
        btns.forEach(btn => {
            if(!btn) return;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                btns.forEach(b => { if(b) b.classList.remove('active'); });
                btn.classList.add('active');
                if (typeof window.setCashflowMetric === 'function') {
                   window.setCashflowMetric(btn.dataset.metric, allTxs, allSavs);
                }
            });
        });

        // Bind Time Filter
        const timeFilter = document.getElementById('chartTimeFilter');
        const customGroup = document.getElementById('customDateRangeInputs');
        const applyCustom = document.getElementById('applyCustomDateBtn');

        if(timeFilter) {
            timeFilter.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    customGroup.classList.remove('d-none');
                    customGroup.classList.add('d-flex');
                } else {
                    customGroup.classList.add('d-none');
                    customGroup.classList.remove('d-flex');
                    if (typeof window.renderDynamicCashflowChart === 'function') {
                        window.renderDynamicCashflowChart(allTxs, allSavs);
                    }
                }
            });
        }
        
        if (applyCustom) {
            applyCustom.addEventListener('click', () => {
                if (typeof window.renderDynamicCashflowChart === 'function') {
                    window.renderDynamicCashflowChart(allTxs, allSavs);
                }
            });
        }
    }
});
`;

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    content += "\n" + appendLogic;
    fs.writeFileSync(filePath, content);
    console.log('Successfully appended logic to ' + filePath);
}

processFile(path.join(__dirname, 'docs', 'assets', 'js', 'app.js'));
processFile(path.join(__dirname, 'src', 'assets', 'js', 'app.js'));
processFile(path.join(__dirname, 'app-beautified.js'));
