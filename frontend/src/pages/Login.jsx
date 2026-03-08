import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await login(formData);
    
    if (success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Quick login buttons
  const quickLogin = (role) => {
    const credentials = {
      admin: { email: 'admin@inventory.com', password: 'admin123' },
      staff: { email: 'staff@inventory.com', password: 'staff123' },
      customer: { email: 'customer@example.com', password: 'customer123' },
    };
    setFormData(credentials[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Package className="text-primary-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Inventory Analytics
          </h1>
          <p className="text-primary-100">
            Sales and Delivery Management System
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 text-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Login */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Quick Login (Demo):</p>
            <div className="flex gap-2">
              <button
                onClick={() => quickLogin('admin')}
                className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Admin
              </button>
              <button
                onClick={() => quickLogin('staff')}
                className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Staff
              </button>
              <button
                onClick={() => quickLogin('customer')}
                className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Customer
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-primary-100 text-sm mt-6">
          © 2024 Inventory Analytics System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
