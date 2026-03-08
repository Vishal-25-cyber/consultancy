import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Search, Eye, Edit, Truck } from 'lucide-react';
import { orderAPI, customerAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, filterPayment]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.orderStatus = filterStatus;
      if (filterPayment) params.paymentStatus = filterPayment;
      
      const response = await orderAPI.getAll(params);
      setOrders(response.data.data.orders);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      processing: 'badge-info',
      ready: 'badge-success',
      completed: 'badge-success',
      cancelled: 'badge-danger',
      returned: 'badge-gray'
    };
    return colors[status] || 'badge-gray';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'badge-warning',
      partial: 'badge-warning',
      paid: 'badge-success',
      overdue: 'badge-danger'
    };
    return colors[status] || 'badge-gray';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600 mt-1">Manage customer orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="">All Order Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="input"
            >
              <option value="">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Items</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Order Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Payment</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-primary-600">{order.orderNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{order.customer?.name}</div>
                        <div className="text-sm text-gray-500">{order.customer?.email}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        ₹{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {order.items.length}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`badge ${getOrderStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`badge ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            title="View Details"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            title="Edit Order"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            title="Assign Delivery"
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                          >
                            <Truck size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
