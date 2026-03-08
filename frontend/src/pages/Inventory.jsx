import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { inventoryAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Inventory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transRes, summaryRes] = await Promise.all([
        inventoryAPI.getTransactions({ limit: 50 }),
        inventoryAPI.getSummary()
      ]);
      setTransactions(transRes.data.data.transactions);
      setSummary(summaryRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionColor = (type) => {
    const colors = {
      'stock-in': 'badge-success',
      'stock-out': 'badge-danger',
      'adjustment': 'badge-info',
      'return': 'badge-warning'
    };
    return colors[type] || 'badge-gray';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track stock movements and history</p>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <p className="text-gray-600 text-sm mb-1">Total Products</p>
              <p className="text-2xl font-bold">{summary.totalProducts}</p>
            </div>
            <div className="card">
              <p className="text-gray-600 text-sm mb-1">Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-600">{summary.lowStockCount}</p>
            </div>
            <div className="card">
              <p className="text-gray-600 text-sm mb-1">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{summary.outOfStockCount}</p>
            </div>
            <div className="card">
              <p className="text-gray-600 text-sm mb-1">Total Stock Value</p>
              <p className="text-2xl font-bold text-green-600">₹{summary.totalStockValue.toLocaleString()}</p>
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-center py-3 px-4">Type</th>
                  <th className="text-right py-3 px-4">Quantity</th>
                  <th className="text-right py-3 px-4">Stock Before</th>
                  <th className="text-right py-3 px-4">Stock After</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{tx.product?.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`badge ${getTransactionColor(tx.transactionType)}`}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{tx.quantity}</td>
                    <td className="py-3 px-4 text-right">{tx.stockBefore}</td>
                    <td className="py-3 px-4 text-right">{tx.stockAfter}</td>
                    <td className="py-3 px-4">{format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}</td>
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

export default Inventory;
