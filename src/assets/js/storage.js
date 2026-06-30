const STORAGE_KEY_SETUP="finStudent_setup_v2",STORAGE_KEY_TRANSACTIONS="finStudent_transactions_v2",STORAGE_KEY_SAVINGS="finStudent_savings_v3",STORAGE_KEY_SAVING_TARGETS="finStudent_saving_targets_v1",STORAGE_KEY_CUSTOM_CATEGORIES="finStudent_custom_cats_v1",API_BASE="api",LocalStore={getSetup(){const a=localStorage.getItem(STORAGE_KEY_SETUP);return a?JSON.parse(a):null},saveSetup(a){localStorage.setItem(STORAGE_KEY_SETUP,JSON.stringify(a))},getTransactions(){const a=localStorage.getItem(STORAGE_KEY_TRANSACTIONS);return a?JSON.parse(a):[]},addTransaction(a){const e=this.getTransactions(),i={...a,id:Date.now().toString()+Math.random().toString(36).substring(2,9),is_periodic:a.is_periodic||!1,amortization_days:a.amortization_days||1,nature:a.nature||null,createdAt:(new Date).toISOString()};return e.push(i),e.sort(((a,e)=>new Date(e.date)-new Date(a.date))),localStorage.setItem(STORAGE_KEY_TRANSACTIONS,JSON.stringify(e)),i},deleteTransaction(a){let e=this.getTransactions();e=e.filter((e=>e.id!==a)),localStorage.setItem(STORAGE_KEY_TRANSACTIONS,JSON.stringify(e))},updateTransaction(id,data){let txs=this.getTransactions();const idx=txs.findIndex(t=>t.id===id);if(idx!==-1){txs[idx]={...txs[idx],...data};txs.sort((a,b)=>new Date(b.date)-new Date(a.date));localStorage.setItem(STORAGE_KEY_TRANSACTIONS,JSON.stringify(txs));return txs[idx];}return null;},getSavings(){const a=localStorage.getItem(STORAGE_KEY_SAVINGS);return a?JSON.parse(a):[]},addSavingTransaction(a){const e=this.getSavings(),i={...a,id:Date.now().toString()+Math.random().toString(36).substring(2,9),created_at:(new Date).toISOString()};return e.push(i),e.sort(((a,e)=>new Date(e.date)-new Date(a.date))),localStorage.setItem(STORAGE_KEY_SAVINGS,JSON.stringify(e)),i},deleteSavingTransaction(a){let e=this.getSavings();e=e.filter((e=>e.id!==a)),localStorage.setItem(STORAGE_KEY_SAVINGS,JSON.stringify(e))},getSavingTargets(){const a=localStorage.getItem(STORAGE_KEY_SAVING_TARGETS);return a?JSON.parse(a):[]},addSavingTarget(a){const e=this.getSavingTargets(),i={...a,id:Date.now().toString()+Math.random().toString(36).substring(2,9),createdAt:new Date().toISOString()};return e.push(i),localStorage.setItem(STORAGE_KEY_SAVING_TARGETS,JSON.stringify(e)),i},deleteSavingTarget(a){let e=this.getSavingTargets();e=e.filter(e=>e.id!==a);localStorage.setItem(STORAGE_KEY_SAVING_TARGETS,JSON.stringify(e));},updateSavingTarget(id,data){let e=this.getSavingTargets();let idx=e.findIndex(x=>x.id===id);if(idx!==-1){e[idx]={...e[idx],...data};localStorage.setItem(STORAGE_KEY_SAVING_TARGETS,JSON.stringify(e));return e[idx];}return null;},updateSavingTransaction(id,data){let e=this.getSavings();let idx=e.findIndex(x=>x.id===id);if(idx!==-1){e[idx]={...e[idx],...data};localStorage.setItem(STORAGE_KEY_SAVINGS,JSON.stringify(e));return e[idx];}return null;},getAllDataForSync(){return{setup:this.getSetup(),transactions:this.getTransactions(),savings:this.getSavings()}},getCustomCategories(){const a=localStorage.getItem(STORAGE_KEY_CUSTOM_CATEGORIES);return a?JSON.parse(a):[]},saveCustomCategory(a){let e=this.getCustomCategories();if(a.id){const idx=e.findIndex(x=>x.id===a.id);if(idx!==-1)e[idx]=a;else e.push(a)}else{a.id='cat_'+Date.now();e.push(a)}localStorage.setItem(STORAGE_KEY_CUSTOM_CATEGORIES,JSON.stringify(e));return a},deleteCustomCategory(id){let e=this.getCustomCategories();e=e.filter(x=>x.id!==id);localStorage.setItem(STORAGE_KEY_CUSTOM_CATEGORIES,JSON.stringify(e))},clearAll(){localStorage.removeItem(STORAGE_KEY_SETUP),localStorage.removeItem(STORAGE_KEY_TRANSACTIONS),localStorage.removeItem(STORAGE_KEY_SAVINGS)}},FinCategories={ _kebutuhan:[{value:"Tempat Tinggal & Utilitas",label:"Tempat Tinggal & Utilitas",icon:"ti-home",isPeriodic:!0,isCustom:!1},{value:"Konsumsi Dasar Pokok",label:"Konsumsi Dasar Pokok",icon:"ti-shopping-cart",isPeriodic:!0,isCustom:!1},{value:"Transportasi Wajib",label:"Transportasi Wajib",icon:"ti-car",isPeriodic:!1,isCustom:!1},{value:"Servis Rutin Kendaraan",label:"Servis Rutin Kendaraan",icon:"ti-tools",isPeriodic:!0,isCustom:!1},{value:"Kebutuhan Pendidikan",label:"Kebutuhan Pendidikan",icon:"ti-book",isPeriodic:!1,isCustom:!1},{value:"Kesehatan & Kebersihan diri",label:"Kesehatan & Kebersihan diri",icon:"ti-first-aid-kit",isPeriodic:!0,isCustom:!1},{value:"Kebutuhan & Tagihan lainnya",label:"Kebutuhan & Tagihan lainnya",icon:"ti-file-invoice",isPeriodic:!1,isCustom:!1}], _keinginan:[{value:"Makanan dan Minuman (Jajan)",label:"Makanan dan Minuman (Jajan)",icon:"ti-coffee",isPeriodic:!1,isCustom:!1},{value:"Hiburan & Langganan Digital",label:"Hiburan & Langganan Digital",icon:"ti-device-tv",isPeriodic:!1,isCustom:!1},{value:"Belanja & Lifestyle",label:"Belanja & Lifestyle",icon:"ti-shopping-bag",isPeriodic:!1,isCustom:!1},{value:"Sosial & Rekreasi",label:"Sosial & Rekreasi",icon:"ti-users",isPeriodic:!1,isCustom:!1},{value:"Pengeluaran lainnya",label:"Pengeluaran lainnya",icon:"ti-bolt",isPeriodic:!1,isCustom:!1}], _pemasukan:[{value:"Gaji",label:"Gaji",icon:"ti-cash",isCustom:!1},{value:"Uang Saku",label:"Uang Saku Orang Tua",icon:"ti-wallet",isCustom:!1},{value:"Freelance",label:"Freelance / Bisnis",icon:"ti-briefcase",isCustom:!1},{value:"Lainnya",label:"Lainnya",icon:"ti-coin",isCustom:!1}], get kebutuhan() { const custom = LocalStore.getCustomCategories().filter(c => c.nature === 'kebutuhan'); return [...this._kebutuhan, ...custom]; }, get keinginan() { const custom = LocalStore.getCustomCategories().filter(c => c.nature === 'keinginan'); return [...this._keinginan, ...custom]; }, get pemasukan() { const custom = LocalStore.getCustomCategories().filter(c => c.nature === 'pemasukan'); return [...this._pemasukan, ...custom]; }, getIcon(a,e) { let i=[]; i="pemasukan"===a?this.pemasukan:"kebutuhan"===a?this.kebutuhan:"keinginan"===a?this.keinginan:[...this.kebutuhan,...this.keinginan,...this.pemasukan]; const t=i.find((a=>a.value===e)); return t&&t.icon?t.icon:"ti-circle" }, isPeriodicCategory(a,e) { const i=this[a]; if(!i)return!1; const t=i.find((a=>a.value===e)); return!!t&&!0===t.isPeriodic }},ApiService={getSetupData:async()=>LocalStore.getSetup(),saveSetupData:async a=>(LocalStore.saveSetup(a),{success:!0}),getTransactions:async()=>LocalStore.getTransactions(),addTransaction:async a=>({success:!0,data:LocalStore.addTransaction(a)}),updateTransaction:async(id,data)=>({success:!0,data:LocalStore.updateTransaction(id,data)}),deleteTransaction:async a=>(LocalStore.deleteTransaction(a),{success:!0}),getSavings:async()=>LocalStore.getSavings(),addSavingTransaction:async a=>({success:!0,data:LocalStore.addSavingTransaction(a)}),deleteSavingTransaction:async a=>(LocalStore.deleteSavingTransaction(a),{success:!0}),getSavingTargets:async()=>LocalStore.getSavingTargets(),addSavingTarget:async a=>({success:!0,data:LocalStore.addSavingTarget(a)}),deleteSavingTarget:async a=>(LocalStore.deleteSavingTarget(a),{success:!0}),updateSavingTarget:async (id, data)=>({success:!0,data:LocalStore.updateSavingTarget(id, data)}),updateSavingTransaction:async (id, data)=>({success:!0,data:LocalStore.updateSavingTransaction(id, data)})};


// Custom Alert Component
window.CustomAlert = {
  _init: function() {
    if (document.getElementById('globalCustomAlert')) return;
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="modal fade" id="globalCustomAlert" tabindex="-1" aria-hidden="true" style="z-index: 1060;">
        <div class="modal-dialog modal-dialog-centered modal-sm">
          <div class="modal-content rounded-4 border-0 shadow-lg text-center p-4">
            <div class="mb-3">
              <img src="./assets/images/mochi1.gif" alt="Mochi" style="height: 150px; object-fit: contain;">
            </div>
            <h5 class="modal-title mb-2 fw-bold text-dark" id="gcaTitle">Pemberitahuan</h5>
            <p class="text-muted mb-4 fs-6" id="gcaMessage"></p>
            <div class="d-flex justify-content-center gap-3 w-100">
              <button type="button" class="btn btn-light rounded-pill px-4 fw-semibold flex-grow-1" id="gcaCancelBtn" data-bs-dismiss="modal">Batal</button>
              <button type="button" class="btn btn-primary rounded-pill px-4 fw-bold flex-grow-1" id="gcaConfirmBtn">OK</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(div);
  },
  alert: function(message, title = 'Pemberitahuan') {
    return new Promise((resolve) => {
      this._init();
      document.getElementById('gcaTitle').innerText = title;
      document.getElementById('gcaMessage').innerText = message;
      if (imgUrl) document.querySelector('#globalCustomAlert img').src = imgUrl;
      else document.querySelector('#globalCustomAlert img').src = './assets/images/mochi1.gif';
      document.getElementById('gcaCancelBtn').classList.add('d-none');
      const confirmBtn = document.getElementById('gcaConfirmBtn');
      confirmBtn.innerText = 'OK';
      confirmBtn.className = 'btn btn-primary rounded-pill px-4 fw-bold flex-grow-1';
      
      const modalEl = document.getElementById('globalCustomAlert');
      const bsModal = new bootstrap.Modal(modalEl);
      
      const onConfirm = () => {
        confirmBtn.removeEventListener('click', onConfirm);
        bsModal.hide();
        resolve(true);
      };
      
      confirmBtn.addEventListener('click', onConfirm);
      
      modalEl.addEventListener('hidden.bs.modal', function onHidden() {
        modalEl.removeEventListener('hidden.bs.modal', onHidden);
        resolve(true);
      });
      
      bsModal.show();
    });
  },
  confirm: function(message, title = 'Konfirmasi', imgUrl = null) {
    return new Promise((resolve) => {
      this._init();
      document.getElementById('gcaTitle').innerText = title;
      document.getElementById('gcaMessage').innerText = message;
      const cancelBtn = document.getElementById('gcaCancelBtn');
      const confirmBtn = document.getElementById('gcaConfirmBtn');
      
      cancelBtn.classList.remove('d-none');
      confirmBtn.innerText = 'Ya';
      confirmBtn.className = 'btn btn-danger rounded-pill px-4 fw-bold flex-grow-1';
      
      const modalEl = document.getElementById('globalCustomAlert');
      const bsModal = new bootstrap.Modal(modalEl);
      
      let resolved = false;
      
      const onConfirm = () => {
        resolved = true;
        confirmBtn.removeEventListener('click', onConfirm);
        cancelBtn.removeEventListener('click', onCancel);
        bsModal.hide();
        resolve(true);
      };
      
      const onCancel = () => {
        resolved = true;
        confirmBtn.removeEventListener('click', onConfirm);
        cancelBtn.removeEventListener('click', onCancel);
        bsModal.hide();
        resolve(false);
      };
      
      confirmBtn.addEventListener('click', onConfirm);
      cancelBtn.addEventListener('click', onCancel);
      
      modalEl.addEventListener('hidden.bs.modal', function onHidden() {
        modalEl.removeEventListener('hidden.bs.modal', onHidden);
        if (!resolved) resolve(false);
      });
      
      bsModal.show();
    });
  }
};
