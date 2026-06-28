const fs = require('fs');

function patchApp(file) {
  if (!fs.existsSync(file)) return;
  let js = fs.readFileSync(file, 'utf8');

  // Fix 1: g() function crashing on appendChild
  const oldG = 'a="pemasukan"===e?FinCategories.pemasukan:FinCategories[t]||FinCategories.kebutuhan,s.innerHTML="",a.forEach((e=>{const t=document.createElement("option");t.value=e.value,t.textContent=e.label,e.isPeriodic&&(t.dataset.periodic="true"),s.appendChild(t)})),v()';
  const newG = 'a="pemasukan"===e?FinCategories.pemasukan:FinCategories[t]||FinCategories.kebutuhan;if(s&&s.tagName==="SELECT"){s.innerHTML="";a.forEach((e=>{const t=document.createElement("option");t.value=e.value,t.textContent=e.label,e.isPeriodic&&(t.dataset.periodic="true"),s.appendChild(t)}))}v()';
  
  if (js.includes(oldG)) {
    js = js.replace(oldG, newG);
  }

  // Fix 2: v() function crashing on s.options
  const oldV = 'const e=s.options[s.selectedIndex];';
  const newV = 'const e=(s&&s.tagName==="SELECT")?s.options[s.selectedIndex]:null;';
  if (js.includes(oldV)) {
    js = js.replace(oldV, newV);
  }
  
  // Fix 3: In duplicate click handler (f), it does: s.value=i.category,v()
  const oldF = 's.value=i.category,v(),';
  const newF = 's.value=i.category,v(),s.dispatchEvent(new Event("change")),';
  if (js.includes(oldF)) {
    js = js.replace(oldF, newF);
  }

  fs.writeFileSync(file, js);
}

patchApp('docs/assets/js/app.js');
if (fs.existsSync('src/assets/js/app.js')) {
  patchApp('src/assets/js/app.js');
}

console.log('Fixed!');
