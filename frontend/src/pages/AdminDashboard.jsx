import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  Truck,
  CreditCard
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { analyticsAPI, orderAPI, deliveryAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch multiple analytics endpoints in parallel
      const [dashResponse, trendResponse, productsResponse, categoryResponse] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getSalesTrend({ period: 'monthly' }),
        analyticsAPI.getTopProducts({ limit: 5 }),
        analyticsAPI.getRevenueByCategory()
      ]);

      setDashboardData(dashResponse.data.data);
      
      // Format sales trend data
      const formattedTrend = trendResponse.data.data.map(item => ({
        name: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        sales: item.totalSales,
        orders: item.totalOrders
      }));
      setSalesTrend(formattedTrend);

      setTopProducts(productsResponse.data.data);
      setRevenueByCategory(categoryResponse.data.data);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Sales"
            value={`₹${(dashboardData?.totalSales || 0).toLocaleString()}`}
            icon={DollarSign}
            color="blue"
            trend="up"
            trendValue="12.5"
          />
          <StatCard
            title="Total Orders"
            value={(dashboardData?.totalOrders || 0).toLocaleString()}
            icon={ShoppingCart}
            color="green"
            trend="up"
            trendValue="8.2"
          />
          <StatCard
            title="Total Customers"
            value={(dashboardData?.totalCustomers || 0).toLocaleString()}
            icon={Users}
            color="purple"
            trend="up"
            trendValue="5.1"
          />
          <StatCard
            title="Total Profit"
            value={`₹${(dashboardData?.totalProfit || 0).toLocaleString()}`}
            icon={TrendingUp}
            color="orange"
            trend="up"
            trendValue="15.3"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Products"
            value={(dashboardData?.totalProducts || 0).toLocaleString()}
            icon={Package}
            color="indigo"
          />
          <StatCard
            title="Low Stock Items"
            value={(dashboardData?.lowStockCount || 0).toLocaleString()}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="Pending Deliveries"
            value={(dashboardData?.pendingDeliveries || 0).toLocaleString()}
            icon={Truck}
            color="blue"
          />
          <StatCard
            title="Payment Pending"
            value={`₹${(dashboardData?.paymentPending || 0).toLocaleString()}`}
            icon={CreditCard}
            color="orange"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={2} name="Sales (₹)" />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Category */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.categoryName}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="totalRevenue"
                >
                  {revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantity Sold</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Orders</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{product.productName}</td>
                    <td className="py-3 px-4 text-right">{product.totalQuantity}</td>
                    <td className="py-3 px-4 text-right">₹{product.totalRevenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{product.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
