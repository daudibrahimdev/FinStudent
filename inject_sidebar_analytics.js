const fs = require('fs');

const files = [
  'docs/index.html',
  'docs/setup.html',
  'docs/transactions.html',
  'docs/transactions-history.html',
  'docs/savings.html',
  'docs/leaderboard.html',
  'docs/analytics.html'
];

const sidebarItem = `
    <!-- Nav item Analytics -->
    <li class="nav-item">
      <a class="nav-link" href="./analytics.html">
        <span class="nav-icon">
          <i class="ti ti-chart-pie fs-4 text-info"></i>
        </span> 
        <span class="text">Analisis & Laporan</span>
      </a>
    </li>
`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('href="./analytics.html"')) {
    content = content.replace(/<!-- Nav item Setup -->/g, sidebarItem + '\n    <!-- Nav item Setup -->');
    fs.writeFileSync(file, content);
    console.log('Updated sidebar in ' + file);
  }
});
