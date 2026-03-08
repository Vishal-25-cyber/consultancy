import { useState, useEffect } from 'react';
import { superstoreAPI } from '../../utils/superstoreApi';
import { Users, TrendingUp, DollarSign, ShoppingBag, Search, MapPin } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B'];

export default function CustomersView() {
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await superstoreAPI.getCustomerAnalytics();
      setCustomerData(response.data.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value);

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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  const topCustomers = customerData.topCustomers || [];
  const segmentData = customerData.segmentStats || [];
  const filteredCustomers = topCustomers.filter(c => 
    c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Customers</p>
              <p className="text-3xl font-bold mt-2">{formatNumber(customerData.totalCustomers || 0)}</p>
            </div>
            <Users size={32} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(customerData.totalRevenue || 0)}</p>
            </div>
            <DollarSign size={32} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Avg Order Value</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(customerData.avgOrderValue || 0)}</p>
            </div>
            <ShoppingBag size={32} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Repeat Rate</p>
              <p className="text-3xl font-bold mt-2">{((customerData.repeatRate || 0) * 100).toFixed(1)}%</p>
            </div>
            <TrendingUp size={32} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Customer Segmentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Customer Segmentation</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={segmentData}
                dataKey="sales"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry._id}: ${entry.customers}`}
                style={{ fontSize: '12px', fontWeight: '600' }}
              >
                {segmentData.map((entry, index) => (
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

        {/* Bar Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Revenue by Segment</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={segmentData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segment Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {segmentData.map((segment, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{segment._id} Segment</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Customers:</span>
                <span className="text-sm font-bold text-blue-600">{formatNumber(segment.customers)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Sales:</span>
                <span className="text-sm font-bold text-green-600">{formatCurrency(segment.sales)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Orders:</span>
                <span className="text-sm font-bold text-purple-600">{formatNumber(segment.orders)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-600">Avg per Customer:</span>
                <span className="text-xs font-bold text-orange-600">
                  {formatCurrency(segment.sales / segment.customers)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Customers Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Top Customers</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Segment</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Location</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">Orders</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">Total Sales</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase">Total Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCustomers.map((customer, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-slate-900">{customer.customerName}</div>
                      <div className="text-xs text-slate-500 font-mono">{customer.customerId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      customer.segment === 'Consumer' ? 'bg-blue-100 text-blue-700' :
                      customer.segment === 'Corporate' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {customer.segment}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-sm text-slate-700">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{customer.state || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-slate-900">
                    {formatNumber(customer.orders)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">
                    {formatCurrency(customer.totalSales)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">
                    {formatCurrency(customer.totalProfit)}
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
