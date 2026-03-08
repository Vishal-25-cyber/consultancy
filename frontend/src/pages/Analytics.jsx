import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Truck,
  ShoppingCart
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { analyticsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [profitability, setProfitability] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerAnalytics, setCustomerAnalytics] = useState([]);
  const [salesByRegion, setSalesByRegion] = useState([]);
  const [productPerformance, setProductPerformance] = useState({ fastMoving: [], slowMoving: [] });
  const [deliveryPerformance, setDeliveryPerformance] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const [
        profitRes,
        trendRes,
        productsRes,
        customerRes,
        regionRes,
        performanceRes,
        deliveryRes
      ] = await Promise.all([
        analyticsAPI.getProfitability(),
        analyticsAPI.getSalesTrend({ period: 'monthly' }),
        analyticsAPI.getTopProducts({ limit: 10 }),
        analyticsAPI.getCustomerAnalytics({ limit: 10 }),
        analyticsAPI.getSalesByRegion({ groupBy: 'state' }),
        analyticsAPI.getProductPerformance(),
        analyticsAPI.getDeliveryPerformance()
      ]);

      setProfitability(profitRes.data.data);
      
      const formattedTrend = trendRes.data.data.map(item => ({
        name: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        sales: item.totalSales,
        orders: item.totalOrders,
        avgOrder: item.avgOrderValue
      }));
      setSalesTrend(formattedTrend);

      setTopProducts(productsRes.data.data);
      setCustomerAnalytics(customerRes.data.data);
      setSalesByRegion(regionRes.data.data);
      setProductPerformance(performanceRes.data.data);
      setDeliveryPerformance(deliveryRes.data.data);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];

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
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">Deep insights from 100,000+ transaction records</p>
        </div>

        {/* Profitability Stats */}
        {profitability && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={`₹${profitability.totalRevenue?.toLocaleString() || 0}`}
              icon={DollarSign}
              color="blue"
            />
            <StatCard
              title="Total Cost"
              value={`₹${profitability.totalCost?.toLocaleString() || 0}`}
              icon={ShoppingCart}
              color="red"
            />
            <StatCard
              title="Gross Profit"
              value={`₹${profitability.grossProfit?.toLocaleString() || 0}`}
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              title="Profit Margin"
              value={`${profitability.profitMargin?.toFixed(2) || 0}%`}
              icon={TrendingUp}
              color="purple"
            />
          </div>
        )}

        {/* Sales Trend Advanced */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Sales Trend Analysis</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={salesTrend}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#0ea5e9" 
                fillOpacity={1} 
                fill="url(#colorSales)" 
                name="Sales (₹)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Product Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fast Moving Products */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Fast Moving Products</h3>
            <div className="space-y-3">
              {productPerformance.fastMoving.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-600">Turnover: {product.turnoverRate.toFixed(2)}x</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">₹{product.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{product.totalQuantity} units</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slow Moving Products */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Slow Moving Products</h3>
            <div className="space-y-3">
              {productPerformance.slowMoving.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-600">Turnover: {product.turnoverRate.toFixed(2)}x</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-600">₹{product.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{product.totalQuantity} units</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Analytics & Sales by Region */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Customers */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Top Customers by Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="customerName" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalSpent" fill="#0ea5e9" name="Total Spent (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sales by Region */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Sales by Region</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByRegion}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(entry) => `${entry._id}: ₹${(entry.totalSales / 1000).toFixed(0)}k`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="totalSales"
                >
                  {salesByRegion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delivery Performance */}
        {deliveryPerformance && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Delivery Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">On-Time Delivery Rate</p>
                <p className="text-2xl font-bold text-green-600">{deliveryPerformance.onTimeDeliveryRate}%</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Delivered</p>
                <p className="text-2xl font-bold text-blue-600">{deliveryPerformance.totalDelivered?.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">On-Time Deliveries</p>
                <p className="text-2xl font-bold text-purple-600">{deliveryPerformance.onTimeDelivered?.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Delayed Deliveries</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(deliveryPerformance.totalDelivered - deliveryPerformance.onTimeDelivered).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Top Products Table */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top 10 Products by Revenue</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantity Sold</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Orders</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-semibold">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{product.productName}</td>
                    <td className="py-3 px-4 text-right">{product.totalQuantity.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600">
                      ₹{product.totalRevenue.toLocaleString()}
                    </td>
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

export default Analytics;
