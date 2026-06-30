const fs = require('fs');
let html = fs.readFileSync('docs/setup.html', 'utf8');
let top = html.substring(0, html.indexOf('<div class="custom-container">'));
let bottomIndex = html.indexOf('<!-- Libs JS -->');
// Need to add closing div for the app-content and wrappers if needed?
// Let's check what closes custom-container in setup.html
// setup.html line 1007 is </div>, 1008 is </div>
let bottom = `      </div>\n    </div>\n` + html.substring(bottomIndex);

let newMain = `
      <div class="custom-container">
        <div class="row mb-6">
          <div class="col-lg-12 col-md-12 col-12">
            <!-- Page header -->
            <div class="mb-5">
              <h1 class="mb-3 h2">Peringkat & XP</h1>
              <p class="text-muted">Bandingkan progres finansial kamu dengan pengguna lain.</p>
            </div>
          </div>
        </div>
        
        <div class="row justify-content-center">
          <div class="col-xl-8 col-lg-10 col-12">
            <div class="card shadow-sm border-0" style="border-radius: 16px;">
              <div class="card-header bg-white border-bottom-0 pt-4 pb-0 text-center">
                <img src="./assets/images/cat/mochihappy.gif" alt="Trophy" style="width: 120px; object-fit: contain; margin-bottom: 1rem;">
                <h5 class="mb-0 text-primary fw-bold">Leaderboard Minggu Ini</h5>
              </div>
              <div class="card-body px-4 py-4">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <tbody id="leaderboardList">
                      <tr><td class="text-center py-4 text-muted">Memuat peringkat...</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
`;

// Add the custom script before </body>
bottom = bottom.replace('</body>', `
<script src="./assets/js/gamification.js"></script>
<script>
document.addEventListener('DOMContentLoaded', async () => {
  const xp = await GamificationEngine.calculateTotalXP();
  
  const dummyUsers = [
    { name: 'mochi', xp: 2367, avatar: 'avatar-1.jpg' },
    { name: 'jera', xp: 1895, avatar: 'avatar-2.jpg' },
    { name: 'hippo', xp: 1276, avatar: 'avatar-3.jpg' },
    { name: 'bobo', xp: 941, avatar: 'avatar-4.jpg' },
    { name: 'seli', xp: 246, avatar: 'avatar-5.jpg' },
    { name: 'Kamu', xp: xp, avatar: 'avatar-10.jpg', isUser: true }
  ];
  
  // Sort by XP descending
  dummyUsers.sort((a, b) => b.xp - a.xp);
  
  const tbody = document.getElementById('leaderboardList');
  tbody.innerHTML = '';
  
  dummyUsers.forEach((user, index) => {
    const tr = document.createElement('tr');
    if (user.isUser) {
      tr.style.backgroundColor = 'var(--bs-primary-bg-subtle)';
      tr.style.borderLeft = '4px solid var(--bs-primary)';
    } else {
      tr.style.borderLeft = '4px solid transparent';
    }
    tr.style.transition = 'all 0.3s ease';
    
    // Position styling
    let posBadge = \`<span class="fw-bold fs-5 text-muted">\${index + 1}</span>\`;
    if (index === 0) posBadge = \`<span class="badge bg-warning rounded-circle shadow-sm" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 14px;">1</span>\`;
    if (index === 1) posBadge = \`<span class="badge bg-secondary rounded-circle shadow-sm" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 14px;">2</span>\`;
    if (index === 2) posBadge = \`<span class="badge bg-danger rounded-circle shadow-sm" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 14px;">3</span>\`;
    
    tr.innerHTML = \`
      <td style="width: 60px;" class="text-center">\${posBadge}</td>
      <td style="width: 60px;">
        <img src="./assets/images/avatar/\${user.avatar}" alt="\${user.name}" class="rounded-circle shadow-sm" style="width: 48px; height: 48px; object-fit: cover;">
      </td>
      <td>
        <div class="fw-bold \${user.isUser ? 'text-primary fs-5' : 'text-dark'}">\${user.name} \${user.isUser ? ' (Kamu)' : ''}</div>
      </td>
      <td class="text-end pe-4">
        <span class="badge rounded-pill \${user.isUser ? 'bg-primary text-white fs-6' : 'bg-light text-dark border fw-medium'} px-3 py-2">
          \${new Intl.NumberFormat('id-ID').format(user.xp)} XP
        </span>
      </td>
    \`;
    tbody.appendChild(tr);
  });
});
</script>
</body>`);

fs.writeFileSync('docs/leaderboard.html', top + newMain + bottom);
