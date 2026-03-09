import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Package,
  TrendingUp,
  Brain,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders History', icon: ShoppingCart },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'ml-predictions', label: 'ML Predictions', icon: Brain },
  { id: 'reports', label: 'Reports', icon: TrendingUp },
];

export default function AdminLayout({ children, activeTab, setActiveTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleMenuClick = (tabId) => {
    setActiveTab(tabId);
    // Only close sidebar on mobile screens
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Backdrop Overlay - only on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Toggle Button - Only show when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-5 left-5 z-50 transition-all duration-300"
        >
          <div className="group">
            <div className="p-2.5 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 hover:border-blue-300 transition-all duration-200">
              <Menu size={22} className="text-gray-700" />
            </div>
          </div>
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-gray-200 shadow-xl`}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section with Close Button */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                  <BarChart3 size={24} className="text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">SARITHA TRADERS</h1>
                  <p className="text-xs text-blue-100 font-medium">Packaging Materials Merchant</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full group relative rounded-lg transition-all duration-200 ${
                    isActive ? '' : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto">
                        <ChevronRight size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium text-sm shadow-sm"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-4 transition-all duration-300 ${sidebarOpen ? 'ml-16' : 'ml-16'}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                    {menuItems.find((item) => item.id === activeTab)?.icon && (
                      <div className="text-white">
                        {(() => {
                          const Icon = menuItems.find((item) => item.id === activeTab).icon;
                          return <Icon size={18} />;
                        })()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {menuItems.find((item) => item.id === activeTab)?.label || 'Dashboard'}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">View and manage your data</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
