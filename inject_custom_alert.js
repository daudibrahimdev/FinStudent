const fs = require('fs');

const customAlertCode = `
// Custom Alert Component
window.CustomAlert = {
  _init: function() {
    if (document.getElementById('globalCustomAlert')) return;
    const div = document.createElement('div');
    div.innerHTML = \`
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
    \`;
    document.body.appendChild(div);
  },
  alert: function(message, title = 'Pemberitahuan') {
    return new Promise((resolve) => {
      this._init();
      document.getElementById('gcaTitle').innerText = title;
      document.getElementById('gcaMessage').innerText = message;
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
  confirm: function(message, title = 'Konfirmasi') {
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
`;

let storageJs = fs.readFileSync('docs/assets/js/storage.js', 'utf8');
if (!storageJs.includes('window.CustomAlert')) {
  storageJs = storageJs + '\n\n' + customAlertCode;
  fs.writeFileSync('docs/assets/js/storage.js', storageJs);
  console.log('Appended CustomAlert to storage.js');
} else {
  console.log('CustomAlert already exists in storage.js');
}
