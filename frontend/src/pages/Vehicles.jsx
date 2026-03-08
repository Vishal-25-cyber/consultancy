import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { vehicleAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleAPI.getAll();
      setVehicles(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'badge-success',
      'in-transit': 'badge-warning',
      maintenance: 'badge-danger',
      inactive: 'badge-gray'
    };
    return colors[status] || 'badge-gray';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-600 mt-1">Manage delivery vehicles</p>
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Vehicle Number</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Driver</th>
                  <th className="text-right py-3 px-4">Capacity (kg)</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-primary-600">{vehicle.vehicleNumber}</td>
                    <td className="py-3 px-4 capitalize">{vehicle.vehicleType}</td>
                    <td className="py-3 px-4">{vehicle.driver?.name || 'Not assigned'}</td>
                    <td className="py-3 px-4 text-right">{vehicle.capacity}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`badge ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
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

export default Vehicles;
