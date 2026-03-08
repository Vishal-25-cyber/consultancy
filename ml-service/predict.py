"""
Simple prediction script for testing models
"""

import joblib
import pandas as pd
from datetime import datetime
import config

def predict_sales(product, quantity=100, discount=0):
    """Quick sales prediction"""
    try:
        model_data = joblib.load(config.SALES_MODEL_PATH)
        model = model_data['model']
        features = model_data['features']
        label_encoders = model_data['label_encoders']
        
        # Encode product
        try:
            product_encoded = label_encoders['productName'].transform([product])[0]
        except:
            print(f"Warning: Unknown product '{product}', using default")
            product_encoded = 0
        
        # Prepare input
        input_data = {
            'quantity': quantity,
            'discount': discount,
            'productName_encoded': product_encoded,
            'category_encoded': 0,
            'region_encoded': 0,
            'segment_encoded': 0,
            'shipMode_encoded': 0,
            'year': datetime.now().year,
            'month': datetime.now().month,
            'quarter': (datetime.now().month - 1) // 3 + 1,
            'day_of_week': datetime.now().weekday(),
            'is_weekend': 1 if datetime.now().weekday() in [5, 6] else 0
        }
        
        input_df = pd.DataFrame([input_data], columns=features)
        prediction = model.predict(input_df)[0]
        
        return {
            'product': product,
            'quantity': quantity,
            'predicted_sales': f"₹{prediction:,.2f}",
            'per_unit': f"₹{prediction/quantity:,.2f}"
        }
    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    # Test predictions
    products = ['Woven Fabric', 'Bale Tape', 'Cardboard Box', 'HM Plastic']
    
    print("\n" + "="*60)
    print("🔮 SALES PREDICTIONS")
    print("="*60)
    
    for product in products:
        result = predict_sales(product, quantity=100)
        if 'error' not in result:
            print(f"\n{product}:")
            print(f"  Quantity: {result['quantity']}")
            print(f"  Predicted Sales: {result['predicted_sales']}")
            print(f"  Per Unit: {result['per_unit']}")
