"""
Machine Learning Training Script
Trains Random Forest models for:
1. Sales Prediction
2. Demand Forecasting
3. Customer Segmentation
"""

import pandas as pd
import numpy as np
from pymongo import MongoClient
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, classification_report
import joblib
import os
from datetime import datetime
import config

class MLTrainer:
    def __init__(self):
        self.client = MongoClient(config.MONGODB_URI)
        self.db = self.client[config.DB_NAME]
        self.collection = self.db[config.COLLECTION_NAME]
        self.label_encoders = {}
        
        # Create models directory
        if not os.path.exists(config.MODEL_DIR):
            os.makedirs(config.MODEL_DIR)
    
    def load_data(self):
        """Load data from MongoDB"""
        print("📥 Loading data from MongoDB...")
        data = list(self.collection.find())
        df = pd.DataFrame(data)
        print(f"✅ Loaded {len(df)} records")
        return df
    
    def preprocess_data(self, df):
        """Preprocess and engineer features"""
        print("🔧 Preprocessing data...")
        
        # Convert dates
        df['orderDate'] = pd.to_datetime(df['orderDate'])
        df['shipDate'] = pd.to_datetime(df['shipDate'])
        
        # Create time-based features
        df['year'] = df['orderDate'].dt.year
        df['month'] = df['orderDate'].dt.month
        df['quarter'] = df['orderDate'].dt.quarter
        df['day_of_week'] = df['orderDate'].dt.dayofweek
        df['day_of_month'] = df['orderDate'].dt.day
        df['week_of_year'] = df['orderDate'].dt.isocalendar().week
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Calculate fulfillment days
        df['fulfillment_days'] = (df['shipDate'] - df['orderDate']).dt.days
        
        # Profit margin
        df['profit_margin'] = (df['profit'] / df['sales']) * 100
        
        # Encode categorical variables
        categorical_cols = ['productName', 'category', 'subCategory', 'region', 'segment', 'shipMode', 'state']
        
        for col in categorical_cols:
            if col in df.columns:
                le = LabelEncoder()
                df[f'{col}_encoded'] = le.fit_transform(df[col].astype(str))
                self.label_encoders[col] = le
        
        print("✅ Preprocessing completed")
        return df
    
    def train_sales_predictor(self, df):
        """Train Random Forest for Sales Prediction"""
        print("\n" + "="*60)
        print("🌲 TRAINING SALES PREDICTION MODEL (Random Forest)")
        print("="*60)
        
        # Select features
        feature_cols = [
            'quantity', 'discount', 'productName_encoded', 'category_encoded',
            'region_encoded', 'segment_encoded', 'shipMode_encoded',
            'year', 'month', 'quarter', 'day_of_week', 'is_weekend'
        ]
        
        X = df[feature_cols]
        y = df['sales']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=config.TEST_SIZE, random_state=config.RANDOM_STATE
        )
        
        # Train Random Forest
        print(f"Training Random Forest with {config.N_ESTIMATORS} trees...")
        rf_model = RandomForestRegressor(
            n_estimators=config.N_ESTIMATORS,
            max_depth=20,
            min_samples_split=10,
            min_samples_leaf=4,
            random_state=config.RANDOM_STATE,
            n_jobs=-1
        )
        
        rf_model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = rf_model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        print(f"\n📊 Model Performance:")
        print(f"   Mean Absolute Error: ₹{mae:,.2f}")
        print(f"   Root Mean Squared Error: ₹{rmse:,.2f}")
        print(f"   R² Score: {r2:.4f}")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': feature_cols,
            'importance': rf_model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\n🔍 Top 5 Important Features:")
        for idx, row in feature_importance.head().iterrows():
            print(f"   {row['feature']}: {row['importance']:.4f}")
        
        # Save model
        model_data = {
            'model': rf_model,
            'features': feature_cols,
            'label_encoders': self.label_encoders,
            'trained_at': datetime.now().isoformat(),
            'metrics': {
                'mae': float(mae),
                'rmse': float(rmse),
                'r2_score': float(r2)
            }
        }
        
        joblib.dump(model_data, config.SALES_MODEL_PATH)
        print(f"\n✅ Model saved to {config.SALES_MODEL_PATH}")
        
        return rf_model, feature_importance
    
    def train_demand_forecaster(self, df):
        """Train Random Forest for Demand Forecasting"""
        print("\n" + "="*60)
        print("🌲 TRAINING DEMAND FORECASTING MODEL (Random Forest)")
        print("="*60)
        
        # Aggregate demand by product and date
        demand_df = df.groupby(['productName', 'orderDate']).agg({
            'quantity': 'sum',
            'sales': 'sum'
        }).reset_index()
        
        demand_df['orderDate'] = pd.to_datetime(demand_df['orderDate'])
        demand_df['month'] = demand_df['orderDate'].dt.month
        demand_df['quarter'] = demand_df['orderDate'].dt.quarter
        demand_df['day_of_week'] = demand_df['orderDate'].dt.dayofweek
        
        # Encode product names
        le_product = LabelEncoder()
        demand_df['product_encoded'] = le_product.fit_transform(demand_df['productName'])
        
        # Features
        feature_cols = ['product_encoded', 'month', 'quarter', 'day_of_week']
        X = demand_df[feature_cols]
        y = demand_df['quantity']
        
        # Split and train
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=config.TEST_SIZE, random_state=config.RANDOM_STATE
        )
        
        print(f"Training Random Forest for demand forecasting...")
        rf_demand = RandomForestRegressor(
            n_estimators=config.N_ESTIMATORS,
            max_depth=15,
            random_state=config.RANDOM_STATE,
            n_jobs=-1
        )
        
        rf_demand.fit(X_train, y_train)
        
        # Evaluate
        y_pred = rf_demand.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        print(f"\n📊 Model Performance:")
        print(f"   Mean Absolute Error: {mae:.2f} units")
        print(f"   Root Mean Squared Error: {rmse:.2f} units")
        print(f"   R² Score: {r2:.4f}")
        
        # Save model
        model_data = {
            'model': rf_demand,
            'features': feature_cols,
            'product_encoder': le_product,
            'trained_at': datetime.now().isoformat(),
            'metrics': {
                'mae': float(mae),
                'rmse': float(rmse),
                'r2_score': float(r2)
            }
        }
        
        joblib.dump(model_data, config.DEMAND_MODEL_PATH)
        print(f"✅ Model saved to {config.DEMAND_MODEL_PATH}")
        
        return rf_demand
    
    def train_customer_segmentation(self, df):
        """Train model for customer behavior classification"""
        print("\n" + "="*60)
        print("🌲 TRAINING CUSTOMER SEGMENTATION MODEL")
        print("="*60)
        
        # RFM analysis
        latest_date = df['orderDate'].max()
        
        customer_rfm = df.groupby('customerId').agg({
            'orderDate': lambda x: (latest_date - x.max()).days,
            'orderId': 'count',
            'sales': 'sum'
        }).reset_index()
        
        customer_rfm.columns = ['customerId', 'recency', 'frequency', 'monetary']
        
        # Create segments based on quantiles
        customer_rfm['R_score'] = pd.qcut(customer_rfm['recency'], 4, labels=[4, 3, 2, 1], duplicates='drop')
        customer_rfm['F_score'] = pd.qcut(customer_rfm['frequency'].rank(method='first'), 4, labels=[1, 2, 3, 4], duplicates='drop')
        customer_rfm['M_score'] = pd.qcut(customer_rfm['monetary'], 4, labels=[1, 2, 3, 4], duplicates='drop')
        
        # Calculate total score
        customer_rfm['total_score'] = customer_rfm['R_score'].astype(int) + customer_rfm['F_score'].astype(int) + customer_rfm['M_score'].astype(int)
        
        # Define segment labels
        def classify_segment(score):
            if score >= 10:
                return 'Champions'
            elif score >= 8:
                return 'Loyal'
            elif score >= 6:
                return 'Potential'
            else:
                return 'AtRisk'
        
        customer_rfm['segment'] = customer_rfm['total_score'].apply(classify_segment)
        
        # Train classifier
        le_segment = LabelEncoder()
        y = le_segment.fit_transform(customer_rfm['segment'])
        
        X = customer_rfm[['recency', 'frequency', 'monetary']]
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=config.TEST_SIZE, random_state=config.RANDOM_STATE
        )
        
        print(f"Training Random Forest classifier...")
        rf_classifier = RandomForestClassifier(
            n_estimators=config.N_ESTIMATORS,
            max_depth=10,
            random_state=config.RANDOM_STATE,
            n_jobs=-1
        )
        
        rf_classifier.fit(X_train, y_train)
        
        # Evaluate
        y_pred = rf_classifier.predict(X_test)
        accuracy = rf_classifier.score(X_test, y_test)
        
        print(f"\n📊 Model Performance:")
        print(f"   Accuracy: {accuracy:.4f}")
        print(f"\n{classification_report(y_test, y_pred, target_names=le_segment.classes_)}")
        
        # Save model
        model_data = {
            'model': rf_classifier,
            'segment_encoder': le_segment,
            'trained_at': datetime.now().isoformat(),
            'metrics': {
                'accuracy': float(accuracy)
            }
        }
        
        joblib.dump(model_data, config.CUSTOMER_MODEL_PATH)
        print(f"✅ Model saved to {config.CUSTOMER_MODEL_PATH}")
        
        return rf_classifier, customer_rfm
    
    def train_all_models(self):
        """Train all ML models"""
        print("\n" + "="*70)
        print("🚀 STARTING ML MODEL TRAINING")
        print("="*70)
        
        # Load and preprocess data
        df = self.load_data()
        df = self.preprocess_data(df)
        
        # Train models
        sales_model, feature_importance = self.train_sales_predictor(df)
        demand_model = self.train_demand_forecaster(df)
        customer_model, rfm_data = self.train_customer_segmentation(df)
        
        print("\n" + "="*70)
        print("✅ ALL MODELS TRAINED SUCCESSFULLY!")
        print("="*70)
        print(f"\nModels saved in: {config.MODEL_DIR}/")
        print("   - sales_predictor.pkl")
        print("   - demand_predictor.pkl")
        print("   - customer_segmentation.pkl")
        print("\n🎯 Ready to make predictions via API!")
        
        self.client.close()

if __name__ == '__main__':
    trainer = MLTrainer()
    trainer.train_all_models()
