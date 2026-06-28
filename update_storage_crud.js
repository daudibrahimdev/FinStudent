const fs = require('fs');

let code = fs.readFileSync('docs/assets/js/storage.js', 'utf8');

// Update API
const addUpdateSavingTargetAPI = 'deleteSavingTarget:async a=>(LocalStore.deleteSavingTarget(a),{success:!0}),updateSavingTarget:async (id, data)=>({success:!0,data:LocalStore.updateSavingTarget(id, data)}),updateSavingTransaction:async (id, data)=>({success:!0,data:LocalStore.updateSavingTransaction(id, data)})';
code = code.replace('deleteSavingTarget:async a=>(LocalStore.deleteSavingTarget(a),{success:!0})', addUpdateSavingTargetAPI);

// Update LocalStore
const addUpdateSavingTargetStore = 'deleteSavingTarget(a){let e=this.getSavingTargets();e=e.filter(e=>e.id!==a);localStorage.setItem(STORAGE_KEY_SAVING_TARGETS,JSON.stringify(e));},updateSavingTarget(id,data){let e=this.getSavingTargets();let idx=e.findIndex(x=>x.id===id);if(idx!==-1){e[idx]={...e[idx],...data};localStorage.setItem(STORAGE_KEY_SAVING_TARGETS,JSON.stringify(e));return e[idx];}return null;},updateSavingTransaction(id,data){let e=this.getSavings();let idx=e.findIndex(x=>x.id===id);if(idx!==-1){e[idx]={...e[idx],...data};localStorage.setItem(STORAGE_KEY_SAVINGS,JSON.stringify(e));return e[idx];}return null;}';
code = code.replace('deleteSavingTarget(a){let e=this.getSavingTargets();e=e.filter(e=>e.id!==a);localStorage.setItem(STORAGE_KEY_SAVING_TARGETS,JSON.stringify(e));}', addUpdateSavingTargetStore);

// Update CustomAlert
code = code.replace("confirm: function(message, title = 'Konfirmasi')", "confirm: function(message, title = 'Konfirmasi', imgUrl = null)");

const originalConfirmSetup = `document.getElementById('gcaTitle').innerText = title;
      document.getElementById('gcaMessage').innerText = message;`;
const newConfirmSetup = `document.getElementById('gcaTitle').innerText = title;
      document.getElementById('gcaMessage').innerText = message;
      if (imgUrl) document.querySelector('#globalCustomAlert img').src = imgUrl;
      else document.querySelector('#globalCustomAlert img').src = './assets/images/mochi1.gif';`;
code = code.replace(originalConfirmSetup, newConfirmSetup);

fs.writeFileSync('docs/assets/js/storage.js', code);
console.log('storage.js updated');
