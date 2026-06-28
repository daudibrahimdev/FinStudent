const fs = require('fs');

let storageJs = fs.readFileSync('docs/assets/js/storage.js', 'utf8');

// 1. Add STORAGE_KEY_CUSTOM_CATEGORIES
if (!storageJs.includes('STORAGE_KEY_CUSTOM_CATEGORIES')) {
  storageJs = storageJs.replace('STORAGE_KEY_SAVING_TARGETS="finStudent_saving_targets_v1",', 'STORAGE_KEY_SAVING_TARGETS="finStudent_saving_targets_v1",STORAGE_KEY_CUSTOM_CATEGORIES="finStudent_custom_cats_v1",');
}

// 2. Add LocalStore functions for Custom Categories
const localStoreInject = `getCustomCategories(){const a=localStorage.getItem(STORAGE_KEY_CUSTOM_CATEGORIES);return a?JSON.parse(a):[]},saveCustomCategory(a){let e=this.getCustomCategories();if(a.id){const idx=e.findIndex(x=>x.id===a.id);if(idx!==-1)e[idx]=a;else e.push(a)}else{a.id='cat_'+Date.now();e.push(a)}localStorage.setItem(STORAGE_KEY_CUSTOM_CATEGORIES,JSON.stringify(e));return a},deleteCustomCategory(id){let e=this.getCustomCategories();e=e.filter(x=>x.id!==id);localStorage.setItem(STORAGE_KEY_CUSTOM_CATEGORIES,JSON.stringify(e))},`;

if (!storageJs.includes('getCustomCategories()')) {
  storageJs = storageJs.replace('clearAll(){', localStoreInject + 'clearAll(){');
}

// 3. Rewrite FinCategories
// Since FinCategories is currently static, we need to convert it into a class or an object with an init() method, 
// OR we just provide a method to get the arrays dynamically.
// To avoid breaking existing code, we will make FinCategories a proxy-like object or just rewrite its properties.
// Actually, since `app.js` accesses `FinCategories.pemasukan`, we need them to be arrays. 
// A getter property would be best.

const finCatOld = `FinCategories={kebutuhan:[{value:"Tempat Tinggal & Utilitas",label:"Tempat Tinggal & Utilitas",icon:"ti-home",isPeriodic:!0},{value:"Konsumsi Dasar Pokok",label:"Konsumsi Dasar Pokok",icon:"ti-shopping-cart",isPeriodic:!0},{value:"Transportasi Wajib",label:"Transportasi Wajib",icon:"ti-car",isPeriodic:!1},{value:"Pendidikan & Kebutuhan Kampus",label:"Pendidikan & Kebutuhan Kampus",icon:"ti-book",isPeriodic:!1},{value:"Kesehatan & Kebersihan Diri",label:"Kesehatan & Kebersihan Diri",icon:"ti-first-aid-kit",isPeriodic:!0},{value:"Kewajiban & Tagihan Lainnya",label:"Kewajiban & Tagihan Lainnya",icon:"ti-file-invoice",isPeriodic:!1}],keinginan:[{value:"Food & Beverage (Jajan & Nongkrong)",label:"Food & Beverage (Jajan & Nongkrong)",icon:"ti-coffee",isPeriodic:!1},{value:"Hiburan & Langganan Digital",label:"Hiburan & Langganan Digital",icon:"ti-device-tv",isPeriodic:!1},{value:"Belanja & Lifestyle",label:"Belanja & Lifestyle",icon:"ti-shopping-bag",isPeriodic:!1},{value:"Sosial & Rekreasi",label:"Sosial & Rekreasi",icon:"ti-users",isPeriodic:!1},{value:"Pengeluaran Impulsif (Lain-lain)",label:"Pengeluaran Impulsif (Lain-lain)",icon:"ti-bolt",isPeriodic:!1}],pemasukan:[{value:"Gaji",label:"Gaji",icon:"ti-cash"},{value:"Uang Saku",label:"Uang Saku Orang Tua",icon:"ti-wallet"},{value:"Freelance",label:"Freelance / Bisnis",icon:"ti-briefcase"},{value:"Lainnya",label:"Lainnya",icon:"ti-coin"}],getIcon(a,e){let i=[];i="pemasukan"===a?this.pemasukan:"kebutuhan"===a?this.kebutuhan:"keinginan"===a?this.keinginan:[...this.kebutuhan,...this.keinginan,...this.pemasukan];const t=i.find((a=>a.value===e));return t&&t.icon?t.icon:"ti-circle"},isPeriodicCategory(a,e){const i=this[a];if(!i)return!1;const t=i.find((a=>a.value===e));return!!t&&!0===t.isPeriodic}},`;

const finCatNew = `
FinCategories={
  _kebutuhan:[{value:"Tempat Tinggal & Utilitas",label:"Tempat Tinggal & Utilitas",icon:"ti-home",isPeriodic:!0,isCustom:!1},{value:"Konsumsi Dasar Pokok",label:"Konsumsi Dasar Pokok",icon:"ti-shopping-cart",isPeriodic:!0,isCustom:!1},{value:"Transportasi Wajib",label:"Transportasi Wajib",icon:"ti-car",isPeriodic:!1,isCustom:!1},{value:"Pendidikan & Kebutuhan Kampus",label:"Pendidikan & Kebutuhan Kampus",icon:"ti-book",isPeriodic:!1,isCustom:!1},{value:"Kesehatan & Kebersihan Diri",label:"Kesehatan & Kebersihan Diri",icon:"ti-first-aid-kit",isPeriodic:!0,isCustom:!1},{value:"Kewajiban & Tagihan Lainnya",label:"Kewajiban & Tagihan Lainnya",icon:"ti-file-invoice",isPeriodic:!1,isCustom:!1}],
  _keinginan:[{value:"Food & Beverage (Jajan & Nongkrong)",label:"Food & Beverage (Jajan & Nongkrong)",icon:"ti-coffee",isPeriodic:!1,isCustom:!1},{value:"Hiburan & Langganan Digital",label:"Hiburan & Langganan Digital",icon:"ti-device-tv",isPeriodic:!1,isCustom:!1},{value:"Belanja & Lifestyle",label:"Belanja & Lifestyle",icon:"ti-shopping-bag",isPeriodic:!1,isCustom:!1},{value:"Sosial & Rekreasi",label:"Sosial & Rekreasi",icon:"ti-users",isPeriodic:!1,isCustom:!1},{value:"Pengeluaran Impulsif (Lain-lain)",label:"Pengeluaran Impulsif (Lain-lain)",icon:"ti-bolt",isPeriodic:!1,isCustom:!1}],
  _pemasukan:[{value:"Gaji",label:"Gaji",icon:"ti-cash",isCustom:!1},{value:"Uang Saku",label:"Uang Saku Orang Tua",icon:"ti-wallet",isCustom:!1},{value:"Freelance",label:"Freelance / Bisnis",icon:"ti-briefcase",isCustom:!1},{value:"Lainnya",label:"Lainnya",icon:"ti-coin",isCustom:!1}],
  get kebutuhan() {
    const custom = LocalStore.getCustomCategories().filter(c => c.nature === 'kebutuhan');
    return [...this._kebutuhan, ...custom];
  },
  get keinginan() {
    const custom = LocalStore.getCustomCategories().filter(c => c.nature === 'keinginan');
    return [...this._keinginan, ...custom];
  },
  get pemasukan() {
    const custom = LocalStore.getCustomCategories().filter(c => c.nature === 'pemasukan');
    return [...this._pemasukan, ...custom];
  },
  getIcon(a,e) {
    let i=[];
    i="pemasukan"===a?this.pemasukan:"kebutuhan"===a?this.kebutuhan:"keinginan"===a?this.keinginan:[...this.kebutuhan,...this.keinginan,...this.pemasukan];
    const t=i.find((a=>a.value===e));
    return t&&t.icon?t.icon:"ti-circle"
  },
  isPeriodicCategory(a,e) {
    const i=this[a];
    if(!i)return!1;
    const t=i.find((a=>a.value===e));
    return!!t&&!0===t.isPeriodic
  }
},
`.replace(/\n/g, '').replace(/\s+/g, ' ');

if (storageJs.includes(finCatOld)) {
  storageJs = storageJs.replace(finCatOld, finCatNew + ',');
}

fs.writeFileSync('docs/assets/js/storage.js', storageJs);
console.log('storage.js updated with custom categories support!');
