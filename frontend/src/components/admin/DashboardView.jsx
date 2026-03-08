import { useState, useEffect } from 'react';
import { superstoreAPI } from '../../utils/superstoreApi';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Package, TrendingUp, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DashboardView() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Sales</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(overview.totalSales || 0)}</p>
              <p className="text-blue-100 text-xs mt-1">From 100K+ orders</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <DollarSign size={32} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Profit</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(overview.totalProfit || 0)}</p>
              <p className="text-green-100 text-xs mt-1">Net profit earned</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <TrendingUp size={32} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold mt-2">{formatNumber(overview.totalOrders || 0)}</p>
              <p className="text-purple-100 text-xs mt-1">Orders processed</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Package size={32} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Avg Order Value</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(overview.avgSales || 0)}</p>
              <p className="text-orange-100 text-xs mt-1">Per order average</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Users size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Sales & Profit Trend</h2>
          <button
            onClick={fetchDashboardData}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw size={20} className="text-slate-600" />
          </button>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} name="Sales" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} name="Profit" dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category and Region Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData?.categoryStats || []}
                dataKey="sales"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry._id}`}
              >
                {(dashboardData?.categoryStats || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Region */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Sales by Region</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData?.regionStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="_id" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="sales" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Sales" />
              <Bar dataKey="profit" fill="#10B981" radius={[8, 8, 0, 0]} name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segment Analysis */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Sales by Segment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(dashboardData?.segmentStats || []).map((segment, index) => (
            <div key={segment._id} className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-bold text-slate-900 mb-4">{segment._id}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-sm">Sales:</span>
                  <span className="font-bold text-blue-600 text-lg">{formatCurrency(segment.sales)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-sm">Profit:</span>
                  <span className="font-bold text-green-600 text-lg">{formatCurrency(segment.profit)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-sm">Orders:</span>
                  <span className="font-bold text-purple-600 text-lg">{formatNumber(segment.orders)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Top 10 Products by Sales</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Profit</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(dashboardData?.topProducts || []).map((product, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{product._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">{formatCurrency(product.totalSales)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">{formatCurrency(product.totalProfit)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900">{formatNumber(product.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Top 10 Customers</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Segment</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Total Sales</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Total Profit</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(dashboardData?.topCustomers || []).map((customer, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold text-sm">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{customer.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {customer.segment}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">{formatCurrency(customer.totalSales)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">{formatCurrency(customer.totalProfit)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900">{formatNumber(customer.orders)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
