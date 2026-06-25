/**
 * FinStudent - Core Application Logic v2
 * Smart Form + Amortisasi + Dashboard Brain
 */

document.addEventListener('DOMContentLoaded', async () => {

  // ==========================================
  // GLOBAL HELPERS
  // ==========================================
  const formatRupiah = (number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });

  // ==========================================
  // MOBILE FEED RENDERER (shared across pages)
  // ==========================================
  const renderMobileFeed = (containerId, items, feedType, deleteCallback) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (!items || items.length === 0) {
      container.innerHTML = '<div class="text-center text-muted py-4">Belum ada data.</div>';
      return;
    }

    let lastDateStr = null;
    items.forEach(item => {
      const itemDate = formatDate(item.date);
      if (itemDate !== lastDateStr) {
        const header = document.createElement('div');
        header.className = 'feed-date-header';
        header.innerHTML = `<i class="ti ti-calendar-event me-1"></i> ${itemDate}`;
        container.appendChild(header);
        lastDateStr = itemDate;
      }

      const div = document.createElement('div');
      div.className = 'feed-item';

      let iconClass, iconType, desc, metaBadges, sign, amountClass, amount;

      if (feedType === 'saving') {
        iconClass = item.type === 'simpan' ? 'ti-piggy-bank' : 'ti-hand-grab';
        iconType = item.type === 'simpan' ? 'saving' : 'expense';
        desc = item.description || (item.type === 'simpan' ? 'Menabung' : 'Penarikan');
        const badgeClass = item.type === 'simpan' ? 'saving-in' : 'saving-out';
        const badgeLabel = item.type === 'simpan' ? 'Simpan' : 'Tarik';
        metaBadges = `<span class="meta-badge ${badgeClass}">${badgeLabel}</span>`;
        sign = item.type === 'simpan' ? '+' : '-';
        amountClass = item.type === 'simpan' ? 'saving' : 'expense';
        amount = parseFloat(item.amount);
      } else if (feedType === 'dashboard') {
        if (item.type === 'simpan' || item.type === 'tarik') {
          iconClass = 'ti-piggy-bank';
          iconType = 'saving';
          desc = item.description || 'Menabung';
          const badgeClass = item.type === 'simpan' ? 'saving-in' : 'saving-out';
          const badgeLabel = item.type === 'simpan' ? 'Tabungan Masuk' : 'Tabungan Keluar';
          metaBadges = `<span class="meta-badge ${badgeClass}">${badgeLabel}</span>`;
          sign = item.type === 'simpan' ? '+' : '-';
          amountClass = 'saving';
        } else {
          iconClass = typeof FinCategories !== 'undefined' ? FinCategories.getIcon(item.type === 'pengeluaran' ? item.nature : 'pemasukan', item.category) : 'ti-circle';
          iconType = item.type === 'pemasukan' ? 'income' : 'expense';
          desc = item.description || '-';
          const typeBadgeClass = item.type === 'pemasukan' ? 'income' : 'expense';
          const typeBadgeLabel = item.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';
          metaBadges = `<span class="meta-badge ${typeBadgeClass}">${typeBadgeLabel}</span>`;
          if (item.category) metaBadges += ` <span>${item.category}</span>`;
          if (item.nature === 'keinginan') metaBadges += ` <span class="meta-badge keinginan">Keinginan</span>`;
          sign = item.type === 'pemasukan' ? '+' : '-';
          amountClass = item.type === 'pemasukan' ? 'income' : 'expense';
        }
        amount = parseFloat(item.amount);
      } else {
        // transaction
        iconClass = typeof FinCategories !== 'undefined' ? FinCategories.getIcon(item.type === 'pengeluaran' ? item.nature : 'pemasukan', item.category) : 'ti-circle';
        iconType = item.type === 'pemasukan' ? 'income' : 'expense';
        desc = item.description || '-';
        const typeBadgeClass = item.type === 'pemasukan' ? 'income' : 'expense';
        const typeBadgeLabel = item.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';
        metaBadges = `<span class="meta-badge ${typeBadgeClass}">${typeBadgeLabel}</span>`;
        if (item.category) metaBadges += ` <span>${item.category}</span>`;
        if (item.nature === 'keinginan') metaBadges += ` <span class="meta-badge keinginan">Keinginan</span>`;
        if (item.is_periodic && item.amortization_days > 1) metaBadges += ` <span class="meta-badge" style="background:rgba(6,182,212,0.1);color:#0891b2;">÷${item.amortization_days}h</span>`;
        sign = item.type === 'pemasukan' ? '+' : '-';
        amountClass = item.type === 'pemasukan' ? 'income' : 'expense';
        amount = parseFloat(item.amount);
      }

      const deleteBtn = deleteCallback ? `<button class="feed-delete" data-id="${item.id}"><i class="ti ti-trash"></i></button>` : '';

      div.innerHTML = `
        <div class="feed-icon ${iconType}"><i class="ti ${iconClass}"></i></div>
        <div class="feed-info">
          <div class="feed-desc">${desc}</div>
          <div class="feed-meta">${metaBadges}</div>
        </div>
        <div class="feed-amount ${amountClass}">${sign}${formatRupiah(amount)}</div>
        ${deleteBtn}
      `;

      if (deleteCallback) {
        const delBtn = div.querySelector('.feed-delete');
        if (delBtn) {
          delBtn.addEventListener('click', () => deleteCallback(item.id));
        }
      }

      container.appendChild(div);
    });
  };

  // ==========================================
  // ROUTER / MIDDLEWARE
  // ==========================================
  let routerSetupData = null;
  let routerTransactions = [];
  try {
    routerSetupData = await ApiService.getSetupData();
    routerTransactions = await ApiService.getTransactions();
    const currentPath = window.location.pathname.toLowerCase();

    const isSetupPage = currentPath.includes('setup.html');
    const isTransactionsPage = currentPath.includes('transactions.html');

    if (!routerSetupData) {
      if (!isSetupPage) { window.location.href = 'setup.html'; return; }
    } else {
      const hasExpense = routerTransactions.some(tx => tx.type === 'pengeluaran');
      if (!hasExpense) {
        if (isTransactionsPage) {
          const alertBox = document.getElementById('onboardingAlert');
          if (alertBox) alertBox.style.display = 'block';
        } else if (!isSetupPage) {
          window.location.href = 'transactions.html';
          return;
        }
      }
    }
  } catch (error) {
    console.error("Router error:", error);
  }


  // ==========================================
  // PAGE: SETUP
  // ==========================================
  const setupForm = document.getElementById('setupForm');
  if (setupForm) {
    const submitBtn = document.getElementById('submitBtn');
    const settingsCard = document.getElementById('currentSettingsCard');
    let isUpdate = false;

    try {
      const existingData = await ApiService.getSetupData();
      if (existingData && existingData.balance !== undefined) {
        isUpdate = true;
        document.getElementById('balance').value = existingData.balance;
        document.getElementById('nextPayday').value = existingData.nextPayday;
        if (settingsCard) {
          settingsCard.style.display = 'block';
          const balDisplay = document.getElementById('currentBalanceDisplay');
          const payDisplay = document.getElementById('currentPaydayDisplay');
          if (balDisplay) balDisplay.textContent = formatRupiah(existingData.balance);
          if (payDisplay) payDisplay.textContent = formatDate(existingData.nextPayday);
        }
        submitBtn.textContent = 'Update Pengaturan';
        submitBtn.classList.remove('btn-primary');
        submitBtn.classList.add('btn-warning');
      }
    } catch (err) { console.error("Setup load error:", err); }

    setupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!setupForm.checkValidity()) { e.stopPropagation(); setupForm.classList.add('was-validated'); return; }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Menyimpan...';

      const payload = {
        balance: parseFloat(document.getElementById('balance').value),
        nextPayday: document.getElementById('nextPayday').value
      };

      try {
        await ApiService.saveSetupData(payload);
        if (isUpdate) {
          alert('Pengaturan berhasil diperbarui!');
          window.location.href = 'index.html';
        } else {
          const txs = await ApiService.getTransactions();
          window.location.href = txs.some(tx => tx.type === 'pengeluaran') ? 'index.html' : 'transactions.html';
        }
      } catch (error) {
        alert('Gagal menyimpan pengaturan');
        submitBtn.disabled = false;
        submitBtn.textContent = isUpdate ? 'Update Pengaturan' : 'Simpan & Mulai';
      }
    });
  }

  // ==========================================
  // PAGE: TRANSACTIONS (Smart Form v2)
  // ==========================================
  const transactionForm = document.getElementById('transactionForm');
  if (transactionForm) {
    const tableBody = document.getElementById('tableBody');
    const typeInput = document.getElementById('type');
    const typeSelectWrapper = document.getElementById('typeSelectWrapper');
    const categorySelect = document.getElementById('category');
    const natureGroup = document.getElementById('natureGroup');
    const natureInput = document.getElementById('nature');
    const natureSelectWrapper = document.getElementById('natureSelectWrapper');
    const amortGroup = document.getElementById('amortizationGroup');
    const amortDaysInput = document.getElementById('amortizationDays');
    const amortPreview = document.getElementById('amortizationPreview');
    const amountDisplay = document.getElementById('amountDisplay');
    const amountHidden = document.getElementById('amount');

    // --- Helper: Populate Categories ---
    const populateCategories = () => {
      const type = typeInput.value;
      const nature = natureInput.value;
      let options = [];

      if (type === 'pemasukan') {
        options = FinCategories.pemasukan;
      } else {
        options = FinCategories[nature] || FinCategories.kebutuhan;
      }

      categorySelect.innerHTML = '';
      options.forEach(opt => {
        const el = document.createElement('option');
        el.value = opt.value;
        el.textContent = opt.label;
        if (opt.isPeriodic) el.dataset.periodic = 'true';
        categorySelect.appendChild(el);
      });
      checkAmortization();
    };

    // --- Helper: Toggle Nature visibility ---
    const toggleNatureVisibility = () => {
      if (typeInput.value === 'pengeluaran') {
        natureGroup.style.display = 'block';
      } else {
        natureGroup.style.display = 'none';
        amortGroup.style.display = 'none';
      }
      populateCategories();
    };

    // --- Helper: Check if current category is periodic ---
    const checkAmortization = () => {
      const selected = categorySelect.options[categorySelect.selectedIndex];
      if (selected && selected.dataset.periodic === 'true' && typeInput.value === 'pengeluaran') {
        amortGroup.style.display = 'block';
      } else {
        amortGroup.style.display = 'none';
        amortDaysInput.value = 1;
      }
      updateAmortPreview();
    };

    // --- Helper: Preview amortization ---
    const updateAmortPreview = () => {
      const amount = parseFloat(amountHidden.value) || 0;
      const days = parseInt(amortDaysInput.value) || 1;
      if (amount > 0 && days > 1 && amortGroup.style.display !== 'none') {
        amortPreview.textContent = `≈ ${formatRupiah(amount / days)}/hari selama ${days} hari`;
      } else {
        amortPreview.textContent = '';
      }
    };

    // --- Event Listeners ---
    // Type dropdown change
    typeInput.addEventListener('change', () => {
      const val = typeInput.value;
      if (typeSelectWrapper) {
        typeSelectWrapper.className = 'custom-styled-select ' + (val === 'pengeluaran' ? 'select-expense' : 'select-income');
      }
      toggleNatureVisibility();
      populateCategories();
    });

    // Nature dropdown change
    natureInput.addEventListener('change', () => {
      const val = natureInput.value;
      if (natureSelectWrapper) {
        natureSelectWrapper.className = 'custom-styled-select ' + (val === 'kebutuhan' ? 'select-kebutuhan' : 'select-keinginan');
      }
      populateCategories();
    });

    categorySelect.addEventListener('change', checkAmortization);
    amortDaysInput.addEventListener('input', updateAmortPreview);
    
    if (amountDisplay) {
      amountDisplay.addEventListener('input', (e) => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if(val) {
          amountHidden.value = val;
          e.target.value = formatRupiah(parseInt(val)).replace('Rp', '').trim();
        } else {
          amountHidden.value = '';
          e.target.value = '';
        }
        updateAmortPreview();
      });
    }

    // Init date and categories
    if (document.getElementById('date')) document.getElementById('date').valueAsDate = new Date();
    toggleNatureVisibility();

        // --- Load & Render Transactions ---
    const loadTransactions = async () => {
      try {
        const transactions = await ApiService.getTransactions();
        tableBody.innerHTML = '';
        if (transactions.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Belum ada transaksi.</td></tr>';
          return;
        }

        let lastDateStr = null;

        transactions.forEach(tx => {
          const itemDateStr = formatDate(tx.date);
          if (itemDateStr !== lastDateStr) {
            const separatorTr = document.createElement('tr');
            separatorTr.className = 'tr-separator d-md-none'; // Sembunyikan pemisah khusus mobile ini di desktop, atau tampilkan saja
            separatorTr.innerHTML = `
              <td colspan="6" class="bg-light fw-bold text-secondary py-2 border-bottom-0">
                <i class="ti ti-calendar-event me-2"></i>${itemDateStr}
              </td>
            `;
            tableBody.appendChild(separatorTr);
            lastDateStr = itemDateStr;
          }

          const tr = document.createElement('tr');
          let typeBadge, natureTag = '';
          if (tx.type === 'pemasukan') {
            typeBadge = '<span class="badge text-success-emphasis bg-success-subtle">Pemasukan</span>';
          } else {
            typeBadge = '<span class="badge text-danger-emphasis bg-danger-subtle">Pengeluaran</span>';
            if (tx.nature === 'keinginan') {
              natureTag = ' <span class="badge text-warning-emphasis bg-warning-subtle">Keinginan</span>';
            }
          }

          const amortTag = tx.is_periodic && tx.amortization_days > 1
            ? ` <span class="badge text-info-emphasis bg-info-subtle" title="Diamortisasi ${tx.amortization_days} hari">÷${tx.amortization_days}h</span>`
            : '';

          const amountColor = tx.type === 'pemasukan' ? 'text-success' : 'text-body';
          const sign = tx.type === 'pemasukan' ? '+' : '-';

          const iconClass = typeof FinCategories !== 'undefined' ? FinCategories.getIcon(tx.type === 'pengeluaran' ? tx.nature : 'pemasukan', tx.category) : 'ti-circle';
          
          tr.innerHTML = `
            <td><span class="d-none d-md-inline">${formatDate(tx.date)}</span></td>
            <td><strong>${tx.description || '-'}</strong></td>
            <td><i class="ti ${iconClass} text-primary me-1"></i>${tx.category}${natureTag}${amortTag}</td>
            <td>${typeBadge}</td>
            <td class="${amountColor} fw-semibold">${sign}${formatRupiah(tx.amount)}</td>
            <td><button class="btn btn-outline-danger btn-sm rounded-circle px-2 py-1 delete-btn" data-id="${tx.id}"><i class="ti ti-trash"></i></button></td>
          `;
          tableBody.appendChild(tr);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            if (confirm('Hapus transaksi ini?')) {
              await ApiService.deleteTransaction(e.target.dataset.id);
              loadTransactions();
            }
          });
        });

        // Render mobile feed
        renderMobileFeed('txMobileFeed', transactions, 'transaction', async (id) => {
          if (confirm('Hapus transaksi ini?')) {
            await ApiService.deleteTransaction(id);
            loadTransactions();
          }
        });
      } catch (err) {
        console.error("Load transactions error:", err);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Gagal memuat data.</td></tr>';
      }
    };

    // --- Form Submit ---
    transactionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!transactionForm.checkValidity()) { e.stopPropagation(); transactionForm.classList.add('was-validated'); return; }

      const saveBtn = document.getElementById('saveBtn');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Menyimpan...';

      const type = typeInput.value;
      const nature = type === 'pengeluaran' ? natureInput.value : null;
      const selectedCat = categorySelect.options[categorySelect.selectedIndex];
      const isPeriodic = selectedCat && selectedCat.dataset.periodic === 'true' && type === 'pengeluaran';
      const amortDays = isPeriodic ? Math.max(1, parseInt(amortDaysInput.value) || 1) : 1;

      const transaction = {
        date: document.getElementById('date').value,
        type: type,
        nature: nature,
        amount: parseFloat(amountHidden.value),
        category: categorySelect.value,
        description: document.getElementById('description').value,
        is_periodic: isPeriodic,
        amortization_days: amortDays
      };

      try {
        await ApiService.addTransaction(transaction);
        transactionForm.reset();
        amountDisplay.value = '';
        amountHidden.value = '';
        transactionForm.classList.remove('was-validated');
        
        // Reset dropdowns
        typeInput.value = 'pengeluaran';
        if (typeSelectWrapper) typeSelectWrapper.className = 'custom-styled-select select-expense';
        natureInput.value = 'kebutuhan';
        if (natureSelectWrapper) natureSelectWrapper.className = 'custom-styled-select select-kebutuhan';
        toggleNatureVisibility();
        document.getElementById('date').valueAsDate = new Date();

        // Onboarding redirect
        const allTxs = await ApiService.getTransactions();
        if (allTxs.some(tx => tx.type === 'pengeluaran')) {
          const alertBox = document.getElementById('onboardingAlert');
          if (alertBox && alertBox.style.display === 'block') {
            alert('Mantap! Dashboard kamu sekarang sudah aktif. Yuk lihat!');
            window.location.href = 'index.html';
            return;
          }
        }
        
        // Character Alert Logic (50/30/20 Rule)
        if (transaction.nature === 'keinginan') {
          const setup = await ApiService.getSetupData();
          let totalPendapatanBulanIni = parseFloat(setup.balance) || 0;
          let totalKeinginanBulanIni = 0;
          
          const today = new Date();
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
          
          allTxs.forEach(t => {
            const tDate = new Date(t.date).getTime();
            if (tDate >= firstDayOfMonth) {
              const amt = parseFloat(t.amount) || 0;
              if (t.type === 'pemasukan') totalPendapatanBulanIni += amt;
              if (t.type === 'pengeluaran' && t.nature === 'keinginan') totalKeinginanBulanIni += amt;
            }
          });
          
          if (totalPendapatanBulanIni > 0) {
            const percentage = (totalKeinginanBulanIni / totalPendapatanBulanIni) * 100;
            const alertBox = document.getElementById('characterAlert');
            const alertImg = document.getElementById('characterAlertImg');
            const alertText = document.getElementById('characterAlertText');
            
            if (alertBox && alertImg && alertText) {
              let show = false;
              if (percentage > 50) {
                alertImg.src = 'assets/images/cat/passed_out.gif';
                alertText.textContent = 'Ya sudah, aku menyerah.';
                show = true;
              } else if (percentage > 40) {
                alertImg.src = 'assets/images/cat/sad.gif';
                alertText.textContent = 'Oh.. kamu mengabaikan rencana kita lagi?';
                show = true;
              } else if (percentage > 30) {
                alertImg.src = 'assets/images/cat/angry.gif';
                alertText.textContent = 'Masih mau jajan lagi? Rrrawwww!';
                show = true;
              } else if (percentage > 25) {
                alertImg.src = 'assets/images/cat/confused.gif';
                alertText.textContent = 'hmm, kamu jajan terus ya.. hmm';
                show = true;
              }
              
              if (show) {
                alertBox.style.display = 'block';
                setTimeout(() => { alertBox.style.display = 'none'; }, 5000);
              }
            }
          }
        }

        loadTransactions();
      } catch (err) {
        console.error("Save transaction error:", err);
        alert('Gagal menyimpan transaksi');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Simpan Transaksi';
      }
    });

    loadTransactions();
  }

  // ==========================================
  // PAGE: SAVINGS (LEDGER)
  // ==========================================
  const savingsForm = document.getElementById('savingsForm');
  if (savingsForm) {
    const savingsTableBody = document.getElementById('savingsTableBody');
    const savingDateInput = document.getElementById('saving_date');
    const savingTypeInput = document.getElementById('saving_type');
    const savingTypePills = document.getElementById('savingTypePills');
    const savingAmountDisplay = document.getElementById('savingAmountDisplay');
    const savingAmountHidden = document.getElementById('saving_amount');
    const savingDescInput = document.getElementById('saving_desc');

    // Setup Toggle Pills
    if (savingTypePills) {
      savingTypePills.querySelectorAll('[data-type]').forEach(btn => {
        btn.addEventListener('click', () => {
          savingTypePills.querySelectorAll('.nav-link').forEach(b => {
            b.classList.remove('active', 'text-success', 'text-danger');
            b.style.backgroundColor = '';
            b.classList.add('text-muted');
          });
          btn.classList.add('active');
          btn.classList.remove('text-muted');
          const t = btn.dataset.type;
          if (t === 'simpan') {
            btn.classList.add('text-success');
            btn.style.backgroundColor = 'rgba(16,185,129,0.15)';
          } else {
            btn.classList.add('text-danger');
            btn.style.backgroundColor = 'rgba(220,53,69,0.15)';
          }
          savingTypeInput.value = t;
        });
      });
    }

    // Auto format Nominal
    if (savingAmountDisplay) {
      savingAmountDisplay.addEventListener('input', (e) => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if(val) {
          savingAmountHidden.value = val;
          e.target.value = formatRupiah(parseInt(val)).replace('Rp', '').trim();
        } else {
          savingAmountHidden.value = '';
          e.target.value = '';
        }
      });
    }

    // Set default date
    if (savingDateInput) savingDateInput.valueAsDate = new Date();

    const loadSavings = async () => {
      try {
        const savings = await ApiService.getSavings();
        savingsTableBody.innerHTML = '';
        if (savings.length === 0) {
          savingsTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Belum ada riwayat tabungan.</td></tr>';
          return;
        }

        let lastDateStr = null;

        savings.forEach(saving => {
          const itemDateStr = formatDate(saving.date);
          if (itemDateStr !== lastDateStr) {
            const separatorTr = document.createElement('tr');
            separatorTr.className = 'tr-separator d-md-none';
            separatorTr.innerHTML = `
              <td colspan="5" class="bg-light fw-bold text-secondary py-2 border-bottom-0">
                <i class="ti ti-calendar-event me-2"></i>${itemDateStr}
              </td>
            `;
            savingsTableBody.appendChild(separatorTr);
            lastDateStr = itemDateStr;
          }

          const tr = document.createElement('tr');
          const amount = parseFloat(saving.amount);

          let typeBadge = saving.type === 'simpan'
            ? '<span class="badge bg-success-subtle text-success-emphasis">Simpan (Nabung)</span>'
            : '<span class="badge bg-danger-subtle text-danger-emphasis">Tarik</span>';

          const sign = saving.type === 'simpan' ? '+' : '-';
          const amountColor = saving.type === 'simpan' ? 'text-success' : 'text-danger';

          tr.innerHTML = `
            <td><span class="d-none d-md-inline">${formatDate(saving.date)}</span></td>
            <td>${typeBadge}</td>
            <td><strong>${saving.description || '-'}</strong></td>
            <td class="${amountColor} fw-semibold">${sign}${formatRupiah(amount)}</td>
            <td>
              <button class="btn btn-outline-danger btn-sm rounded-circle px-2 py-1 delete-saving-btn" data-id="${saving.id}"><i class="ti ti-trash"></i></button>
            </td>
          `;
          savingsTableBody.appendChild(tr);
        });

        // Event listeners for buttons
        document.querySelectorAll('.delete-saving-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.dataset.id;
            if (confirm('Hapus riwayat tabungan ini?')) {
              await ApiService.deleteSavingTransaction(id);
              loadSavings();
            }
          });
        });

        // Render mobile feed
        renderMobileFeed('savingsMobileFeed', savings, 'saving', async (id) => {
          if (confirm('Hapus riwayat tabungan ini?')) {
            await ApiService.deleteSavingTransaction(id);
            loadSavings();
          }
        });

      } catch (err) {
        console.error("Load savings error:", err);
        savingsTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Gagal memuat data.</td></tr>';
      }
    };

    savingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!savingsForm.checkValidity()) { e.stopPropagation(); savingsForm.classList.add('was-validated'); return; }

      const saveBtn = document.getElementById('saveBtn');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Menyimpan...';

      const type = savingTypeInput.value;

      const savingPayload = {
        date: savingDateInput.value,
        type: type,
        amount: parseFloat(savingAmountHidden.value) || 0,
        description: savingDescInput.value
      };

      try {
        await ApiService.addSavingTransaction(savingPayload);

        // Reset form
        savingAmountDisplay.value = '';
        savingAmountHidden.value = '';
        savingDescInput.value = '';
        savingsForm.classList.remove('was-validated');

        // Reset type pills
        savingTypeInput.value = 'simpan';
        if (savingTypePills) {
          savingTypePills.querySelectorAll('.nav-link').forEach(b => {
            b.classList.remove('active', 'text-success', 'text-danger');
            b.style.backgroundColor = '';
            b.classList.add('text-muted');
          });
          const simpanBtn = savingTypePills.querySelector('[data-type="simpan"]');
          if(simpanBtn) {
            simpanBtn.classList.add('active', 'text-success');
            simpanBtn.classList.remove('text-muted');
            simpanBtn.style.backgroundColor = 'rgba(16,185,129,0.15)';
          }
        }

        // Show Cat Toast if Simpan
        if (type === 'simpan') {
          const toast = document.getElementById('catToast');
          if (toast) {
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 8000);
          }
        }

        loadSavings();
      } catch (err) {
        console.error("Save savings error:", err);
        alert('Gagal menyimpan transaksi tabungan');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Simpan Transaksi';
      }
    });

    loadSavings();
  }

  // ==========================================
  // PAGE: DASHBOARD — The Core Brain
  // ==========================================
  const currentBalanceEl = document.getElementById('currentBalance');
  if (currentBalanceEl) {
    try {
      const setupData = await ApiService.getSetupData();
      if (setupData && setupData.balance !== undefined && setupData.nextPayday) {
        const transactions = await ApiService.getTransactions();
        const savingsData = await ApiService.getSavings();

        const initialBalance = parseFloat(setupData.balance);
        const nextPayday = new Date(setupData.nextPayday);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const payDayNorm = new Date(nextPayday);
        payDayNorm.setHours(0, 0, 0, 0);

        // ---- PHASE 1: Aggregate data ----
        let totalExpense = 0;
        let totalIncome = 0;
        let totalKebutuhan = 0;
        let totalKeinginan = 0;
        let keinginanByCategory = {};
        let allExpenseCategories = {};

        // For amortized daily average calculation
        let amortizedDailyContributions = [];

        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        transactions.forEach(tx => {
          const amount = parseFloat(tx.amount);
          const txDate = new Date(tx.date);

          if (tx.type === 'pengeluaran') {
            totalExpense += amount;

            // Track by nature
            if (tx.nature === 'keinginan') {
              totalKeinginan += amount;
              if (txDate >= thirtyDaysAgo) {
                if (!keinginanByCategory[tx.category]) keinginanByCategory[tx.category] = 0;
                keinginanByCategory[tx.category] += amount;
              }
            } else {
              totalKebutuhan += amount;
            }

            // Track all categories for pie chart
            if (!allExpenseCategories[tx.category]) allExpenseCategories[tx.category] = { amount: 0, nature: tx.nature || 'kebutuhan' };
            allExpenseCategories[tx.category].amount += amount;

            // Amortized daily: for periodic expenses, spread across days
            const amortDays = (tx.is_periodic && tx.amortization_days > 1) ? tx.amortization_days : 1;
            const dailyAmount = amount / amortDays;
            amortizedDailyContributions.push({ dailyAmount, date: txDate, amortDays });

          } else if (tx.type === 'pemasukan') {
            totalIncome += amount;
          }
        });

        let totalSavings = 0;
        savingsData.forEach(s => {
          const amount = parseFloat(s.amount) || 0;
          if (s.type === 'simpan') {
            totalSavings += amount;
          } else if (s.type === 'tarik') {
            totalSavings -= amount;
          }
        });

        const totalSavingsDisplay = document.getElementById('totalSavingsDisplay');
        if (totalSavingsDisplay) {
          totalSavingsDisplay.innerText = formatRupiah(totalSavings);
        }

        const currentBalance = initialBalance + totalIncome - totalExpense;
        const activeBalance = currentBalance - totalSavings;
        currentBalanceEl.innerText = formatRupiah(activeBalance);

        // ==========================================
        // PHASE 3: Filtered Dashboard (Charts & Tables)
        // ==========================================
        const renderFilteredDashboard = (selectedYYYYMM) => {
          let filteredTransactions = [];
          let filteredSavings = [];

          if (selectedYYYYMM) {
            const [y, m] = selectedYYYYMM.split('-');
            filteredTransactions = transactions.filter(tx => {
              const d = new Date(tx.date);
              return d.getFullYear() == parseInt(y) && (d.getMonth() + 1) == parseInt(m);
            });
            filteredSavings = savingsData.filter(s => {
              const d = new Date(s.date);
              return d.getFullYear() == parseInt(y) && (d.getMonth() + 1) == parseInt(m);
            });
          } else {
            filteredTransactions = transactions;
            filteredSavings = savingsData;
          }

          let fTotalExpense = 0;
          let fTotalIncome = 0;
          let fTotalKebutuhan = 0;
          let fTotalKeinginan = 0;
          let fAllExpenseCategories = {};

          filteredTransactions.forEach(tx => {
            const amount = parseFloat(tx.amount);
            if (tx.type === 'pengeluaran') {
              fTotalExpense += amount;
              if (tx.nature === 'keinginan') fTotalKeinginan += amount;
              else fTotalKebutuhan += amount;

              if (!fAllExpenseCategories[tx.category]) fAllExpenseCategories[tx.category] = { amount: 0, nature: tx.nature || 'kebutuhan' };
              fAllExpenseCategories[tx.category].amount += amount;
            } else if (tx.type === 'pemasukan') {
              fTotalIncome += amount;
            }
          });

          let fTotalSavings = 0;
          let fTotalTabunganBulanIni = 0;
          filteredSavings.forEach(s => {
            const amount = parseFloat(s.amount) || 0;
            if (s.type === 'simpan') {
              fTotalSavings += amount;
              fTotalTabunganBulanIni += amount;
            } else if (s.type === 'tarik') {
              fTotalSavings -= amount;
              fTotalTabunganBulanIni -= amount;
            }
          });

          // ---- Summary Tabs ----
          const summaryIncomeEl = document.getElementById('summaryIncome');
          const summaryExpenseEl = document.getElementById('summaryExpense');
          const summarySavingsEl = document.getElementById('summarySavings');
          if (summaryIncomeEl) summaryIncomeEl.innerText = formatRupiah(fTotalIncome);
          if (summaryExpenseEl) summaryExpenseEl.innerText = formatRupiah(fTotalExpense);
          if (summarySavingsEl) summarySavingsEl.innerText = formatRupiah(fTotalTabunganBulanIni);

          // ---- Donut Chart ----
          const catTableBody = document.getElementById('categoryBreakdownTable');
          const catChartEl = document.getElementById('categoryBreakdownChart');
          if (catChartEl && typeof ApexCharts !== 'undefined') {
            if (window.donutChartInstance) {
              window.donutChartInstance.destroy();
              window.donutChartInstance = null;
            }
            catChartEl.innerHTML = '';
            const totalChartAmount = fTotalExpense + fTotalTabunganBulanIni;
            if (totalChartAmount > 0) {
              window.donutChartInstance = new ApexCharts(catChartEl, {
                series: [fTotalKebutuhan, fTotalKeinginan, fTotalTabunganBulanIni],
                labels: ['Kebutuhan', 'Keinginan', 'Tabungan'],
                chart: { type: 'donut', height: 200 },
                colors: ['#624bff', '#f59e0b', '#10b981'],
                legend: { show: false },
                dataLabels: { enabled: false },
                plotOptions: {
                  pie: {
                    donut: {
                      size: '70%',
                      labels: {
                        show: true,
                        total: { 
                          show: true, 
                          label: 'Total', 
                          color: 'var(--ds-heading-color)',
                          formatter: () => formatRupiah(totalChartAmount) 
                        }
                      }
                    }
                  }
                }
              });
              window.donutChartInstance.render();
            } else {
              catChartEl.innerHTML = '<div class="text-center text-muted py-4">Belum ada data untuk grafik.</div>';
            }
          }

          // ---- Breakdown Table ----
          if (catTableBody) {
            const entries = Object.entries(fAllExpenseCategories).sort((a, b) => b[1].amount - a[1].amount);
            catTableBody.innerHTML = '';
            const totalChartAmount = fTotalExpense + fTotalTabunganBulanIni;

            if (fTotalTabunganBulanIni > 0) {
              const pct = totalChartAmount > 0 ? ((fTotalTabunganBulanIni / totalChartAmount) * 100).toFixed(1) : 0;
              const tr = document.createElement('tr');
              tr.innerHTML = `
                <td>
                  <div class="d-flex align-items-center">
                    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#10b981;" class="me-2"></span>
                    <span>Tabungan</span>
                  </div>
                </td>
                <td class="d-flex justify-content-end gap-2">
                  <span>${formatRupiah(fTotalTabunganBulanIni)}</span>
                  <span class="text-secondary">${pct}%</span>
                </td>
              `;
              catTableBody.appendChild(tr);
            }

            if (entries.length > 0) {
              entries.forEach(([cat, info]) => {
                const pct = totalChartAmount > 0 ? ((info.amount / totalChartAmount) * 100).toFixed(1) : 0;
                const color = info.nature === 'keinginan' ? '#f59e0b' : '#624bff';
                const iconClass = typeof FinCategories !== 'undefined' ? FinCategories.getIcon(info.nature, cat) : 'ti-circle';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                  <td>
                    <div class="d-flex align-items-center">
                      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};" class="me-2"></span>
                      <i class="ti ${iconClass} text-secondary me-2"></i>
                      <span>${cat}</span>
                    </div>
                  </td>
                  <td class="d-flex justify-content-end gap-2">
                    <span>${formatRupiah(info.amount)}</span>
                    <span class="text-secondary fw-bold" style="min-width: 45px; text-align: right;">${pct}%</span>
                  </td>
                `;
                catTableBody.appendChild(tr);
              });
            }
          }

          // ---- Transaction Table ----
          const dashboardTransactionTableBody = document.getElementById('dashboardTransactionTableBody');
          if (dashboardTransactionTableBody) {
            dashboardTransactionTableBody.innerHTML = '';
            const allFiltered = [...filteredTransactions, ...filteredSavings].sort((a,b) => new Date(b.date) - new Date(a.date));
            if (allFiltered.length === 0) {
              dashboardTransactionTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Belum ada transaksi di bulan ini.</td></tr>';
            } else {
              let lastDateStr = null;

              allFiltered.forEach(item => {
                const tr = document.createElement('tr');
                let typeBadge, sign, amountColor, iconClass, categoryText, descText;
                
                const itemDateStr = formatDate(item.date);
                if (itemDateStr !== lastDateStr) {
                  // Tambahkan baris pemisah tanggal
                  const separatorTr = document.createElement('tr');
                  separatorTr.className = 'tr-separator';
                  separatorTr.innerHTML = `
                    <td colspan="4" class="bg-light fw-bold text-secondary py-2 border-bottom-0">
                      <i class="ti ti-calendar-event me-2"></i>${itemDateStr}
                    </td>
                  `;
                  dashboardTransactionTableBody.appendChild(separatorTr);
                  lastDateStr = itemDateStr;
                }

                if (item.type === 'simpan' || item.type === 'tarik') {
                  typeBadge = item.type === 'simpan' 
                    ? '<span class="badge" style="background-color: rgba(16, 185, 129, 0.15); color: #10b981;">Tabungan Masuk</span>'
                    : '<span class="badge" style="background-color: rgba(245, 158, 11, 0.15); color: #f59e0b;">Tabungan Keluar</span>';
                  sign = item.type === 'simpan' ? '+' : '-';
                  amountColor = item.type === 'simpan' ? 'text-success' : 'text-body';
                  iconClass = 'ti-piggy-bank';
                  categoryText = 'Tabungan';
                  descText = item.description || 'Menabung';
                } else {
                  typeBadge = item.type === 'pemasukan'
                    ? '<span class="badge" style="background-color: rgba(16, 185, 129, 0.15); color: #10b981;">Pemasukan</span>'
                    : '<span class="badge" style="background-color: rgba(220, 53, 69, 0.15); color: #dc3545;">Pengeluaran</span>';
                  sign = item.type === 'pemasukan' ? '+' : '-';
                  amountColor = item.type === 'pemasukan' ? 'text-success' : 'text-body';
                  iconClass = typeof FinCategories !== 'undefined' ? FinCategories.getIcon(item.type === 'pengeluaran' ? item.nature : 'pemasukan', item.category) : 'ti-circle';
                  categoryText = item.category;
                  descText = item.description || '-';
                }

                tr.innerHTML = `
                  <td><strong>${descText}</strong></td>
                  <td><i class="ti ${iconClass} text-primary me-1"></i>${categoryText}</td>
                  <td>${typeBadge}</td>
                  <td class="${amountColor} fw-semibold">${sign}${formatRupiah(item.amount)}</td>
                `;
                dashboardTransactionTableBody.appendChild(tr);
              });
            }
          }

          // ---- Mobile Feed for Dashboard ----
          renderMobileFeed('dashboardMobileFeed', allFiltered, 'dashboard');

          // ---- Line Charts ----
          if (typeof window.renderDashboardCharts === 'function') {
            window.renderDashboardCharts(filteredTransactions, filteredSavings, selectedYYYYMM);
          }
        };

        // ---- Initialize Custom Month Picker ----
        let currentSelectedYYYYMM = null;
        let pickerYear = new Date().getFullYear();
        
        const mpLabel = document.getElementById('monthPickerLabel');
        const mpCurrentYear = document.getElementById('mpCurrentYear');
        const mpMonthsGrid = document.getElementById('mpMonthsGrid');
        const mpPrevYear = document.getElementById('mpPrevYear');
        const mpNextYear = document.getElementById('mpNextYear');
        const mpClearBtn = document.getElementById('mpClearBtn');
        const mpThisMonthBtn = document.getElementById('mpThisMonthBtn');

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        const renderPickerGrid = () => {
          if(!mpMonthsGrid) return;
          if(mpCurrentYear) mpCurrentYear.innerText = pickerYear;
          mpMonthsGrid.innerHTML = '';
          
          let selectedYear = null, selectedMonth = null;
          if(currentSelectedYYYYMM) {
            const parts = currentSelectedYYYYMM.split('-');
            selectedYear = parseInt(parts[0]);
            selectedMonth = parseInt(parts[1]) - 1;
          }

          monthNames.forEach((mName, index) => {
            const col = document.createElement('div');
            col.className = 'col-4';
            
            const isSelected = selectedYear === pickerYear && selectedMonth === index;
            const innerDiv = document.createElement('div');
            innerDiv.className = `p-2 rounded-3 mp-month-item ${isSelected ? 'active' : ''}`;
            innerDiv.innerText = mName;
            
            innerDiv.addEventListener('click', (e) => {
               e.stopPropagation();
               // Update selection
               const mm = String(index + 1).padStart(2, '0');
               currentSelectedYYYYMM = `${pickerYear}-${mm}`;
               mpLabel.innerText = `${mName} ${pickerYear}`;
               
               // Render dashboard
               renderFilteredDashboard(currentSelectedYYYYMM);
               
               // Re-render grid to update 'active' class
               renderPickerGrid();
               
               // Close dropdown (Bootstrap 5)
               const btn = document.getElementById('monthPickerDropdownBtn');
               if (btn && typeof bootstrap !== 'undefined') {
                 const dropdown = bootstrap.Dropdown.getInstance(btn) || new bootstrap.Dropdown(btn);
                 dropdown.hide();
               }
            });
            col.appendChild(innerDiv);
            mpMonthsGrid.appendChild(col);
          });
        };

        if (mpLabel && mpMonthsGrid) {
          const mToday = new Date();
          currentSelectedYYYYMM = `${mToday.getFullYear()}-${String(mToday.getMonth() + 1).padStart(2, '0')}`;
          pickerYear = mToday.getFullYear();
          mpLabel.innerText = `${monthNames[mToday.getMonth()]} ${mToday.getFullYear()}`;
          
          if(mpPrevYear) {
            mpPrevYear.addEventListener('click', (e) => {
              e.stopPropagation();
              pickerYear--;
              renderPickerGrid();
            });
          }
          if(mpNextYear) {
            mpNextYear.addEventListener('click', (e) => {
              e.stopPropagation();
              pickerYear++;
              renderPickerGrid();
            });
          }
          if(mpClearBtn) {
            mpClearBtn.addEventListener('click', (e) => {
               e.stopPropagation();
               currentSelectedYYYYMM = null;
               pickerYear = mToday.getFullYear();
               mpLabel.innerText = 'Semua Bulan';
               renderPickerGrid();
               renderFilteredDashboard(null);
               const btn = document.getElementById('monthPickerDropdownBtn');
               if (btn && typeof bootstrap !== 'undefined') {
                 const dropdown = bootstrap.Dropdown.getInstance(btn) || new bootstrap.Dropdown(btn);
                 dropdown.hide();
               }
            });
          }
          if(mpThisMonthBtn) {
            mpThisMonthBtn.addEventListener('click', (e) => {
               e.stopPropagation();
               currentSelectedYYYYMM = `${mToday.getFullYear()}-${String(mToday.getMonth() + 1).padStart(2, '0')}`;
               pickerYear = mToday.getFullYear();
               mpLabel.innerText = `${monthNames[mToday.getMonth()]} ${mToday.getFullYear()}`;
               renderPickerGrid();
               renderFilteredDashboard(currentSelectedYYYYMM);
               const btn = document.getElementById('monthPickerDropdownBtn');
               if (btn && typeof bootstrap !== 'undefined') {
                 const dropdown = bootstrap.Dropdown.getInstance(btn) || new bootstrap.Dropdown(btn);
                 dropdown.hide();
               }
            });
          }

          // Inisialisasi awal UI grid
          renderPickerGrid();
          // Initial render dashboard
          renderFilteredDashboard(currentSelectedYYYYMM);
        } else {
          // Fallback if UI not found
          renderFilteredDashboard(null);
        }
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  }
});
