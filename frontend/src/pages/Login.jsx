import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package } from 'lucide-react';
import toast from 'react-hot-toast';

// Permanent admin credentials
const ADMIN_EMAIL = 'admin@inventory.com';
const ADMIN_PASSWORD = 'admin123';

const Login = () => {
  const [tab, setTab] = useState('user'); // 'user' | 'admin'
  const [userMode, setUserMode] = useState('signin'); // 'signin' | 'signup'

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // User sign in
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(signInData);
      if (user) navigate('/dashboard');
    } catch (_) {}
    setLoading(false);
  };

  // User sign up (stores in MongoDB)
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    const success = await register({
      name: signUpData.name,
      email: signUpData.email,
      password: signUpData.password,
      role: 'customer',
    });
    if (success) navigate('/dashboard');
    setLoading(false);
  };

  // Admin login with permanent credentials
  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      const user = await login({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      if (user) navigate('/dashboard');
    } catch (_) {}
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Package className="text-primary-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SARITHA TRADERS</h1>
          <p className="text-primary-100">Packaging Materials Merchant</p>
        </div>

        <div className="card">
          {/* User / Admin top tabs */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              onClick={() => setTab('user')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                tab === 'user' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              User
            </button>
            <button
              onClick={() => setTab('admin')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                tab === 'admin' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Admin
            </button>
          </div>

          {/* ── USER TAB ── */}
          {tab === 'user' && (
            <>
              {/* Sign In / Sign Up sub-tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setUserMode('signin')}
                  className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                    userMode === 'signin'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setUserMode('signup')}
                  className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                    userMode === 'signup'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {userMode === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="label">Email Address</label>
                    <input
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      className="input"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <input
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      className="input"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 text-lg">
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                  <p className="text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <button type="button" onClick={() => setUserMode('signup')} className="text-primary-600 font-medium hover:underline">
                      Sign Up
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                      className="input"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input
                      type="email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      className="input"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <input
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      className="input"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Confirm Password</label>
                    <input
                      type="password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                      className="input"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 text-lg">
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </button>
                  <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setUserMode('signin')} className="text-primary-600 font-medium hover:underline">
                      Sign In
                    </button>
                  </p>
                </form>
              )}
            </>
          )}

          {/* ── ADMIN TAB ── */}
          {tab === 'admin' && (
            <div className="space-y-5">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                <p className="text-sm font-semibold text-indigo-700">Admin Access</p>
                <p className="text-xs text-indigo-500 mt-1">
                  Secured with permanent credentials
                </p>
              </div>
              <button
                onClick={handleAdminLogin}
                disabled={loading}
                className="w-full btn btn-primary py-3 text-lg"
              >
                {loading ? 'Signing in...' : 'Login as Admin'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-primary-100 text-sm mt-6">
          © 2026 Saritha Traders. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
