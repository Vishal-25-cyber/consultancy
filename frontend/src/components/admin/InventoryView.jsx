import { useState, useEffect } from 'react';
import { superstoreAPI } from '../../utils/superstoreApi';
import { Package, TrendingUp, TrendingDown, AlertCircle, BarChart3, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function InventoryView() {
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState({});

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await superstoreAPI.getProductAnalytics();
      setInventoryData(response.data.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value);
  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  // Format Y-axis values for better readability
  const formatYAxis = (value) => {
    if (value >= 10000000) { // 1 Crore = 10 Million
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    }
    if (value >= 100000) { // 1 Lakh
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  const downloadPDF = () => {
    try {
      console.log('Starting Inventory PDF generation...');
      
      const doc = new jsPDF();
      console.log('jsPDF instance created');
      console.log('autoTable available:', typeof doc.autoTable);
      
      const topProducts = inventoryData.topProducts || [];
      console.log('Products count:', topProducts.length);
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('Inventory Report', 14, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, 14, 28);
      
      // Add summary section
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Summary', 14, 40);
      
      doc.setFontSize(10);
      doc.text(`Total Unique Products: ${formatNumber(inventoryData.totalProducts || 0)}`, 14, 48);
      doc.text(`Total Quantity: ${formatNumber(inventoryData.totalQuantity || 0)}`, 14, 54);
      doc.text(`Total Value: ${formatCurrency(inventoryData.totalValue || 0)}`, 14, 60);
      doc.text(`Average Unit Price: ${formatCurrency(inventoryData.avgPrice || 0)}`, 14, 66);
      
      // Add all products table
      doc.setFontSize(14);
      doc.text('All Products', 14, 78);
      
      const tableData = topProducts.map((product, index) => [
        index + 1,
        product.productName,
        product.category,
        formatNumber(product.quantity),
        formatCurrency(product.totalSales),
        formatCurrency(product.totalProfit)
      ]);
      
      console.log('Table data prepared:', tableData.length, 'rows');
      
      doc.autoTable({
        startY: 82,
        head: [['#', 'Product Name', 'Category', 'Qty Sold', 'Sales', 'Profit']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 60 },
          2: { cellWidth: 30 },
          3: { cellWidth: 20, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' },
          5: { cellWidth: 30, halign: 'right' }
        },
        margin: { top: 82, left: 14, right: 14 }
      });
      
      console.log('Table added to PDF');
      
      // Save the PDF
      const filename = `Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      console.log('PDF saved:', filename);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Inventory PDF generation error:', error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  const topProducts = inventoryData.topProducts || [];
  const fastMoving = [...topProducts].filter(p => p.quantity > 50).slice(0, 10);
  const slowMoving = [...topProducts].sort((a, b) => a.quantity - b.quantity).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Unique Products</p>
              <p className="text-3xl font-bold mt-2">{formatNumber(inventoryData.totalProducts || 0)}</p>
            </div>
            <Package size={32} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Quantity</p>
              <p className="text-3xl font-bold mt-2">{formatNumber(inventoryData.totalQuantity || 0)}</p>
            </div>
            <TrendingUp size={32} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Value</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(inventoryData.totalValue || 0)}</p>
            </div>
            <BarChart3 size={32} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Avg Unit Price</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(inventoryData.avgPrice || 0)}</p>
            </div>
            <AlertCircle size={32} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Inventory by Category */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Inventory by Category</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={inventoryData.categoryBreakdown || []} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="category" 
              stroke="#64748b"
              style={{ fontSize: '13px', fontWeight: '500' }}
            />
            <YAxis 
              stroke="#64748b"
              tickFormatter={formatYAxis}
              style={{ fontSize: '13px', fontWeight: '600' }}
              width={80}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'Quantity') return formatNumber(value) + ' units';
                if (name === 'Value (₹)') return formatCurrency(value);
                return value;
              }}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                fontSize: '14px',
                fontWeight: '600'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '14px', fontWeight: '600' }} />
            <Bar dataKey="quantity" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Quantity" />
            <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} name="Value (₹)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Fast Moving vs Slow Moving */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fast Moving Items */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp size={20} className="text-green-600" />
            <h3 className="text-lg font-bold text-slate-900">Top  10 Fast-Moving Items</h3>
          </div>
          <div className="space-y-3">
            {fastMoving.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{product.productName}</p>
                  <p className="text-xs text-slate-500">{product.category}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-green-600">{formatNumber(product.quantity)} units</p>
                  <p className="text-xs text-slate-500">{formatCurrency(product.totalSales)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slow Moving Items */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingDown size={20} className="text-red-600" />
            <h3 className="text-lg font-bold text-slate-900">Top 10 Slow-Moving Items</h3>
          </div>
          <div className="space-y-3">
            {slowMoving.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{product.productName}</p>
                  <p className="text-xs text-slate-500">{product.category}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-red-600">{formatNumber(product.quantity)} units</p>
                  <p className="text-xs text-slate-500">{formatCurrency(product.totalSales)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Products Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">All Products Inventory</h2>
            <p className="text-sm text-slate-600 mt-1">Showing {topProducts.length} of {inventoryData.totalProducts || 0} products</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold">
              {topProducts.length} Products
            </div>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <Download size={18} />
              Download PDF
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">Quantity Sold</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">Total Sales</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">Profit</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{product.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.category === 'Technology' ? 'bg-blue-100 text-blue-700' :
                      product.category === 'Furniture' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-slate-900">
                    {formatNumber(product.quantity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">
                    {formatCurrency(product.totalSales)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">
                    {formatCurrency(product.totalProfit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.quantity > 50 ? 'bg-green-100 text-green-700' :
                      product.quantity > 20 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.quantity > 50 ? 'High Stock' : product.quantity > 20 ? 'Medium' : 'Low Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
