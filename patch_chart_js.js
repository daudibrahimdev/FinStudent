const fs = require('fs');
const path = require('path');

const chartJsContent = `// FinStudent Chart.js v2 — Dynamic Cashflow + Needs vs Wants

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

  window.renderDynamicCashflowChart = function(allTransactions, allSavings) {
    if (!document.getElementById('mainCashflowChart')) return;

    // 1. Get UI Filter State
    const timeFilter = document.getElementById('chartTimeFilter') ? document.getElementById('chartTimeFilter').value : 'this_month';
    const customStart = document.getElementById('chartStartDate') ? document.getElementById('chartStartDate').value : '';
    const customEnd = document.getElementById('chartEndDate') ? document.getElementById('chartEndDate').value : '';

    let startDate, endDate;
    const now = new Date();
    now.setHours(0,0,0,0);

    if (timeFilter === 'this_month') {
       startDate = new Date(now.getFullYear(), now.getMonth(), 1);
       endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (timeFilter === 'last_month') {
       startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
       endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (timeFilter === 'this_year') {
       startDate = new Date(now.getFullYear(), 0, 1);
       endDate = new Date(now.getFullYear(), 11, 31);
    } else if (timeFilter === 'custom' && customStart && customEnd) {
       startDate = new Date(customStart);
       endDate = new Date(customEnd);
       startDate.setHours(0,0,0,0);
       endDate.setHours(23,59,59,999);
    } else {
       // fallback this month
       startDate = new Date(now.getFullYear(), now.getMonth(), 1);
       endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Smart Grouping logic
    const isMonthlyGrouping = diffDays > 31;

    let labels = [];
    let seriesData = [];
    
    // Filter Data by date range
    const filterTx = txs => txs.filter(t => {
       const d = new Date(t.date).getTime();
       return d >= startDate.getTime() && d <= endDate.getTime();
    });

    const txsInRange = filterTx(allTransactions || []);
    const savingsInRange = filterTx(allSavings || []);

    if (isMonthlyGrouping) {
        // Group By Month
        let monthMap = {};
        // Generate labels from start to end month
        let iter = new Date(startDate);
        iter.setDate(1);
        while (iter <= endDate) {
            let key = iter.getFullYear() + '-' + String(iter.getMonth()).padStart(2, '0');
            let label = iter.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
            monthMap[key] = { label: label, val: 0 };
            iter.setMonth(iter.getMonth() + 1);
        }

        // Aggregate
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
           labels.push(monthMap[k].label);
           seriesData.push(monthMap[k].val);
        });

    } else {
        // Group By Day
        let dayMap = {};
        let iter = new Date(startDate);
        while (iter <= endDate) {
            let key = iter.toISOString().split('T')[0];
            let label = iter.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            dayMap[key] = { label: label, val: 0 };
            iter.setDate(iter.getDate() + 1);
        }

        if (currentMetric === 'pemasukan' || currentMetric === 'pengeluaran') {
           txsInRange.forEach(t => {
               if (t.type === currentMetric) {
                   const key = t.date.split(' ')[0].split('T')[0]; // simple ISO split
                   if (dayMap[key]) dayMap[key].val += parseFloat(t.amount);
               }
           });
        } else if (currentMetric === 'tabungan') {
           savingsInRange.forEach(t => {
               if (t.type === 'simpan') {
                   const key = t.date.split(' ')[0].split('T')[0];
                   if (dayMap[key]) dayMap[key].val += parseFloat(t.amount);
               }
           });
        }

        Object.keys(dayMap).sort().forEach(k => {
           labels.push(dayMap[k].label);
           seriesData.push(dayMap[k].val);
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
          xaxis: { categories: labels },
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
            categories: labels,
            tickAmount: 6,
            labels: { show: true, style: { colors: [window.theme.gray600] } } 
          },
          colors: [metricColor],
          yaxis: { labels: { formatter: function (e) { return 'Rp ' + (e/1000).toFixed(0) + 'k'; }, style: { colors: window.theme.gray600 } } }
        };
        mainChartInstance = new ApexCharts(document.querySelector("#mainCashflowChart"), options);
        mainChartInstance.render();
    }
  };

  // Expose global setter for UI bindings
  window.setCashflowMetric = function(metric, allTransactions, allSavings) {
      currentMetric = metric;
      window.renderDynamicCashflowChart(allTransactions, allSavings);
  };

})();
`;

fs.writeFileSync(path.join(__dirname, 'src', 'assets', 'js', 'vendors', 'chart.js'), chartJsContent);
fs.writeFileSync(path.join(__dirname, 'docs', 'assets', 'js', 'vendors', 'chart.js'), chartJsContent);
console.log('chart.js replaced successfully.');

