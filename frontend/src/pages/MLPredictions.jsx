import { useState, useEffect } from 'react';
import { mlApi } from '../utils/mlApi';
import { Brain, TrendingUp, Users, Activity, AlertCircle, CheckCircle } from 'lucide-react';

const MLPredictions = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [mlStatus, setMlStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  // Sales prediction form
  const [salesForm, setSalesForm] = useState({
    productName: 'Woven Fabric',
    category: 'Textile Products',
    region: 'North India',
    segment: 'Wholesale',
    quantity: 100,
    discount: 0
  });
  const [salesPrediction, setSalesPrediction] = useState(null);

  // Demand prediction form
  const [demandForm, setDemandForm] = useState({
    productName: 'Cardboard Box',
    month: new Date().getMonth() + 1
  });
  const [demandPrediction, setDemandPrediction] = useState(null);

  // Customer segment form
  const [customerForm, setCustomerForm] = useState({
    recency: 30,
    frequency: 5,
    monetary: 10000
  });
  const [segmentPrediction, setSegmentPrediction] = useState(null);

  const products = ['Woven Fabric', 'Bale Tape', 'Clip', 'Brown Paper', 'HM Plastic', 
                   'PP Cover', 'Marker Ink', 'LD Plastic', 'Touch Film', 'Brown Tape', 
                   'Cardboard Box', 'Carry Cover'];

  const categories = ['Packaging Materials', 'Plastic Products', 'Textile Products', 'Accessories'];
  const regions = ['North India', 'South India', 'East India', 'West India', 'Central India'];
  const segments = ['Wholesale', 'Retail', 'Industrial', 'Corporate'];

  useEffect(() => {
    checkMLService();
    loadForecast();
    loadModelInfo();
  }, []);

  const checkMLService = async () => {
    try {
      const response = await mlApi.checkHealth();
      setMlStatus(response.data);
    } catch (err) {
      setMlStatus({ status: 'unavailable' });
    }
  };

  const loadForecast = async () => {
    try {
      const response = await mlApi.getNextMonthForecast();
      setForecast(response.data);
    } catch (err) {
      console.error('Forecast load error:', err);
    }
  };

  const loadModelInfo = async () => {
    try {
      const response = await mlApi.getModelInfo();
      setModelInfo(response.data);
    } catch (err) {
      console.error('Model info error:', err);
    }
  };

  const handleSalesPrediction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await mlApi.predictSales(salesForm);
      setSalesPrediction(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemandPrediction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await mlApi.predictDemand(demandForm);
      setDemandPrediction(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSegmentPrediction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await mlApi.predictCustomerSegment(customerForm);
      setSegmentPrediction(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-8 h-8 text-blue-600" />
              ML Predictions & Forecasting
            </h1>
            <p className="text-gray-600 mt-1">Random Forest Machine Learning Models</p>
          </div>
          
          {/* ML Service Status */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            mlStatus?.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {mlStatus?.status === 'healthy' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">ML Service Active</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">ML Service Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Model Info Cards */}
      {modelInfo && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {modelInfo.sales_model && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Sales Predictor</h3>
              <p className="text-sm text-gray-600">R² Score: {modelInfo.sales_model.metrics?.r2_score?.toFixed(4)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Trained: {new Date(modelInfo.sales_model.trained_at).toLocaleDateString()}
              </p>
            </div>
          )}
          {modelInfo.demand_model && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Demand Forecaster</h3>
              <p className="text-sm text-gray-600">R² Score: {modelInfo.demand_model.metrics?.r2_score?.toFixed(4)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Trained: {new Date(modelInfo.demand_model.trained_at).toLocaleDateString()}
              </p>
            </div>
          )}
          {modelInfo.customer_model && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Customer Segmentation</h3>
              <p className="text-sm text-gray-600">Accuracy: {(modelInfo.customer_model.metrics?.accuracy * 100).toFixed(2)}%</p>
              <p className="text-xs text-gray-500 mt-1">
                Trained: {new Date(modelInfo.customer_model.trained_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-2 px-6 py-3 font-medium ${
              activeTab === 'sales'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Sales Prediction
          </button>
          <button
            onClick={() => setActiveTab('demand')}
            className={`flex items-center gap-2 px-6 py-3 font-medium ${
              activeTab === 'demand'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity className="w-5 h-5" />
            Demand Forecast
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`flex items-center gap-2 px-6 py-3 font-medium ${
              activeTab === 'customer'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-5 h-5" />
            Customer Segment
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex items-center gap-2 px-6 py-3 font-medium ${
              activeTab === 'forecast'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Brain className="w-5 h-5" />
            Next Month Forecast
          </button>
        </div>

        <div className="p-6">
          {/* Sales Prediction Tab */}
          {activeTab === 'sales' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Predict Sales Amount</h3>
                <form onSubmit={handleSalesPrediction} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <select
                      value={salesForm.productName}
                      onChange={(e) => setSalesForm({...salesForm, productName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {products.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={salesForm.category}
                      onChange={(e) => setSalesForm({...salesForm, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                    <select
                      value={salesForm.region}
                      onChange={(e) => setSalesForm({...salesForm, region: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {regions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Segment</label>
                    <select
                      value={salesForm.segment}
                      onChange={(e) => setSalesForm({...salesForm, segment: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {segments.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={salesForm.quantity}
                      onChange={(e) => setSalesForm({...salesForm, quantity: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount (0-1)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={salesForm.discount}
                      onChange={(e) => setSalesForm({...salesForm, discount: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Predicting...' : 'Predict Sales'}
                  </button>
                </form>
              </div>
              
              <div>
                {salesPrediction && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Result</h3>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Predicted Sales Amount</p>
                      <p className="text-4xl font-bold text-blue-600">
                        ₹{salesPrediction.predicted_sales?.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                      </p>
                      <p className="text-sm text-gray-600 mt-4">
                        Per Unit: ₹{(salesPrediction.predicted_sales / salesForm.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Demand Forecast Tab */}
          {activeTab === 'demand' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast Product Demand</h3>
                <form onSubmit={handleDemandPrediction} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <select
                      value={demandForm.productName}
                      onChange={(e) => setDemandForm({...demandForm, productName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {products.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                    <select
                      value={demandForm.month}
                      onChange={(e) => setDemandForm({...demandForm, month: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i+1} value={i+1}>
                          {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Forecasting...' : 'Forecast Demand'}
                  </button>
                </form>
              </div>
              
              <div>
                {demandPrediction && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast Result</h3>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Predicted Demand</p>
                      <p className="text-4xl font-bold text-green-600">
                        {Math.round(demandPrediction.predicted_demand).toLocaleString()} units
                      </p>
                      <p className="text-sm text-gray-600 mt-4">
                        Product: {demandPrediction.product}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Segment Tab */}
          {activeTab === 'customer' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Predict Customer Segment</h3>
                <form onSubmit={handleSegmentPrediction} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recency (days since last order)
                    </label>
                    <input
                      type="number"
                      value={customerForm.recency}
                      onChange={(e) => setCustomerForm({...customerForm, recency: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency (number of orders)
                    </label>
                    <input
                      type="number"
                      value={customerForm.frequency}
                      onChange={(e) => setCustomerForm({...customerForm, frequency: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monetary (total spent ₹)
                    </label>
                    <input
                      type="number"
                      value={customerForm.monetary}
                      onChange={(e) => setCustomerForm({...customerForm, monetary: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Analyzing...' : 'Predict Segment'}
                  </button>
                </form>
              </div>
              
              <div>
                {segmentPrediction && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Segment Classification</h3>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Predicted Segment</p>
                      <p className="text-4xl font-bold text-purple-600">
                        {segmentPrediction.predicted_segment}
                      </p>
                      {segmentPrediction.probabilities && (
                        <div className="mt-6 space-y-2">
                          <p className="text-sm font-medium text-gray-700">Confidence:</p>
                          {Object.entries(segmentPrediction.probabilities).map(([segment, prob]) => (
                            <div key={segment} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">{segment}</span>
                              <span className="text-sm font-medium">{(prob * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Forecast Tab */}
          {activeTab === 'forecast' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Month Sales Forecast</h3>
              {forecast?.forecasts && (
                <div className="grid grid-cols-3 gap-4">
                  {forecast.forecasts.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition">
                      <h4 className="font-medium text-gray-900">{item.product}</h4>
                      <p className="text-2xl font-bold text-blue-600 mt-2">
                        ₹{item.predicted_sales.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{item.forecast_month}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MLPredictions;
