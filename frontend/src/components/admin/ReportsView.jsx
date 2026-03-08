import { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsView() {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('monthly');
  const [generating, setGenerating] = useState(false);

  const generateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      toast.success('Report generated successfully!');
      setGenerating(false);
    }, 1500);
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
                onClick={() => {
                  setReportType(type.id);
                  generateReport();
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
