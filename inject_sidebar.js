const fs = require('fs');

const files = [
  'docs/index.html',
  'docs/setup.html',
  'docs/transactions.html',
  'docs/transactions-history.html',
  'docs/savings.html',
  'docs/leaderboard.html'
];

const sidebarItem = `
    <!-- Nav item Leaderboard -->
    <li class="nav-item">
      <a class="nav-link" href="./leaderboard.html">
        <span class="nav-icon">
          <i class="ti ti-trophy fs-4 text-warning"></i>
        </span> 
        <span class="text">Leaderboard & XP</span>
      </a>
    </li>
`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // There are usually two sidebars (desktop and mobile offcanvas)
  // We'll replace `<!-- Nav item Setup -->` with our item + `<!-- Nav item Setup -->`
  
  // Replace all instances
  content = content.replace(/<!-- Nav item Setup -->/g, sidebarItem + '\n    <!-- Nav item Setup -->');
  
  // For transactions, we should also trigger Gamification Popup if it's there?
  // Let's add gamification.js script tag before </body> if not exists.
  if (file === 'docs/transactions.html' || file === 'docs/index.html') {
    if (!content.includes('gamification.js')) {
       content = content.replace('</body>', '  <script src="./assets/js/gamification.js"></script>\n</body>');
    }
  }

  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});
