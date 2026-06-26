document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements - UI
  const targetCardsContainer = document.getElementById('targetCardsContainer');
  const emptyStateContainer = document.getElementById('emptyStateContainer');
  
  // DOM Elements - Wizard
  const wizardModal = document.getElementById('wizardModal');
  const bsWizardModal = new bootstrap.Modal(wizardModal);
  const wizardProgress = document.getElementById('wizardProgress');
  const btnNextWizard = document.getElementById('btnNextWizard');
  const btnPrevWizard = document.getElementById('btnPrevWizard');
  
  // Wizard Inputs
  const inputName = document.getElementById('targetName');
  const inputAmount = document.getElementById('targetAmount');
  const inputDate = document.getElementById('targetDate');

  // DOM Elements - Detail Modal
  const detailModal = document.getElementById('targetDetailModal');
  const bsDetailModal = new bootstrap.Modal(detailModal);
  const detailActionAmount = document.getElementById('detailActionAmount');
  const detailActionDesc = document.getElementById('detailActionDesc');
  const btnSaveTransaction = document.getElementById('btnSaveTransaction');
  const btnDeleteTarget = document.getElementById('btnDeleteTarget');

  // State
  let currentStep = 1;
  let currentTargetId = null;
  let activeTabType = 'simpan';

  // Utils
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const parseCurrency = (val) => {
    return parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
  };

  // 1. Initial Render
  const renderTargets = async () => {
    const targets = await ApiService.getSavingTargets();
    const allSavings = await ApiService.getSavings();

    targetCardsContainer.innerHTML = '';
    
    if (targets.length === 0) {
      emptyStateContainer.classList.remove('d-none');
    } else {
      emptyStateContainer.classList.add('d-none');
      
      targets.forEach(target => {
        // Calculate progress
        const targetSavings = allSavings.filter(s => s.targetId === target.id);
        const totalSaved = targetSavings.reduce((acc, curr) => {
          return curr.type === 'simpan' ? acc + parseFloat(curr.amount) : acc - parseFloat(curr.amount);
        }, 0);
        
        let percentage = (totalSaved / parseFloat(target.targetAmount)) * 100;
        percentage = percentage > 100 ? 100 : percentage < 0 ? 0 : percentage;

        const card = document.createElement('div');
        card.className = 'col-12 col-md-6 col-xl-4';
        card.innerHTML = `
          <div class="card target-card h-100 rounded-4" data-id="${target.id}">
            <div class="card-body p-4 p-md-5">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <h4 class="fw-bold mb-0 text-truncate pe-3">${target.name}</h4>
                <div class="icon-shape icon-md rounded-circle bg-primary-subtle text-primary flex-shrink-0">
                  <i class="ti ti-target fs-5"></i>
                </div>
              </div>
              <div class="mb-4">
                <div class="text-muted small mb-1">Terkumpul</div>
                <div class="fs-3 fw-bolder text-primary">${formatCurrency(totalSaved)}</div>
                <div class="text-muted small">dari ${formatCurrency(target.targetAmount)}</div>
              </div>
              <div class="progress mb-2" style="height: 8px; border-radius: 4px;">
                <div class="progress-bar bg-primary" role="progressbar" style="width: ${percentage}%"></div>
              </div>
              <div class="d-flex justify-content-between text-muted small fw-semibold">
                <span>${percentage.toFixed(0)}%</span>
                <span><i class="ti ti-calendar me-1"></i>${new Date(target.targetDate).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}</span>
              </div>
            </div>
          </div>
        `;
        
        card.querySelector('.target-card').addEventListener('click', () => openTargetDetail(target.id));
        targetCardsContainer.appendChild(card);
      });
    }
  };

  // 2. Wizard Logic
  const updateWizardUI = () => {
    // Hide all steps
    for (let i = 1; i <= 4; i++) {
      document.getElementById('step' + i).classList.add('d-none');
      document.getElementById('step' + i).classList.remove('active');
    }
    
    // Show current step
    const currentEl = document.getElementById('step' + currentStep);
    currentEl.classList.remove('d-none');
    
    // Force reflow to restart animation
    void currentEl.offsetWidth; 
    currentEl.classList.add('active');

    // Update Progress Dots
    const dots = wizardProgress.querySelectorAll('.progress-dot');
    dots.forEach((dot, index) => {
      if (index < currentStep) dot.classList.add('active');
      else dot.classList.remove('active');
    });

    // Update Buttons
    if (currentStep === 1) {
      btnPrevWizard.textContent = 'Batal';
      btnPrevWizard.removeAttribute('data-bs-dismiss');
      btnPrevWizard.setAttribute('data-bs-dismiss', 'modal');
    } else if (currentStep < 4) {
      btnPrevWizard.textContent = 'Kembali';
      btnPrevWizard.removeAttribute('data-bs-dismiss');
    }

    if (currentStep < 4) {
      btnNextWizard.innerHTML = 'Lanjut <i class="ti ti-arrow-right ms-2"></i>';
      btnNextWizard.classList.remove('d-none');
      btnPrevWizard.classList.remove('d-none');
    } else {
      btnNextWizard.innerHTML = 'Lihat Target Saya <i class="ti ti-check ms-2"></i>';
      btnPrevWizard.classList.add('d-none');
      wizardProgress.classList.add('d-none');
    }
  };

  btnNextWizard.addEventListener('click', async () => {
    // Validation
    if (currentStep === 1) {
      if (!inputName.value.trim()) return alert('Nama target tidak boleh kosong!');
    } else if (currentStep === 2) {
      if (parseCurrency(inputAmount.value) <= 0) return alert('Total target harus lebih dari Rp 0!');
    } else if (currentStep === 3) {
      if (!inputDate.value) return alert('Pilih tanggal target selesai!');
      const selected = new Date(inputDate.value);
      if (selected <= new Date()) return alert('Tanggal harus di masa depan!');
      
      // Save Target
      await ApiService.addSavingTarget({
        name: inputName.value.trim(),
        targetAmount: parseCurrency(inputAmount.value),
        targetDate: inputDate.value
      });
      await renderTargets();
    } else if (currentStep === 4) {
      // Finish
      bsWizardModal.hide();
      return;
    }
    
    if (currentStep < 4) {
      currentStep++;
      updateWizardUI();
    }
  });

  btnPrevWizard.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateWizardUI();
    }
  });

  // Reset Wizard on hidden
  wizardModal.addEventListener('hidden.bs.modal', () => {
    currentStep = 1;
    inputName.value = '';
    inputAmount.value = '';
    inputDate.value = '';
    wizardProgress.classList.remove('d-none');
    updateWizardUI();
  });

  // Format Currency Input
  inputAmount.addEventListener('input', (e) => {
    let val = parseCurrency(e.target.value);
    e.target.value = val > 0 ? formatCurrency(val) : '';
  });

  detailActionAmount.addEventListener('input', (e) => {
    let val = parseCurrency(e.target.value);
    e.target.value = val > 0 ? formatCurrency(val) : '';
  });

  // 3. Detail Modal Logic
  const openTargetDetail = async (id) => {
    currentTargetId = id;
    const targets = await ApiService.getSavingTargets();
    const target = targets.find(t => t.id === id);
    if (!target) return;

    await refreshDetailData(target);
    
    // Reset Form
    detailActionAmount.value = '';
    detailActionDesc.value = '';
    activeTabType = 'simpan';
    document.getElementById('tab-simpan').click();

    bsDetailModal.show();
  };

  const refreshDetailData = async (target) => {
    document.getElementById('detailTargetName').textContent = target.name;
    document.getElementById('detailTargetDate').textContent = 'Deadline: ' + new Date(target.targetDate).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
    document.getElementById('detailTotalAmount').textContent = formatCurrency(target.targetAmount);

    const allSavings = await ApiService.getSavings();
    const targetSavings = allSavings.filter(s => s.targetId === target.id);
    
    const totalSaved = targetSavings.reduce((acc, curr) => {
      return curr.type === 'simpan' ? acc + parseFloat(curr.amount) : acc - parseFloat(curr.amount);
    }, 0);

    let percentage = (totalSaved / parseFloat(target.targetAmount)) * 100;
    percentage = percentage > 100 ? 100 : percentage < 0 ? 0 : percentage;

    document.getElementById('detailCurrentAmount').textContent = formatCurrency(totalSaved);
    document.getElementById('detailProgressBar').style.width = percentage + '%';
    document.getElementById('detailProgressText').textContent = percentage.toFixed(1) + '%';

    // Render Tx History
    const historyContainer = document.getElementById('targetTransactionHistory');
    historyContainer.innerHTML = '';
    
    if (targetSavings.length === 0) {
      historyContainer.innerHTML = '<div class="text-center text-muted small py-3">Belum ada transaksi</div>';
    } else {
      // Sort desc
      targetSavings.sort((a,b) => new Date(b.date) - new Date(a.date));
      targetSavings.forEach(tx => {
        const item = document.createElement('div');
        item.className = 'feed-item';
        const isSimpan = tx.type === 'simpan';
        const iconClass = isSimpan ? 'saving' : 'expense';
        const iconTi = isSimpan ? 'ti-trending-up' : 'ti-trending-down';
        const sign = isSimpan ? '+' : '-';
        
        item.innerHTML = `
          <div class="feed-icon ${iconClass}">
            <i class="ti ${iconTi}"></i>
          </div>
          <div class="feed-info">
            <div class="feed-desc">${tx.description || (isSimpan ? 'Menabung' : 'Penarikan')}</div>
            <div class="feed-meta">
              <span>${new Date(tx.date).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}</span>
            </div>
          </div>
          <div class="feed-amount ${iconClass}">${sign}${formatCurrency(tx.amount)}</div>
        `;
        historyContainer.appendChild(item);
      });
    }
  };

  // Tab action listener
  document.querySelectorAll('#detailActionPills .nav-link').forEach(tab => {
    tab.addEventListener('click', (e) => {
      activeTabType = e.target.dataset.type;
    });
  });

  // Save Transaction
  btnSaveTransaction.addEventListener('click', async () => {
    const amount = parseCurrency(detailActionAmount.value);
    if (amount <= 0) return alert('Masukkan nominal yang valid!');

    await ApiService.addSavingTransaction({
      targetId: currentTargetId,
      amount: amount,
      type: activeTabType,
      date: new Date().toISOString(),
      description: detailActionDesc.value.trim()
    });

    const targets = await ApiService.getSavingTargets();
    const target = targets.find(t => t.id === currentTargetId);
    
    detailActionAmount.value = '';
    detailActionDesc.value = '';
    
    await refreshDetailData(target);
    await renderTargets(); // update background cards
  });

  // Delete Target
  btnDeleteTarget.addEventListener('click', async () => {
    if (confirm('Yakin ingin menghapus target menabung ini? Uang yang sudah dicatat akan tetap ada di total tabungan global, tetapi target ini akan hilang.')) {
      await ApiService.deleteSavingTarget(currentTargetId);
      bsDetailModal.hide();
      await renderTargets();
    }
  });

  // Init
  renderTargets();
});
