const fs = require('fs');

const code = `document.addEventListener('DOMContentLoaded', async () => {
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
  let bsDetailModal = null; // initialized below
  const detailActionAmount = document.getElementById('detailActionAmount');
  const detailActionDate = document.getElementById('detailActionDate');
  const detailActionDesc = document.getElementById('detailActionDesc');
  const btnSaveTransaction = document.getElementById('btnSaveTransaction');
  
  // DOM Elements - Edit Target Modal
  const editTargetName = document.getElementById('editTargetName');
  const editTargetAmount = document.getElementById('editTargetAmount');
  const editTargetDate = document.getElementById('editTargetDate');
  const btnUpdateTarget = document.getElementById('btnUpdateTarget');
  const btnDeleteTarget = document.getElementById('btnDeleteTarget');

  // DOM Elements - Edit Transaction Modal
  const editTxDate = document.getElementById('editTxDate');
  const editTxAmount = document.getElementById('editTxAmount');
  const editTxDesc = document.getElementById('editTxDesc');
  const editTxId = document.getElementById('editTxId');
  const btnUpdateTx = document.getElementById('btnUpdateTx');
  const btnDeleteTx = document.getElementById('btnDeleteTx');

  // State
  let currentStep = 1;
  let currentTargetId = null;
  let activeTabType = 'simpan';
  let txPage = 1;
  const TX_PER_PAGE = 5;

  // Initialize Modals
  if (detailModal) {
    bsDetailModal = new bootstrap.Modal(detailModal);
  }
  const bsEditTargetModal = document.getElementById('editTargetModal') ? new bootstrap.Modal(document.getElementById('editTargetModal')) : null;
  const bsEditTxModal = document.getElementById('editTransactionModal') ? new bootstrap.Modal(document.getElementById('editTransactionModal')) : null;

  // Utils
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const parseCurrency = (val) => {
    return parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
  };
  
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if(isNaN(d)) return '';
    return d.toISOString().split('T')[0];
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
        card.innerHTML = \`
          <div class="card target-card h-100 rounded-4" data-id="\${target.id}">
            <div class="card-body p-4 p-md-5">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <h4 class="fw-bold mb-0 text-truncate pe-3">\${target.name}</h4>
                <div class="icon-shape icon-md rounded-circle bg-primary-subtle text-primary flex-shrink-0">
                  <i class="ti ti-target fs-5"></i>
                </div>
              </div>
              <div class="mb-4">
                <div class="text-muted small mb-1">Terkumpul</div>
                <div class="fs-3 fw-bolder text-primary">\${formatCurrency(totalSaved)}</div>
                <div class="text-muted small">dari \${formatCurrency(target.targetAmount)}</div>
              </div>
              <div class="progress mb-2" style="height: 8px; border-radius: 4px;">
                <div class="progress-bar bg-primary" role="progressbar" style="width: \${percentage}%"></div>
              </div>
              <div class="d-flex justify-content-between text-muted small fw-semibold">
                <span>\${percentage.toFixed(0)}%</span>
                <span><i class="ti ti-calendar me-1"></i>\${new Date(target.targetDate).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}</span>
              </div>
            </div>
          </div>
        \`;
        
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
    if (currentStep === 1) {
      if (!inputName.value.trim()) return await CustomAlert.alert('Nama target tidak boleh kosong!');
    } else if (currentStep === 2) {
      if (parseCurrency(inputAmount.value) <= 0) return await CustomAlert.alert('Total target harus lebih dari Rp 0!');
    } else if (currentStep === 3) {
      if (!inputDate.value) return await CustomAlert.alert('Pilih tanggal target selesai!');
      const selected = new Date(inputDate.value);
      const today = new Date();
      today.setHours(0,0,0,0);
      selected.setHours(0,0,0,0);
      if (isNaN(selected.getTime()) || selected < today) return await CustomAlert.alert('Tanggal tidak valid atau sudah lewat!');
      
      await ApiService.addSavingTarget({
        name: inputName.value.trim(),
        targetAmount: parseCurrency(inputAmount.value),
        targetDate: inputDate.value
      });
      await renderTargets();
    } else if (currentStep === 4) {
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

  wizardModal.addEventListener('hidden.bs.modal', () => {
    currentStep = 1;
    inputName.value = '';
    inputAmount.value = '';
    inputDate.value = '';
    wizardProgress.classList.remove('d-none');
    updateWizardUI();
  });

  // Currency Formatters
  const setupCurrencyInput = (el) => {
    if(!el) return;
    el.addEventListener('input', (e) => {
      let val = parseCurrency(e.target.value);
      e.target.value = val > 0 ? formatCurrency(val) : '';
    });
  };
  
  setupCurrencyInput(inputAmount);
  setupCurrencyInput(detailActionAmount);
  setupCurrencyInput(editTargetAmount);
  setupCurrencyInput(editTxAmount);

  // 3. Detail Modal Logic
  const openTargetDetail = async (id) => {
    currentTargetId = id;
    const targets = await ApiService.getSavingTargets();
    const target = targets.find(t => t.id === id);
    if (!target) return;

    // Reset Form
    detailActionAmount.value = '';
    detailActionDesc.value = '';
    detailActionDate.valueAsDate = new Date();
    activeTabType = 'simpan';
    document.getElementById('tab-simpan').click();

    txPage = 1;
    await refreshDetailData(target);
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
    
    let remaining = parseFloat(target.targetAmount) - totalSaved;
    let remainingText = formatCurrency(remaining);
    
    if(remaining <= 0) {
      document.getElementById('detailRemainingAmount').textContent = "Target Terlampaui \uD83C\uDF89";
      document.getElementById('detailRemainingAmount').className = "fs-4 fw-bolder text-success";
    } else {
      document.getElementById('detailRemainingAmount').textContent = remainingText;
      document.getElementById('detailRemainingAmount').className = "fs-4 fw-bolder text-warning";
    }

    document.getElementById('detailCurrentAmount').textContent = formatCurrency(totalSaved);
    document.getElementById('detailProgressBar').style.width = percentage + '%';
    document.getElementById('detailProgressText').textContent = percentage.toFixed(1) + '%';

    // Populate Edit Modal Data
    if(editTargetName) editTargetName.value = target.name;
    if(editTargetAmount) editTargetAmount.value = formatCurrency(target.targetAmount);
    if(editTargetDate) editTargetDate.value = formatDateForInput(target.targetDate);

    // Render Pagination
    renderTargetHistoryPagination(targetSavings);
  };

  const renderTargetHistoryPagination = (targetSavings) => {
    const historyContainer = document.getElementById('targetTransactionHistory');
    historyContainer.innerHTML = '';
    
    const btnPrevTx = document.getElementById('btnPrevTxPage');
    const btnNextTx = document.getElementById('btnNextTxPage');
    const txPageInfo = document.getElementById('targetTxPageInfo');

    if (targetSavings.length === 0) {
      historyContainer.innerHTML = '<div class="text-center text-muted small py-4">Belum ada transaksi</div>';
      txPageInfo.textContent = 'Menampilkan 0-0 dari 0';
      if(btnPrevTx) btnPrevTx.disabled = true;
      if(btnNextTx) btnNextTx.disabled = true;
      return;
    }
    
    // Sort desc
    targetSavings.sort((a,b) => new Date(b.date) - new Date(a.date));
    
    const totalPages = Math.ceil(targetSavings.length / TX_PER_PAGE);
    if (txPage > totalPages) txPage = totalPages;
    if (txPage < 1) txPage = 1;
    
    const startIndex = (txPage - 1) * TX_PER_PAGE;
    const endIndex = Math.min(startIndex + TX_PER_PAGE, targetSavings.length);
    const paginatedItems = targetSavings.slice(startIndex, endIndex);

    txPageInfo.textContent = \`Menampilkan \${startIndex + 1}-\${endIndex} dari \${targetSavings.length}\`;
    if(btnPrevTx) btnPrevTx.disabled = (txPage === 1);
    if(btnNextTx) btnNextTx.disabled = (txPage === totalPages);

    paginatedItems.forEach(tx => {
      const item = document.createElement('div');
      item.className = 'feed-item position-relative mb-2 pb-2 border-bottom hover-bg-light p-2 rounded-3 transition-all cursor-pointer';
      item.style.cursor = 'pointer';
      
      const isSimpan = tx.type === 'simpan';
      const iconClass = isSimpan ? 'saving' : 'expense';
      const iconTi = isSimpan ? 'ti-trending-up' : 'ti-trending-down';
      const sign = isSimpan ? '+' : '-';
      
      item.innerHTML = \`
        <div class="d-flex align-items-center w-100">
          <div class="feed-icon \${iconClass} me-3 flex-shrink-0" style="width:40px;height:40px;">
            <i class="ti \${iconTi} fs-5"></i>
          </div>
          <div class="feed-info flex-grow-1 min-w-0 pe-2">
            <div class="feed-desc fw-bold text-truncate">\${tx.description || (isSimpan ? 'Menabung' : 'Penarikan')}</div>
            <div class="feed-meta small text-muted">
              <span>\${new Date(tx.date).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}</span>
            </div>
          </div>
          <div class="feed-amount \${iconClass} fw-bolder flex-shrink-0">\${sign}\${formatCurrency(tx.amount)}</div>
        </div>
      \`;
      
      item.addEventListener('click', () => {
        openEditTxModal(tx);
      });
      historyContainer.appendChild(item);
    });
  };

  const openEditTxModal = (tx) => {
    editTxId.value = tx.id;
    editTxDate.value = formatDateForInput(tx.date);
    editTxAmount.value = formatCurrency(tx.amount);
    editTxDesc.value = tx.description || '';
    
    bsDetailModal.hide();
    bsEditTxModal.show();
  };

  if(document.getElementById('btnPrevTxPage')) {
    document.getElementById('btnPrevTxPage').addEventListener('click', async () => {
      txPage--;
      const targets = await ApiService.getSavingTargets();
      const target = targets.find(t => t.id === currentTargetId);
      await refreshDetailData(target);
    });
  }

  if(document.getElementById('btnNextTxPage')) {
    document.getElementById('btnNextTxPage').addEventListener('click', async () => {
      txPage++;
      const targets = await ApiService.getSavingTargets();
      const target = targets.find(t => t.id === currentTargetId);
      await refreshDetailData(target);
    });
  }

  // Tab action listener
  document.querySelectorAll('#detailActionPills .nav-link').forEach(tab => {
    tab.addEventListener('click', (e) => {
      activeTabType = e.target.dataset.type;
    });
  });

  // Save Transaction
  btnSaveTransaction.addEventListener('click', async () => {
    const amount = parseCurrency(detailActionAmount.value);
    const dateVal = detailActionDate.value;
    if (amount <= 0) return await CustomAlert.alert('Masukkan nominal yang valid!');
    if (!dateVal) return await CustomAlert.alert('Pilih tanggal transaksi!');

    const parsedDate = new Date(dateVal);
    parsedDate.setHours(new Date().getHours()); 
    parsedDate.setMinutes(new Date().getMinutes());

    await ApiService.addSavingTransaction({
      targetId: currentTargetId,
      amount: amount,
      type: activeTabType,
      date: parsedDate.toISOString(),
      description: detailActionDesc.value.trim()
    });

    const targets = await ApiService.getSavingTargets();
    const target = targets.find(t => t.id === currentTargetId);
    
    detailActionAmount.value = '';
    detailActionDesc.value = '';
    
    await refreshDetailData(target);
    await renderTargets(); // update background cards
  });

  // Update Target
  if (btnUpdateTarget) {
    btnUpdateTarget.addEventListener('click', async () => {
      const name = editTargetName.value.trim();
      const amount = parseCurrency(editTargetAmount.value);
      const dateVal = editTargetDate.value;
      
      if (!name) return await CustomAlert.alert('Nama target tidak boleh kosong!');
      if (amount <= 0) return await CustomAlert.alert('Total target harus lebih dari Rp 0!');
      if (!dateVal) return await CustomAlert.alert('Pilih tanggal target selesai!');

      await ApiService.updateSavingTarget(currentTargetId, {
        name: name,
        targetAmount: amount,
        targetDate: dateVal
      });

      bsEditTargetModal.hide();
      const targets = await ApiService.getSavingTargets();
      const target = targets.find(t => t.id === currentTargetId);
      await refreshDetailData(target);
      await renderTargets();
      bsDetailModal.show();
    });
  }

  // Delete Target
  if (btnDeleteTarget) {
    btnDeleteTarget.addEventListener('click', async () => {
      if ((await CustomAlert.confirm('Yakin ingin menghapus target menabung ini? Uang yang sudah dicatat akan tetap ada di total tabungan global.', 'Hapus Target', './assets/images/mochi-rm.png'))) {
        await ApiService.deleteSavingTarget(currentTargetId);
        bsEditTargetModal.hide();
        await renderTargets();
      }
    });
  }

  // Update Transaction
  if (btnUpdateTx) {
    btnUpdateTx.addEventListener('click', async () => {
      const id = editTxId.value;
      const amount = parseCurrency(editTxAmount.value);
      const dateVal = editTxDate.value;
      const desc = editTxDesc.value.trim();

      if (amount <= 0) return await CustomAlert.alert('Masukkan nominal yang valid!');
      if (!dateVal) return await CustomAlert.alert('Pilih tanggal transaksi!');
      
      const parsedDate = new Date(dateVal);

      await ApiService.updateSavingTransaction(id, {
        amount: amount,
        date: parsedDate.toISOString(),
        description: desc
      });

      bsEditTxModal.hide();
      const targets = await ApiService.getSavingTargets();
      const target = targets.find(t => t.id === currentTargetId);
      await refreshDetailData(target);
      await renderTargets();
      bsDetailModal.show();
    });
  }

  // Delete Transaction
  if (btnDeleteTx) {
    btnDeleteTx.addEventListener('click', async () => {
      const id = editTxId.value;
      if ((await CustomAlert.confirm('Yakin ingin menghapus riwayat tabungan ini?', 'Hapus Riwayat', './assets/images/mochi-rm.png'))) {
        await ApiService.deleteSavingTransaction(id);
        bsEditTxModal.hide();
        const targets = await ApiService.getSavingTargets();
        const target = targets.find(t => t.id === currentTargetId);
        await refreshDetailData(target);
        await renderTargets();
        bsDetailModal.show();
      }
    });
  }

  // Handle Cancel from Edit Modals back to Detail Modal
  document.querySelectorAll('[data-bs-target="#targetDetailModal"]').forEach(el => {
    el.addEventListener('click', async () => {
      const targets = await ApiService.getSavingTargets();
      const target = targets.find(t => t.id === currentTargetId);
      if(target) await refreshDetailData(target);
    });
  });

  // Init
  renderTargets();
});
`;

fs.writeFileSync('docs/assets/js/savings.js', code);
console.log('savings.js rewritten!');
