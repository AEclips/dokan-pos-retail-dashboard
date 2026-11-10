import * as XLSX from 'xlsx';

/**
 * Exports sales and revenue records to an Excel (.xlsx) file.
 * Columns: date, product, quantity sold, revenue.
 * 
 * @param {Array} sales - Array of sales invoice records
 * @param {string} [shopName] - Optional store name for filename
 */
export function exportSalesToExcel(sales = [], shopName = 'DokanPOS') {
  if (!sales || sales.length === 0) {
    alert('No sales data available to export!');
    return false;
  }

  // Flatten sales invoice records into individual product line rows
  const rows = [];

  sales.forEach((sale) => {
    const saleDate = sale.timestamp || sale.date || new Date().toISOString();
    const formattedDate = new Date(saleDate).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (sale.items && sale.items.length > 0) {
      sale.items.forEach((item) => {
        const qty = parseInt(item.quantity) || 1;
        const unitPrice = parseFloat(item.sellingPrice) || 0;
        const lineRevenue = qty * unitPrice - (parseFloat(item.itemDiscount) || 0);

        rows.push({
          'Date': formattedDate,
          'Product': item.name || item.productName || 'Unnamed Item',
          'Quantity Sold': qty,
          'Revenue': lineRevenue
        });
      });
    } else {
      // Fallback if transaction has no decomposed items
      rows.push({
        'Date': formattedDate,
        'Product': 'General Sale (' + (sale.id || 'N/A') + ')',
        'Quantity Sold': 1,
        'Revenue': parseFloat(sale.grandTotal) || 0
      });
    }
  });

  // Create new worksheet from JSON data
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set clean column widths
  worksheet['!cols'] = [
    { wch: 20 }, // Date
    { wch: 38 }, // Product
    { wch: 16 }, // Quantity Sold
    { wch: 16 }  // Revenue
  ];

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales & Revenue');

  // Generate file name with current timestamp
  const dateStamp = new Date().toISOString().split('T')[0];
  const filename = `${shopName.replace(/\s+/g, '_')}_Sales_Report_${dateStamp}.xlsx`;

  // Trigger file download
  XLSX.writeFile(workbook, filename);
  return true;
}
