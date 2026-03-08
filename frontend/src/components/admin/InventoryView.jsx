import { useState, useEffect } from 'react';
import { superstoreAPI } from '../../utils/superstoreApi';
import { Package, TrendingUp, TrendingDown, AlertCircle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

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

  const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value);
  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

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
  const fastMoving = topProducts.filter(p => p.quantity > 50).slice(0, 10);
  const slowMoving = topProducts.sort((a, b) => a.quantity - b.quantity).slice(0, 10);

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
          <BarChart data={inventoryData.categoryBreakdown || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="category" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Quantity" />
            <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} name="Value ($)" />
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
                  <p className="text-sm font-medium text-slate-900 truncate">{product._id}</p>
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
                  <p className="text-sm font-medium text-slate-900 truncate">{product._id}</p>
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
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">All Products Inventory</h2>
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
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{product._id}</td>
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
