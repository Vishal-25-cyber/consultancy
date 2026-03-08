import { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { superstoreAPI } from '../../utils/superstoreApi';

export default function ReportsView() {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('monthly');
  const [generating, setGenerating] = useState(false);

  const generateSalesReport = async () => {
    const response = await superstoreAPI.getSalesAnalytics({});
    const data = response.data.data;
    
    const wb = XLSX.utils.book_new();
    
    // Summary Sheet
    const summaryData = [
      ['Sales Report'],
      ['Generated:', new Date().toLocaleDateString('en-IN')],
      ['Date Range:', dateRange.charAt(0).toUpperCase() + dateRange.slice(1)],
      [],
      ['Summary'],
      ['Total Sales', data.totalSales || 0],
      ['Total Profit', data.totalProfit || 0],
      ['Total Orders', data.totalOrders || 0],
      ['Profit Margin', `${((data.totalProfit / data.totalSales) * 100).toFixed(2)}%`],
      [],
      ['Category Performance'],
      ['Category', 'Sales', 'Profit', 'Orders', 'Margin %']
    ];
    
    if (data.categoryBreakdown) {
      data.categoryBreakdown.forEach(cat => {
        summaryData.push([
          cat._id,
          cat.sales,
          cat.profit,
          cat.orders,
          ((cat.profit / cat.sales) * 100).toFixed(2)
        ]);
      });
    }
    
    summaryData.push([], ['Regional Performance'], ['Region', 'Sales', 'Profit', 'Orders', 'Margin %']);
    
    if (data.regionBreakdown) {
      data.regionBreakdown.forEach(region => {
        summaryData.push([
          region._id,
          region.sales,
          region.profit,
          region.orders,
          ((region.profit / region.sales) * 100).toFixed(2)
        ]);
      });
    }
    
    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    ws['!cols'] = [{wch: 20}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 12}];
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
    
    // Monthly Trend Sheet
    if (data.monthlySales && data.monthlySales.length > 0) {
      const monthlyData = [
        ['Monthly Sales Trend'],
        ['Month', 'Sales', 'Profit'],
        ...data.monthlySales.map(m => [m.month, m.sales, m.profit])
      ];
      const wsMonthly = XLSX.utils.aoa_to_sheet(monthlyData);
      wsMonthly['!cols'] = [{wch: 15}, {wch: 15}, {wch: 15}];
      XLSX.utils.book_append_sheet(wb, wsMonthly, 'Monthly Trend');
    }
    
    return wb;
  };

  const generateProfitReport = async () => {
    const response = await superstoreAPI.getProfitAnalysis();
    const data = response.data.data;
    
    const wb = XLSX.utils.book_new();
    
    // Top Profitable Products
    const profitableData = [
      ['Profit Analysis Report'],
      ['Generated:', new Date().toLocaleDateString('en-IN')],
      [],
      ['Top 10 Most Profitable Products'],
      ['#', 'Product Name', 'Category', 'Total Profit', 'Profit Margin %'],
      ...data.topProfitable.slice(0, 10).map((p, idx) => [
        idx + 1,
        p.productName,
        p.category,
        p.totalProfit,
        p.profitMargin
      ])
    ];
    
    const ws1 = XLSX.utils.aoa_to_sheet(profitableData);
    ws1['!cols'] = [{wch: 5}, {wch: 40}, {wch: 20}, {wch: 15}, {wch: 15}];
    XLSX.utils.book_append_sheet(wb, ws1, 'Top Profitable');
    
    // Low Margin Products
    const lowMarginData = [
      ['Low Margin Products'],
      ['#', 'Product Name', 'Category', 'Total Profit', 'Profit Margin %'],
      ...data.lowMargin.slice(0, 10).map((p, idx) => [
        idx + 1,
        p.productName,
        p.category,
        p.totalProfit,
        p.profitMargin
      ])
    ];
    
    const ws2 = XLSX.utils.aoa_to_sheet(lowMarginData);
    ws2['!cols'] = [{wch: 5}, {wch: 40}, {wch: 20}, {wch: 15}, {wch: 15}];
    XLSX.utils.book_append_sheet(wb, ws2, 'Low Margin');
    
    return wb;
  };

  const generateInventoryReport = async () => {
    const response = await superstoreAPI.getProductAnalytics();
    const data = response.data.data;
    
    const wb = XLSX.utils.book_new();
    
    const inventoryData = [
      ['Inventory Report'],
      ['Generated:', new Date().toLocaleDateString('en-IN')],
      [],
      ['Summary'],
      ['Total Unique Products', data.totalProducts || 0],
      ['Total Quantity', data.totalQuantity || 0],
      ['Total Value', data.totalValue || 0],
      ['Average Price', data.avgPrice || 0],
      [],
      ['All Products'],
      ['#', 'Product Name', 'Category', 'Quantity Sold', 'Total Sales', 'Total Profit'],
      ...data.topProducts.map((p, idx) => [
        idx + 1,
        p.productName,
        p.category,
        p.quantity,
        p.totalSales || 0,
        p.totalProfit || 0
      ])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(inventoryData);
    ws['!cols'] = [{wch: 5}, {wch: 40}, {wch: 20}, {wch: 15}, {wch: 15}, {wch: 15}];
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    
    // Category Breakdown
    if (data.categoryBreakdown && data.categoryBreakdown.length > 0) {
      const categoryData = [
        ['Category Breakdown'],
        ['Category', 'Quantity', 'Value'],
        ...data.categoryBreakdown.map(cat => [
          cat.category,
          cat.quantity,
          cat.value
        ])
      ];
      const wsCat = XLSX.utils.aoa_to_sheet(categoryData);
      wsCat['!cols'] = [{wch: 20}, {wch: 15}, {wch: 15}];
      XLSX.utils.book_append_sheet(wb, wsCat, 'By Category');
    }
    
    return wb;
  };

  const generateCustomerReport = async () => {
    const response = await superstoreAPI.getCustomerAnalytics();
    const data = response.data.data;
    
    const wb = XLSX.utils.book_new();
    
    const customerData = [
      ['Customer Report'],
      ['Generated:', new Date().toLocaleDateString('en-IN')],
      [],
      ['Summary'],
      ['Total Customers', data.totalCustomers || 0],
      ['Total Orders', data.totalOrders || 0],
      ['Average Order Value', data.avgOrderValue || 0],
      [],
      ['Customer Segments'],
      ['Segment', 'Order Count', 'Total Sales', '% of Total'],
    ];
    
    if (data.segmentBreakdown) {
      data.segmentBreakdown.forEach(seg => {
        customerData.push([
          seg._id,
          seg.count,
          seg.totalSales,
          ((seg.count / data.totalOrders) * 100).toFixed(2)
        ]);
      });
    }
    
    const ws = XLSX.utils.aoa_to_sheet(customerData);
    ws['!cols'] = [{wch: 20}, {wch: 15}, {wch: 15}, {wch: 12}];
    XLSX.utils.book_append_sheet(wb, ws, 'Customer Analysis');
    
    return wb;
  };

  const generateRegionalReport = async () => {
    const response = await superstoreAPI.getSalesAnalytics({});
    const data = response.data.data;
    
    const wb = XLSX.utils.book_new();
    
    const regionalData = [
      ['Regional Performance Report'],
      ['Generated:', new Date().toLocaleDateString('en-IN')],
      [],
      ['Regional Analysis'],
      ['Region', 'Sales', 'Profit', 'Orders', 'Margin %']
    ];
    
    if (data.regionBreakdown) {
      data.regionBreakdown.forEach(region => {
        regionalData.push([
          region._id,
          region.sales,
          region.profit,
          region.orders,
          ((region.profit / region.sales) * 100).toFixed(2)
        ]);
      });
    }
    
    const ws = XLSX.utils.aoa_to_sheet(regionalData);
    ws['!cols'] = [{wch: 15}, {wch: 15}, {wch: 15}, {wch: 12}, {wch: 12}];
    XLSX.utils.book_append_sheet(wb, ws, 'Regional Performance');
    
    return wb;
  };

  const generateCategoryReport = async () => {
    const response = await superstoreAPI.getSalesAnalytics({});
    const data = response.data.data;
    
    const wb = XLSX.utils.book_new();
    
    const categoryData = [
      ['Category Performance Report'],
      ['Generated:', new Date().toLocaleDateString('en-IN')],
      [],
      ['Category Analysis'],
      ['Category', 'Sales', 'Profit', 'Orders', 'Margin %']
    ];
    
    if (data.categoryBreakdown) {
      data.categoryBreakdown.forEach(cat => {
        categoryData.push([
          cat._id,
          cat.sales,
          cat.profit,
          cat.orders,
          ((cat.profit / cat.sales) * 100).toFixed(2)
        ]);
      });
    }
    
    const ws = XLSX.utils.aoa_to_sheet(categoryData);
    ws['!cols'] = [{wch: 20}, {wch: 15}, {wch: 15}, {wch: 12}, {wch: 12}];
    XLSX.utils.book_append_sheet(wb, ws, 'Category Performance');
    
    return wb;
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      let wb;
      
      switch(reportType) {
        case 'sales':
          wb = await generateSalesReport();
          break;
        case 'profit':
          wb = await generateProfitReport();
          break;
        case 'inventory':
          wb = await generateInventoryReport();
          break;
        case 'customer':
          wb = await generateCustomerReport();
          break;
        case 'regional':
          wb = await generateRegionalReport();
          break;
        case 'category':
          wb = await generateCategoryReport();
          break;
        default:
          wb = await generateSalesReport();
      }
      
      const fileName = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_Report_${dateRange}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Excel report downloaded successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', desc: 'Comprehensive sales analytics and trends' },
    { id: 'profit', name: 'Profit Analysis', desc: 'Profit margins and profitability insights' },
    { id: 'inventory', name: 'Inventory Report', desc: 'Stock levels and product performance' },
    { id: 'customer', name: 'Customer Report', desc: 'Customer behavior and segmentation' },
    { id: 'regional', name: 'Regional Report', desc: 'Region-wise performance analysis' },
    { id: 'category', name: 'Category Report', desc: 'Category-wise sales breakdown' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <FileText size={32} />
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        </div>
        <p className="text-blue-100">Generate comprehensive Excel reports from 100,000+ transactions</p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-slate-600" />
            <h2 className="text-xl font-bold text-slate-900">Report Configuration</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={generating}
          className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download size={20} />
              <span>Generate Report</span>
            </>
          )}
        </button>
      </div>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((type) => (
          <div key={type.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-white" />
              </div>
              <button
                onClick={async () => {
                  const prevType = reportType;
                  setReportType(type.id);
                  setGenerating(true);
                  try {
                    let wb;
                    
                    switch(type.id) {
                      case 'sales':
                        wb = await generateSalesReport();
                        break;
                      case 'profit':
                        wb = await generateProfitReport();
                        break;
                      case 'inventory':
                        wb = await generateInventoryReport();
                        break;
                      case 'customer':
                        wb = await generateCustomerReport();
                        break;
                      case 'regional':
                        wb = await generateRegionalReport();
                        break;
                      case 'category':
                        wb = await generateCategoryReport();
                        break;
                    }
                    
                    const fileName = `${type.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
                    XLSX.writeFile(wb, fileName);
                    toast.success(`${type.name} downloaded successfully!`);
                  } catch (error) {
                    console.error('Error:', error);
                    toast.error('Failed to generate report');
                  } finally {
                    setGenerating(false);
                    setReportType(prevType);
                  }
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Quick Download Excel"
              >
                <Download size={20} className="text-green-600" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{type.name}</h3>
            <p className="text-sm text-slate-600">{type.desc}</p>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <Calendar size={14} />
                <span>Available for all date ranges</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Reports</h2>
        <div className="space-y-3">
          {[
            { name: 'Monthly Sales Report', date: '2024-03-01', size: '1.2 MB', format: 'Excel' },
            { name: 'Quarterly Profit Analysis', date: '2024-02-28', size: '980 KB', format: 'Excel' },
            { name: 'Annual Inventory Summary', date: '2024-01-31', size: '2.4 MB', format: 'Excel' },
            { name: 'Customer Segmentation Report', date: '2024-01-15', size: '750 KB', format: 'Excel' },
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{report.name}</p>
                  <p className="text-sm text-slate-500">{report.date} • {report.size} • {report.format}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-white rounded-lg transition-colors">
                <Download size={20} className="text-slate-600" />
              </button>
            </div>
          ))}
        </div>
      </div>
   </div>
  );
}
