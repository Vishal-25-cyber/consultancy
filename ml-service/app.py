"""
Flask API for ML Predictions
Serves Random Forest model predictions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import config

app = Flask(__name__)
CORS(app)

# Global model variables
sales_model_data = None
demand_model_data = None
customer_model_data = None

def load_models():
    """Load trained models"""
    global sales_model_data, demand_model_data, customer_model_data
    
    try:
        if os.path.exists(config.SALES_MODEL_PATH):
            sales_model_data = joblib.load(config.SALES_MODEL_PATH)
            print(f"✅ Loaded sales prediction model")
        
        if os.path.exists(config.DEMAND_MODEL_PATH):
            demand_model_data = joblib.load(config.DEMAND_MODEL_PATH)
            print(f"✅ Loaded demand forecasting model")
        
        if os.path.exists(config.CUSTOMER_MODEL_PATH):
            customer_model_data = joblib.load(config.CUSTOMER_MODEL_PATH)
            print(f"✅ Loaded customer segmentation model")
        
        return True
    except Exception as e:
        print(f"❌ Error loading models: {str(e)}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    models_loaded = {
        'sales_model': sales_model_data is not None,
        'demand_model': demand_model_data is not None,
        'customer_model': customer_model_data is not None
    }
    
    return jsonify({
        'status': 'healthy',
        'service': 'ML Prediction Service',
        'models_loaded': models_loaded,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict/sales', methods=['POST'])
def predict_sales():
    """Predict sales amount"""
    try:
        if sales_model_data is None:
            return jsonify({'error': 'Sales model not loaded'}), 500
        
        data = request.json
        model = sales_model_data['model']
        features = sales_model_data['features']
        label_encoders = sales_model_data['label_encoders']
        
        # Prepare input data
        input_data = {}
        
        # Encode categorical features
        if 'productName' in data and 'productName' in label_encoders:
            try:
                input_data['productName_encoded'] = label_encoders['productName'].transform([data['productName']])[0]
            except:
                input_data['productName_encoded'] = 0
        
        if 'category' in data and 'category' in label_encoders:
            try:
                input_data['category_encoded'] = label_encoders['category'].transform([data['category']])[0]
            except:
                input_data['category_encoded'] = 0
        
        if 'region' in data and 'region' in label_encoders:
            try:
                input_data['region_encoded'] = label_encoders['region'].transform([data['region']])[0]
            except:
                input_data['region_encoded'] = 0
        
        if 'segment' in data and 'segment' in label_encoders:
            try:
                input_data['segment_encoded'] = label_encoders['segment'].transform([data['segment']])[0]
            except:
                input_data['segment_encoded'] = 0
        
        if 'shipMode' in data and 'shipMode' in label_encoders:
            try:
                input_data['shipMode_encoded'] = label_encoders['shipMode'].transform([data['shipMode']])[0]
            except:
                input_data['shipMode_encoded'] = 0
        
        # Numerical features
        input_data['quantity'] = data.get('quantity', 10)
        input_data['discount'] = data.get('discount', 0)
        input_data['year'] = data.get('year', datetime.now().year)
        input_data['month'] = data.get('month', datetime.now().month)
        input_data['quarter'] = data.get('quarter', (datetime.now().month - 1) // 3 + 1)
        input_data['day_of_week'] = data.get('day_of_week', datetime.now().weekday())
        input_data['is_weekend'] = 1 if input_data['day_of_week'] in [5, 6] else 0
        
        # Create DataFrame
        input_df = pd.DataFrame([input_data], columns=features)
        
        # Make prediction
        prediction = model.predict(input_df)[0]
        
        return jsonify({
            'success': True,
            'predicted_sales': float(prediction),
            'currency': '₹',
            'input': data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/demand', methods=['POST'])
def predict_demand():
    """Predict product demand"""
    try:
        if demand_model_data is None:
            return jsonify({'error': 'Demand model not loaded'}), 500
        
        data = request.json
        model = demand_model_data['model']
        product_encoder = demand_model_data['product_encoder']
        
        # Prepare input
        try:
            product_encoded = product_encoder.transform([data['productName']])[0]
        except:
            product_encoded = 0
        
        month = data.get('month', datetime.now().month)
        quarter = (month - 1) // 3 + 1
        day_of_week = data.get('day_of_week', datetime.now().weekday())
        
        input_df = pd.DataFrame([{
            'product_encoded': product_encoded,
            'month': month,
            'quarter': quarter,
            'day_of_week': day_of_week
        }])
        
        # Make prediction
        prediction = model.predict(input_df)[0]
        
        return jsonify({
            'success': True,
            'predicted_demand': float(prediction),
            'unit': 'units',
            'product': data['productName'],
            'month': month
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/customer-segment', methods=['POST'])
def predict_customer_segment():
    """Predict customer segment"""
    try:
        if customer_model_data is None:
            return jsonify({'error': 'Customer model not loaded'}), 500
        
        data = request.json
        model = customer_model_data['model']
        segment_encoder = customer_model_data['segment_encoder']
        
        # Prepare input
        input_df = pd.DataFrame([{
            'recency': data.get('recency', 30),
            'frequency': data.get('frequency', 5),
            'monetary': data.get('monetary', 10000)
        }])
        
        # Make prediction
        prediction = model.predict(input_df)[0]
        segment = segment_encoder.inverse_transform([prediction])[0]
        
        # Get probabilities
        probabilities = model.predict_proba(input_df)[0]
        segment_probs = {
            segment_encoder.inverse_transform([i])[0]: float(prob)
            for i, prob in enumerate(probabilities)
        }
        
        return jsonify({
            'success': True,
            'predicted_segment': segment,
            'probabilities': segment_probs,
            'input': {
                'recency': data.get('recency'),
                'frequency': data.get('frequency'),
                'monetary': data.get('monetary')
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/forecast/next-month', methods=['GET'])
def forecast_next_month():
    """Forecast sales for next month by product"""
    try:
        if sales_model_data is None:
            return jsonify({'error': 'Sales model not loaded'}), 500
        
        model = sales_model_data['model']
        features = sales_model_data['features']
        label_encoders = sales_model_data['label_encoders']
        
        # Get unique products
        products = list(label_encoders['productName'].classes_)
        
        # Next month details
        next_month = datetime.now() + timedelta(days=30)
        
        forecasts = []
        
        for product in products[:12]:  # Forecast for all 12 products
            try:
                product_encoded = label_encoders['productName'].transform([product])[0]
                category = 'Packaging Materials'  # Default, should be from product mapping
                category_encoded = 0
                
                input_data = {
                    'quantity': 100,
                    'discount': 0,
                    'productName_encoded': product_encoded,
                    'category_encoded': category_encoded,
                    'region_encoded': 0,
                    'segment_encoded': 0,
                    'shipMode_encoded': 0,
                    'year': next_month.year,
                    'month': next_month.month,
                    'quarter': (next_month.month - 1) // 3 + 1,
                    'day_of_week': next_month.weekday(),
                    'is_weekend': 1 if next_month.weekday() in [5, 6] else 0
                }
                
                input_df = pd.DataFrame([input_data], columns=features)
                prediction = model.predict(input_df)[0]
                
                forecasts.append({
                    'product': product,
                    'predicted_sales': float(prediction),
                    'forecast_month': next_month.strftime('%B %Y')
                })
            except:
                continue
        
        return jsonify({
            'success': True,
            'forecasts': forecasts,
            'currency': '₹'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get model information and metrics"""
    info = {}
    
    if sales_model_data:
        info['sales_model'] = {
            'trained_at': sales_model_data.get('trained_at'),
            'metrics': sales_model_data.get('metrics'),
            'features': sales_model_data.get('features')
        }
    
    if demand_model_data:
        info['demand_model'] = {
            'trained_at': demand_model_data.get('trained_at'),
            'metrics': demand_model_data.get('metrics')
        }
    
    if customer_model_data:
        info['customer_model'] = {
            'trained_at': customer_model_data.get('trained_at'),
            'metrics': customer_model_data.get('metrics')
        }
    
    return jsonify(info)

if __name__ == '__main__':
    print("="*70)
    print("🚀 STARTING ML PREDICTION SERVICE")
    print("="*70)
    
    # Load models
    load_models()
    
    print(f"\n🌐 Starting server on port {config.ML_SERVICE_PORT}...")
    print(f"📡 API Endpoints:")
    print(f"   - GET  /health")
    print(f"   - POST /predict/sales")
    print(f"   - POST /predict/demand")
    print(f"   - POST /predict/customer-segment")
    print(f"   - GET  /forecast/next-month")
    print(f"   - GET  /model/info")
    print("\n" + "="*70)
    
    app.run(host='0.0.0.0', port=config.ML_SERVICE_PORT, debug=True)
