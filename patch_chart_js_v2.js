const fs = require('fs');
const path = require('path');

const chartJsContent = `// FinStudent Chart.js v2.1 — Dynamic Cashflow (Datetime X-Axis & Modern UI)

var theme = {
  primary: 'var(--ds-primary)',
  secondary: 'var(--ds-secondary)',
  success: 'var(--ds-success)',
  info: 'var(--ds-info)',
  warning: 'var(--ds-warning)',
  danger: 'var(--ds-danger)',
  dark: 'var(--ds-dark)',
  light: 'var(--ds-light)',
  white: 'var(--ds-white)',
  gray600: 'var(--ds-gray-600)'
};

window.theme = theme;

(function () {
  let mainChartInstance = null;
  let currentMetric = 'pengeluaran'; // default
  let cachedTxs = [];
  let cachedSavs = [];

  const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  window.renderDynamicCashflowChart = function(allTransactions, allSavings) {
    if (!document.getElementById('mainCashflowChart')) return;
    if (allTransactions) cachedTxs = allTransactions;
    if (allSavings) cachedSavs = allSavings;

    // 1. Get UI Filter State
    let activeRange = 'this_month';
    document.querySelectorAll('.time-preset-btn').forEach(b => {
        if (b.classList.contains('active')) activeRange = b.dataset.range;
    });

    let startDate, endDate;
    const now = new Date();
    now.setHours(0,0,0,0);

    if (activeRange === 'this_month') {
       startDate = new Date(now.getFullYear(), now.getMonth(), 1);
       endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (activeRange === 'last_month') {
       startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
       endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (activeRange === 'this_year') {
       startDate = new Date(now.getFullYear(), 0, 1);
       endDate = new Date(now.getFullYear(), 11, 31);
    } else if (activeRange === 'custom') {
       const customStart = document.getElementById('chartStartDate').value;
       const customEnd = document.getElementById('chartEndDate').value;
       if (customStart && customEnd) {
           startDate = new Date(customStart);
           endDate = new Date(customEnd);
       } else {
           startDate = new Date(now.getFullYear(), now.getMonth(), 1);
           endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
       }
    } else {
       startDate = new Date(now.getFullYear(), now.getMonth(), 1);
       endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    
    startDate.setHours(0,0,0,0);
    endDate.setHours(23,59,59,999);

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isMonthlyGrouping = diffDays > 31;

    let seriesData = [];
    let totIncome = 0, totExpense = 0, totSavings = 0;

    // Filter Data by date range
    const filterTx = txs => txs.filter(t => {
       const d = new Date(t.date).getTime();
       return d >= startDate.getTime() && d <= endDate.getTime();
    });

    const txsInRange = filterTx(cachedTxs);
    const savingsInRange = filterTx(cachedSavs);

    txsInRange.forEach(t => {
        if(t.type === 'pemasukan') totIncome += parseFloat(t.amount);
        else if(t.type === 'pengeluaran') totExpense += parseFloat(t.amount);
    });
    savingsInRange.forEach(t => {
        if(t.type === 'simpan') totSavings += parseFloat(t.amount);
        else if(t.type === 'tarik') totSavings -= parseFloat(t.amount);
    });

    // Update Dropdown UI Amounts
    if(document.getElementById('drpIncome')) document.getElementById('drpIncome').innerText = formatCurrency(totIncome);
    if(document.getElementById('drpExpense')) document.getElementById('drpExpense').innerText = formatCurrency(totExpense);
    if(document.getElementById('drpSavings')) document.getElementById('drpSavings').innerText = formatCurrency(Math.max(0, totSavings));

    // Update Active Button
    let activeTotal = 0;
    if(currentMetric === 'pemasukan') activeTotal = totIncome;
    else if(currentMetric === 'pengeluaran') activeTotal = totExpense;
    else if(currentMetric === 'tabungan') activeTotal = Math.max(0, totSavings);
    if(document.getElementById('activeMetricAmount')) document.getElementById('activeMetricAmount').innerText = formatCurrency(activeTotal);

    if (isMonthlyGrouping) {
        // Group By Month (Datetime timestamp = 1st of month)
        let monthMap = {};
        let iter = new Date(startDate);
        iter.setDate(1);
        while (iter <= endDate) {
            let key = iter.getFullYear() + '-' + String(iter.getMonth()).padStart(2, '0');
            monthMap[key] = { timestamp: iter.getTime(), val: 0 };
            iter.setMonth(iter.getMonth() + 1);
        }

        if (currentMetric === 'pemasukan' || currentMetric === 'pengeluaran') {
           txsInRange.forEach(t => {
               if (t.type === currentMetric) {
                   const d = new Date(t.date);
                   const key = d.getFullYear() + '-' + String(d.getMonth()).padStart(2, '0');
                   if (monthMap[key]) monthMap[key].val += parseFloat(t.amount);
               }
           });
        } else if (currentMetric === 'tabungan') {
           savingsInRange.forEach(t => {
               if (t.type === 'simpan') {
                   const d = new Date(t.date);
                   const key = d.getFullYear() + '-' + String(d.getMonth()).padStart(2, '0');
                   if (monthMap[key]) monthMap[key].val += parseFloat(t.amount);
               }
           });
        }

        Object.keys(monthMap).sort().forEach(k => {
           seriesData.push([ monthMap[k].timestamp, monthMap[k].val ]);
        });

    } else {
        // Group By Day
        let dayMap = {};
        let iter = new Date(startDate);
        while (iter <= endDate) {
            let key = iter.toISOString().split('T')[0];
            dayMap[key] = { timestamp: iter.getTime(), val: 0 };
            iter.setDate(iter.getDate() + 1);
        }

        if (currentMetric === 'pemasukan' || currentMetric === 'pengeluaran') {
           txsInRange.forEach(t => {
               if (t.type === currentMetric) {
                   const d = new Date(t.date);
                   // normalize to local timezone day
                   const iterLocal = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                   const key = iterLocal.toISOString().split('T')[0];
                   // Fallback for simple date matching
                   let matchKey = Object.keys(dayMap).find(k => k.startsWith(t.date.split(' ')[0]));
                   if (matchKey && dayMap[matchKey]) dayMap[matchKey].val += parseFloat(t.amount);
                   else {
                       const simpleKey = t.date.split(' ')[0];
                       if (dayMap[simpleKey]) dayMap[simpleKey].val += parseFloat(t.amount);
                   }
               }
           });
        } else if (currentMetric === 'tabungan') {
           savingsInRange.forEach(t => {
               if (t.type === 'simpan') {
                   const simpleKey = t.date.split(' ')[0];
                   if (dayMap[simpleKey]) dayMap[simpleKey].val += parseFloat(t.amount);
               }
           });
        }

        Object.keys(dayMap).sort().forEach(k => {
           seriesData.push([ dayMap[k].timestamp, dayMap[k].val ]);
        });
    }

    // Determine colors & names
    let metricName = "Pengeluaran";
    let metricColor = window.theme.warning;
    if (currentMetric === 'pemasukan') {
       metricName = "Pemasukan";
       metricColor = '#00a76f';
    } else if (currentMetric === 'tabungan') {
       metricName = "Tabungan Masuk";
       metricColor = window.theme.success;
    }

    // Update or Create
    if (mainChartInstance) {
       mainChartInstance.updateOptions({
          colors: [metricColor]
       });
       mainChartInstance.updateSeries([{
          name: metricName,
          data: seriesData
       }]);
    } else {
       var options = {
          series: [{ name: metricName, data: seriesData }],
          chart: { height: 350, type: 'area', toolbar: { show: false }, fontFamily: 'Public Sans, serif' },
          dataLabels: { enabled: false },
          stroke: { curve: 'smooth', width: 2 },
          xaxis: { 
            type: 'datetime',
            labels: { 
               style: { colors: window.theme.gray600 },
               datetimeFormatter: {
                 year: 'yyyy',
                 month: 'MMM yyyy',
                 day: 'dd MMM',
                 hour: 'HH:mm'
               }
            } 
          },
          tooltip: {
            x: { format: 'dd MMM yyyy' }
          },
          colors: [metricColor],
          yaxis: { labels: { formatter: function (e) { return 'Rp ' + (e/1000).toFixed(0) + 'k'; }, style: { colors: window.theme.gray600 } } }
        };
        mainChartInstance = new ApexCharts(document.querySelector("#mainCashflowChart"), options);
        mainChartInstance.render();
    }
  };

  window.setCashflowMetric = function(metric, allTransactions, allSavings) {
      currentMetric = metric;
      // Update UI Header
      const labelEl = document.getElementById('activeMetricLabel');
      const iconEl = document.getElementById('activeMetricIcon');
      
      if (metric === 'pemasukan') {
          labelEl.innerText = 'PEMASUKAN';
          iconEl.className = 'bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center flex-shrink-0';
          iconEl.innerHTML = '<i class="ti ti-arrow-down-left fs-4"></i>';
      } else if (metric === 'pengeluaran') {
          labelEl.innerText = 'PENGELUARAN';
          iconEl.className = 'bg-warning-subtle text-warning rounded-circle d-flex align-items-center justify-content-center flex-shrink-0';
          iconEl.innerHTML = '<i class="ti ti-arrow-up-right fs-4"></i>';
      } else {
          labelEl.innerText = 'TABUNGAN MASUK';
          iconEl.className = 'bg-info-subtle text-info rounded-circle d-flex align-items-center justify-content-center flex-shrink-0';
          iconEl.innerHTML = '<i class="ti ti-pig-money fs-4"></i>';
      }

      window.renderDynamicCashflowChart(allTransactions, allSavings);
  };

})();
`;

fs.writeFileSync(path.join(__dirname, 'src', 'assets', 'js', 'vendors', 'chart.js'), chartJsContent);
fs.writeFileSync(path.join(__dirname, 'docs', 'assets', 'js', 'vendors', 'chart.js'), chartJsContent);
console.log('chart.js v2 replaced successfully.');

