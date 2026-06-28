const fs = require('fs');

const storageFile = 'docs/assets/js/storage.js';
let content = fs.readFileSync(storageFile, 'utf8');

const replacementKebutuhan = `_kebutuhan:[{value:"Tempat Tinggal & Utilitas",label:"Tempat Tinggal & Utilitas",icon:"ti-home",isPeriodic:!0,isCustom:!1},{value:"Konsumsi Dasar Pokok",label:"Konsumsi Dasar Pokok",icon:"ti-shopping-cart",isPeriodic:!0,isCustom:!1},{value:"Transportasi Wajib",label:"Transportasi Wajib",icon:"ti-car",isPeriodic:!1,isCustom:!1},{value:"Servis Rutin Kendaraan",label:"Servis Rutin Kendaraan",icon:"ti-tools",isPeriodic:!0,isCustom:!1},{value:"Kebutuhan Pendidikan",label:"Kebutuhan Pendidikan",icon:"ti-book",isPeriodic:!1,isCustom:!1},{value:"Kesehatan & Kebersihan diri",label:"Kesehatan & Kebersihan diri",icon:"ti-first-aid-kit",isPeriodic:!0,isCustom:!1},{value:"Kebutuhan & Tagihan lainnya",label:"Kebutuhan & Tagihan lainnya",icon:"ti-file-invoice",isPeriodic:!1,isCustom:!1}]`;
const replacementKeinginan = `_keinginan:[{value:"Makanan dan Minuman (Jajan)",label:"Makanan dan Minuman (Jajan)",icon:"ti-coffee",isPeriodic:!1,isCustom:!1},{value:"Hiburan & Langganan Digital",label:"Hiburan & Langganan Digital",icon:"ti-device-tv",isPeriodic:!1,isCustom:!1},{value:"Belanja & Lifestyle",label:"Belanja & Lifestyle",icon:"ti-shopping-bag",isPeriodic:!1,isCustom:!1},{value:"Sosial & Rekreasi",label:"Sosial & Rekreasi",icon:"ti-users",isPeriodic:!1,isCustom:!1},{value:"Pengeluaran lainnya",label:"Pengeluaran lainnya",icon:"ti-bolt",isPeriodic:!1,isCustom:!1}]`;

content = content.replace(/_kebutuhan:\[.*?\](,\s*_keinginan)/, replacementKebutuhan + '$1');
content = content.replace(/_keinginan:\[.*?\](,\s*_pemasukan)/, replacementKeinginan + '$1');

fs.writeFileSync(storageFile, content);
if (fs.existsSync('src/assets/js/storage.js')) {
    fs.writeFileSync('src/assets/js/storage.js', content);
}
console.log('Categories updated!');
