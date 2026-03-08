import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/inventory_analytics')
DB_NAME = 'inventory_analytics'
COLLECTION_NAME = 'superstoreorders'

# ML Service Configuration
ML_SERVICE_PORT = int(os.getenv('ML_SERVICE_PORT', 5001))
NODE_BACKEND_URL = os.getenv('NODE_BACKEND_URL', 'http://localhost:5000')

# Model Paths
MODEL_DIR = 'models'
SALES_MODEL_PATH = f'{MODEL_DIR}/sales_predictor.pkl'
DEMAND_MODEL_PATH = f'{MODEL_DIR}/demand_predictor.pkl'
CUSTOMER_MODEL_PATH = f'{MODEL_DIR}/customer_segmentation.pkl'

# Training Configuration
TEST_SIZE = 0.2
RANDOM_STATE = 42
N_ESTIMATORS = 100
