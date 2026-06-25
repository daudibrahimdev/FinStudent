/**
 * FinStudent - Smart Proxy Data Service Layer v2
 * Otomatis memilih: localStorage (Guest) atau PHP API (Logged In)
 * Mendukung field: nature, is_periodic, amortization_days
 */

const STORAGE_KEY_SETUP = 'finStudent_setup_v2';
const STORAGE_KEY_TRANSACTIONS = 'finStudent_transactions_v2';
const STORAGE_KEY_SAVINGS = 'finStudent_savings_v3';
const API_BASE = 'api';

// ==========================================
// Internal: localStorage handlers (Guest Mode)
// ==========================================
const LocalStore = {
  getSetup() {
    const data = localStorage.getItem(STORAGE_KEY_SETUP);
    return data ? JSON.parse(data) : null;
  },
  saveSetup(data) {
    localStorage.setItem(STORAGE_KEY_SETUP, JSON.stringify(data));
  },
  getTransactions() {
    const data = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  addTransaction(tx) {
    const transactions = this.getTransactions();
    const newTx = {
      ...tx,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      is_periodic: tx.is_periodic || false,
      amortization_days: tx.amortization_days || 1,
      nature: tx.nature || null,
      createdAt: new Date().toISOString()
    };
    transactions.push(newTx);
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    return newTx;
  },
  deleteTransaction(id) {
    let transactions = this.getTransactions();
    transactions = transactions.filter(tx => tx.id !== id);
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  },
  getSavings() {
    const data = localStorage.getItem(STORAGE_KEY_SAVINGS);
    return data ? JSON.parse(data) : [];
  },
  addSavingTransaction(saving) {
    const savings = this.getSavings();
    const newSaving = {
      ...saving,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };
    savings.push(newSaving);
    savings.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem(STORAGE_KEY_SAVINGS, JSON.stringify(savings));
    return newSaving;
  },
  deleteSavingTransaction(id) {
    let savings = this.getSavings();
    savings = savings.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY_SAVINGS, JSON.stringify(savings));
  },
  getAllDataForSync() {
    return {
      setup: this.getSetup(),
      transactions: this.getTransactions(),
      savings: this.getSavings()
    };
  },
  clearAll() {
    localStorage.removeItem(STORAGE_KEY_SETUP);
    localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEY_SAVINGS);
  }
};

// ==========================================
// CATEGORY CONFIG (shared between form & calculations)
// ==========================================
const FinCategories = {
  kebutuhan: [
    { value: 'Tempat Tinggal & Utilitas', label: 'Tempat Tinggal & Utilitas', icon: 'ti-home', isPeriodic: true },
    { value: 'Konsumsi Dasar Pokok', label: 'Konsumsi Dasar Pokok', icon: 'ti-shopping-cart', isPeriodic: true },
    { value: 'Transportasi Wajib', label: 'Transportasi Wajib', icon: 'ti-car', isPeriodic: false },
    { value: 'Pendidikan & Kebutuhan Kampus', label: 'Pendidikan & Kebutuhan Kampus', icon: 'ti-book', isPeriodic: false },
    { value: 'Kesehatan & Kebersihan Diri', label: 'Kesehatan & Kebersihan Diri', icon: 'ti-first-aid-kit', isPeriodic: true },
    { value: 'Kewajiban & Tagihan Lainnya', label: 'Kewajiban & Tagihan Lainnya', icon: 'ti-file-invoice', isPeriodic: false }
  ],
  keinginan: [
    { value: 'Food & Beverage (Jajan & Nongkrong)', label: 'Food & Beverage (Jajan & Nongkrong)', icon: 'ti-coffee', isPeriodic: false },
    { value: 'Hiburan & Langganan Digital', label: 'Hiburan & Langganan Digital', icon: 'ti-device-tv', isPeriodic: false },
    { value: 'Belanja & Lifestyle', label: 'Belanja & Lifestyle', icon: 'ti-shopping-bag', isPeriodic: false },
    { value: 'Sosial & Rekreasi', label: 'Sosial & Rekreasi', icon: 'ti-users', isPeriodic: false },
    { value: 'Pengeluaran Impulsif (Lain-lain)', label: 'Pengeluaran Impulsif (Lain-lain)', icon: 'ti-bolt', isPeriodic: false }
  ],
  pemasukan: [
    { value: 'Gaji', label: 'Gaji', icon: 'ti-cash' },
    { value: 'Uang Saku', label: 'Uang Saku Orang Tua', icon: 'ti-wallet' },
    { value: 'Freelance', label: 'Freelance / Bisnis', icon: 'ti-briefcase' },
    { value: 'Lainnya', label: 'Lainnya', icon: 'ti-coin' }
  ],
  getIcon(nature, categoryValue) {
    let cats = [];
    if (nature === 'pemasukan') cats = this.pemasukan;
    else if (nature === 'kebutuhan') cats = this.kebutuhan;
    else if (nature === 'keinginan') cats = this.keinginan;
    else cats = [...this.kebutuhan, ...this.keinginan, ...this.pemasukan];
    
    const found = cats.find(c => c.value === categoryValue);
    return found && found.icon ? found.icon : 'ti-circle';
  },
  isPeriodicCategory(nature, categoryValue) {
    const cats = this[nature];
    if (!cats) return false;
    const found = cats.find(c => c.value === categoryValue);
    return found ? found.isPeriodic === true : false;
  }
};

// ==========================================
// ApiService: The Smart Proxy (PUBLIC API)
// ==========================================
const ApiService = {
  async getSetupData() {
    return LocalStore.getSetup();
  },

  async saveSetupData(data) {
    LocalStore.saveSetup(data);
    return { success: true };
  },

  async getTransactions() {
    return LocalStore.getTransactions();
  },

  async addTransaction(transaction) {
    const newTx = LocalStore.addTransaction(transaction);
    return { success: true, data: newTx };
  },

  async deleteTransaction(id) {
    LocalStore.deleteTransaction(id);
    return { success: true };
  },

  async getSavings() {
    return LocalStore.getSavings();
  },

  async addSavingTransaction(saving) {
    const newSaving = LocalStore.addSavingTransaction(saving);
    return { success: true, data: newSaving };
  },

  async deleteSavingTransaction(id) {
    LocalStore.deleteSavingTransaction(id);
    return { success: true };
  }
};
