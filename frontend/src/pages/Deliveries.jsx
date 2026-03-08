import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { deliveryAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await deliveryAPI.getAll({ limit: 50 });
      setDeliveries(response.data.data.deliveries);
    } catch (error) {
      toast.error('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'badge-gray',
      assigned: 'badge-info',
      'in-transit': 'badge-warning',
      delivered: 'badge-success',
      failed: 'badge-danger'
    };
    return colors[status] || 'badge-gray';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deliveries</h1>
          <p className="text-gray-600 mt-1">Manage order deliveries</p>
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Delivery ID</th>
                  <th className="text-left py-3 px-4">Order</th>
                  <th className="text-left py-3 px-4">Vehicle</th>
                  <th className="text-left py-3 px-4">Scheduled Date</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => (
                  <tr key={delivery._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-primary-600">{delivery.deliveryNumber}</td>
                    <td className="py-3 px-4">{delivery.order?.orderNumber}</td>
                    <td className="py-3 px-4">{delivery.vehicle?.vehicleNumber || 'Not assigned'}</td>
                    <td className="py-3 px-4">{format(new Date(delivery.scheduledDate), 'MMM dd, yyyy')}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`badge ${getStatusColor(delivery.deliveryStatus)}`}>
                        {delivery.deliveryStatus}
                      </span>
                    </td>
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

export default Deliveries;
