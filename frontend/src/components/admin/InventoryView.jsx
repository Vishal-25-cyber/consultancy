import { useState, useEffect } from 'react';
import { superstoreAPI } from '../../utils/superstoreApi';
import {
  Package, TrendingUp, TrendingDown, AlertTriangle, BarChart3,
  Download, Edit2, Check, X, RefreshCw, Search, CheckCircle2,
  XCircle, AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function InventoryView() {
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState({});
  const [stockProducts, setStockProducts] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editValues, setEditValues] = useState({ currentStock: '', reorderLevel: '' });
  const [savingStock, setSavingStock] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchInventory();
    fetchStockProducts();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await superstoreAPI.getProductAnalytics();
      setInventoryData(response.data.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockProducts = async () => {
    try {
      setLoadingStock(true);
      const res = await superstoreAPI.getAvailableProducts();
      setStockProducts(res.data.data);
    } catch (e) {
      console.error('Stock fetch error:', e);
    } finally {
      setLoadingStock(false);
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product.productName);
    setEditValues({ currentStock: product.currentStock ?? 100, reorderLevel: product.reorderLevel ?? 50 });
  };

  const handleSaveStock = async (product) => {
    setSavingStock(true);
    try {
      await superstoreAPI.updateStock({
        productName: product.productName,
        category: product.category,
        subCategory: product.subCategory,
        currentStock: editValues.currentStock,
        reorderLevel: editValues.reorderLevel
      });
      toast.success(`Stock updated for "${product.productName}"`);
      setEditingProduct(null);
      fetchStockProducts();
    } catch {
      toast.error('Failed to update stock');
    } finally {
      setSavingStock(false);
    }
  };

  const badgeStyle = (status) => {
    switch (status) {
      case 'Out of Stock': return { cls: 'bg-red-100 text-red-700 border border-red-200',    icon: <XCircle size={11} /> };
      case 'Low Stock':    return { cls: 'bg-orange-100 text-orange-700 border border-orange-200', icon: <AlertCircle size={11} /> };
      case 'In Stock':     return { cls: 'bg-green-100 text-green-700 border border-green-200',  icon: <CheckCircle2 size={11} /> };
      default:             return { cls: 'bg-gray-100 text-gray-500',                         icon: null };
    }
  };

  const formatNumber   = (v) => new Intl.NumberFormat('en-IN').format(v);
  const formatCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
  const formatYAxis    = (v) => v >= 10000000 ? `₹${(v/10000000).toFixed(1)}Cr` : v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`;

  // Derived counts
  const inStockCount  = stockProducts.filter(p => p.stockStatus === 'In Stock').length;
  const lowStockCount = stockProducts.filter(p => p.stockStatus === 'Low Stock').length;
  const outOfStock    = stockProducts.filter(p => p.stockStatus === 'Out of Stock').length;
  const lowStockItems = stockProducts.filter(p => p.stockStatus === 'Low Stock' || p.stockStatus === 'Out of Stock');

  // Filtered product list
  const displayed = stockProducts.filter(p => {
    const matchSearch = !search || p.productName.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === 'all' || p.stockStatus === filterStatus;
    return matchSearch && matchFilter;
  });

  const topProducts = inventoryData.topProducts || [];
  const fastMoving  = [...topProducts].filter(p => p.quantity > 50).slice(0, 8);
  const slowMoving  = [...topProducts].sort((a, b) => a.quantity - b.quantity).slice(0, 8);

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18); doc.setTextColor(40, 40, 40);
      doc.text('Inventory Report — SARITHA TRADERS', 14, 20);
      doc.setFontSize(9); doc.setTextColor(120, 120, 120);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 27);
      const tableData = topProducts.map((p, i) => [i+1, p.productName, p.category, formatNumber(p.quantity), formatCurrency(p.totalSales), formatCurrency(p.totalProfit)]);
      autoTable(doc, {
        startY: 34,
        head: [['#', 'Product', 'Category', 'Qty Sold', 'Sales', 'Profit']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7.5 },
        columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 58 }, 2: { cellWidth: 28 }, 3: { cellWidth: 22, halign: 'right' }, 4: { cellWidth: 28, halign: 'right' }, 5: { cellWidth: 28, halign: 'right' } },
        margin: { left: 14, right: 14 }
      });
      const url = URL.createObjectURL(doc.output('blob'));
      const a = document.createElement('a'); a.href = url; a.download = `Inventory_${new Date().toISOString().split('T')[0]}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch (e) { toast.error('PDF failed: ' + e.message); }
  };

  if (loading && stockProducts.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-slate-500 text-sm">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── HEADER STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Products</p>
              <p className="text-3xl font-extrabold text-slate-800 mt-1">{stockProducts.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package size={22} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">In Stock</p>
              <p className="text-3xl font-extrabold text-green-600 mt-1">{inStockCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={22} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Low Stock</p>
              <p className="text-3xl font-extrabold text-orange-500 mt-1">{lowStockCount}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <AlertTriangle size={22} className="text-orange-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Out of Stock</p>
              <p className="text-3xl font-extrabold text-red-600 mt-1">{outOfStock}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <XCircle size={22} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ── LOW STOCK ALERT ── */}
      {lowStockItems.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
            <div>
              <p className="font-bold text-red-700 text-sm">{lowStockItems.length} product{lowStockItems.length > 1 ? 's need' : ' needs'} restocking</p>
              <p className="text-xs text-red-500">Update stock levels to keep users informed</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map((item, i) => (
              <span key={i} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${item.stockStatus === 'Out of Stock' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                {item.stockStatus === 'Out of Stock' ? <XCircle size={10} /> : <AlertCircle size={10} />}
                {item.productName.length > 30 ? item.productName.slice(0, 30) + '…' : item.productName}
                {` (${item.currentStock} left)`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── STOCK MANAGEMENT TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Stock Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click "Edit" to update stock. Users see live badges instantly.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-52">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" placeholder="Search products..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="all">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <button onClick={fetchStockProducts}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
              <RefreshCw size={15} className={loadingStock ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Stock Level</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Reorder At</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayed.map((product, idx) => {
                const badge = badgeStyle(product.stockStatus);
                const stockPct = Math.min(100, Math.round(((product.currentStock ?? 100) / Math.max(1, (product.reorderLevel ?? 50) * 3)) * 100));
                const barColor = product.stockStatus === 'Out of Stock' ? 'bg-red-400' : product.stockStatus === 'Low Stock' ? 'bg-orange-400' : 'bg-green-400';
                const isEditing = editingProduct === product.productName;
                return (
                  <tr key={idx} className={`hover:bg-slate-50 transition-colors ${isEditing ? 'bg-blue-50' : ''}`}>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{idx + 1}</td>
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <p className="text-sm font-semibold text-slate-800 truncate">{product.productName}</p>
                      <p className="text-xs text-slate-400">{product.subCategory}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{product.category}</td>
                    <td className="px-5 py-3.5 text-center">
                      {isEditing ? (
                        <input type="number" min="0"
                          value={editValues.currentStock}
                          onChange={e => setEditValues(v => ({ ...v, currentStock: e.target.value }))}
                          className="w-20 text-center border border-blue-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-slate-800 text-sm">{product.currentStock ?? 100}</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${stockPct}%` }} />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {isEditing ? (
                        <input type="number" min="1"
                          value={editValues.reorderLevel}
                          onChange={e => setEditValues(v => ({ ...v, reorderLevel: e.target.value }))}
                          className="w-20 text-center border border-blue-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-sm text-slate-500">{product.reorderLevel ?? 50}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>
                        {badge.icon}{product.stockStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => handleSaveStock(product)} disabled={savingStock}
                            className="w-7 h-7 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg flex items-center justify-center transition-colors">
                            <Check size={13} />
                          </button>
                          <button onClick={() => setEditingProduct(null)}
                            className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg flex items-center justify-center transition-colors">
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(product)}
                          className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                          <Edit2 size={11} /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {displayed.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">No products match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
          Showing {displayed.length} of {stockProducts.length} products
        </div>
      </div>

      {/* ── ANALYTICS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900">Inventory by Category</h3>
            <button onClick={downloadPDF}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-medium transition-colors shadow">
              <Download size={13} /> Export PDF
            </button>
          </div>
          {loading ? (
            <div className="h-52 flex items-center justify-center text-slate-400 text-sm">Loading chart…</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={inventoryData.categoryBreakdown || []} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tickFormatter={formatYAxis} tick={{ fontSize: 11 }} width={60} />
                <Tooltip formatter={(v, n) => n==='Qty' ? formatNumber(v)+' units' : formatCurrency(v)}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="quantity" fill="#6366f1" radius={[6,6,0,0]} name="Qty" />
                <Bar dataKey="value" fill="#22c55e" radius={[6,6,0,0]} name="Value (₹)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Summary stats */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
          <h3 className="text-base font-bold text-slate-900">Sales Summary</h3>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-blue-600" />
                <span className="text-sm text-slate-700 font-medium">Products</span>
              </div>
              <span className="font-bold text-blue-700">{formatNumber(inventoryData.totalProducts || 0)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-sm text-slate-700 font-medium">Total Qty Sold</span>
              </div>
              <span className="font-bold text-green-700">{formatNumber(inventoryData.totalQuantity || 0)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-purple-600" />
                <span className="text-sm text-slate-700 font-medium">Total Value</span>
              </div>
              <span className="font-bold text-purple-700">{formatCurrency(inventoryData.totalValue || 0)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-600" />
                <span className="text-sm text-slate-700 font-medium">Avg Unit Price</span>
              </div>
              <span className="font-bold text-amber-700">{formatCurrency(inventoryData.avgPrice || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAST / SLOW MOVING ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Top 8 Fast-Moving</h3>
          </div>
          <div className="space-y-2">
            {fastMoving.map((p, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.productName}</p>
                    <p className="text-xs text-slate-400">{p.category}</p>
                  </div>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="text-sm font-bold text-green-600">{formatNumber(p.quantity)}</p>
                  <p className="text-xs text-slate-400">units</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <TrendingDown size={16} className="text-red-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Top 8 Slow-Moving</h3>
          </div>
          <div className="space-y-2">
            {slowMoving.map((p, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-5 h-5 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.productName}</p>
                    <p className="text-xs text-slate-400">{p.category}</p>
                  </div>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="text-sm font-bold text-red-500">{formatNumber(p.quantity)}</p>
                  <p className="text-xs text-slate-400">units</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
