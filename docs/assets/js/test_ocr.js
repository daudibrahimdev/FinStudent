const { parseReceipt } = require('./receipt_ocr.js');

const mockSPBU = `
SPBU 34-12604
JL.RAYA TJ.BARAT 142
JAKARTA SELATAN
ORIGINAL COPY
28/06/26 12:53:05
Pump No : 11
Fuel type : PERTALITE
Amount : 50000.
Volume : 5.000 LTR
Rate : 10000.
TERIMA KASIH
`;

const mockGacoan = `
MIE GACOAN
JAKARTA SELATAN - LENTENG AGUNG
Jl. Lenteng Agung, Kel. Lenteng Agung,
IG: @mie.gacoan
Reprint 1
Date : 28-06-2026 14:24
Customer : Daud
Purpose : 02. TAKE AWAY
Cashier : SELF ORDER

Full Name
Daud

1 MIE GACOAN 10.455
1 LEVEL 1 0
1 MIE HOMPIMPA 10.455
1 LEVEL 1 0
1 UDANG KEJU 9.546
---
3 items
Subtotal : 30.456
PB1 : 3.046
Total : 33.502
Rounding : -2
Grand Total : 33.500
`;

const mockPlanetBan = `
PT. SURGANYA MOTOR INDONESIA
31.556.808.9-412.000
MAMPANG PRAPATAN DURENTIG
JL. MAMPANG PRAPATAN RAYA
Member : GLOBAL MEMBERSHIP
Nama Member : RIKI MAULANA
27.06.2026 12:19:00

Deskripsi Qty Harga Subtotal
===========================
MK MINYA REM 50 ML 1 11,000 11,000
X-G BEARING 6201 2 21,000 42,000
X-G BR-PAD GEN-VAR 1 46,000 46,000
XGRADE DISCBRK HOND 1 150,000 150,000
===========================
Subtotal 5 249,000
Lebih Hemat 0
Sp. Diskon 49,000
Total 5 200,000
Tunai 200,000
`;

console.log("--- TEST SPBU ---");
console.log(JSON.stringify(parseReceipt(mockSPBU), null, 2));

console.log("\n--- TEST MIE GACOAN ---");
console.log(JSON.stringify(parseReceipt(mockGacoan), null, 2));

console.log("\n--- TEST PLANET BAN ---");
console.log(JSON.stringify(parseReceipt(mockPlanetBan), null, 2));
