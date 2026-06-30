document.addEventListener('DOMContentLoaded', () => {
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const exportExcelBtn = document.getElementById('exportExcelBtn');

    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', (e) => {
            e.preventDefault();
            exportToPDF();
        });
    }

    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            exportToExcel();
        });
    }
});

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('id-ID', options);
}

function getFilteredData() {
    if (!window.currentFilteredTransactions || window.currentFilteredTransactions.length === 0) {
        return null;
    }
    return window.currentFilteredTransactions;
}

function exportToPDF() {
    const data = getFilteredData();
    if (!data) {
        alert("Tidak ada data transaksi untuk di-export.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');

    // Header
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text("Laporan Riwayat Transaksi FinStudent", 40, 40);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${formatDate(new Date())}`, 40, 55);

    // Prepare table data
    const tableColumn = ["Tanggal", "Tipe", "Kategori", "Deskripsi", "Nominal"];
    const tableRows = [];
    
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    data.forEach(t => {
        const amt = parseFloat(t.amount) || 0;
        if (t.type === 'pemasukan' || t.type === 'simpan') totalPemasukan += amt;
        if (t.type === 'pengeluaran' || t.type === 'tarik') totalPengeluaran += amt;

        const typeStr = t.type === 'pengeluaran' ? 'Pengeluaran' : (t.type === 'pemasukan' ? 'Pemasukan' : (t.type === 'simpan' ? 'Nabung' : 'Tarik Tabungan'));
        
        let catStr = t.category;
        if (t.type === 'pengeluaran') {
            catStr += ` (${t.nature === 'kebutuhan' ? 'Kebutuhan' : 'Keinginan'})`;
        }

        const transactionData = [
            formatDate(t.date),
            typeStr,
            catStr,
            t.description || "-",
            formatCurrency(amt)
        ];
        
        tableRows.push(transactionData);
    });

    const saldoBersih = totalPemasukan - totalPengeluaran;

    // Add empty row for spacing
    tableRows.push(["", "", "", "", ""]);
    
    // Add Total Rows at the bottom
    tableRows.push(["", "", "", "Total Pemasukan", formatCurrency(totalPemasukan)]);
    tableRows.push(["", "", "", "Total Pengeluaran", formatCurrency(totalPengeluaran)]);
    tableRows.push(["", "", "", "Saldo Bersih", formatCurrency(saldoBersih)]);

    // Generate table
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        theme: 'grid',
        headStyles: {
            fillColor: [98, 75, 255], // Primary color matching Dasher theme
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [248, 249, 250]
        },
        columnStyles: {
            4: { halign: 'right' } // Align nominal to right
        },
        willDrawCell: function (data) {
            // Style the total rows
            const rowIndex = data.row.index;
            const totalRowsStart = tableRows.length - 3;
            if (rowIndex >= totalRowsStart) {
                doc.setFont("helvetica", "bold");
                if (rowIndex === tableRows.length - 1) {
                    // Saldo bersih row
                    data.cell.styles.fillColor = [232, 245, 233]; // Light green
                    if (data.column.index === 4) {
                        data.cell.styles.textColor = saldoBersih >= 0 ? [16, 185, 129] : [220, 53, 69];
                    }
                }
            }
        }
    });

    const today = new Date().toISOString().split('T')[0];
    doc.save(`FinStudent_Transaksi_${today}.pdf`);
}

function exportToExcel() {
    const data = getFilteredData();
    if (!data) {
        alert("Tidak ada data transaksi untuk di-export.");
        return;
    }

    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    const excelData = data.map(t => {
        const amt = parseFloat(t.amount) || 0;
        if (t.type === 'pemasukan' || t.type === 'simpan') totalPemasukan += amt;
        if (t.type === 'pengeluaran' || t.type === 'tarik') totalPengeluaran += amt;

        const typeStr = t.type === 'pengeluaran' ? 'Pengeluaran' : (t.type === 'pemasukan' ? 'Pemasukan' : (t.type === 'simpan' ? 'Nabung' : 'Tarik Tabungan'));
        
        let catStr = t.category;
        if (t.type === 'pengeluaran') {
            catStr += ` (${t.nature === 'kebutuhan' ? 'Kebutuhan' : 'Keinginan'})`;
        }

        return {
            "Tanggal": formatDate(t.date),
            "Tipe": typeStr,
            "Kategori": catStr,
            "Deskripsi": t.description || "-",
            "Nominal": amt
        };
    });

    const saldoBersih = totalPemasukan - totalPengeluaran;

    // Add empty row
    excelData.push({ "Tanggal": "", "Tipe": "", "Kategori": "", "Deskripsi": "", "Nominal": null });
    
    // Add Total Rows
    excelData.push({ "Tanggal": "", "Tipe": "", "Kategori": "", "Deskripsi": "Total Pemasukan", "Nominal": totalPemasukan });
    excelData.push({ "Tanggal": "", "Tipe": "", "Kategori": "", "Deskripsi": "Total Pengeluaran", "Nominal": totalPengeluaran });
    excelData.push({ "Tanggal": "", "Tipe": "", "Kategori": "", "Deskripsi": "Saldo Bersih", "Nominal": saldoBersih });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Auto adjust column widths
    const colWidths = [
        { wch: 15 }, // Tanggal
        { wch: 15 }, // Tipe
        { wch: 25 }, // Kategori
        { wch: 30 }, // Deskripsi
        { wch: 15 }  // Nominal
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Transaksi");

    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `FinStudent_Transaksi_${today}.xlsx`);
}
