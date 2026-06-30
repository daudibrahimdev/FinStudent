const fs = require('fs');
let html = fs.readFileSync('docs/index.html', 'utf8');
let top = html.substring(0, html.indexOf('<div class="container-fluid mb-5 p-4">'));
let bottom = html.substring(html.indexOf('<!-- Footer -->'));
let newMain = `
<div class="container-fluid mb-5 p-4">
  <div class="row">
    <div class="col-12">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="mb-1 h2">Peringkat & XP</h1>
          <p class="text-muted mb-0">Bandingkan progres finansial kamu dengan pengguna lain.</p>
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-lg-8 col-12 mx-auto">
      <div class="card shadow-sm border-0" style="border-radius: 16px;">
        <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
          <h5 class="mb-0">Leaderboard Minggu Ini</h5>
        </div>
        <div class="card-body">
          <div class="text-center mb-4">
            <img src="./assets/images/cat/mochihappy.gif" alt="Trophy" style="width: 120px; object-fit: contain;">
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <tbody id="leaderboardList">
                <tr><td class="text-center py-4 text-muted">Memuat peringkat...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

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
      tr.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
      tr.style.fontWeight = 'bold';
    }
    
    // Position styling
    let posBadge = \`<span class="fw-bold">\${index + 1}</span>\`;
    if (index === 0) posBadge = \`<span class="badge bg-warning rounded-circle" style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 14px;">1</span>\`;
    if (index === 1) posBadge = \`<span class="badge bg-secondary rounded-circle" style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 14px;">2</span>\`;
    if (index === 2) posBadge = \`<span class="badge bg-danger rounded-circle" style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 14px;">3</span>\`;
    
    tr.innerHTML = \`
      <td style="width: 60px;" class="text-center">\${posBadge}</td>
      <td style="width: 60px;">
        <img src="./assets/images/avatar/\${user.avatar}" alt="\${user.name}" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover;">
      </td>
      <td>
        <span class="\${user.isUser ? 'text-primary' : 'text-dark'}">\${user.name} \${user.isUser ? ' (Kamu)' : ''}</span>
      </td>
      <td class="text-end">
        <span class="fw-bold \${user.isUser ? 'text-success' : ''}">\${new Intl.NumberFormat('id-ID').format(user.xp)} XP</span>
      </td>
    \`;
    tbody.appendChild(tr);
  });
});
</script>
`;
fs.writeFileSync('docs/leaderboard.html', top + newMain + bottom);
