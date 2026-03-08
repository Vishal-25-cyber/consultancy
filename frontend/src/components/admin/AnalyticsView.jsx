import { useState, useEffect } from 'react';
import { superstoreAPI } from '../../utils/superstoreApi';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Filter, Calendar, Percent, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedCategory, selectedRegion, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [salesRes, profitRes, productRes, customerRes] = await Promise.all([
        superstoreAPI.getSalesAnalytics({ category: selectedCategory, region: selectedRegion }),
        superstoreAPI.getProfitAnalysis(),
        superstoreAPI.getProductAnalytics(),
        superstoreAPI.getCustomerAnalytics()
      ]);

      setAnalyticsData({
        sales: salesRes.data.data,
        profit: profitRes.data.data,
        products: productRes.data.data,
        customers: customerRes.data.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
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
      console.log('Starting Analytics PDF generation...');
      console.log('Analytics data available:', !!analyticsData.sales);
      
      const doc = new jsPDF();
      console.log('jsPDF instance created');
      console.log('autoTable available:', typeof doc.autoTable);
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('Analytics Report', 14, 20);
      
      // Add date and filters
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 28);
      doc.text(`Category: ${selectedCategory === 'all' ? 'All Categories' : selectedCategory}`, 14, 34);
      doc.text(`Region: ${selectedRegion === 'all' ? 'All Regions' : selectedRegion}`, 14, 40);
      
      // Add Key Metrics
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Key Metrics', 14, 52);
      
      doc.setFontSize(10);
      doc.text(`Total Sales: ${formatCurrency(analyticsData.sales?.totalSales || 0)}`, 14, 60);
      doc.text(`Profit Margin: ${((analyticsData.profit?.avgMargin || 0) * 100).toFixed(1)}%`, 14, 66);
      doc.text(`Products Sold: ${(analyticsData.products?.totalProducts || 0).toLocaleString()}`, 14, 72);
      doc.text(`Active Customers: ${(analyticsData.customers?.totalCustomers || 0).toLocaleString()}`, 14, 78);
      
      // Add Category Performance
      doc.setFontSize(14);
      doc.text('Category Performance', 14, 90);
      
      const categoryData = categoryStats.map((cat) => [
        cat._id,
        formatCurrency(cat.sales),
        formatCurrency(cat.profit),
        `${((cat.profit / cat.sales) * 100).toFixed(1)}%`
      ]);
      
      console.log('Category data prepared:', categoryData.length, 'rows');
      
      doc.autoTable({
        startY: 94,
        head: [['Category', 'Sales', 'Profit', 'Margin']],
        body: categoryData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 10, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right' }
        }
      });
      
      console.log('Category table added');
      
      // Add Regional Performance
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Regional Performance', 14, finalY);
      
      const regionData = regionStats.map((region) => [
        region._id,
        formatCurrency(region.sales),
        formatCurrency(region.profit),
        region.orders.toLocaleString(),
        `${((region.profit / region.sales) * 100).toFixed(1)}%`
      ]);
      
      console.log('Region data prepared:', regionData.length, 'rows');
      
      doc.autoTable({
        startY: finalY + 4,
        head: [['Region', 'Sales', 'Profit', 'Orders', 'Margin']],
        body: regionData,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94], textColor: 255, fontSize: 10, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right' }
        }
      });
      
      console.log('Region table added');
      
      // Add Top Products on new page if needed
      if (profitableProducts.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Top 10 Most Profitable Products', 14, 20);
        
        const profitableData = profitableProducts.map((product, idx) => [
          idx + 1,
          product.productName,
          product.category,
          formatCurrency(product.totalProfit),
          `${product.profitMargin}%`
        ]);
        
        console.log('Top products data prepared:', profitableData.length, 'rows');
        
        doc.autoTable({
          startY: 24,
          head: [['#', 'Product', 'Category', 'Profit', 'Margin']],
          body: profitableData,
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 10, fontStyle: 'bold' },
          bodyStyles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 80 },
            3: { halign: 'right' },
            4: { halign: 'right' }
          }
        });
        
        console.log('Top products table added');
      }
      
      // Save the PDF
      const filename = `Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      console.log('PDF saved:', filename);
      toast.success('Analytics PDF downloaded successfully!');
    } catch (error) {
      console.error('Analytics PDF generation error:', error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const monthlySales = analyticsData.sales?.monthlySales || [];
  const profitableProducts = analyticsData.profit?.topProfitable || [];
  const lowMarginProducts = analyticsData.profit?.lowMargin || [];
  const categoryStats = analyticsData.sales?.categoryBreakdown || [];
  const regionStats = analyticsData.sales?.regionBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Analytics Filter Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-slate-600" />
            <h3 className="text-lg font-bold text-slate-900">Analytics Filters</h3>
          </div>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
          >
            <Download size={18} />
            Download PDF
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Furniture">Furniture</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Technology">Technology</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Regions</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="Central">Central</option>
              <option value="South">South</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Time (2020-2024)</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <p className="text-blue-100 text-sm font-medium">Total Sales</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(analyticsData.sales?.totalSales || 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <p className="text-green-100 text-sm font-medium">Profit Margin</p>
          <p className="text-3xl font-bold mt-2">{((analyticsData.profit?.avgMargin || 0) * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <p className="text-purple-100 text-sm font-medium">Products Sold</p>
          <p className="text-3xl font-bold mt-2">{(analyticsData.products?.totalProducts || 0).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
          <p className="text-orange-100 text-sm font-medium">Active Customers</p>
          <p className="text-3xl font-bold mt-2">{(analyticsData.customers?.totalCustomers || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Monthly Sales Trend */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Monthly Sales Trend Analysis</h2>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Calendar size={16} />
            <span>2020-2024</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={monthlySales}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Area type="monotone" dataKey="sales" stroke="#3B82F6" fillOpacity={1} fill="url(#colorSales)" name="Sales" />
            <Area type="monotone" dataKey="profit" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Profitable vs Low Margin Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Profitable Products */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp size={20} className="text-green-600" />
            <h3 className="text-lg font-bold text-slate-900">Top 10 Most Profitable</h3>
          </div>
          <div className="space-y-3">
            {profitableProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{product.productName}</p>
                  <p className="text-xs text-slate-500">{product.category}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-green-600">{formatCurrency(product.totalProfit)}</p>
                  <p className="text-xs text-slate-500">{product.profitMargin}% margin</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Margin Products */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingDown size={20} className="text-red-600" />
            <h3 className="text-lg font-bold text-slate-900">Top 10 Low Margin Products</h3>
          </div>
          <div className="space-y-3">
            {lowMarginProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{product.productName}</p>
                  <p className="text-xs text-slate-500">{product.category}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-red-600">{formatCurrency(product.totalProfit)}</p>
                  <p className="text-xs text-slate-500">{product.profitMargin}% margin</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Category Performance Comparison</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={categoryStats} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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

      {/* Regional Performance */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Regional Performance Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {regionStats.map((region, index) => (
            <div key={index} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border-2 border-slate-200">
              <h4 className="text-lg font-bold text-slate-900 mb-3">{region._id} Region</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Sales:</span>
                  <span className="text-sm font-bold text-blue-600">{formatCurrency(region.sales)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Profit:</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(region.profit)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Orders:</span>
                  <span className="text-sm font-bold text-purple-600">{region.orders.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-300">
                  <span className="text-xs text-slate-600">Margin:</span>
                  <span className="text-xs font-bold text-orange-600">{((region.profit / region.sales) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
