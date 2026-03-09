import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { superstoreAPI } from '../utils/superstoreApi';
import { Search, Package, Calendar, MapPin, LogOut, User, Menu, X, Plus, ShoppingCart, LayoutGrid, ChevronRight, TrendingUp, IndianRupee, Tag, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PlaceOrderModal from '../components/PlaceOrderModal';

export default function SuperstoreUser() {
  const [activeTab, setActiveTab] = useState('products');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Orders state
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [orderFilters, setOrderFilters] = useState({ search: '', category: '', region: '', segment: '' });
  const [orderPagination, setOrderPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [orderStats, setOrderStats] = useState({ total: 0, totalSpent: 0, uniqueProducts: 0, topCategory: '—' });

  // Products state
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'products', label: 'Products', icon: LayoutGrid },
    { id: 'orders', label: 'My Orders', icon: ShoppingCart },
  ];

  useEffect(() => {
    fetchProducts();
    fetchOrderStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab, orderPagination.page, orderFilters.category, orderFilters.region, orderFilters.segment]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await superstoreAPI.getOrders({
        page: orderPagination.page,
        limit: orderPagination.limit,
        ...orderFilters
      });
      setOrders(response.data.data);
      setOrderPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      // Fetch all user orders (large limit) to compute stats
      const response = await superstoreAPI.getOrders({ page: 1, limit: 1000 });
      const allOrders = response.data.data || [];
      const total = response.data.pagination?.total || allOrders.length;
      const totalSpent = allOrders.reduce((sum, o) => sum + (o.sales || 0), 0);
      const uniqueProducts = new Set(allOrders.map(o => o.productName)).size;
      const catCount = {};
      allOrders.forEach(o => { catCount[o.category] = (catCount[o.category] || 0) + 1; });
      const topCategory = Object.keys(catCount).sort((a, b) => catCount[b] - catCount[a])[0] || '—';
      setOrderStats({ total, totalSpent, uniqueProducts, topCategory });
    } catch { /* silent */ }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await superstoreAPI.getAvailableProducts();
      setProducts(response.data.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleMenuClick = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleOrderPlaced = () => {
    fetchOrders();
    fetchOrderStats();
    if (activeTab !== 'orders') setActiveTab('orders');
    toast.success('Order placed! View in My Orders.');
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  const categoryColors = {
    'Packaging Materials': 'bg-blue-100 text-blue-700',
    'Plastic Products': 'bg-purple-100 text-purple-700',
    'Textile Products': 'bg-amber-100 text-amber-700',
    'Accessories': 'bg-green-100 text-green-700',
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = !productSearch || p.productName.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = !productCategory || p.category === productCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <PlaceOrderModal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} onOrderPlaced={handleOrderPlaced} />

      {/* Backdrop overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Hamburger button */}
      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} className="fixed top-5 left-5 z-50">
          <div className="p-2.5 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 hover:border-blue-300 transition-all">
            <Menu size={22} className="text-gray-700" />
          </div>
        </button>
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-white border-r border-gray-200 shadow-xl`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                  <Package size={22} className="text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">SARITHA TRADERS</h1>
                  <p className="text-xs text-blue-100">Orders Portal</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <X size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => handleMenuClick(item.id)}
                  className={`w-full group rounded-lg transition-all duration-200 ${isActive ? '' : 'hover:bg-gray-50'}`}>
                  <div className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700'}`}>
                    <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`}><Icon size={20} /></div>
                    <span className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>{item.label}</span>
                    {isActive && <div className="ml-auto"><ChevronRight size={16} className="text-white" /></div>}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Place Order + Logout */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button onClick={() => setShowOrderModal(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm">
              <Plus size={18} />
              <span>Place Order</span>
            </button>
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-sm shadow-sm">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="ml-16 flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  {activeTab === 'products' ? <LayoutGrid size={18} className="text-white" /> : <ShoppingCart size={18} className="text-white" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{activeTab === 'products' ? 'Products' : 'My Orders'}</h2>
                  <p className="text-xs text-gray-500">{activeTab === 'products' ? 'Browse available products' : 'Orders you have placed'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="px-6 pt-5 pb-0 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingCart size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">My Orders</p>
              <p className="text-xl font-bold text-gray-900">{orderStats.total}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <IndianRupee size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Spent</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(orderStats.totalSpent)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Unique Products</p>
              <p className="text-xl font-bold text-gray-900">{orderStats.uniqueProducts}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart2 size={18} className="text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">Top Category</p>
              <p className="text-sm font-bold text-gray-900 truncate">{orderStats.topCategory}</p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">

          {/* ─── PRODUCTS TAB ─── */}
          {activeTab === 'products' && (
            <div>
              {/* Search + Filter */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Search products..."
                      value={productSearch} onChange={e => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                  </div>
                  <select value={productCategory} onChange={e => setProductCategory(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                    <option value="">All Categories</option>
                    <option value="Packaging Materials">Packaging Materials</option>
                    <option value="Plastic Products">Plastic Products</option>
                    <option value="Textile Products">Textile Products</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              {loadingProducts ? (
                <div className="flex items-center justify-center py-24">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">{filteredProducts.length} products available</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product Name</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sub-Category</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                          <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Price</th>
                          <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Popularity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((product, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                            <td className="px-5 py-3 text-sm text-gray-400 w-10">{idx + 1}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Package size={15} className="text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">{product.productName}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-sm text-gray-500">{product.subCategory}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${categoryColors[product.category] || 'bg-gray-100 text-gray-600'}`}>
                                {product.category}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right text-sm font-bold text-blue-600">{formatCurrency(product.price)}</td>
                            <td className="px-5 py-3 text-right">
                              <div className="flex items-center justify-end gap-1 text-gray-400">
                                <TrendingUp size={13} />
                                <span className="text-xs">{product.popularity?.toLocaleString()}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── MY ORDERS TAB ─── */}
          {activeTab === 'orders' && (
            <div>
              {/* Filters */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Search by order ID, product..."
                      value={orderFilters.search}
                      onChange={e => setOrderFilters(prev => ({ ...prev, search: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && fetchOrders()}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <select value={orderFilters.category} onChange={e => setOrderFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                      <option value="">All Categories</option>
                      <option value="Packaging Materials">Packaging Materials</option>
                      <option value="Plastic Products">Plastic Products</option>
                      <option value="Textile Products">Textile Products</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                    <select value={orderFilters.region} onChange={e => setOrderFilters(prev => ({ ...prev, region: e.target.value }))}
                      className="px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                      <option value="">All Regions</option>
                      <option value="North India">North India</option>
                      <option value="South India">South India</option>
                      <option value="East India">East India</option>
                      <option value="West India">West India</option>
                    </select>
                    <select value={orderFilters.segment} onChange={e => setOrderFilters(prev => ({ ...prev, segment: e.target.value }))}
                      className="px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                      <option value="">All Segments</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Retail">Retail</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                    <button onClick={fetchOrders}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors">
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {/* Orders Count */}
              {!loadingOrders && (
                <p className="text-sm text-gray-500 mb-4">
                  {orderPagination.total === 0
                    ? 'No orders placed yet. Click "Place Order" to get started!'
                    : `${orderPagination.total} order${orderPagination.total !== 1 ? 's' : ''} found`}
                </p>
              )}

              {loadingOrders ? (
                <div className="flex items-center justify-center py-24">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 py-20 text-center">
                  <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">No orders yet</p>
                  <p className="text-gray-400 text-sm mt-1">Use the "Place Order" button in the sidebar to get started</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Region</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                          <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Sales</th>
                          <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Qty</th>
                          <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Ship Mode</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-blue-600">{order.orderId}</td>
                            <td className="px-5 py-3 max-w-xs">
                              <div className="text-sm font-medium text-gray-900 truncate">{order.productName}</div>
                              <div className="text-xs text-gray-400">{order.subCategory}</div>
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${categoryColors[order.category] || 'bg-gray-100 text-gray-600'}`}>
                                {order.category}
                              </span>
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin size={13} className="text-gray-400" />{order.region}
                              </div>
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar size={13} className="text-gray-400" />{formatDate(order.orderDate)}
                              </div>
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap text-right text-sm font-semibold text-blue-600">{formatCurrency(order.sales)}</td>
                            <td className="px-5 py-3 whitespace-nowrap text-center text-sm text-gray-700">{order.quantity}</td>
                            <td className="px-5 py-3 whitespace-nowrap text-center">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{order.shipMode}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {orderPagination.totalPages > 1 && (
                    <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Showing {((orderPagination.page - 1) * orderPagination.limit) + 1}–{Math.min(orderPagination.page * orderPagination.limit, orderPagination.total)} of {orderPagination.total}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => setOrderPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                          disabled={orderPagination.page === 1}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                          Previous
                        </button>
                        <span className="px-3 py-1.5 text-sm text-gray-600">{orderPagination.page} / {orderPagination.totalPages}</span>
                        <button onClick={() => setOrderPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                          disabled={orderPagination.page >= orderPagination.totalPages}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

