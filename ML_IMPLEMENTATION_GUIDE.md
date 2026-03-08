# 🤖 Random Forest ML Implementation Guide

## 🎉 What's Been Added

Your project now includes **Machine Learning capabilities** using **Random Forest algorithms**!

### ✨ New Features

1. **Sales Prediction** - Predict sales amount based on product, region, segment, quantity
2. **Demand Forecasting** - Forecast product demand for future months  
3. **Customer Segmentation** - Classify customers using RFM analysis
4. **Next Month Forecast** - Automated sales forecasts for all products

---

## 🏗️ Project Structure

```
consultancy project/
├── backend/
│   ├── controllers/
│   │   └── mlController.js          ✨ NEW - ML API integration
│   ├── routes/
│   │   └── mlRoutes.js              ✨ NEW - ML endpoints
│   └── server.js                    📝 UPDATED - Added ML routes
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── MLPredictions.jsx    ✨ NEW - ML dashboard page
│   │   │   └── SuperstoreAdmin.jsx  📝 UPDATED - Added ML route
│   │   ├── utils/
│   │   │   └── mlApi.js             ✨ NEW - ML API client
│   │   ├── components/
│   │   │   └── AdminLayout.jsx      📝 UPDATED - Added ML menu
│   │   └── App.jsx                  📝 UPDATED - Added ML route
│
└── ml-service/                       ✨ NEW - Python ML Service
    ├── models/                       (trained models stored here)
    ├── app.py                        Flask API server
    ├── train.py                      Random Forest training script
    ├── predict.py                    Quick prediction script
    ├── config.py                     Configuration
    ├── requirements.txt              Python dependencies
    ├── .env.example                  Environment variables template
    └── README.md                     ML service documentation
```

---

## 🚀 Setup Instructions

### Step 1: Install Python Dependencies

```powershell
cd "c:\consultancy project\ml-service"
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

**This installs:**
- Flask (API framework)
- scikit-learn (Random Forest algorithms)
- pandas, numpy (data processing)
- pymongo (MongoDB connection)
- joblib (model serialization)

### Step 2: Configure Environment

```powershell
cp .env.example .env
```

Default configuration works out of the box:
- MongoDB: `localhost:27017`
- ML Service Port: `5001`
- Node Backend: `localhost:5000`

### Step 3: Train ML Models

```powershell
python train.py
```

**What happens:**
1. Loads 100,000 orders from MongoDB
2. Preprocesses data and engineers features
3. Trains 3 Random Forest models:
   - Sales Predictor (100 trees)
   - Demand Forecaster (100 trees)
   - Customer Segmentation Classifier (100 trees)
4. Saves models to `models/` directory

**Expected output:**
```
📥 Loading data from MongoDB...
✅ Loaded 100000 records
🔧 Preprocessing data...
🌲 TRAINING SALES PREDICTION MODEL (Random Forest)
📊 Model Performance:
   Mean Absolute Error: ₹XXX.XX
   R² Score: 0.XXXX
✅ Model saved to models/sales_predictor.pkl
...
✅ ALL MODELS TRAINED SUCCESSFULLY!
```

**Training time:** 2-5 minutes (depending on your CPU)

### Step 4: Start ML Service

```powershell
python app.py
```

Flask server starts on `http://localhost:5001`

### Step 5: Start Your Application

In separate terminals:

**Terminal 1 - Backend:**
```powershell
cd "c:\consultancy project\backend"
node server.js
```

**Terminal 2 - Frontend:**
```powershell
cd "c:\consultancy project\frontend"
npm run dev
```

---

## 🎯 How to Use

### 1. Access ML Predictions Dashboard

1. Login to your application
2. Click **"ML Predictions"** in the sidebar (Brain icon 🧠)
3. You'll see 4 tabs:
   - **Sales Prediction**
   - **Demand Forecast**
   - **Customer Segment**
   - **Next Month Forecast**

### 2. Predict Sales

**Inputs:**
- Product (e.g., Woven Fabric)
- Category (e.g., Textile Products)
- Region (e.g., North India)
- Segment (e.g., Wholesale)
- Quantity (e.g., 100)
- Discount (e.g., 0)

**Output:**
```
Predicted Sales Amount: ₹45,250.50
Per Unit: ₹452.51
```

### 3. Forecast Demand

**Inputs:**
- Product (e.g., Cardboard Box)
- Month (e.g., April)

**Output:**
```
Predicted Demand: 1,250 units
```

### 4. Customer Segmentation

**Inputs:**
- Recency: Days since last order (e.g., 30)
- Frequency: Number of orders (e.g., 10)
- Monetary: Total spent ₹ (e.g., 50,000)

**Output:**
```
Predicted Segment: Champions
Confidence:
  - Champions: 85.5%
  - Loyal: 10.2%
  - Potential: 3.1%
  - AtRisk: 1.2%
```

---

## 🔬 Technical Details

### Random Forest Algorithms

**Why Random Forest?**
- ✅ Handles non-linear relationships
- ✅ Resistant to overfitting
- ✅ Works well with mixed data types
- ✅ Provides feature importance
- ✅ No extensive hyperparameter tuning needed

**Model 1: Sales Predictor**
```python
RandomForestRegressor(
    n_estimators=100,        # 100 decision trees
    max_depth=20,            # Maximum tree depth
    random_state=42          # Reproducibility
)
```

**Features used:**
- Product, Category, Region, Segment
- Quantity, Discount
- Year, Month, Quarter, Day of Week
- Weekend flag

**Model 2: Demand Forecaster**
```python
RandomForestRegressor(
    n_estimators=100,
    max_depth=15
)
```

**Features used:**
- Product (encoded)
- Month, Quarter
- Day of Week

**Model 3: Customer Segmentation**
```python
RandomForestClassifier(
    n_estimators=100,
    max_depth=10
)
```

**Features used:**
- Recency (days since last order)
- Frequency (number of orders)
- Monetary (total sales)

---

## 📡 API Endpoints

### Node.js Backend (Your App)

```
GET  /api/ml/health                      Check ML service status
POST /api/ml/predict/sales               Predict sales amount
POST /api/ml/predict/demand              Forecast demand
POST /api/ml/predict/customer-segment    Classify customer
GET  /api/ml/forecast/next-month         Get all product forecasts
GET  /api/ml/model/info                  Get model metrics
```

### Python ML Service (Direct Access)

```
GET  http://localhost:5001/health
POST http://localhost:5001/predict/sales
POST http://localhost:5001/predict/demand
POST http://localhost:5001/predict/customer-segment
GET  http://localhost:5001/forecast/next-month
GET  http://localhost:5001/model/info
```

---

## 🔄 Retraining Models

As you get more data, retrain models periodically:

```powershell
cd "c:\consultancy project\ml-service"
.\venv\Scripts\activate
python train.py
```

**Recommended frequency:**
- Weekly: If you have rapidly changing data
- Monthly: For stable business patterns
- Quarterly: For mature datasets

---

## 📊 Model Performance Metrics

**After training, check:**

1. **R² Score** (Coefficient of Determination)
   - 1.0 = Perfect predictions
   - 0.7-0.9 = Good model
   - <0.5 = Needs improvement

2. **MAE** (Mean Absolute Error)
   - Lower is better
   - Example: ₹500 MAE means average error is ₹500

3. **RMSE** (Root Mean Squared Error)
   - Lower is better
   - Penalizes large errors more than MAE

---

## 🐛 Troubleshooting

### Issue: "ML service unavailable"
**Solution:** Start the ML service: `python app.py`

### Issue: "Models not loaded"
**Solution:** Train models first: `python train.py`

### Issue: "ModuleNotFoundError: No module named 'flask'"
**Solution:** Activate venv and install dependencies:
```powershell
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Issue: "Connection refused MongoDB"
**Solution:** Start MongoDB service

### Issue: Low R² score (<0.5)
**Solution:**
1. Add more training data
2. Check for data quality issues
3. Adjust model hyperparameters in `train.py`

---

## 🎓 Understanding the Predictions

### Sales Prediction
- **Input:** Product details + quantity
- **Output:** Estimated sales amount in ₹
- **Use case:** Quote generation, revenue forecasting

### Demand Forecasting
- **Input:** Product + future month
- **Output:** Expected quantity sold
- **Use case:** Inventory planning, procurement

### Customer Segmentation
- **Input:** Customer purchase behavior (RFM)
- **Output:** Customer category
- **Use case:** Targeted marketing, retention campaigns

---

## 🚀 Next Steps

1. ✅ **Train models** - Complete initial training
2. ✅ **Test predictions** - Try different scenarios
3. 📈 **Monitor accuracy** - Track actual vs predicted
4. 🔄 **Retrain regularly** - Update models monthly
5. 📊 **Use insights** - Make data-driven decisions

---

## 📝 Quick Commands Reference

```powershell
# Setup
cd "c:\consultancy project\ml-service"
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Train models
python train.py

# Start ML service
python app.py

# Test predictions
python predict.py
```

---

## 🎯 Benefits for Your Business

✅ **Data-Driven Decisions** - Stop guessing, start predicting  
✅ **Revenue Optimization** - Accurate sales forecasts  
✅ **Inventory Management** - Prevent stockouts and overstock  
✅ **Customer Insights** - Understand customer behavior  
✅ **Competitive Advantage** - Modern ML-powered analytics  

---

**Your application now has enterprise-grade machine learning capabilities! 🎉**

Need help? Check the ML service README or review model performance metrics after training.
