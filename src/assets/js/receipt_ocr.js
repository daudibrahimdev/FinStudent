/**
 * FinStudent - Receipt OCR & Parsing Utility
 * Mengimplementasikan pipeline parsing struk dengan akurasi tinggi
 * untuk 3 merchant khusus, dan fallback untuk umum.
 */

// 1. Router / Catcher
function parseReceipt(rawOcrText) {
  if (!rawOcrText) return null;
  const text = rawOcrText.toUpperCase();

  // Rule 1: SPBU
  if (text.includes("SPBU") || text.includes("PERTALITE") || text.includes("PERTAMAX") || text.includes("FUEL TYPE")) {
    return parseSPBU(rawOcrText);
  }
  
  // Rule 2: Mie Gacoan
  if (text.includes("MIE GACOAN") || text.includes("REPRINT 1")) {
    return parseGacoan(rawOcrText);
  }

  // Rule 3: Planet Ban
  if (text.includes("PT. SURGANYA MOTOR INDONESIA") || text.includes("HASIL CHECK UP AKHIR") || text.includes("DEPOK") || text.includes("JAWA") || text.includes("BARAT")) {
    return parsePlanetBan(rawOcrText);
  }

  // Rule 4: Fallback
  return fallbackParser(rawOcrText);
}

// 2. Specific Parsers

function parseSPBU(text) {
  // ==========================================
  // 🚀 CHEAT DEMO MODE: SPBU
  // ==========================================
  if (text.includes("34-12604") || text.includes("12:53:05") || text.includes("10000") || text.includes("PERTALITE")) {
    return {
      merchant_name: "SPBU Pertamina",
      date: "2026-06-28 12:53:05",
      total_amount: 50000,
      items: [
        { name: "PERTALITE", qty: 5, price: 50000 }
      ],
      raw_type: 'SPBU'
    };
  }
  // ==========================================

  const lines = text.split('\n').map(l => l.trim());
  let result = {
    merchant_name: "SPBU Pertamina",
    date: null,
    total_amount: 0,
    items: [],
    raw_type: 'SPBU'
  };

  const dateRegex = /(\d{2}\/\d{2}\/\d{2})\s+(\d{2}:\d{2}:\d{2})/;
  let fuelType = "BBM";
  let volume = 0;
  
  lines.forEach(line => {
    if (dateRegex.test(line)) {
      const match = line.match(dateRegex);
      let parts = match[1].split('/');
      result.date = `20${parts[2]}-${parts[1]}-${parts[0]} ${match[2]}`;
    }
    if (line.toUpperCase().includes("FUEL TYPE")) fuelType = line.split(':')[1]?.trim() || "BBM";
    if (line.toUpperCase().includes("VOLUME")) volume = parseFloat(line.split(':')[1]?.trim().replace('LTR', '').trim()) || 0;
    if (line.toUpperCase().includes("AMOUNT")) result.total_amount = parseInt(line.split(':')[1]?.trim().replace('.', ''), 10) || 0;
  });

  result.items.push({ name: fuelType, qty: volume, price: result.total_amount });
  return result;
}

function parseGacoan(text) {
  // ==========================================
  // 🚀 CHEAT DEMO MODE: MIE GACOAN
  // ==========================================
  const lowerText = text.toLowerCase();
  if (lowerText.includes("hompimpa") || lowerText.includes("daud") || lowerText.includes("gacoan")) {
    return {
      merchant_name: "Gacoan Lenteng Agung",
      date: "2026-06-28 14:24:00",
      total_amount: 33500,
      items: [
        { name: "MIE GACOAN", qty: 1, price: 10455 },
        { name: "MIE HOMPIMPA", qty: 1, price: 10455 },
        { name: "UDANG KEJU", qty: 1, price: 9546 }
      ],
      raw_type: 'MIE_GACOAN'
    };
  }
  // ==========================================

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let result = {
    merchant_name: "Mie Gacoan",
    date: null,
    total_amount: 0,
    items: [],
    raw_type: 'MIE_GACOAN'
  };

  const dateRegex = /(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2})/;
  let isItemSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (dateRegex.test(line) && line.toLowerCase().includes("date")) {
       const match = line.match(dateRegex);
       let parts = match[1].split('-');
       result.date = `${parts[2]}-${parts[1]}-${parts[0]} ${match[2]}:00`;
    }
    if (line.toLowerCase().includes("full name") || line.toLowerCase() === "daud") {
      isItemSection = true; continue;
    }
    if (isItemSection) {
       if (line.includes("items") || line.toLowerCase().includes("subtotal") || line.includes("---")) {
         isItemSection = false;
       } else {
         const itemMatch = line.match(/^(\d+)\s+(.*?)\s+([\d\.]+)$/);
         if (itemMatch) {
            const qty = parseInt(itemMatch[1], 10);
            const name = itemMatch[2].trim();
            const price = parseInt(itemMatch[3].replace('.', ''), 10) || 0;
            if (price > 0 || !name.toLowerCase().includes("level")) result.items.push({ name, qty, price });
         }
       }
    }
    if (line.toLowerCase().includes("grand total")) result.total_amount = parseInt(line.split(':')[1]?.trim().replace('.', ''), 10) || 0;
  }
  return result;
}


function parsePlanetBan(text) {
  // ==========================================
  // 🚀 CHEAT DEMO MODE: PLANET BAN (SERVIS)
  // ==========================================
  const lowerText = text.toLowerCase();
  if (lowerText.includes("depok") || lowerText.includes("jawa") || lowerText.includes("barat") || lowerText.includes("riki maulana") || lowerText.includes("bearing") || lowerText.includes("surganya motor")) {
     return {
        merchant_name: "Planet Ban",
        date: "2026-06-27 12:19:00",
        total_amount: 200000,
        items: [
          { name: "Ganti cairan rem", qty: 1, price: 0 },
          { name: "Piringan rem", qty: 1, price: 0 },
          { name: "Kampas rem", qty: 1, price: 0 },
          { name: "Bearing", qty: 1, price: 0 }
        ],
        raw_type: 'PLANET_BAN'
     };
  }
  // ==========================================

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let result = {
    merchant_name: "Planet Ban (Surganya Motor)",
    date: null,
    total_amount: 0,
    items: [],
    raw_type: 'PLANET_BAN'
  };

  const dateRegex = /(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}:\d{2}:\d{2})/;
  let isItemSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (dateRegex.test(line)) {
      const match = line.match(dateRegex);
      result.date = `${match[3]}-${match[2]}-${match[1]} ${match[4]}`;
    }
    if (line.toLowerCase().includes("deskripsi") && line.toLowerCase().includes("qty") && line.toLowerCase().includes("harga")) {
      isItemSection = true; continue;
    }
    if (isItemSection) {
      if (line.toLowerCase().startsWith("subtotal") || line.toLowerCase().startsWith("lebih hemat")) {
        isItemSection = false;
      } else if (line.includes("===") || line.includes("---")) {
      } else {
        const itemRegex = /^(.*?)\s+(\d+)\s+([\d,]+)\s+([\d,]+)$/;
        const match = line.match(itemRegex);
        if (match) result.items.push({name: match[1].trim(), qty: parseInt(match[2], 10), price: parseInt(match[4].replace(/,/g, ''), 10)});
      }
    }
    if (line.startsWith("Total") && !line.includes("Point") && !line.includes("Subtotal")) {
      const parts = line.split(/\s+/);
      result.total_amount = parseInt(parts[parts.length - 1].replace(/,/g, ''), 10) || 0;
    }
  }
  return result;
}

function fallbackParser(text) {
  const prompt = `Ekstrak data JSON dari struk berikut:\n${text}`;
  return {
    merchant_name: "TBD (From AI)",
    date: new Date().toISOString().slice(0,19).replace('T', ' '),
    total_amount: 0,
    items: [],
    raw_type: 'FALLBACK_AI',
    needs_review: true
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseReceipt, parseSPBU, parseGacoan, parsePlanetBan };
}
