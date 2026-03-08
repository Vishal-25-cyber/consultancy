import { useState } from 'react';
import Layout from '../components/Layout';
import { FileText, Download } from 'lucide-react';
import { reportAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(false);

  const generateReport = async (type) => {
    setLoading(true);
    try {
      let response;
      switch(type) {
        case 'daily':
          response = await reportAPI.getDailySales();
          break;
        case 'monthly':
          response = await reportAPI.getMonthlySales();
          break;
        case 'inventory':
          response = await reportAPI.getInventory();
          break;
        case 'delivery':
          response = await reportAPI.getDeliveryPerformance();
          break;
        case 'customer':
          response = await reportAPI.getCustomer();
          break;
        case 'profit':
          response = await reportAPI.getProfitLoss();
          break;
      }
      toast.success('Report generated successfully');
      console.log('Report data:', response.data);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    { id: 'daily', title: 'Daily Sales Report', desc: 'View daily sales performance' },
    { id: 'monthly', title: 'Monthly Sales Report', desc: 'View monthly sales breakdown' },
    { id: 'inventory', title: 'Inventory Report', desc: 'Current stock status' },
    { id: 'delivery', title: 'Delivery Performance', desc: 'Delivery metrics and KPIs' },
    { id: 'customer', title: 'Customer Report', desc: 'Customer analytics and insights' },
    { id: 'profit', title: 'Profit/Loss Report', desc: 'Financial profitability analysis' }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and download business reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <FileText className="text-primary-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{report.desc}</p>
                  <button 
                    onClick={() => generateReport(report.id)}
                    disabled={loading}
                    className="btn btn-primary btn-sm flex items-center gap-2"
                  >
                    <Download size={16} />
                    Generate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
