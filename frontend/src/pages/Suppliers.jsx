import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { supplierAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await supplierAPI.getAll();
      setSuppliers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage supplier information</p>
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Contact Person</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">City</th>
                  <th className="text-center py-3 px-4">Rating</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{supplier.name}</td>
                    <td className="py-3 px-4">{supplier.contactPerson}</td>
                    <td className="py-3 px-4">{supplier.phone}</td>
                    <td className="py-3 px-4">{supplier.address?.city}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="badge badge-warning">⭐ {supplier.rating.toFixed(1)}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`badge ${supplier.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                        {supplier.status}
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

export default Suppliers;
