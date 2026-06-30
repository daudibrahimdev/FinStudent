const fs = require('fs');
const path = require('path');

const newAppendLogic = `
// --- DYNAMIC CHART BINDINGS V2 ---
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

        if (typeof window.renderDynamicCashflowChart === 'function') {
            window.renderDynamicCashflowChart(allTxs, allSavs);
        }

        // Metric Select Dropdown Items
        const metricBtns = document.querySelectorAll('.metric-select-btn');
        metricBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                metricBtns.forEach(b => { b.classList.remove('active', 'bg-light'); });
                btn.classList.add('active', 'bg-light');
                if (typeof window.setCashflowMetric === 'function') {
                   window.setCashflowMetric(btn.dataset.metric, allTxs, allSavs);
                }
            });
        });

        // Time Filter Presets
        const timePresetBtns = document.querySelectorAll('.time-preset-btn');
        const activeTimeLabel = document.getElementById('activeTimeLabel');
        const customStart = document.getElementById('chartStartDate');
        const customEnd = document.getElementById('chartEndDate');
        
        timePresetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                timePresetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if(activeTimeLabel) activeTimeLabel.innerText = btn.innerText;
                customStart.value = ''; // clear custom
                customEnd.value = '';

                if (typeof window.renderDynamicCashflowChart === 'function') {
                    window.renderDynamicCashflowChart(allTxs, allSavs);
                }
            });
        });

        // Apply Custom Date
        const applyCustomBtn = document.getElementById('applyCustomDateBtn');
        if (applyCustomBtn) {
            applyCustomBtn.addEventListener('click', () => {
                timePresetBtns.forEach(b => b.classList.remove('active'));
                // add a dummy active state to a custom flag so chart.js reads it
                const dummyBtn = document.createElement('button');
                dummyBtn.className = 'time-preset-btn active d-none';
                dummyBtn.dataset.range = 'custom';
                document.body.appendChild(dummyBtn);

                if(activeTimeLabel) activeTimeLabel.innerText = "Kustom";

                if (typeof window.renderDynamicCashflowChart === 'function') {
                    window.renderDynamicCashflowChart(allTxs, allSavs);
                }
                
                // remove dummy after render
                setTimeout(() => dummyBtn.remove(), 100);
            });
        }
    }
});
`;

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    const startIndex = content.indexOf('// --- DYNAMIC CHART BINDINGS ---');
    if (startIndex !== -1) {
        content = content.substring(0, startIndex);
    }
    
    // Also remove v2 if re-running
    const startV2Index = content.indexOf('// --- DYNAMIC CHART BINDINGS V2 ---');
    if (startV2Index !== -1) {
        content = content.substring(0, startV2Index);
    }
    
    content += "\n" + newAppendLogic;
    fs.writeFileSync(filePath, content);
    console.log('Successfully appended V2 logic to ' + filePath);
}

processFile(path.join(__dirname, 'docs', 'assets', 'js', 'app.js'));
processFile(path.join(__dirname, 'src', 'assets', 'js', 'app.js'));
processFile(path.join(__dirname, 'app-beautified.js'));
