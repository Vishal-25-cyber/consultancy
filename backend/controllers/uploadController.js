import XLSX from 'xlsx';
import SuperstoreOrder from '../models/SuperstoreOrder.js';

// Helper: parse a cell value as a number
const toNum = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};

// Helper: parse a cell value as a date
const toDate = (v) => {
  if (!v) return new Date();
  if (v instanceof Date) return v;
  // Excel serial number
  if (typeof v === 'number') {
    return new Date(Math.round((v - 25569) * 86400 * 1000));
  }
  const d = new Date(v);
  return isNaN(d) ? new Date() : d;
};

export const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Parse the workbook from the buffer in memory
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Excel file is empty or has no data' });
    }

    // Map Excel columns to schema fields (case-insensitive, flexible column names)
    const normalize = (key) => key?.toString().toLowerCase().replace(/[\s_\-\.]+/g, '');

    const getField = (row, ...aliases) => {
      const keys = Object.keys(row);
      for (const alias of aliases) {
        const match = keys.find((k) => normalize(k) === normalize(alias));
        if (match !== undefined && row[match] !== '') return row[match];
      }
      return '';
    };

    const orders = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const orderId = String(getField(row, 'Order ID', 'OrderID', 'order_id', 'orderid') || `ROW-${i + 2}`).trim();
        const customerName = String(getField(row, 'Customer Name', 'CustomerName', 'customer_name', 'customername') || 'Unknown').trim();
        const customerId = String(getField(row, 'Customer ID', 'CustomerID', 'customer_id', 'customerid') || `C-${i + 1}`).trim();
        const productName = String(getField(row, 'Product Name', 'ProductName', 'product_name', 'productname') || 'Unknown Product').trim();
        const productId = String(getField(row, 'Product ID', 'ProductID', 'product_id', 'productid') || `P-${i + 1}`).trim();
        const category = String(getField(row, 'Category', 'category') || 'Packaging Materials').trim();
        const subCategory = String(getField(row, 'Sub-Category', 'SubCategory', 'sub_category', 'subcategory', 'Sub Category') || category).trim();
        const segment = String(getField(row, 'Segment', 'segment') || 'Retail').trim();
        const region = String(getField(row, 'Region', 'region') || 'North India').trim();
        const city = String(getField(row, 'City', 'city') || 'Unknown').trim();
        const state = String(getField(row, 'State', 'state') || 'Unknown').trim();
        const country = String(getField(row, 'Country', 'country') || 'India').trim();
        const postalCode = String(getField(row, 'Postal Code', 'PostalCode', 'postal_code', 'postalcode', 'Pincode', 'pincode') || '000000').trim();
        const shipMode = String(getField(row, 'Ship Mode', 'ShipMode', 'ship_mode', 'shipmode') || 'Standard Delivery').trim();
        const orderDateRaw = getField(row, 'Order Date', 'OrderDate', 'order_date', 'orderdate');
        const shipDateRaw = getField(row, 'Ship Date', 'ShipDate', 'ship_date', 'shipdate');
        const sales = toNum(getField(row, 'Sales', 'sales', 'Amount', 'amount', 'Revenue', 'revenue'));
        const quantity = Math.max(1, Math.round(toNum(getField(row, 'Quantity', 'quantity', 'Qty', 'qty'))));
        const discount = toNum(getField(row, 'Discount', 'discount'));
        const profit = toNum(getField(row, 'Profit', 'profit'));

        orders.push({
          orderId,
          orderDate: toDate(orderDateRaw),
          shipDate: toDate(shipDateRaw) || toDate(orderDateRaw),
          shipMode,
          customerId,
          customerName,
          segment,
          country,
          city,
          state,
          postalCode,
          region,
          productId,
          category,
          subCategory,
          productName,
          sales,
          quantity,
          discount: Math.min(1, Math.max(0, discount)),
          profit
        });
      } catch (rowErr) {
        errors.push(`Row ${i + 2}: ${rowErr.message}`);
      }
    }

    if (orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid rows found in the Excel file',
        errors: errors.slice(0, 10)
      });
    }

    // Replace all existing data with the uploaded data
    await SuperstoreOrder.deleteMany({});

    // Insert in batches of 500 for performance
    const batchSize = 500;
    let inserted = 0;
    for (let i = 0; i < orders.length; i += batchSize) {
      const batch = orders.slice(i, i + batchSize);
      await SuperstoreOrder.insertMany(batch, { ordered: false });
      inserted += batch.length;
    }

    res.json({
      success: true,
      message: `Successfully imported ${inserted} orders from Excel`,
      data: {
        totalRows: rows.length,
        imported: inserted,
        skipped: rows.length - orders.length,
        errors: errors.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
