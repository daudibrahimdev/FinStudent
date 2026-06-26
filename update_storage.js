const fs = require('fs');
let code = fs.readFileSync('docs/assets/js/storage.js', 'utf8');

code = code.replace(
  'STORAGE_KEY_SAVINGS="finStudent_savings_v3"',
  'STORAGE_KEY_SAVINGS="finStudent_savings_v3",STORAGE_KEY_SAVING_TARGETS="finStudent_saving_targets_v1"'
);

code = code.replace(
  'deleteSavingTransaction(a){let e=this.getSavings();e=e.filter((e=>e.id!==a)),localStorage.setItem(STORAGE_KEY_SAVINGS,JSON.stringify(e))}',
  'deleteSavingTransaction(a){let e=this.getSavings();e=e.filter((e=>e.id!==a)),localStorage.setItem(STORAGE_KEY_SAVINGS,JSON.stringify(e))},getSavingTargets(){const a=localStorage.getItem(STORAGE_KEY_SAVING_TARGETS);return a?JSON.parse(a):[]},addSavingTarget(a){const e=this.getSavingTargets(),i={...a,id:Date.now().toString()+Math.random().toString(36).substring(2,9),createdAt:new Date().toISOString()};return e.push(i),localStorage.setItem(STORAGE_KEY_SAVING_TARGETS,JSON.stringify(e)),i},deleteSavingTarget(a){let e=this.getSavingTargets();e=e.filter(e=>e.id!==a);localStorage.setItem(STORAGE_KEY_SAVING_TARGETS,JSON.stringify(e));}'
);

code = code.replace(
  'deleteSavingTransaction:async a=>(LocalStore.deleteSavingTransaction(a),{success:!0})',
  'deleteSavingTransaction:async a=>(LocalStore.deleteSavingTransaction(a),{success:!0}),getSavingTargets:async()=>LocalStore.getSavingTargets(),addSavingTarget:async a=>({success:!0,data:LocalStore.addSavingTarget(a)}),deleteSavingTarget:async a=>(LocalStore.deleteSavingTarget(a),{success:!0})'
);

fs.writeFileSync('docs/assets/js/storage.js', code);
console.log('storage.js updated');
