/**
 * Gamification Engine for FinStudent
 * Calculates XP retrospectively and manages XP popup notifications.
 */

const GamificationEngine = {
  // Constant multipliers
  XP_DISCIPLINE: 10,
  XP_SURVIVAL: 20,
  XP_HEALTH_STREAK: 100, // per 7 days healthy
  XP_ANTI_LEAK: 500, // per clean month

  calculateTotalXP: async function() {
    let xp = 0;
    let txs = [];
    try {
      txs = await ApiService.getTransactions();
    } catch (e) {
      console.error('Gamification fetch error', e);
      return 0;
    }

    if (!txs || txs.length === 0) return 0;

    const ob = typeof OnboardingData !== 'undefined' ? OnboardingData.get() : null;
    const obIncome = ob ? parseFloat(ob.income) || 0 : 0;
    const obFixed = ob ? parseFloat(ob.fixedExpense) || 0 : 0;
    const freq = ob ? ob.frequency : 'bulanan';

    // Group transactions by date
    const dailyTx = {};
    const monthlyTersier = {};
    const monthlyTotalPengeluaran = {};

    let disciplineCount = 0;

    txs.forEach(t => {
      // 1. Kedisiplinan Pencatatan (Daily Input)
      if (t.createdAt && t.date) {
        const dateInput = new Date(t.date).toDateString();
        const dateCreated = new Date(t.createdAt).toDateString();
        if (dateInput === dateCreated) {
          disciplineCount++;
          xp += this.XP_DISCIPLINE;
        }
      }

      // Grouping by Date
      const dateStr = new Date(t.date).toDateString();
      if (!dailyTx[dateStr]) dailyTx[dateStr] = { pengeluaran: 0 };
      
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'pengeluaran') {
        dailyTx[dateStr].pengeluaran += amt;
        
        // Grouping by Month for Health Status & Anti Leak
        const monthKey = new Date(t.date).getFullYear() + '-' + new Date(t.date).getMonth();
        if (!monthlyTersier[monthKey]) monthlyTersier[monthKey] = 0;
        if (!monthlyTotalPengeluaran[monthKey]) monthlyTotalPengeluaran[monthKey] = 0;
        
        monthlyTotalPengeluaran[monthKey] += amt;
        if (t.nature === 'keinginan') {
          monthlyTersier[monthKey] += amt;
        }
      }
    });

    // 2. EXP "Survival" (Sama Rata)
    const dailyLimit = freq === 'harian' ? obIncome : Math.max(0, obIncome - obFixed) / 30;
    
    Object.keys(dailyTx).forEach(date => {
      const spent = dailyTx[date].pengeluaran;
      if (spent <= dailyLimit && spent > 0) {
        xp += this.XP_SURVIVAL;
      } else if (spent === 0 && freq !== 'harian') {
         xp += this.XP_SURVIVAL;
      }
    });

    // 3. Health Status & Anti-Leak (Monthly Evaluation)
    Object.keys(monthlyTotalPengeluaran).forEach(m => {
      const total = monthlyTotalPengeluaran[m];
      const tersier = monthlyTersier[m];
      
      // Health Status
      if (total > 0) {
        const ratio = (tersier / total) * 100;
        if (ratio < 30) {
          // If the month was healthy overall, we simulate that they maintained a 4-week streak
          xp += (this.XP_HEALTH_STREAK * 4);
        }
      }

      // Anti-Leak
      if (total < obIncome) {
        xp += this.XP_ANTI_LEAK;
      }
    });

    return Math.floor(xp);
  },

  showXpPopup: function(xpGained, message) {
    let container = document.getElementById('xpPopupContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'xpPopupContainer';
      container.style.position = 'fixed';
      container.style.bottom = '20px';
      container.style.right = '20px';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '10px';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'xp-toast shadow-lg';
    toast.style.background = 'var(--bs-body-bg)';
    toast.style.border = '1px solid rgba(16, 185, 129, 0.3)';
    toast.style.borderRadius = '12px';
    toast.style.padding = '12px 16px';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '12px';
    toast.style.transform = 'translateX(120%)';
    toast.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';
    toast.style.opacity = '0';
    toast.style.minWidth = '280px';
    
    // Mochi happy gif
    const img = document.createElement('img');
    img.src = './assets/images/cat/mochihappy.gif';
    img.style.width = '48px';
    img.style.height = '48px';
    img.style.objectFit = 'contain';
    
    const textContainer = document.createElement('div');
    const title = document.createElement('div');
    title.innerHTML = `<strong class="text-success">+${xpGained} XP</strong>`;
    title.style.fontSize = '1.1rem';
    
    const desc = document.createElement('div');
    desc.textContent = message;
    desc.style.fontSize = '0.8rem';
    desc.style.color = 'var(--bs-secondary)';
    
    textContainer.appendChild(title);
    textContainer.appendChild(desc);
    
    toast.appendChild(img);
    toast.appendChild(textContainer);
    
    container.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
      setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
      }, 50);
    });
    
    // Remove after 3.5 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 3500);
  }
};
