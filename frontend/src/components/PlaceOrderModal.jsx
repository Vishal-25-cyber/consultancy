import { useState, useEffect } from 'react';
import { X, ShoppingCart, Package, MapPin, Truck, User, IndianRupee, ChevronDown, AlertTriangle } from 'lucide-react';
import { superstoreAPI } from '../utils/superstoreApi';
import toast from 'react-hot-toast';

const inputCls = "w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide";

export default function PlaceOrderModal({ isOpen, onClose, onOrderPlaced }) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    subCategory: '',
    quantity: 1,
    customerName: '',
    shipMode: 'Standard Delivery',
    segment: 'Wholesale',
    city: '',
    state: '',
    region: 'North India',
    postalCode: '',
    sales: 0
  });

  const regions = ['North India', 'South India', 'East India', 'West India'];
  const shipModes = ['Standard Delivery', 'Express Delivery', 'Same Day', 'Economy'];
  const segments = ['Wholesale', 'Retail', 'Industrial', 'Corporate'];

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  useEffect(() => {
    if (isOpen) fetchProducts();
  }, [isOpen]);

  useEffect(() => {
    if (formData.productName) {
      const product = products.find(p => p.productName === formData.productName);
      if (product) {
        setFormData(prev => ({
          ...prev,
          category: product.category,
          subCategory: product.subCategory,
          sales: product.price
        }));
      }
    }
  }, [formData.productName, products]);

  const fetchProducts = async () => {
    try {
      const response = await superstoreAPI.getAvailableProducts();
      setProducts(response.data.data);
    } catch {
      toast.error('Failed to load products');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productName || !formData.customerName || !formData.city || !formData.state || !formData.postalCode) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await superstoreAPI.createOrder({
        ...formData,
        quantity: parseInt(formData.quantity),
        sales: parseFloat(formData.sales) * parseInt(formData.quantity)
      });
      if (res.data.lowStockWarning) {
        toast.success(`Order placed! Only ${res.data.remainingStock} unit${res.data.remainingStock !== 1 ? 's' : ''} left — admin notified to refill.`, { duration: 6000, icon: '⚠️' });
      } else {
        toast.success('Order placed successfully!');
      }
      setFormData({
        productName: '', category: '', subCategory: '', quantity: 1,
        customerName: '', shipMode: 'Standard Delivery', segment: 'Wholesale',
        city: '', state: '', region: 'North India', postalCode: '', sales: 0
      });
      onOrderPlaced();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const totalPrice = formData.sales * formData.quantity;
  const selectedProduct = products.find(p => p.productName === formData.productName) || null;
  const availableStock = selectedProduct?.currentStock ?? 100;
  const stockStatus = selectedProduct?.stockStatus ?? 'Available';
  const isOutOfStock = formData.productName && (stockStatus === 'Out of Stock' || availableStock === 0);
  const isLowStock = formData.productName && stockStatus === 'Low Stock';
  const insufficientQty = !isOutOfStock && formData.productName && parseInt(formData.quantity) > availableStock;
  const canSubmit = !loading && !isOutOfStock && !insufficientQty;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Place New Order</h2>
              <p className="text-blue-100 text-xs">Fill in the details below</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── Product ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                <Package size={13} className="text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Product Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Select Product *</label>
                <div className="relative">
                  <select name="productName" value={formData.productName} onChange={handleChange} required className={inputCls + " appearance-none pr-8"}>
                    <option value="">Choose a product...</option>
                    {products.map((p, i) => (
                      <option key={i} value={p.productName}>
                        {p.productName} — {formatINR(p.price)} ({p.category})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {formData.category && (
                <div>
                  <label className={labelCls}>Category</label>
                  <input type="text" value={formData.category} readOnly className={inputCls + " bg-gray-50 text-gray-500 cursor-default"} />
                </div>
              )}
              {formData.subCategory && (
                <div>
                  <label className={labelCls}>Sub-Category</label>
                  <input type="text" value={formData.subCategory} readOnly className={inputCls + " bg-gray-50 text-gray-500 cursor-default"} />
                </div>
              )}

              <div>
                <label className={labelCls}>Quantity *</label>
                <input type="number" name="quantity" min="1" max="1000" value={formData.quantity}
                  onChange={handleChange} required
                  className={`${inputCls} ${insufficientQty ? 'border-red-400 ring-1 ring-red-400' : ''}`} />
                {formData.productName && selectedProduct && (
                  <p className="text-xs mt-1 text-gray-400">{availableStock} units available</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Total Price</label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <IndianRupee size={16} className="text-blue-600 flex-shrink-0" />
                  <span className="text-sm font-bold text-blue-700">
                    {totalPrice > 0 ? formatINR(totalPrice) : '—'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Stock Warning Banner ── */}
          {formData.productName && (isOutOfStock || isLowStock || insufficientQty) && (
            <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border ${
              isOutOfStock || insufficientQty
                ? 'bg-red-50 border-red-200'
                : 'bg-orange-50 border-orange-200'
            }`}>
              <AlertTriangle size={16} className={`flex-shrink-0 mt-0.5 ${isOutOfStock || insufficientQty ? 'text-red-500' : 'text-orange-500'}`} />
              <div>
                <p className={`text-xs font-semibold ${isOutOfStock || insufficientQty ? 'text-red-700' : 'text-orange-700'}`}>
                  {isOutOfStock
                    ? 'Out of Stock'
                    : insufficientQty
                    ? 'Insufficient Stock'
                    : 'Low Stock Alert'}
                </p>
                <p className={`text-xs mt-0.5 ${isOutOfStock || insufficientQty ? 'text-red-600' : 'text-orange-600'}`}>
                  {isOutOfStock
                    ? `"${formData.productName}" is currently out of stock. Please contact admin to refill.`
                    : insufficientQty
                    ? `Only ${availableStock} unit${availableStock !== 1 ? 's' : ''} available. Please reduce your quantity.`
                    : `Only ${availableStock} unit${availableStock !== 1 ? 's' : ''} left. Order soon before it runs out!`}
                </p>
              </div>
            </div>
          )}

          <hr className="border-gray-100" />

          {/* ── Customer ── */
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
                <User size={13} className="text-indigo-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Customer Information</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Customer Name *</label>
                <input type="text" name="customerName" value={formData.customerName}
                  onChange={handleChange} required placeholder="e.g. Ramesh Kumar" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Segment *</label>
                <div className="relative">
                  <select name="segment" value={formData.segment} onChange={handleChange} className={inputCls + " appearance-none pr-8"}>
                    {segments.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* ── Shipping ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                <MapPin size={13} className="text-green-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Shipping Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange}
                  required placeholder="e.g. Mumbai" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>State *</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange}
                  required placeholder="e.g. Maharashtra" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Region *</label>
                <div className="relative">
                  <select name="region" value={formData.region} onChange={handleChange} className={inputCls + " appearance-none pr-8"}>
                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Postal Code *</label>
                <input type="text" name="postalCode" value={formData.postalCode}
                  onChange={handleChange} required placeholder="e.g. 400001" maxLength="6" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}><Truck size={12} className="inline mr-1" />Ship Mode *</label>
                <div className="relative">
                  <select name="shipMode" value={formData.shipMode} onChange={handleChange} className={inputCls + " appearance-none pr-8"}>
                    {shipModes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0 bg-white">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors">
            Cancel
          </button>
          <button type="submit" onClick={handleSubmit} disabled={!canSubmit}
            className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Placing...
              </span>
            ) : 'Place Order'}
          </button>
        </div>

      </div>
    </div>
  );
}
