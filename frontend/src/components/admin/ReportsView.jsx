import { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { superstoreAPI } from '../../utils/superstoreApi';

export default function ReportsView() {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('monthly');
  const [generating, setGenerating] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(value);

  const generateSalesReport = async (doc) => {
    const response = await superstoreAPI.getSalesAnalytics({});
    const data = response.data.data;
    
    doc.setFontSize(20);
    doc.text('Sales Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);
    doc.text(`Date Range: ${dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}`, 14, 34);
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Summary', 14, 46);
    
    doc.setFontSize(10);
    doc.text(`Total Sales: ${formatCurrency(data.totalSales || 0)}`, 14, 54);
    doc.text(`Total Profit: ${formatCurrency(data.totalProfit || 0)}`, 14, 60);
    doc.text(`Profit Margin: ${((data.totalProfit / data.totalSales) * 100).toFixed(2)}%`, 14, 66);
    
    // Category breakdown
    if (data.categoryBreakdown && data.categoryBreakdown.length > 0) {
      doc.setFontSize(14);
      doc.text('Category Performance', 14, 78);
      
      const categoryData = data.categoryBreakdown.map(cat => [
        cat._id,
        formatCurrency(cat.sales),
        formatCurrency(cat.profit),
        `${((cat.profit / cat.sales) * 100).toFixed(1)}%`
      ]);
      
      doc.autoTable({
        startY: 82,
        head: [['Category', 'Sales', 'Profit', 'Margin']],
        body: categoryData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
      });
    }
    
    // Regional breakdown
    if (data.regionBreakdown && data.regionBreakdown.length > 0) {
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Regional Performance', 14, finalY);
      
      const regionData = data.regionBreakdown.map(region => [
        region._id,
        formatCurrency(region.sales),
        formatCurrency(region.profit),
        region.orders.toLocaleString()
      ]);
      
      doc.autoTable({
        startY: finalY + 4,
        head: [['Region', 'Sales', 'Profit', 'Orders']],
        body: regionData,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] }
      });
    }
  };

  const generateProfitReport = async (doc) => {
    const response = await superstoreAPI.getProfitAnalysis();
    const data = response.data.data;
    
    doc.setFontSize(20);
    doc.text('Profit Analysis Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Top 10 Most Profitable Products', 14, 40);
    
    const profitableData = data.topProfitable.slice(0, 10).map((p, idx) => [
      idx + 1,
      p.productName,
      p.category,
      formatCurrency(p.totalProfit),
      `${p.profitMargin}%`
    ]);
    
    doc.autoTable({
      startY: 44,
      head: [['#', 'Product', 'Category', 'Profit', 'Margin']],
      body: profitableData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }
    });
    
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Low Margin Products', 14, finalY);
    
    const lowMarginData = data.lowMargin.slice(0, 10).map((p, idx) => [
      idx + 1,
      p.productName,
      p.category,
      formatCurrency(p.totalProfit),
      `${p.profitMargin}%`
    ]);
    
    doc.autoTable({
      startY: finalY + 4,
      head: [['#', 'Product', 'Category', 'Profit', 'Margin']],
      body: lowMarginData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] }
    });
  };

  const generateInventoryReport = async (doc) => {
    const response = await superstoreAPI.getProductAnalytics();
    const data = response.data.data;
    
    doc.setFontSize(20);
    doc.text('Inventory Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Summary', 14, 40);
    
    doc.setFontSize(10);
    doc.text(`Total Unique Products: ${formatNumber(data.totalProducts)}`, 14, 48);
    doc.text(`Total Quantity: ${formatNumber(data.totalQuantity)}`, 14, 54);
    doc.text(`Total Value: ${formatCurrency(data.totalValue)}`, 14, 60);
    doc.text(`Average Price: ${formatCurrency(data.avgPrice)}`, 14, 66);
    
    doc.setFontSize(14);
    doc.text('Top 20 Products by Quantity', 14, 78);
    
    const productData = data.topProducts.slice(0, 20).map((p, idx) => [
      idx + 1,
      p.productName,
      p.category,
      formatNumber(p.quantity),
      formatCurrency(p.totalSales)
    ]);
    
    doc.autoTable({
      startY: 82,
      head: [['#', 'Product', 'Category', 'Quantity', 'Sales']],
      body: productData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });
  };

  const generateCustomerReport = async (doc) => {
    const response = await superstoreAPI.getCustomerAnalytics();
    const data = response.data.data;
    
    doc.setFontSize(20);
    doc.text('Customer Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Summary', 14, 40);
    
    doc.setFontSize(10);
    doc.text(`Total Customers: ${formatNumber(data.totalCustomers || 0)}`, 14, 48);
    doc.text(`Total Orders: ${formatNumber(data.totalOrders || 0)}`, 14, 54);
    doc.text(`Average Order Value: ${formatCurrency(data.avgOrderValue || 0)}`, 14, 60);
    
    if (data.segmentBreakdown && data.segmentBreakdown.length > 0) {
      doc.setFontSize(14);
      doc.text('Customer Segments', 14, 72);
      
      const segmentData = data.segmentBreakdown.map(seg => [
        seg._id,
        formatNumber(seg.count),
        formatCurrency(seg.totalSales),
        `${((seg.count / data.totalOrders) * 100).toFixed(1)}%`
      ]);
      
      doc.autoTable({
        startY: 76,
        head: [['Segment', 'Orders', 'Total Sales', '% of Total']],
        body: segmentData,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] }
      });
    }
  };

  const generateRegionalReport = async (doc) => {
    const response = await superstoreAPI.getSalesAnalytics({});
    const data = response.data.data;
    
    doc.setFontSize(20);
    doc.text('Regional Performance Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);
    
    if (data.regionBreakdown && data.regionBreakdown.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Regional Performance Analysis', 14, 40);
      
      const regionData = data.regionBreakdown.map(region => [
        region._id,
        formatCurrency(region.sales),
        formatCurrency(region.profit),
        region.orders.toLocaleString(),
        `${((region.profit / region.sales) * 100).toFixed(1)}%`
      ]);
      
      doc.autoTable({
        startY: 44,
        head: [['Region', 'Sales', 'Profit', 'Orders', 'Margin']],
        body: regionData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
      });
    }
  };

  const generateCategoryReport = async (doc) => {
    const response = await superstoreAPI.getSalesAnalytics({});
    const data = response.data.data;
    
    doc.setFontSize(20);
    doc.text('Category Performance Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);
    
    if (data.categoryBreakdown && data.categoryBreakdown.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Category Performance Analysis', 14, 40);
      
      const categoryData = data.categoryBreakdown.map(cat => [
        cat._id,
        formatCurrency(cat.sales),
        formatCurrency(cat.profit),
        cat.orders.toLocaleString(),
        `${((cat.profit / cat.sales) * 100).toFixed(1)}%`
      ]);
      
      doc.autoTable({
        startY: 44,
        head: [['Category', 'Sales', 'Profit', 'Orders', 'Margin']],
        body: categoryData,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246] }
      });
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      
      switch(reportType) {
        case 'sales':
          await generateSalesReport(doc);
          break;
        case 'profit':
          await generateProfitReport(doc);
          break;
        case 'inventory':
          await generateInventoryReport(doc);
          break;
        case 'customer':
          await generateCustomerReport(doc);
          break;
        case 'regional':
          await generateRegionalReport(doc);
          break;
        case 'category':
          await generateCategoryReport(doc);
          break;
        default:
          await generateSalesReport(doc);
      }
      
      const fileName = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_Report_${dateRange}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success('Report generated and downloaded successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
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
        <p className="text-blue-100">Generate comprehensive reports from 100,000+ transactions</p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200">
        <div className="flex items-center space-x-2 mb-6">
          <Filter size={20} className="text-slate-600" />
          <h2 className="text-xl font-bold text-slate-900">Report Configuration</h2>
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
          className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadlow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-white" />
              </div>
              <button
                onClick={async () => {
                  const prevType = reportType;
                  setReportType(type.id);
                  setGenerating(true);
                  try {
                    const doc = new jsPDF();
                    
                    switch(type.id) {
                      case 'sales':
                        await generateSalesReport(doc);
                        break;
                      case 'profit':
                        await generateProfitReport(doc);
                        break;
                      case 'inventory':
                        await generateInventoryReport(doc);
                        break;
                      case 'customer':
                        await generateCustomerReport(doc);
                        break;
                      case 'regional':
                        await generateRegionalReport(doc);
                        break;
                      case 'category':
                        await generateCategoryReport(doc);
                        break;
                    }
                    
                    const fileName = `${type.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
                    doc.save(fileName);
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
                title="Quick Generate"
              >
                <Download size={20} className="text-slate-600" />
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
            { name: 'Monthly Sales Report', date: '2024-03-01', size: '2.5 MB' },
            { name: 'Quarterly Profit Analysis', date: '2024-02-28', size: '3.2 MB' },
            { name: 'Annual Inventory Summary', date: '2024-01-31', size: '4.1 MB' },
            { name: 'Customer Segmentation Report', date: '2024-01-15', size: '1.8 MB' },
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{report.name}</p>
                  <p className="text-sm text-slate-500">{report.date} • {report.size}</p>
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
