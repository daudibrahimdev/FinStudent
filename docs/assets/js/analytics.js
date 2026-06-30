document.addEventListener("DOMContentLoaded", () => {
    // 1. Utilities
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    // 2. Data Loading
    const allTransactions = JSON.parse(localStorage.getItem('finStudent_transactions_v2')) || [];
    // Only analyze expenses (pengeluaran)
    const expenses = allTransactions.filter(tx => tx.type === 'pengeluaran');

    // 3. State
    let currentFilter = 'this_month'; // 'all', 'this_month', 'custom_month'
    let selectedMonth = new Date().getMonth();
    let selectedYear = new Date().getFullYear();
    let filteredExpenses = [];
    let filteredAllTransactions = [];
    let activeRule = null;
    let rulePage = 1;
    let ruleChart = null;
    const ruleSummaryContainer = document.getElementById('ruleSummaryContainer');
    const ruleTransactionsContainer = document.getElementById('ruleTransactionsContainer');
    const btnBackToRuleList = document.getElementById('btnBackToRuleList');

    // View States
    let activeCategory = null;
    let activeMerchant = null;
    const ITEMS_PER_PAGE = 10;
    let categoryPage = 1;
    let merchantPage = 1;

    // Charts instances
    let categoryChart = null;
    let merchantChart = null;

    // UI Elements - Month Picker
    const mpCurrentYear = document.getElementById('mpCurrentYear');
    const mpMonthsGrid = document.getElementById('mpMonthsGrid');
    const monthPickerLabel = document.getElementById('monthPickerLabel');
    const mpPrevYear = document.getElementById('mpPrevYear');
    const mpNextYear = document.getElementById('mpNextYear');
    const mpClearBtn = document.getElementById('mpClearBtn');
    const mpThisMonthBtn = document.getElementById('mpThisMonthBtn');

    // UI Elements - Containers
    const categorySummaryContainer = document.getElementById('categorySummaryContainer');
    const categoryTransactionsContainer = document.getElementById('categoryTransactionsContainer');
    const btnBackToCategoryList = document.getElementById('btnBackToCategoryList');
    
    const merchantSummaryContainer = document.getElementById('merchantSummaryContainer');
    const merchantTransactionsContainer = document.getElementById('merchantTransactionsContainer');
    const btnBackToMerchantList = document.getElementById('btnBackToMerchantList');

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    
    const colors = ['#0d6efd', '#6610f2', '#6f42c1', '#d63384', '#dc3545', '#fd7e14', '#ffc107', '#198754', '#20c997', '#0dcaf0'];

    // ==========================================
    // INITIALIZATION & MONTH PICKER
    // ==========================================

    const initMonthPicker = () => {
        let viewYear = selectedYear;
        
        const renderMonths = () => {
            mpCurrentYear.textContent = viewYear;
            mpMonthsGrid.innerHTML = '';
            monthNames.forEach((month, index) => {
                const col = document.createElement('div');
                col.className = 'col-4 p-1';
                const isSelected = (currentFilter === 'custom_month' || currentFilter === 'this_month') && index === selectedMonth && viewYear === selectedYear;
                col.innerHTML = `<button type="button" class="btn btn-sm w-100 ${isSelected ? 'btn-primary text-white' : 'btn-light '} mp-month-btn" data-month="${index}">${month}</button>`;
                mpMonthsGrid.appendChild(col);
            });
        };

        mpMonthsGrid.addEventListener('click', (e) => {
            if(e.target.classList.contains('mp-month-btn')) {
                selectedMonth = parseInt(e.target.getAttribute('data-month'));
                selectedYear = viewYear;
                currentFilter = 'custom_month';
                applyFilter();
                // Close dropdown
                const dropdownEl = document.getElementById('monthPickerDropdownBtn');
                const dropdown = bootstrap.Dropdown.getInstance(dropdownEl);
                if (dropdown) dropdown.hide();
            }
        });

        mpPrevYear.addEventListener('click', (e) => {
            e.stopPropagation();
            viewYear--;
            renderMonths();
        });

        mpNextYear.addEventListener('click', (e) => {
            e.stopPropagation();
            viewYear++;
            renderMonths();
        });

        mpClearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentFilter = 'all';
            applyFilter();
            const dropdown = bootstrap.Dropdown.getInstance(document.getElementById('monthPickerDropdownBtn'));
            if (dropdown) dropdown.hide();
        });

        mpThisMonthBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const now = new Date();
            selectedMonth = now.getMonth();
            selectedYear = now.getFullYear();
            viewYear = selectedYear;
            currentFilter = 'this_month';
            applyFilter();
            const dropdown = bootstrap.Dropdown.getInstance(document.getElementById('monthPickerDropdownBtn'));
            if (dropdown) dropdown.hide();
        });
        
        // Fix for dropdown closing when clicking inside
        document.querySelector('.dropdown-menu').addEventListener('click', function (e) {
            e.stopPropagation();
        });

        renderMonths();
    };

    const applyFilter = () => {
        if (currentFilter === 'all') {
            filteredExpenses = [...expenses];
            filteredAllTransactions = [...allTransactions];
            monthPickerLabel.textContent = "Semua Waktu";
        } else {
            // this_month or custom_month
            filteredExpenses = expenses.filter(tx => {
                const date = new Date(tx.date);
                return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
            });
            filteredAllTransactions = allTransactions.filter(tx => {
                const date = new Date(tx.date);
                return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
            });
            monthPickerLabel.textContent = `${monthNames[selectedMonth]} ${selectedYear}`;
        }
        
        // Re-render picker to highlight active
        initMonthPicker();
        
        // Reset Views
        resetCategoryView();
        resetMerchantView();
        resetRuleView();
        
        // Process & Render
        processAndRenderKategori();
        processAndRenderMerchant();
        processAndRenderRule();
    };

    // ==========================================
    // KATEGORI LOGIC
    // ==========================================
    
    const resetCategoryView = () => {
        activeCategory = null;
        categoryPage = 1;
        categorySummaryContainer.style.display = 'block';
        categoryTransactionsContainer.style.display = 'none';
        btnBackToCategoryList.style.display = 'none';
        if(categoryChart) {
            // Reset selection visually if possible
        }
    };

    const processAndRenderKategori = () => {
        // Group by category
        const catMap = {};
        let totalExpenses = 0;
        
        filteredExpenses.forEach(tx => {
            const cat = tx.category || 'Lainnya';
            if(!catMap[cat]) catMap[cat] = 0;
            catMap[cat] += parseFloat(tx.amount || 0);
            totalExpenses += parseFloat(tx.amount || 0);
        });

        // Sort by amount descending
        const sortedCats = Object.keys(catMap).map(cat => ({
            name: cat,
            amount: catMap[cat],
            percentage: totalExpenses > 0 ? (catMap[cat] / totalExpenses) * 100 : 0
        })).sort((a, b) => b.amount - a.amount);

        renderCategoryChart(sortedCats, totalExpenses);
        renderCategoryCards(sortedCats, totalExpenses);
        
        // Also update chart title center initially
        updateChartCenter('categoryDonutChart', 'Pengeluaran', totalExpenses);
    };

    const renderCategoryChart = (data, totalAmount) => {
        const chartElement = document.querySelector("#categoryDonutChart");
        chartElement.innerHTML = ''; // Clear previous

        if(data.length === 0) {
            chartElement.innerHTML = '<div class="d-flex h-100 justify-content-center align-items-center text-muted py-5">Tidak ada data pengeluaran.</div>';
            return;
        }

        const series = data.map(item => item.amount);
        const labels = data.map(item => item.name);

        const options = {
            series: series,
            labels: labels,
            chart: {
                type: 'donut',
                height: 350,
                background: 'transparent',
                fontFamily: 'inherit',
                events: {
                    dataPointSelection: (event, chartContext, config) => {
                        const selectedIdx = config.dataPointIndex;
                        if(selectedIdx >= 0) {
                            const catName = labels[selectedIdx];
                            showCategoryTransactions(catName);
                        }
                    }
                }
            },
            colors: colors,
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                color: 'var(--ds-gray-600)',
                                offsetY: -10
                            },
                            value: {
                                show: true,
                                fontSize: '20px',
                                fontFamily: 'inherit',
                                fontWeight: 700,
                                color: 'var(--ds-heading-color)',
                                formatter: function (val) {
                                    return formatCurrency(val);
                                }
                            },
                            total: {
                                show: true,
                                showAlways: true,
                                label: 'Pengeluaran',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                color: 'var(--ds-gray-600)',
                                formatter: function (w) {
                                    return formatCurrency(totalAmount);
                                }
                            }
                        }
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return Math.round(val) + "%";
                },
                dropShadow: { enabled: false }
            },
            legend: {
                show: true,
                position: 'bottom',
                horizontalAlign: 'center',
                floating: false,
                fontSize: '13px',
                fontFamily: 'inherit',
                markers: { radius: 12 },
                itemMargin: { horizontal: 10, vertical: 5 }
            },
            stroke: { show: true, colors: 'transparent', width: 2 },
            theme: {
                mode: document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light'
            }
        };

        categoryChart = new ApexCharts(chartElement, options);
        categoryChart.render();
    };
    
    // Custom function to update the center text of donut chart manually if needed
    const updateChartCenter = (chartId, label, amount) => {
        // We can just rely on the chart rendering or update options
        if(chartId === 'categoryDonutChart' && categoryChart) {
             // Instead of updating the whole chart, we will just let it be, 
             // but if we want to change the total label:
             // It's tricky to update just the total label without re-rendering, so we'll leave the chart's built-in total.
        }
    };

    const renderCategoryCards = (data, totalAmount) => {
        const listContainer = document.getElementById('categoryCardsList');
        listContainer.innerHTML = '';
        
        if(data.length === 0) return;

        data.forEach((item, index) => {
            const color = colors[index % colors.length];
            const col = document.createElement('div');
            col.className = 'col-12 col-md-6';
            col.innerHTML = `
                <div class="card border shadow-none rounded-4 cursor-pointer hover-lift h-100 category-card" data-category="${item.name}" style="transition: all 0.2s;">
                    <div class="card-body p-3 d-flex align-items-center gap-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 45px; height: 45px; background-color: ${color}20; color: ${color};">
                            <i class="ti ti-receipt fs-4"></i>
                        </div>
                        <div class="flex-grow-1 min-w-0">
                            <h6 class="mb-1 fw-bold text-truncate ">${item.name}</h6>
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge rounded-pill text-bg-light fs-xs fw-semibold" style="color: ${color} !important;">${Math.round(item.percentage)}%</span>
                                <span class="text-muted small fw-medium text-truncate">${formatCurrency(item.amount)}</span>
                            </div>
                        </div>
                        <i class="ti ti-chevron-right text-muted"></i>
                    </div>
                </div>
            `;
            listContainer.appendChild(col);
        });

        // Add click events to cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', function() {
                const catName = this.getAttribute('data-category');
                showCategoryTransactions(catName);
            });
        });
    };

    const showCategoryTransactions = (categoryName) => {
        activeCategory = categoryName;
        categoryPage = 1;
        
        categorySummaryContainer.style.display = 'none';
        categoryTransactionsContainer.style.display = 'block';
        btnBackToCategoryList.style.display = 'inline-flex';
        
        document.getElementById('categoryTransactionsTitle').textContent = `Transaksi: ${categoryName}`;
        
        renderCategoryTransactionsList();
        
        // Scroll slightly to the transactions
        categoryTransactionsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const renderCategoryTransactionsList = () => {
        const txList = document.getElementById('categoryTransactionsList');
        const pagination = document.getElementById('categoryPagination');
        
        const filteredTxs = filteredExpenses.filter(tx => (tx.category || 'Lainnya') === activeCategory)
                                            .sort((a,b) => new Date(b.date) - new Date(a.date));
                                            
        // Pagination logic
        const totalItems = filteredTxs.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        
        if (categoryPage > totalPages && totalPages > 0) categoryPage = totalPages;
        
        const startIndex = (categoryPage - 1) * ITEMS_PER_PAGE;
        const paginatedTxs = filteredTxs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        
        // Render List
        txList.innerHTML = '';
        if(paginatedTxs.length === 0) {
            txList.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-muted">Tidak ada transaksi.</td></tr>';
        } else {
            paginatedTxs.forEach(tx => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="ps-4">
                        <div class="fw-medium ">${formatDate(tx.date)}</div>
                    </td>
                    <td>
                        <div class="fw-medium  text-truncate" style="max-width: 200px;">${tx.description || '-'}</div>
                        ${tx.merchant ? `<div class="small text-muted"><i class="ti ti-building-store me-1"></i>${tx.merchant}</div>` : ''}
                    </td>
                    <td class="fw-bold text-danger">
                        -${formatCurrency(tx.amount)}
                    </td>
                `;
                txList.appendChild(tr);
            });
        }
        
        // Render Pagination
        pagination.innerHTML = '';
        if (totalPages > 1) {
            // Prev
            pagination.innerHTML += `<li class="page-item ${categoryPage === 1 ? 'disabled' : ''}"><a class="page-link cat-page-btn" href="#" data-page="${categoryPage - 1}"><i class="ti ti-chevron-left"></i></a></li>`;
            
            // Pages
            for(let i=1; i<=totalPages; i++) {
                if(i === 1 || i === totalPages || (i >= categoryPage - 1 && i <= categoryPage + 1)) {
                    pagination.innerHTML += `<li class="page-item ${categoryPage === i ? 'active' : ''}"><a class="page-link cat-page-btn" href="#" data-page="${i}">${i}</a></li>`;
                } else if(i === categoryPage - 2 || i === categoryPage + 2) {
                    pagination.innerHTML += `<li class="page-item disabled"><a class="page-link" href="#">...</a></li>`;
                }
            }
            
            // Next
            pagination.innerHTML += `<li class="page-item ${categoryPage === totalPages ? 'disabled' : ''}"><a class="page-link cat-page-btn" href="#" data-page="${categoryPage + 1}"><i class="ti ti-chevron-right"></i></a></li>`;
            
            // Add events
            document.querySelectorAll('.cat-page-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    categoryPage = parseInt(e.currentTarget.getAttribute('data-page'));
                    renderCategoryTransactionsList();
                });
            });
        }
    };

    btnBackToCategoryList.addEventListener('click', (e) => {
        e.preventDefault();
        resetCategoryView();
    });


    // ==========================================
    // MERCHANT LOGIC
    // ==========================================
    
    const resetMerchantView = () => {
        activeMerchant = null;
        merchantPage = 1;
        merchantSummaryContainer.style.display = 'block';
        merchantTransactionsContainer.style.display = 'none';
        btnBackToMerchantList.style.display = 'none';
    };

    const processAndRenderMerchant = () => {
        // Group by merchant (case insensitive)
        const merchMap = {};
        let totalMerchExpenses = 0;
        
        filteredExpenses.forEach(tx => {
            if(tx.merchant && tx.merchant.trim() !== '') {
                // normalize name
                const rawName = tx.merchant.trim();
                // capitalize first letter of each word for display, but group by lower
                const normalized = rawName.toLowerCase();
                
                if(!merchMap[normalized]) {
                    merchMap[normalized] = {
                        name: rawName, // Keep original casing of first encountered
                        amount: 0
                    };
                }
                merchMap[normalized].amount += parseFloat(tx.amount || 0);
                totalMerchExpenses += parseFloat(tx.amount || 0);
            }
        });

        // Sort by amount descending
        const sortedMerchants = Object.values(merchMap).map(item => ({
            name: item.name, // The display name
            normalized: item.name.toLowerCase(),
            amount: item.amount,
            percentage: totalMerchExpenses > 0 ? (item.amount / totalMerchExpenses) * 100 : 0
        })).sort((a, b) => b.amount - a.amount);

        // Keep Top 10 for Chart, group rest to "Lainnya"
        let chartData = [];
        if(sortedMerchants.length > 10) {
            chartData = sortedMerchants.slice(0, 9);
            let otherAmount = sortedMerchants.slice(9).reduce((sum, item) => sum + item.amount, 0);
            chartData.push({
                name: 'Merchant Lainnya',
                normalized: 'merchant lainnya',
                amount: otherAmount,
                percentage: (otherAmount / totalMerchExpenses) * 100
            });
        } else {
            chartData = sortedMerchants;
        }

        renderMerchantChart(chartData, totalMerchExpenses);
        renderMerchantCards(sortedMerchants, totalMerchExpenses);
    };

    const renderMerchantChart = (data, totalAmount) => {
        const chartElement = document.querySelector("#merchantDonutChart");
        chartElement.innerHTML = ''; // Clear previous

        if(data.length === 0) {
            chartElement.innerHTML = '<div class="d-flex h-100 justify-content-center align-items-center text-muted py-5">Tidak ada data merchant tercatat.</div>';
            return;
        }

        const series = data.map(item => item.amount);
        const labels = data.map(item => item.name);

        const options = {
            series: series,
            labels: labels,
            chart: {
                type: 'donut',
                height: 350,
                background: 'transparent',
                fontFamily: 'inherit',
                events: {
                    dataPointSelection: (event, chartContext, config) => {
                        const selectedIdx = config.dataPointIndex;
                        if(selectedIdx >= 0) {
                            const merchName = labels[selectedIdx];
                            // Handle if it's the grouped "Merchant Lainnya"
                            if(merchName === 'Merchant Lainnya') return; 
                            showMerchantTransactions(merchName);
                        }
                    }
                }
            },
            colors: colors.slice().reverse(), // different color order
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                color: 'var(--ds-gray-600)',
                                offsetY: -10
                            },
                            value: {
                                show: true,
                                fontSize: '20px',
                                fontFamily: 'inherit',
                                fontWeight: 700,
                                color: 'var(--ds-heading-color)',
                                formatter: function (val) {
                                    return formatCurrency(val);
                                }
                            },
                            total: {
                                show: true,
                                showAlways: true,
                                label: 'Total di Merchant',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                color: 'var(--ds-gray-600)',
                                formatter: function (w) {
                                    return formatCurrency(totalAmount);
                                }
                            }
                        }
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return Math.round(val) + "%";
                },
                dropShadow: { enabled: false }
            },
            legend: {
                show: true,
                position: 'bottom',
                horizontalAlign: 'center',
                floating: false,
                fontSize: '13px',
                fontFamily: 'inherit',
                markers: { radius: 12 },
                itemMargin: { horizontal: 10, vertical: 5 }
            },
            stroke: { show: true, colors: 'transparent', width: 2 },
            theme: {
                mode: document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light'
            }
        };

        merchantChart = new ApexCharts(chartElement, options);
        merchantChart.render();
    };

    const renderMerchantCards = (data, totalAmount) => {
        const listContainer = document.getElementById('merchantCardsList');
        listContainer.innerHTML = '';
        
        if(data.length === 0) return;

        data.forEach((item, index) => {
            const color = colors.slice().reverse()[index % colors.length];
            const col = document.createElement('div');
            col.className = 'col-12 col-md-6';
            col.innerHTML = `
                <div class="card border shadow-none rounded-4 cursor-pointer hover-lift h-100 merchant-card" data-merchant="${item.normalized}" data-raw-merchant="${item.name}" style="transition: all 0.2s;">
                    <div class="card-body p-3 d-flex align-items-center gap-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 45px; height: 45px; background-color: ${color}20; color: ${color};">
                            <i class="ti ti-building-store fs-4"></i>
                        </div>
                        <div class="flex-grow-1 min-w-0">
                            <h6 class="mb-1 fw-bold text-truncate ">${item.name}</h6>
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge rounded-pill text-bg-light fs-xs fw-semibold" style="color: ${color} !important;">${Math.round(item.percentage)}%</span>
                                <span class="text-muted small fw-medium text-truncate">${formatCurrency(item.amount)}</span>
                            </div>
                        </div>
                        <i class="ti ti-chevron-right text-muted"></i>
                    </div>
                </div>
            `;
            listContainer.appendChild(col);
        });

        // Add click events to cards
        document.querySelectorAll('.merchant-card').forEach(card => {
            card.addEventListener('click', function() {
                const merchNormalized = this.getAttribute('data-merchant');
                const rawName = this.getAttribute('data-raw-merchant');
                showMerchantTransactions(rawName, merchNormalized);
            });
        });
    };

    const showMerchantTransactions = (merchantName, normalizedName = merchantName.toLowerCase()) => {
        activeMerchant = normalizedName; // Filter by lower
        merchantPage = 1;
        
        merchantSummaryContainer.style.display = 'none';
        merchantTransactionsContainer.style.display = 'block';
        btnBackToMerchantList.style.display = 'inline-flex';
        
        document.getElementById('merchantTransactionsTitle').textContent = `Transaksi: ${merchantName}`;
        
        renderMerchantTransactionsList();
        
        merchantTransactionsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const renderMerchantTransactionsList = () => {
        const txList = document.getElementById('merchantTransactionsList');
        const pagination = document.getElementById('merchantPagination');
        
        const filteredTxs = filteredExpenses.filter(tx => tx.merchant && tx.merchant.toLowerCase() === activeMerchant)
                                            .sort((a,b) => new Date(b.date) - new Date(a.date));
                                            
        // Pagination logic
        const totalItems = filteredTxs.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        
        if (merchantPage > totalPages && totalPages > 0) merchantPage = totalPages;
        
        const startIndex = (merchantPage - 1) * ITEMS_PER_PAGE;
        const paginatedTxs = filteredTxs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        
        // Render List
        txList.innerHTML = '';
        if(paginatedTxs.length === 0) {
            txList.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-muted">Tidak ada transaksi.</td></tr>';
        } else {
            paginatedTxs.forEach(tx => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="ps-4">
                        <div class="fw-medium ">${formatDate(tx.date)}</div>
                    </td>
                    <td>
                        <div class="fw-medium  text-truncate" style="max-width: 200px;">${tx.description || '-'}</div>
                        <div class="small text-muted"><i class="ti ti-tags me-1"></i>${tx.category || 'Lainnya'}</div>
                    </td>
                    <td class="fw-bold text-danger">
                        -${formatCurrency(tx.amount)}
                    </td>
                `;
                txList.appendChild(tr);
            });
        }
        
        // Render Pagination
        pagination.innerHTML = '';
        if (totalPages > 1) {
            pagination.innerHTML += `<li class="page-item ${merchantPage === 1 ? 'disabled' : ''}"><a class="page-link merch-page-btn" href="#" data-page="${merchantPage - 1}"><i class="ti ti-chevron-left"></i></a></li>`;
            
            for(let i=1; i<=totalPages; i++) {
                if(i === 1 || i === totalPages || (i >= merchantPage - 1 && i <= merchantPage + 1)) {
                    pagination.innerHTML += `<li class="page-item ${merchantPage === i ? 'active' : ''}"><a class="page-link merch-page-btn" href="#" data-page="${i}">${i}</a></li>`;
                } else if(i === merchantPage - 2 || i === merchantPage + 2) {
                    pagination.innerHTML += `<li class="page-item disabled"><a class="page-link" href="#">...</a></li>`;
                }
            }
            
            pagination.innerHTML += `<li class="page-item ${merchantPage === totalPages ? 'disabled' : ''}"><a class="page-link merch-page-btn" href="#" data-page="${merchantPage + 1}"><i class="ti ti-chevron-right"></i></a></li>`;
            
            document.querySelectorAll('.merch-page-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    merchantPage = parseInt(e.currentTarget.getAttribute('data-page'));
                    renderMerchantTransactionsList();
                });
            });
        }
    };

    btnBackToMerchantList.addEventListener('click', (e) => {
        e.preventDefault();
        resetMerchantView();
    });
    
    // Tab Changes - Re-render charts to fix width issues if any
    document.getElementById('merchant-tab').addEventListener('shown.bs.tab', function (e) {
        if(merchantChart) {
            // small delay to ensure DOM is visible
            setTimeout(() => merchantChart.windowResize(), 10);
        }
    });
    document.getElementById('rule-tab').addEventListener('shown.bs.tab', function (e) {
        if(ruleChart) {
            setTimeout(() => ruleChart.windowResize(), 10);
        }
    });
    document.getElementById('kategori-tab').addEventListener('shown.bs.tab', function (e) {
        if(categoryChart) {
            setTimeout(() => categoryChart.windowResize(), 10);
        }
    });

    
    // ==========================================
    // RULE 50/30/20 LOGIC
    // ==========================================
    
    const resetRuleView = () => {
        activeRule = null;
        rulePage = 1;
        ruleSummaryContainer.style.display = 'block';
        ruleTransactionsContainer.style.display = 'none';
        btnBackToRuleList.style.display = 'none';
    };

    const processAndRenderRule = () => {
        let kebutuhan = 0;
        let keinginan = 0;
        let tabungan = 0;
        let total = 0;

        filteredAllTransactions.forEach(tx => {
            const amt = parseFloat(tx.amount || 0);
            if (tx.type === 'pengeluaran') {
                if (tx.nature === 'keinginan') {
                    keinginan += amt;
                    total += amt;
                } else {
                    kebutuhan += amt;
                    total += amt;
                }
            } else if (tx.type === 'simpan') {
                tabungan += amt;
                total += amt;
            }
        });

        const data = [
            { name: 'Kebutuhan', amount: kebutuhan, percentage: total > 0 ? (kebutuhan/total)*100 : 0, color: '#624bff', id: 'kebutuhan' },
            { name: 'Keinginan', amount: keinginan, percentage: total > 0 ? (keinginan/total)*100 : 0, color: '#f59e0b', id: 'keinginan' },
            { name: 'Tabungan', amount: tabungan, percentage: total > 0 ? (tabungan/total)*100 : 0, color: '#10b981', id: 'simpan' }
        ];

        renderRuleChart(data, total);
        renderRuleCards(data);
    };

    const renderRuleChart = (data, totalAmount) => {
        const chartElement = document.querySelector("#ruleDonutChart");
        chartElement.innerHTML = ''; 

        if(totalAmount === 0) {
            chartElement.innerHTML = '<div class="d-flex h-100 justify-content-center align-items-center text-muted py-5">Tidak ada data untuk Rule 50/30/20.</div>';
            return;
        }

        const series = data.map(item => item.amount);
        const labels = data.map(item => item.name);
        const chartColors = data.map(item => item.color);

        const options = {
            series: series,
            labels: labels,
            chart: {
                type: 'donut',
                height: 350,
                background: 'transparent',
                events: {
                    dataPointSelection: (event, chartContext, config) => {
                        const selectedIdx = config.dataPointIndex;
                        if(selectedIdx >= 0) {
                            showRuleTransactions(data[selectedIdx].id, data[selectedIdx].name);
                        }
                    }
                }
            },
            colors: chartColors,
            plotOptions: {
                pie: { donut: { size: '75%', labels: { show: true, name: { show: true, fontSize: '14px', fontFamily: 'inherit', color: undefined, offsetY: -10 }, value: { show: true, fontSize: '20px', fontFamily: 'inherit', fontWeight: 700, color: undefined, formatter: function (val) { return formatCurrency(val); } }, total: { show: true, showAlways: true, label: 'Total Alokasi', fontSize: '14px', fontFamily: 'inherit', color: undefined, formatter: function (w) { return formatCurrency(totalAmount); } } } } }
            },
            dataLabels: { enabled: true, formatter: function (val) { return Math.round(val) + "%"; }, dropShadow: { enabled: false } },
            legend: { show: true, position: 'bottom', horizontalAlign: 'center', fontSize: '13px', fontFamily: 'inherit', markers: { radius: 12 }, itemMargin: { horizontal: 10, vertical: 5 } },
            stroke: { show: true, colors: 'transparent', width: 2 },
            theme: { mode: document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light' }
        };

        ruleChart = new ApexCharts(chartElement, options);
        ruleChart.render();
    };

    const renderRuleCards = (data) => {
        const listContainer = document.getElementById('ruleCardsList');
        listContainer.innerHTML = '';
        
        data.forEach((item) => {
            const col = document.createElement('div');
            col.className = 'col-12 col-md-4';
            col.innerHTML = `
                <div class="card border shadow-none rounded-4 cursor-pointer hover-lift h-100 rule-card" data-rule="${item.id}" data-name="${item.name}">
                    <div class="card-body p-3 d-flex align-items-center gap-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 45px; height: 45px; background-color: ${item.color}20; color: ${item.color};">
                            <i class="ti ${item.id === 'simpan' ? 'ti-pig-money' : item.id === 'kebutuhan' ? 'ti-home' : 'ti-star'} fs-4"></i>
                        </div>
                        <div class="flex-grow-1 min-w-0">
                            <h6 class="mb-1 fw-bold text-truncate">${item.name}</h6>
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge rounded-pill text-bg-light fs-xs fw-semibold" style="color: ${item.color} !important;">${Math.round(item.percentage)}%</span>
                                <span class="text-muted small fw-medium text-truncate">${formatCurrency(item.amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            listContainer.appendChild(col);
        });

        document.querySelectorAll('.rule-card').forEach(card => {
            card.addEventListener('click', function() {
                showRuleTransactions(this.getAttribute('data-rule'), this.getAttribute('data-name'));
            });
        });
    };

    const showRuleTransactions = (ruleId, ruleName) => {
        activeRule = ruleId; 
        rulePage = 1;
        
        ruleSummaryContainer.style.display = 'none';
        ruleTransactionsContainer.style.display = 'block';
        btnBackToRuleList.style.display = 'inline-flex';
        
        document.getElementById('ruleTransactionsTitle').textContent = `Transaksi: ${ruleName}`;
        
        renderRuleTransactionsList();
        ruleTransactionsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    const renderRuleTransactionsList = () => {
        const txList = document.getElementById('ruleTransactionsList');
        const pagination = document.getElementById('rulePagination');
        
        const filteredTxs = filteredAllTransactions.filter(tx => {
            if (activeRule === 'simpan') return tx.type === 'simpan';
            if (activeRule === 'kebutuhan') return tx.type === 'pengeluaran' && tx.nature !== 'keinginan';
            if (activeRule === 'keinginan') return tx.type === 'pengeluaran' && tx.nature === 'keinginan';
            return false;
        }).sort((a,b) => new Date(b.date) - new Date(a.date));
                                            
        const totalItems = filteredTxs.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        
        if (rulePage > totalPages && totalPages > 0) rulePage = totalPages;
        
        const startIndex = (rulePage - 1) * ITEMS_PER_PAGE;
        const paginatedTxs = filteredTxs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        
        txList.innerHTML = '';
        if(paginatedTxs.length === 0) {
            txList.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-muted">Tidak ada transaksi.</td></tr>';
        } else {
            paginatedTxs.forEach(tx => {
                const isSaving = tx.type === 'simpan';
                txList.innerHTML += `
                    <tr>
                        <td class="ps-4"><div class="fw-medium">${formatDate(tx.date)}</div></td>
                        <td>
                            <div class="fw-medium text-truncate" style="max-width: 200px;">${tx.description || '-'}</div>
                            <div class="small text-muted"><i class="ti ${isSaving ? 'ti-pig-money' : 'ti-tags'} me-1"></i>${isSaving ? 'Tabungan' : (tx.category || 'Lainnya')}</div>
                        </td>
                        <td class="fw-bold ${isSaving ? 'text-success' : 'text-danger'}">
                            ${isSaving ? '+' : '-'}${formatCurrency(tx.amount)}
                        </td>
                    </tr>
                `;
            });
        }
        
        pagination.innerHTML = '';
        if (totalPages > 1) {
            pagination.innerHTML += `<li class="page-item ${rulePage === 1 ? 'disabled' : ''}"><a class="page-link rule-page-btn" href="#" data-page="${rulePage - 1}"><i class="ti ti-chevron-left"></i></a></li>`;
            for(let i=1; i<=totalPages; i++) {
                if(i === 1 || i === totalPages || (i >= rulePage - 1 && i <= rulePage + 1)) {
                    pagination.innerHTML += `<li class="page-item ${rulePage === i ? 'active' : ''}"><a class="page-link rule-page-btn" href="#" data-page="${i}">${i}</a></li>`;
                } else if(i === rulePage - 2 || i === rulePage + 2) {
                    pagination.innerHTML += `<li class="page-item disabled"><a class="page-link" href="#">...</a></li>`;
                }
            }
            pagination.innerHTML += `<li class="page-item ${rulePage === totalPages ? 'disabled' : ''}"><a class="page-link rule-page-btn" href="#" data-page="${rulePage + 1}"><i class="ti ti-chevron-right"></i></a></li>`;
            
            document.querySelectorAll('.rule-page-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    rulePage = parseInt(e.currentTarget.getAttribute('data-page'));
                    renderRuleTransactionsList();
                });
            });
        }
    };

    btnBackToRuleList.addEventListener('click', (e) => {
        e.preventDefault();
        resetRuleView();
    });

    // Run Initializer

    initMonthPicker();
    applyFilter();

});
