// GLOBAL VARIABLES
let products = JSON.parse(localStorage.getItem('crackersProducts')) || [];
let billingItems = [];
let serialNumber = 1;
let previewData = [];
let selectedSuggestionIndex = -1;
let billHistory = JSON.parse(localStorage.getItem('billHistory')) || [];
let currentEditingBill = null;

// TAB SWITCHING FUNCTIONALITY
function switchTab(tabName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

// IMPORT DIALOG FUNCTIONS
function showImportDialog() {
    document.getElementById('importDialog').style.display = 'block';
}

function hideImportDialog() {
    document.getElementById('importDialog').style.display = 'none';
    cancelImport();
}

// DRAG AND DROP FUNCTIONALITY
document.addEventListener('DOMContentLoaded', function() {
    const fileUploadArea = document.querySelector('.file-upload-area');
    
    if (fileUploadArea) {
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('dragover');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload({ target: { files: files } });
            }
        });
    }
});

// FILE UPLOAD HANDLER - Enhanced
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        alert('❌ Please upload a PDF or image file (JPG, PNG)');
        return;
    }

    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('previewContainer').style.display = 'none';

    // Process file based on type
    if (file.type === 'application/pdf') {
        processPDFFile(file);
    } else {
        processImageFile(file);
    }
}

// Enhanced file input trigger
function triggerFileInput() {
    document.getElementById('fileInput').click();
}

// PDF PROCESSING (Simulated - Ready for PDF.js integration)
function processPDFFile(file) {
    // SIMULATION: In real implementation, use PDF.js library
    // TODO: Integrate PDF.js for actual PDF text extraction
    setTimeout(() => {
        const simulatedPDFText = `
        Atom Bomb | 150 | 10
        Bullet Bomb | 200 | 5
        Chocolate Bomb | 100 | 20
        Diwali Special | 300 | 15
        Electric Crackers | 250 | 8
        Flower Pots | 80 | 25
        Ground Chakkar | 50 | 50
        `;
        
        parseExtractedText(simulatedPDFText);
    }, 2000);
}

// IMAGE PROCESSING (Simulated OCR - Ready for Tesseract.js integration)
function processImageFile(file) {
    // SIMULATION: In real implementation, use Tesseract.js for OCR
    // TODO: Integrate Tesseract.js for actual OCR processing
    setTimeout(() => {
        const simulatedOCRText = `
        Hydrogen Bomb | 400 | 3
        Indian Crackers | 180 | 12
        Jadi Buti | 120 | 30
        King of Kings | 500 | 2
        Laxmi Bomb | 220 | 6
        Magic Crackers | 160 | 18
        `;
        
        parseExtractedText(simulatedOCRText);
    }, 3000);
}

// PARSE EXTRACTED TEXT
function parseExtractedText(text) {
    const lines = text.split('\n').filter(line => line.trim());
    previewData = [];

    lines.forEach(line => {
        // Expected format: "Product Name | Rate | Pieces"
        const parts = line.split('|').map(part => part.trim());
        
        if (parts.length === 3) {
            const name = parts[0];
            const rate = parseFloat(parts[1]);
            const pieces = parseInt(parts[2]);
            
            // Validate data
            if (name && rate > 0 && pieces > 0) {
                previewData.push({
                    name: name,
                    mrp: rate,
                    pieces: pieces
                });
            }
        }
    });

    // Hide loading and show preview
    document.getElementById('loadingIndicator').style.display = 'none';
    
    if (previewData.length > 0) {
        showPreview();
    } else {
        alert('❌ No valid product data found in the file.\n\n📋 Please ensure the format is:\nProduct Name | Rate | Pieces');
    }
}

// SHOW PREVIEW TABLE
function showPreview() {
    const tbody = document.getElementById('previewTableBody');
    tbody.innerHTML = previewData.map((product, index) => `
        <tr>
            <td><input type="text" value="${product.name}" onchange="updatePreviewData(${index}, 'name', this.value)"></td>
            <td><input type="number" value="${product.mrp}" min="1" step="0.01" onchange="updatePreviewData(${index}, 'mrp', this.value)"></td>
            <td><input type="number" value="${product.pieces}" min="1" onchange="updatePreviewData(${index}, 'pieces', this.value)"></td>
            <td><button class="btn btn-danger" onclick="removePreviewItem(${index})">🗑️ Remove</button></td>
        </tr>
    `).join('');

    document.getElementById('previewContainer').style.display = 'block';
}

// UPDATE PREVIEW DATA
function updatePreviewData(index, field, value) {
    if (field === 'mrp') {
        previewData[index][field] = parseFloat(value);
    } else if (field === 'pieces') {
        previewData[index][field] = parseInt(value);
    } else {
        previewData[index][field] = value;
    }
}

// REMOVE PREVIEW ITEM
function removePreviewItem(index) {
    previewData.splice(index, 1);
    showPreview();
}

// CONFIRM IMPORT
function confirmImport() {
    let importedCount = 0;
    let duplicateCount = 0;

    previewData.forEach(product => {
        // Check for duplicates
        const exists = products.some(p => p.name.toLowerCase() === product.name.toLowerCase());
        
        if (!exists && product.name && product.mrp > 0 && product.pieces > 0) {
            products.push({
                id: Date.now() + Math.random(),
                name: product.name,
                mrp: product.mrp,
                pieces: product.pieces
            });
            importedCount++;
        } else if (exists) {
            duplicateCount++;
        }
    });

    // Save to localStorage
    saveProducts();
    displayProducts();

    // Show success message
    let message = `✅ Successfully imported ${importedCount} products!`;
    if (duplicateCount > 0) {
        message += `\n⚠️ ${duplicateCount} duplicates were skipped.`;
    }
    alert(message);

    // Reset import
    cancelImport();
    hideImportDialog();
}

// CANCEL IMPORT
function cancelImport() {
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('loadingIndicator').style.display = 'none';
    document.getElementById('fileInput').value = '';
    previewData = [];
}

// PRODUCT MANAGEMENT FUNCTIONS

// Add Product
document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName').value.trim();
    const mrp = parseFloat(document.getElementById('productMRP').value);
    const pieces = parseInt(document.getElementById('productPieces').value);
    
    // Validation
    if (!name || mrp <= 0 || pieces <= 0) {
        alert('❌ Please fill all fields with valid values');
        return;
    }
    
    // Check if product already exists
    if (products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        alert('⚠️ Product with this name already exists');
        return;
    }
    
    // Add product
    const product = {
        id: Date.now(),
        name: name,
        mrp: mrp,
        pieces: pieces
    };
    
    products.push(product);
    saveProducts();
    displayProducts();
    clearProductForm();
    
    alert('✅ Product added successfully!');
});

// Save products to localStorage
function saveProducts() {
    localStorage.setItem('crackersProducts', JSON.stringify(products));
}

// Display products in table
function displayProducts(filteredProducts = null) {
    const tbody = document.getElementById('productsTableBody');
    const productsToShow = filteredProducts || products;
    
    if (productsToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #666; padding: 2rem;">📦 No products found</td></tr>';
        return;
    }
    
    tbody.innerHTML = productsToShow.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>₹${product.mrp}</td>
            <td>${product.pieces}</td>
            <td class="action-buttons">
                <button class="btn btn-warning" onclick="editProduct(${product.id})">✏️ Edit</button>
                <button class="btn btn-danger" onclick="deleteProduct(${product.id})">🗑️ Delete</button>
            </td>
        </tr>
    `).join('');
}

// Search products
function searchProducts() {
    const query = document.getElementById('productSearch').value.toLowerCase();
    const filtered = products.filter(product => 
        product.name.toLowerCase().includes(query)
    );
    displayProducts(filtered);
}

// Edit product
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newName = prompt('✏️ Enter new name:', product.name);
    if (!newName || newName.trim() === '') return;
    
    const newMRP = prompt('💰 Enter new MRP:', product.mrp);
    if (!newMRP || parseFloat(newMRP) <= 0) return;
    
    const newPieces = prompt('📦 Enter new pieces per box:', product.pieces);
    if (!newPieces || parseInt(newPieces) <= 0) return;
    
    // Check if new name conflicts with existing products
    if (newName.toLowerCase() !== product.name.toLowerCase() && 
        products.some(p => p.name.toLowerCase() === newName.toLowerCase())) {
        alert('⚠️ Product with this name already exists');
        return;
    }
    
    product.name = newName.trim();
    product.mrp = parseFloat(newMRP);
    product.pieces = parseInt(newPieces);
    
    saveProducts();
    displayProducts();
    alert('✅ Product updated successfully!');
}

// Delete product
function deleteProduct(id) {
    if (!confirm('🗑️ Are you sure you want to delete this product?')) return;
    
    products = products.filter(p => p.id !== id);
    saveProducts();
    displayProducts();
    alert('✅ Product deleted successfully!');
}

// Clear product form
function clearProductForm() {
    document.getElementById('productForm').reset();
}

// BILLING FUNCTIONS WITH KEYBOARD NAVIGATION

// Autocomplete for billing with keyboard navigation
document.getElementById('billingProductSearch').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const suggestions = document.getElementById('billingSuggestions');
    selectedSuggestionIndex = -1;
    
    // Show suggestions after typing 2 letters
    if (query.length < 2) {
        suggestions.style.display = 'none';
        return;
    }
    
    const matches = products.filter(product => 
        product.name.toLowerCase().includes(query)
    );
    
    if (matches.length > 0) {
        suggestions.innerHTML = matches.map((product, index) => {
            const highlightedName = highlightMatchingText(product.name, query);
            return `<div class="suggestion-item" data-index="${index}" onclick="selectBillingProduct(${product.id})">
                <span>${highlightedName}</span>
                <span class="suggestion-details">₹${product.mrp} | ${product.pieces} pcs</span>
            </div>`;
        }).join('');
        suggestions.style.display = 'block';
        
        // Auto-select first item
        selectedSuggestionIndex = 0;
        updateSuggestionHighlight(suggestions.querySelectorAll('.suggestion-item'));
    } else {
        suggestions.style.display = 'none';
    }
});

// Highlight matching text in suggestions
function highlightMatchingText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// KEYBOARD NAVIGATION FOR AUTOCOMPLETE - Enhanced
document.getElementById('billingProductSearch').addEventListener('keydown', function(e) {
    const suggestions = document.getElementById('billingSuggestions');
    const suggestionItems = suggestions.querySelectorAll('.suggestion-item');
    
    // Handle Enter key when suggestions are visible
    if (e.key === 'Enter' && suggestions.style.display !== 'none' && suggestionItems.length > 0) {
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestionItems.length) {
            suggestionItems[selectedSuggestionIndex].click();
        } else if (suggestionItems.length > 0) {
            // If no item is selected, select the first one
            suggestionItems[0].click();
        }
        return;
    }
    
    // Handle Enter key when no suggestions are visible (add to bill)
    if (e.key === 'Enter' && suggestions.style.display === 'none') {
        e.preventDefault();
        // Check if we have a valid product selected and quantity entered
        const productName = document.getElementById('billingProductSearch').value.trim();
        const quantity = document.getElementById('billingQuantity').value;
        
        if (productName && quantity) {
            addToBill();
        } else if (productName && !quantity) {
            // Focus on quantity field if product is selected but no quantity
            document.getElementById('billingQuantity').focus();
        }
        return;
    }
    
    if (suggestions.style.display === 'none' || suggestionItems.length === 0) {
        return;
    }
    
    switch(e.key) {
        case 'ArrowDown':
        case 'PageDown':
            e.preventDefault();
            if (selectedSuggestionIndex < suggestionItems.length - 1) {
                selectedSuggestionIndex++;
            } else {
                selectedSuggestionIndex = 0; // Loop to first item
            }
            updateSuggestionHighlight(suggestionItems);
            break;
            
        case 'ArrowUp':
        case 'PageUp':
            e.preventDefault();
            if (selectedSuggestionIndex > 0) {
                selectedSuggestionIndex--;
            } else {
                selectedSuggestionIndex = suggestionItems.length - 1; // Loop to last item
            }
            updateSuggestionHighlight(suggestionItems);
            break;
            
        case 'Escape':
            suggestions.style.display = 'none';
            selectedSuggestionIndex = -1;
            break;
    }
});

// Update suggestion highlight
function updateSuggestionHighlight(suggestionItems) {
    suggestionItems.forEach((item, index) => {
        if (index === selectedSuggestionIndex) {
            item.classList.add('highlighted');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('highlighted');
        }
    });
}

// Hide suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.autocomplete-container')) {
        document.getElementById('billingSuggestions').style.display = 'none';
        selectedSuggestionIndex = -1;
    }
});

// Select product for billing
function selectBillingProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('billingProductSearch').value = product.name;
    document.getElementById('billingMRP').value = product.mrp;
    document.getElementById('billingPieces').value = product.pieces;
    document.getElementById('billingSuggestions').style.display = 'none';
    selectedSuggestionIndex = -1;
    
    // Focus on quantity input
    document.getElementById('billingQuantity').focus();
    
    // Calculate totals if quantity is already entered
    calculateBillingTotals();
}

// Calculate billing totals
document.getElementById('billingQuantity').addEventListener('input', calculateBillingTotals);

function calculateBillingTotals() {
    const quantity = parseInt(document.getElementById('billingQuantity').value) || 0;
    const pieces = parseInt(document.getElementById('billingPieces').value) || 0;
    const mrp = parseFloat(document.getElementById('billingMRP').value) || 0;
    
    const totalPieces = quantity * pieces;
    const itemTotal = quantity * mrp;
    
    document.getElementById('billingTotalPieces').value = totalPieces;
    document.getElementById('billingItemTotal').value = itemTotal.toFixed(2);
}

// ENTER KEY TO ADD TO BILL - Enhanced
document.getElementById('billingQuantity').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addToBill();
    }
});

// Add to bill - Enhanced with better validation
function addToBill() {
    const productName = document.getElementById('billingProductSearch').value.trim();
    const mrp = parseFloat(document.getElementById('billingMRP').value);
    const pieces = parseInt(document.getElementById('billingPieces').value);
    const quantity = parseInt(document.getElementById('billingQuantity').value);
    const totalPieces = parseInt(document.getElementById('billingTotalPieces').value);
    const itemTotal = parseFloat(document.getElementById('billingItemTotal').value);
    
    // Enhanced validation
    if (!productName) {
        alert('❌ Please select a product first');
        document.getElementById('billingProductSearch').focus();
        return;
    }
    
    if (!quantity || quantity <= 0) {
        alert('❌ Please enter a valid quantity');
        document.getElementById('billingQuantity').focus();
        return;
    }
    
    if (!mrp || !pieces) {
        alert('⚠️ Please select a valid product from the suggestions');
        document.getElementById('billingProductSearch').focus();
        return;
    }
    
    // Check if product exists
    const productExists = products.some(p => p.name.toLowerCase() === productName.toLowerCase());
    if (!productExists) {
        alert('⚠️ Please select a valid product from the suggestions');
        document.getElementById('billingProductSearch').focus();
        return;
    }
    
    // Add to billing items
    billingItems.push({
        sno: serialNumber++,
        name: productName,
        quantity: quantity,
        rate: mrp,
        pieces: totalPieces,
        totalAmount: itemTotal
    });
    
    // Update billing table and summary
    updateBillingTable();
    updateBillingSummary();
    
    // Clear billing form
    clearBillingForm();
    
    // Focus back to product search for next item
    document.getElementById('billingProductSearch').focus();
    
    // Show success message briefly
    const originalPlaceholder = document.getElementById('billingProductSearch').placeholder;
    document.getElementById('billingProductSearch').placeholder = '✅ Item added! Search for next product...';
    setTimeout(() => {
        document.getElementById('billingProductSearch').placeholder = originalPlaceholder;
    }, 2000);
}

// Update billing table
function updateBillingTable() {
    const tbody = document.getElementById('billingTableBody');
    
    if (billingItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666; padding: 2rem;">🛒 No items added to bill yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = billingItems.map(item => `
        <tr>
            <td>${item.sno}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.rate}</td>
            <td>${item.pieces}</td>
            <td>₹${item.totalAmount.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger" onclick="removeFromBill(${item.sno})">🗑️ Remove</button>
            </td>
        </tr>
    `).join('');
}

// Update billing summary
function updateBillingSummary() {
    const totalQuantity = billingItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPieces = billingItems.reduce((sum, item) => sum + item.pieces, 0);
    const grandTotal = billingItems.reduce((sum, item) => sum + item.totalAmount, 0);
    
    document.getElementById('totalQuantity').textContent = `${totalQuantity} boxes`;
    document.getElementById('totalPieces').textContent = `${totalPieces} pieces`;
    document.getElementById('grandTotal').textContent = `₹${grandTotal.toFixed(2)}`;
}

// Remove from bill
function removeFromBill(sno) {
    billingItems = billingItems.filter(item => item.sno !== sno);
    updateBillingTable();
    updateBillingSummary();
}

// Clear billing form
function clearBillingForm() {
    document.getElementById('billingProductSearch').value = '';
    document.getElementById('billingMRP').value = '';
    document.getElementById('billingPieces').value = '';
    document.getElementById('billingQuantity').value = '';
    document.getElementById('billingTotalPieces').value = '';
    document.getElementById('billingItemTotal').value = '';
}

// Clear bill
function clearBill() {
    if (billingItems.length === 0) {
        alert('ℹ️ Bill is already empty');
        return;
    }
    
    if (confirm('🗑️ Are you sure you want to clear the entire bill?')) {
        billingItems = [];
        serialNumber = 1;
        updateBillingTable();
        updateBillingSummary();
        alert('✅ Bill cleared successfully!');
    }
}

// SAVE DAILY SUMMARY
function saveDailySummary() {
    if (billingItems.length === 0) {
        alert('ℹ️ No items in bill to save');
        return;
    }

    const today = new Date().toDateString();
    const summary = {
        date: today,
        items: billingItems.length,
        totalQuantity: billingItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPieces: billingItems.reduce((sum, item) => sum + item.pieces, 0),
        grandTotal: billingItems.reduce((sum, item) => sum + item.totalAmount, 0),
        timestamp: new Date().toISOString()
    };

    // Get existing summaries
    let dailySummaries = JSON.parse(localStorage.getItem('dailySummaries')) || [];
    
    // Add new summary
    dailySummaries.push(summary);
    
    // Save to localStorage
    localStorage.setItem('dailySummaries', JSON.stringify(dailySummaries));
    
    alert(`💾 Daily summary saved successfully!\n📅 Date: ${today}\n💰 Total: ₹${summary.grandTotal.toFixed(2)}`);
}

// SAVE BILL TO HISTORY
function saveBill() {
    if (billingItems.length === 0) {
        alert('ℹ️ No items in bill to save');
        return;
    }

    const now = new Date();
    const billId = 'BILL-' + now.getTime();
    
    const bill = {
        id: billId,
        date: now.toISOString(),
        items: [...billingItems],
        totalQuantity: billingItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPieces: billingItems.reduce((sum, item) => sum + item.pieces, 0),
        grandTotal: billingItems.reduce((sum, item) => sum + item.totalAmount, 0),
        timestamp: now.getTime()
    };

    // Add to bill history
    billHistory.unshift(bill); // Add to beginning of array
    
    // Keep only last 100 bills
    if (billHistory.length > 100) {
        billHistory = billHistory.slice(0, 100);
    }
    
    // Save to localStorage
    localStorage.setItem('billHistory', JSON.stringify(billHistory));
    
    alert(`💾 Bill saved successfully!\n📋 Bill ID: ${billId}\n💰 Total: ₹${bill.grandTotal.toFixed(2)}`);
    
    // Clear current bill
    billingItems = [];
    serialNumber = 1;
    updateBillingTable();
    updateBillingSummary();
    
    // Update history display if on history tab
    if (document.getElementById('billing-history').classList.contains('active')) {
        displayBillHistory();
    }
}

// Print bill - Thermal Printer Style
function printBill() {
    if (billingItems.length === 0) {
        alert('ℹ️ No items in bill to print');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    const now = new Date();
    const totalQuantity = billingItems.reduce((sum, item) => sum + item.quantity, 0);
    const grandTotal = billingItems.reduce((sum, item) => sum + item.totalAmount, 0);
    
    printWindow.document.write(`
        <html>
        <head>
            <title>Bill Print</title>
            <style>
                @media print {
                    @page {
                        size: 80mm auto;
                        margin: 2mm;
                    }
                }
                
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                    line-height: 1.2;
                    margin: 0;
                    padding: 2mm;
                    width: 76mm;
                    color: #000;
                    background: #fff;
                }
                
                .shop-header {
                    text-align: center;
                    margin-bottom: 3mm;
                }
                
                .shop-name {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 1mm;
                    text-transform: uppercase;
                }
                
                .shop-address {
                    font-size: 8px;
                    margin-bottom: 1mm;
                    line-height: 1.3;
                }
                
                .shop-phone {
                    font-size: 10px;
                    margin-bottom: 1mm;
                    font-weight: bold;
                }
                
                .shop-hours {
                    font-size: 8px;
                    margin-bottom: 2mm;
                    color: #333;
                }
                
                .separator {
                    border-top: 1px dashed #000;
                    margin: 2mm 0;
                }
                
                .bill-info {
                    font-size: 9px;
                    margin-bottom: 2mm;
                }
                
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 2mm;
                }
                
                .items-table th {
                    font-size: 9px;
                    font-weight: bold;
                    padding: 1mm 0;
                    border-bottom: 1px dashed #000;
                }
                
                .items-table td {
                    font-size: 10px;
                    padding: 1mm 0;
                    vertical-align: top;
                }
                
                .item-name {
                    text-align: left;
                    width: 60%;
                }
                
                .item-qty {
                    text-align: center;
                    width: 15%;
                }
                
                .item-price {
                    text-align: right;
                    width: 25%;
                }
                
                .totals {
                    margin-top: 2mm;
                    font-size: 10px;
                }
                
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1mm;
                }
                
                .grand-total {
                    font-weight: bold;
                    font-size: 12px;
                    border-top: 1px dashed #000;
                    padding-top: 1mm;
                    margin-top: 2mm;
                }
                
                .footer {
                    text-align: center;
                    font-size: 8px;
                    margin-top: 3mm;
                    border-top: 1px dashed #000;
                    padding-top: 2mm;
                }
                
                /* Hide everything except bill content when printing */
                @media print {
                    body * {
                        visibility: visible;
                    }
                }
            </style>
        </head>
        <body>
            <div class="shop-header">
                <div class="shop-name">GALAXY CRACKERS</div>
                <div class="shop-address">
                    Sattur, highways, Kovilpatti,<br>
                    Meenakshipuram, Tamil Nadu 626205
                </div>
                <div class="shop-phone">Phone: 070104 36814</div>
                <div class="shop-hours">Open 24 hours</div>
            </div>
            
            <div class="separator"></div>
            
            <div class="bill-info">
                Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th class="item-name">Product</th>
                        <th class="item-qty">Qty</th>
                        <th class="item-price">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${billingItems.map(item => `
                        <tr>
                            <td class="item-name">${item.name}</td>
                            <td class="item-qty">${item.quantity}</td>
                            <td class="item-price">₹${item.totalAmount.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="separator"></div>
            
            <div class="totals">
                <div class="total-row">
                    <span>TOTAL QTY:</span>
                    <span>${totalQuantity}</span>
                </div>
                <div class="total-row grand-total">
                    <span>TOTAL AMOUNT:</span>
                    <span>₹${grandTotal.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="footer">
                Thank You! Visit Again<br>
                Have a Safe & Happy Diwali!<br>
                ⭐ 4.7 Rating - 18 Google Reviews ⭐
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Auto print after a short delay
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// INITIALIZE APP - Enhanced
document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
    
    // Load some sample products if none exist
    if (products.length === 0) {
        const sampleProducts = [
            { id: 1, name: "Atom Bomb", mrp: 150, pieces: 10 },
            { id: 2, name: "Bullet Bomb", mrp: 200, pieces: 5 },
            { id: 3, name: "Chocolate Bomb", mrp: 100, pieces: 20 },
            { id: 4, name: "Diwali Special", mrp: 300, pieces: 15 },
            { id: 5, name: "Electric Crackers", mrp: 250, pieces: 8 }
        ];
        
        products = sampleProducts;
        saveProducts();
        displayProducts();
    }

    // Add keyboard support for file upload area
    const fileUploadArea = document.querySelector('.file-upload-area');
    if (fileUploadArea) {
        fileUploadArea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerFileInput();
            }
        });
    }

    // Add global keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+1 to switch to Product Entry
        if (e.ctrlKey && e.key === '1') {
            e.preventDefault();
            switchTab('product-entry');
        }
        
        // Ctrl+2 to switch to Billing
        if (e.ctrlKey && e.key === '2') {
            e.preventDefault();
            switchTab('billing');
        }
        
        // F1 to focus on product search in billing
        if (e.key === 'F1') {
            e.preventDefault();
            switchTab('billing');
            setTimeout(() => {
                document.getElementById('billingProductSearch').focus();
            }, 100);
        }
    });

    // Focus on first input when switching tabs
    const originalSwitchTab = window.switchTab;
    window.switchTab = function(tabName) {
        originalSwitchTab(tabName);
        
        setTimeout(() => {
            if (tabName === 'product-entry') {
                document.getElementById('productName').focus();
            } else if (tabName === 'billing') {
                document.getElementById('billingProductSearch').focus();
            } else if (tabName === 'billing-history') {
                displayBillHistory();
                document.getElementById('historySearch').focus();
            }
        }, 100);
    };
});

// BILLING HISTORY FUNCTIONS

// Display bill history
function displayBillHistory(filteredBills = null) {
    const billsToShow = filteredBills || billHistory;
    const tbody = document.getElementById('historyTableBody');
    
    // Update statistics
    updateHistoryStats(billsToShow);
    
    if (billsToShow.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666; padding: 2rem;">📋 No billing history found</td></tr>';
        return;
    }
    
    tbody.innerHTML = billsToShow.map(bill => {
        const date = new Date(bill.date);
        return `
            <tr>
                <td>${bill.id}</td>
                <td>${date.toLocaleDateString()} ${date.toLocaleTimeString()}</td>
                <td>${bill.items.length}</td>
                <td>${bill.totalQuantity}</td>
                <td>${bill.totalPieces}</td>
                <td>₹${bill.grandTotal.toFixed(2)}</td>
                <td class="action-buttons">
                    <button class="btn btn-warning" onclick="viewBillDetails('${bill.id}')">👁️ View</button>
                    <button class="btn btn-success" onclick="editBill('${bill.id}')">✏️ Edit</button>
                    <button class="btn btn-danger" onclick="deleteBill('${bill.id}')">🗑️ Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Update history statistics
function updateHistoryStats(bills) {
    const totalBills = bills.length;
    const totalRevenue = bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
    const averageBill = totalBills > 0 ? totalRevenue / totalBills : 0;
    
    document.getElementById('totalBillsCount').textContent = totalBills;
    document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById('averageBill').textContent = `₹${averageBill.toFixed(2)}`;
}

// Search bill history
function searchBillHistory() {
    const query = document.getElementById('historySearch').value.toLowerCase();
    const filtered = billHistory.filter(bill => 
        bill.id.toLowerCase().includes(query) ||
        bill.items.some(item => item.name.toLowerCase().includes(query))
    );
    displayBillHistory(filtered);
}

// Filter bill history by date
function filterBillHistory() {
    const fromDate = document.getElementById('historyDateFrom').value;
    const toDate = document.getElementById('historyDateTo').value;
    
    let filtered = billHistory;
    
    if (fromDate) {
        const from = new Date(fromDate);
        filtered = filtered.filter(bill => new Date(bill.date) >= from);
    }
    
    if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999); // End of day
        filtered = filtered.filter(bill => new Date(bill.date) <= to);
    }
    
    displayBillHistory(filtered);
}

// Clear history filters
function clearHistoryFilters() {
    document.getElementById('historySearch').value = '';
    document.getElementById('historyDateFrom').value = '';
    document.getElementById('historyDateTo').value = '';
    displayBillHistory();
}

// View bill details
function viewBillDetails(billId) {
    const bill = billHistory.find(b => b.id === billId);
    if (!bill) return;
    
    currentEditingBill = bill;
    
    // Populate modal
    document.getElementById('modalBillId').textContent = bill.id;
    document.getElementById('modalBillDateTime').textContent = new Date(bill.date).toLocaleString();
    
    // Populate items table
    const tbody = document.getElementById('modalBillItemsBody');
    tbody.innerHTML = bill.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.rate}</td>
            <td>${item.pieces}</td>
            <td>₹${item.totalAmount.toFixed(2)}</td>
        </tr>
    `).join('');
    
    // Update summary
    document.getElementById('modalTotalQuantity').textContent = `${bill.totalQuantity} boxes`;
    document.getElementById('modalTotalPieces').textContent = `${bill.totalPieces} pieces`;
    document.getElementById('modalGrandTotal').textContent = `₹${bill.grandTotal.toFixed(2)}`;
    
    // Show modal
    document.getElementById('billDetailsModal').style.display = 'flex';
}

// Close bill details modal
function closeBillDetailsModal() {
    document.getElementById('billDetailsModal').style.display = 'none';
    currentEditingBill = null;
}

// Edit bill from history
function editBill(billId) {
    const bill = billHistory.find(b => b.id === billId);
    if (!bill) return;
    
    if (confirm('🔄 Load this bill for editing? Current bill will be cleared.')) {
        // Clear current bill
        billingItems = [];
        serialNumber = 1;
        
        // Load bill items
        billingItems = bill.items.map(item => ({...item}));
        serialNumber = Math.max(...billingItems.map(item => item.sno)) + 1;
        
        // Switch to billing tab
        switchTab('billing');
        
        // Update billing display
        updateBillingTable();
        updateBillingSummary();
        
        alert(`✅ Bill ${billId} loaded for editing!`);
    }
}

// Edit bill from history (from modal)
function editBillFromHistory() {
    if (!currentEditingBill) return;
    editBill(currentEditingBill.id);
    closeBillDetailsModal();
}

// Delete bill from history
function deleteBill(billId) {
    if (!confirm('🗑️ Are you sure you want to delete this bill? This action cannot be undone.')) return;
    
    billHistory = billHistory.filter(bill => bill.id !== billId);
    localStorage.setItem('billHistory', JSON.stringify(billHistory));
    
    displayBillHistory();
    alert('✅ Bill deleted successfully!');
}

// Delete bill from history (from modal)
function deleteBillFromHistory() {
    if (!currentEditingBill) return;
    deleteBill(currentEditingBill.id);
    closeBillDetailsModal();
}

// Print bill from history - Thermal Printer Style
function printBillFromHistory() {
    if (!currentEditingBill) return;
    
    const bill = currentEditingBill;
    const printWindow = window.open('', '_blank');
    const billDate = new Date(bill.date);
    
    printWindow.document.write(`
        <html>
        <head>
            <title>Bill Print - ${bill.id}</title>
            <style>
                @media print {
                    @page {
                        size: 80mm auto;
                        margin: 2mm;
                    }
                }
                
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                    line-height: 1.2;
                    margin: 0;
                    padding: 2mm;
                    width: 76mm;
                    color: #000;
                    background: #fff;
                }
                
                .shop-header {
                    text-align: center;
                    margin-bottom: 3mm;
                }
                
                .shop-name {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 1mm;
                    text-transform: uppercase;
                }
                
                .shop-address {
                    font-size: 8px;
                    margin-bottom: 1mm;
                    line-height: 1.3;
                }
                
                .shop-phone {
                    font-size: 10px;
                    margin-bottom: 1mm;
                    font-weight: bold;
                }
                
                .shop-hours {
                    font-size: 8px;
                    margin-bottom: 2mm;
                    color: #333;
                }
                
                .separator {
                    border-top: 1px dashed #000;
                    margin: 2mm 0;
                }
                
                .bill-info {
                    font-size: 9px;
                    margin-bottom: 2mm;
                }
                
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 2mm;
                }
                
                .items-table th {
                    font-size: 9px;
                    font-weight: bold;
                    padding: 1mm 0;
                    border-bottom: 1px dashed #000;
                }
                
                .items-table td {
                    font-size: 10px;
                    padding: 1mm 0;
                    vertical-align: top;
                }
                
                .item-name {
                    text-align: left;
                    width: 60%;
                }
                
                .item-qty {
                    text-align: center;
                    width: 15%;
                }
                
                .item-price {
                    text-align: right;
                    width: 25%;
                }
                
                .totals {
                    margin-top: 2mm;
                    font-size: 10px;
                }
                
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1mm;
                }
                
                .grand-total {
                    font-weight: bold;
                    font-size: 12px;
                    border-top: 1px dashed #000;
                    padding-top: 1mm;
                    margin-top: 2mm;
                }
                
                .footer {
                    text-align: center;
                    font-size: 8px;
                    margin-top: 3mm;
                    border-top: 1px dashed #000;
                    padding-top: 2mm;
                }
                
                /* Hide everything except bill content when printing */
                @media print {
                    body * {
                        visibility: visible;
                    }
                }
            </style>
        </head>
        <body>
            <div class="shop-header">
                <div class="shop-name">GALAXY CRACKERS</div>
                <div class="shop-address">
                    Sattur, highways, Kovilpatti,<br>
                    Meenakshipuram, Tamil Nadu 626205
                </div>
                <div class="shop-phone">Phone: 070104 36814</div>
                <div class="shop-hours">Open 24 hours</div>
            </div>
            
            <div class="separator"></div>
            
            <div class="bill-info">
                Bill ID: ${bill.id}<br>
                Date: ${billDate.toLocaleDateString()} ${billDate.toLocaleTimeString()}
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th class="item-name">Product</th>
                        <th class="item-qty">Qty</th>
                        <th class="item-price">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${bill.items.map(item => `
                        <tr>
                            <td class="item-name">${item.name}</td>
                            <td class="item-qty">${item.quantity}</td>
                            <td class="item-price">₹${item.totalAmount.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="separator"></div>
            
            <div class="totals">
                <div class="total-row">
                    <span>TOTAL QTY:</span>
                    <span>${bill.totalQuantity}</span>
                </div>
                <div class="total-row grand-total">
                    <span>TOTAL AMOUNT:</span>
                    <span>₹${bill.grandTotal.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="footer">
                Thank You! Visit Again<br>
                Have a Safe & Happy Diwali!<br>
                ⭐ 4.7 Rating - 18 Google Reviews ⭐
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Auto print after a short delay
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// Export bill history
function exportBillHistory() {
    if (billHistory.length === 0) {
        alert('ℹ️ No billing history to export');
        return;
    }
    
    const csvContent = [
        ['Bill ID', 'Date', 'Time', 'Items Count', 'Total Quantity', 'Total Pieces', 'Grand Total'],
        ...billHistory.map(bill => {
            const date = new Date(bill.date);
            return [
                bill.id,
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
                bill.items.length,
                bill.totalQuantity,
                bill.totalPieces,
                bill.grandTotal.toFixed(2)
            ];
        })
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('📤 Billing history exported successfully!');

}
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "galaxycrackers" && password === "senthilkumar") {
    localStorage.setItem("isLoggedIn", "true");
    window.location.href = "billing.html";
  } else {
    alert("Invalid Username or Password");
  }
}
// script.js - login handling for index.html
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('loginForm');
  const userInput = document.getElementById('user');
  const passInput = document.getElementById('pass');
  const errorDiv = document.getElementById('error');

  form.addEventListener('submit', function (e) {
    e.preventDefault(); // keep control in JS while validating
    errorDiv.textContent = '';

    const username = userInput.value.trim();
    const password = passInput.value;

    console.log('Login attempt:', { username });

    if (!username || !password) {
      errorDiv.textContent = 'Please enter both username and password.';
      return;
    }

    // Demo credential check:
    // Replace this with your server-side/auth logic or custom validation as needed.
    if (username === 'admin' && password === '1234') {
      // mark logged in and redirect to billing.html
      sessionStorage.setItem('loggedIn', 'true');
      sessionStorage.setItem('username', username);
      console.log('Login success — redirecting to billing.html');
      // Use assign/href to create a normal navigation (works on file:// and http)
      window.location.href = 'billing.html';
      return;
    }

    // If you want to accept any non-empty credentials, comment the block above and uncomment:
    // sessionStorage.setItem('loggedIn', 'true');
    // sessionStorage.setItem('username', username);
    // window.location.href = 'billing.html';

    errorDiv.textContent = 'Invalid username or password.';
    console.warn('Login failed for user:', username);
  });
});
