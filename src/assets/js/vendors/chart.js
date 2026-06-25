// FinStudent Chart.js v2 — Arus Keuangan + Kebutuhan vs Keinginan

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
  infoDark: '#006C9C',
  successLight: '#77ED8B',
  gray100: 'var(--ds-gray-100)',
  gray200: 'var(--ds-gray-200)',
  gray300: 'var(--ds-gray-300)',
  gray400: 'var(--ds-gray-400)',
  gray500: 'var(--ds-gray-500)',
  gray600: 'var(--ds-gray-600)',
  gray700: 'var(--ds-gray-700)',
  gray800: 'var(--ds-gray-800)',
  gray900: 'var(--ds-gray-900)',
  black: 'var(--ds-black)',
  transparent: 'transparent',
};

window.theme = theme;

(function () {
  window.renderDashboardCharts = function(transactions, savingsData, selectedYYYYMM) {
    let targetYear, targetMonth;
    const today = new Date();
    today.setHours(0,0,0,0);

    if (selectedYYYYMM) {
      const parts = selectedYYYYMM.split('-');
      targetYear = parseInt(parts[0], 10);
      targetMonth = parseInt(parts[1], 10) - 1; // JS months are 0-11
    } else {
      targetYear = today.getFullYear();
      targetMonth = today.getMonth();
    }

    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    
    let labels = [];
    let incomeData = Array(daysInMonth).fill(0);
    let expenseData = Array(daysInMonth).fill(0);
    let savingsDataArr = Array(daysInMonth).fill(0);

    // Generate labels: e.g. "1 Aug", "2 Aug"
    for (let i = 1; i <= daysInMonth; i++) {
      let d = new Date(targetYear, targetMonth, i);
      labels.push(d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));
    }

    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate.getFullYear() === targetYear && txDate.getMonth() === targetMonth) {
        const dayIndex = txDate.getDate() - 1;
        const amount = parseFloat(tx.amount);
        if (tx.type === 'pemasukan') incomeData[dayIndex] += amount;
        else if (tx.type === 'pengeluaran') expenseData[dayIndex] += amount;
      }
    });

    if (typeof savingsData !== 'undefined') {
      savingsData.forEach(s => {
        if (s.type === 'simpan') {
          const sDate = new Date(s.date);
          if (sDate.getFullYear() === targetYear && sDate.getMonth() === targetMonth) {
             const dayIndex = sDate.getDate() - 1;
             savingsDataArr[dayIndex] += parseFloat(s.amount);
          }
        }
      });
    }

    var chartBase = {
      chart: { height: 350, type: 'area', toolbar: { show: false }, fontFamily: 'Public Sans, serif' },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      xaxis: { 
        tickAmount: 6,
        labels: { show: true, style: { colors: [window.theme.gray600] } } 
      },
      yaxis: { labels: { formatter: function (e) { return 'Rp ' + (e/1000).toFixed(0) + 'k'; }, style: { colors: window.theme.gray600 } } }
    };

    // 1. Income Chart
    if (document.getElementById('totalIncomeChart')) {
      if (window.incomeChartInstance) window.incomeChartInstance.destroy();
      document.getElementById('totalIncomeChart').innerHTML = '';
      window.incomeChartInstance = new ApexCharts(document.querySelector('#totalIncomeChart'), {
        ...chartBase,
        series: [{ name: 'Pemasukan', data: incomeData }],
        labels: labels,
        colors: ['#00a76f'],
      });
      window.incomeChartInstance.render();
    }

    // 2. Expense Chart
    if (document.getElementById('totalExpensesChart')) {
      if (window.expenseChartInstance) window.expenseChartInstance.destroy();
      document.getElementById('totalExpensesChart').innerHTML = '';
      window.expenseChartInstance = new ApexCharts(document.querySelector('#totalExpensesChart'), {
        ...chartBase,
        series: [{ name: 'Pengeluaran', data: expenseData }],
        labels: labels,
        colors: [window.theme.warning],
      });
      window.expenseChartInstance.render();
    }

    // 3. Savings Chart
    if (document.getElementById('totalSavingsChart')) {
      if (window.savingsChartInstance) window.savingsChartInstance.destroy();
      document.getElementById('totalSavingsChart').innerHTML = '';
      window.savingsChartInstance = new ApexCharts(document.querySelector('#totalSavingsChart'), {
        ...chartBase,
        series: [{ name: 'Tabungan Masuk', data: savingsDataArr }],
        labels: labels,
        colors: [window.theme.success],
      });
      window.savingsChartInstance.render();
    }

    // Clean up unused chart containers from the original template
    ['totalSale', 'salesBygender', 'map-world'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '';
    });
  };
})();
