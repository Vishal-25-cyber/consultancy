import { useState, useEffect } from 'react';
import { superstoreAPI } from '../../utils/superstoreApi';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Package, TrendingUp, Users, RefreshCw, AlertTriangle, Bell, UserX, X } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DashboardView() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchLowStock();
    fetchStockAlerts();
  }, []);

  const fetchLowStock = async () => {
    try {
      const res = await superstoreAPI.getAvailableProducts();
      const items = (res.data.data || []).filter(
        p => p.stockStatus === 'Out of Stock' || p.stockStatus === 'Low Stock'
      );
      setLowStockItems(items);
    } catch { /* silent */ }
  };

  const fetchStockAlerts = async () => {
    try {
      const res = await superstoreAPI.getStockAlerts();
      setStockAlerts(res.data.data || []);
    } catch { /* silent */ }
  };

  const dismissAlert = async (id) => {
    try {
      await superstoreAPI.dismissStockAlert(id);
      setStockAlerts(prev => prev.filter(a => a._id !== id));
    } catch { /* silent */ }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await superstoreAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const overview = dashboardData?.overview || {};
  const monthlyData = dashboardData?.monthlySales?.map(item => ({
    name: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    sales: item.sales,
    profit: item.profit,
    orders: item.orders
  })) || [];

  return (
    <div className="space-y-6">

      {/* ── Low Stock Reminder Banner ── */}
      {lowStockItems.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell size={18} className="text-red-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-red-800">Stock Refill Reminder</h3>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {lowStockItems.length}
                </span>
              </div>
              <p className="text-xs text-red-600 mb-3">
                {lowStockItems.filter(i => i.stockStatus === 'Out of Stock').length > 0
                  ? `${lowStockItems.filter(i => i.stockStatus === 'Out of Stock').length} product${lowStockItems.filter(i => i.stockStatus === 'Out of Stock').length !== 1 ? 's are' : ' is'} out of stock and ${lowStockItems.filter(i => i.stockStatus === 'Low Stock').length} more running low.`
                  : `${lowStockItems.length} product${lowStockItems.length !== 1 ? 's are' : ' is'} running low on stock.`}
                {' '}Go to the <strong>Inventory</strong> tab to update stock levels.
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map((item, i) => (
                  <span key={i}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.stockStatus === 'Out of Stock'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-orange-100 text-orange-700 border border-orange-200'
                    }`}>
                    <AlertTriangle size={10} />
                    {item.productName}
                    {item.currentStock !== null && item.currentStock !== undefined
                      ? ` (${item.currentStock} left)` : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Blocked Order Attempts ── */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserX size={16} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-purple-900">Blocked Order Attempts</h3>
              <p className="text-xs text-purple-500">Users blocked due to insufficient / out-of-stock</p>
            </div>
            <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
              {stockAlerts.length}
            </span>
          </div>
          <button onClick={fetchStockAlerts}
            className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 hover:underline">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
        {stockAlerts.length === 0 ? (
          <div className="text-center py-6 text-purple-300">
            <UserX size={28} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs text-purple-400">No blocked attempts — all orders are going through fine.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stockAlerts.map(alert => (
              <div key={alert._id}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border ${
                  alert.reason === 'out_of_stock'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-orange-50 border-orange-200'
                }`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <AlertTriangle size={14} className={alert.reason === 'out_of_stock' ? 'text-red-500 flex-shrink-0' : 'text-orange-500 flex-shrink-0'} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{alert.productName}</p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{alert.requestedByName}</span>
                      {' '}tried to order <span className="font-medium">{alert.attemptedQty} units</span>
                      {' '}—{' '}
                      <span className={alert.reason === 'out_of_stock' ? 'text-red-600 font-semibold' : 'text-orange-600 font-semibold'}>
                        {alert.reason === 'out_of_stock' ? 'Out of Stock' : `Only ${alert.availableStock} available`}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">
                    {new Date(alert.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button onClick={() => dismissAlert(alert._id)}
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors" title="Dismiss">
                    <X size={13} className="text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.totalSales || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">From {formatNumber(overview.totalOrders || 0)} orders</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <DollarSign size={28} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium mb-1">Total Profit</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.totalProfit || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">Net profit earned</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <TrendingUp size={28} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.totalOrders || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">Orders processed</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Package size={28} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium mb-1">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.avgSales || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">Per order average</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <Users size={28} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Sales & Profit Trend</h2>
          <button
            onClick={fetchDashboardData}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw size={20} className="text-gray-600" />
          </button>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
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
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                fontSize: '14px',
                fontWeight: '600'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '14px', fontWeight: '600' }}
            />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#3B82F6" 
              strokeWidth={3} 
              name="Sales" 
              dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 7 }}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#10B981" 
              strokeWidth={3} 
              name="Profit" 
              dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category and Region Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sales by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData?.categoryStats || []}
                dataKey="sales"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry._id}: ${formatYAxis(entry.sales)}`}
                labelLine={true}
                style={{ fontSize: '12px', fontWeight: '600' }}
              >
                {(dashboardData?.categoryStats || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '600' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Region */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Sales by Region</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData?.regionStats || []} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="_id" 
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
                formatter={(value) => formatCurrency(value)}
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
              <Bar dataKey="sales" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Sales" />
              <Bar dataKey="profit" fill="#10B981" radius={[8, 8, 0, 0]} name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segment Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Sales by Segment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(dashboardData?.segmentStats || []).map((segment, index) => (
            <div key={segment._id} className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <h3 className="text-base font-bold text-gray-900 mb-4">{segment._id}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Sales:</span>
                  <span className="font-bold text-blue-600 text-base">{formatCurrency(segment.sales)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Profit:</span>
                  <span className="font-bold text-green-600 text-base">{formatCurrency(segment.profit)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Orders:</span>
                  <span className="font-bold text-purple-600 text-base">{formatNumber(segment.orders)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Top 10 Products by Sales</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Profit</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {(dashboardData?.topProducts || []).map((product, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">{formatCurrency(product.totalSales)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">{formatCurrency(product.totalProfit)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{formatNumber(product.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Top 10 Customers</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Segment</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Sales</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Profit</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {(dashboardData?.topCustomers || []).map((customer, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold text-sm">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{customer.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                      {customer.segment}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">{formatCurrency(customer.totalSales)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">{formatCurrency(customer.totalProfit)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">{formatNumber(customer.orders)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
