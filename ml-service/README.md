# Machine Learning Service

Random Forest-based prediction service for sales analytics.

## 🎯 Features

- **Sales Prediction**: Predict sales amount based on product, region, segment, quantity
- **Demand Forecasting**: Forecast product demand for future periods
- **Customer Segmentation**: Classify customers into segments (Champions, Loyal, Potential, AtRisk)
- **Next Month Forecast**: Get sales forecasts for all products

## 🏗️ Tech Stack

- **Framework**: Flask (Python 3.8+)
- **ML Library**: scikit-learn (Random Forest)
- **Database**: MongoDB (via pymongo)
- **Additional**: pandas, numpy, joblib

## 📦 Installation

### 1. Create Python Virtual Environment

```bash
cd ml-service
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and update MongoDB connection if needed.

## 🚀 Usage

### Step 1: Train Models

Train Random Forest models on your 100K records:

```bash
python train.py
```

This will:
- Load data from MongoDB
- Preprocess and engineer features
- Train 3 Random Forest models
- Save models to `models/` directory

**Expected Output:**
```
📥 Loading data from MongoDB...
✅ Loaded 100000 records
🔧 Preprocessing data...
🌲 TRAINING SALES PREDICTION MODEL (Random Forest)
📊 Model Performance:
   Mean Absolute Error: ₹XXX.XX
   R² Score: 0.XXXX
✅ Model saved to models/sales_predictor.pkl
```

### Step 2: Start ML Service

```bash
python app.py
```

The service will start on `http://localhost:5001`

### Step 3: Test Predictions

```bash
python predict.py
```

## 📡 API Endpoints

### Health Check
```http
GET /health
```

### Predict Sales
```http
POST /predict/sales
Content-Type: application/json

{
  "productName": "Woven Fabric",
  "category": "Textile Products",
  "region": "North India",
  "segment": "Wholesale",
  "quantity": 100,
  "discount": 0
}
```

**Response:**
```json
{
  "success": true,
  "predicted_sales": 45000.50,
  "currency": "₹"
}
```

### Predict Demand
```http
POST /predict/demand
Content-Type: application/json

{
  "productName": "Cardboard Box",
  "month": 4
}
```

### Predict Customer Segment
```http
POST /predict/customer-segment
Content-Type: application/json

{
  "recency": 30,
  "frequency": 10,
  "monetary": 50000
}
```

### Get Next Month Forecast
```http
GET /forecast/next-month
```

### Get Model Information
```http
GET /model/info
```

## 🔗 Integration with Node.js Backend

Your Node.js backend automatically connects to this service via:

```
http://localhost:5000/api/ml/*
```

Node.js routes:
- `POST /api/ml/predict/sales`
- `POST /api/ml/predict/demand`
- `POST /api/ml/predict/customer-segment`
- `GET /api/ml/forecast/next-month`
- `GET /api/ml/model/info`

## 📊 Model Details

### Sales Prediction Model
- **Algorithm**: Random Forest Regressor
- **Trees**: 100
- **Features**: quantity, discount, product, category, region, segment, date features
- **Target**: sales amount (₹)

### Demand Forecasting Model
- **Algorithm**: Random Forest Regressor
- **Features**: product, month, quarter, day of week
- **Target**: quantity (units)

### Customer Segmentation Model
- **Algorithm**: Random Forest Classifier
- **Features**: Recency, Frequency, Monetary (RFM)
- **Classes**: Champions, Loyal, Potential, AtRisk

## 🔄 Retraining Models

To retrain models with new data:

```bash
python train.py
```

Recommended retraining frequency: Weekly or monthly

## 🐛 Troubleshooting

### Models not loading
- Ensure you've run `python train.py` first
- Check `models/` directory exists with `.pkl` files

### Connection to MongoDB failed
- Verify MongoDB is running
- Check `MONGODB_URI` in `.env`

### Import errors
- Activate virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`

## 📈 Performance Metrics

After training, check model performance:
- **R² Score**: Closer to 1.0 is better (typically 0.7-0.9)
- **MAE**: Lower is better
- **RMSE**: Lower is better

## 🎯 Next Steps

1. Train models: `python train.py`
2. Start service: `python app.py`
3. Access via Node.js: `http://localhost:5000/api/ml/*`
4. View predictions in React dashboard

---

**Need help?** Check logs in terminal for detailed error messages.
