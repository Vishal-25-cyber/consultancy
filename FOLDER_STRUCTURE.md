# PROJECT FOLDER STRUCTURE

## Complete Directory Tree

```
consultancy project/
│
├── backend/                              # Backend Node.js + Express API
│   ├── config/                          # Configuration files
│   │   └── db.js                        # MongoDB connection setup
│   │
│   ├── controllers/                     # Request handlers (Business Logic)
│   │   ├── analyticsController.js       # Analytics & dashboard data
│   │   ├── authController.js            # Authentication (login, register)
│   │   ├── categoryController.js        # Category CRUD operations
│   │   ├── customerController.js        # Customer management
│   │   ├── deliveryController.js        # Delivery tracking
│   │   ├── inventoryController.js       # Inventory transactions
│   │   ├── orderController.js           # Order processing
│   │   ├── productController.js         # Product management
│   │   ├── reportController.js          # Report generation
│   │   ├── supplierController.js        # Supplier management
│   │   ├── userController.js            # User management
│   │   └── vehicleController.js         # Vehicle fleet management
│   │
│   ├── middleware/                      # Express middleware
│   │   ├── auth.js                      # JWT authentication & authorization
│   │   └── responseHandler.js           # Standardized API responses
│   │
│   ├── models/                          # MongoDB Mongoose schemas
│   │   ├── User.js                      # User schema (Admin, Staff, Customer)
│   │   ├── Category.js                  # Product category schema
│   │   ├── Supplier.js                  # Supplier schema
│   │   ├── Customer.js                  # Customer schema
│   │   ├── Product.js                   # Product catalog schema
│   │   ├── Vehicle.js                   # Vehicle fleet schema
│   │   ├── Order.js                     # Order schema with nested items
│   │   ├── Delivery.js                  # Delivery tracking schema
│   │   └── Inventory.js                 # Inventory transaction schema
│   │
│   ├── routes/                          # API route definitions
│   │   ├── auth.js                      # /api/auth routes
│   │   ├── users.js                     # /api/users routes
│   │   ├── categories.js                # /api/categories routes
│   │   ├── suppliers.js                 # /api/suppliers routes
│   │   ├── customers.js                 # /api/customers routes
│   │   ├── products.js                  # /api/products routes
│   │   ├── vehicles.js                  # /api/vehicles routes
│   │   ├── inventory.js                 # /api/inventory routes
│   │   ├── orders.js                    # /api/orders routes
│   │   ├── deliveries.js                # /api/deliveries routes
│   │   ├── analytics.js                 # /api/analytics routes
│   │   └── reports.js                   # /api/reports routes
│   │
│   ├── scripts/                         # Utility scripts
│   │   └── seedData.js                  # Generate 100,000+ records
│   │
│   ├── .env.example                     # Environment variables template
│   ├── .gitignore                       # Git ignore patterns
│   ├── package.json                     # Backend dependencies & scripts
│   ├── package-lock.json                # Lock file
│   └── server.js                        # Application entry point
│
├── frontend/                            # Frontend React + Vite application
│   ├── public/                          # Static assets
│   │   └── vite.svg                     # Vite logo
│   │
│   ├── src/                             # Source code
│   │   ├── components/                  # Reusable React components
│   │   │   ├── Layout.jsx               # Page layout wrapper with sidebar
│   │   │   ├── Sidebar.jsx              # Navigation sidebar
│   │   │   ├── StatCard.jsx             # Dashboard KPI card component
│   │   │   └── PrivateRoute.jsx         # Protected route wrapper
│   │   │
│   │   ├── context/                     # React Context providers
│   │   │   └── AuthContext.jsx          # Authentication state management
│   │   │
│   │   ├── pages/                       # Page components (Routes)
│   │   │   ├── Login.jsx                # Login page with demo credentials
│   │   │   ├── AdminDashboard.jsx       # Main dashboard with charts
│   │   │   ├── Products.jsx             # Product management page
│   │   │   ├── Orders.jsx               # Order management page
│   │   │   ├── Analytics.jsx            # Advanced analytics page
│   │   │   ├── Inventory.jsx            # Inventory tracking page
│   │   │   ├── Deliveries.jsx           # Delivery management page
│   │   │   ├── Customers.jsx            # Customer management page
│   │   │   ├── Suppliers.jsx            # Supplier management page
│   │   │   ├── Vehicles.jsx             # Vehicle fleet page
│   │   │   ├── Reports.jsx              # Report generation page
│   │   │   └── Settings.jsx             # User settings page
│   │   │
│   │   ├── utils/                       # Utility functions
│   │   │   └── api.js                   # Axios API client with interceptors
│   │   │
│   │   ├── App.jsx                      # Root component with routing
│   │   ├── main.jsx                     # React entry point (render)
│   │   └── index.css                    # Global styles + Tailwind
│   │
│   ├── .env.example                     # Frontend environment variables
│   ├── .gitignore                       # Git ignore patterns
│   ├── index.html                       # HTML template
│   ├── package.json                     # Frontend dependencies & scripts
│   ├── package-lock.json                # Lock file
│   ├── vite.config.js                   # Vite configuration
│   ├── tailwind.config.js               # Tailwind CSS configuration
│   ├── postcss.config.js                # PostCSS configuration
│   └── eslint.config.js                 # ESLint configuration
│
├── README.md                            # Installation & setup guide
├── PROJECT_DOCUMENTATION.md             # Complete project documentation
└── FOLDER_STRUCTURE.md                  # This file
```

---

## File Count Summary

| Category | Count |
|----------|-------|
| **Backend Files** | 37 |
| ├─ Controllers | 12 |
| ├─ Models | 9 |
| ├─ Routes | 12 |
| ├─ Middleware | 2 |
| ├─ Config | 1 |
| └─ Scripts | 1 |
| **Frontend Files** | 24 |
| ├─ Pages | 12 |
| ├─ Components | 4 |
| ├─ Utils | 1 |
| ├─ Context | 1 |
| └─ Config | 6 |
| **Documentation** | 3 |
| **Total Files** | 64 |

---

## Key File Descriptions

### Backend Files

#### **server.js** (Entry Point)
```javascript
// Main Express application
// - Connects to MongoDB
// - Mounts all routes
// - Configures middleware (CORS, Morgan, JSON parser)
// - Error handling
// - Starts server on port 5000
```

#### **config/db.js**
```javascript
// MongoDB connection handler
// - Uses Mongoose to connect to MongoDB
// - Connection string from environment variable
// - Error handling for failed connections
```

#### **models/Order.js** (Most Complex Model)
```javascript
// Order schema with nested structure
// - orderItemSchema for multiple products per order
// - Auto-generated order numbers (ORD-20240101-0001)
// - Status tracking (pending → delivered)
// - Payment tracking
// - Total calculation with discounts and taxes
// - Timestamps (createdAt, updatedAt)
```

#### **controllers/analyticsController.js** (Core Analytics)
```javascript
// Analytics functions using MongoDB aggregation
// - getDashboardOverview: Sales, profit, customers KPIs
// - getSalesTrend: Monthly/daily sales trends
// - getTopProducts: Best sellers
// - getProductPerformance: Fast/slow moving items
// - getCustomerAnalytics: Top customers by revenue
// - getDeliveryPerformance: On-time rate, delays
// - getProfitabilityAnalysis: Margins, profit by product
```

#### **middleware/auth.js**
```javascript
// Authentication & Authorization
// - protect: Verifies JWT token
// - authorize: Checks user roles (admin, staff, customer)
// - Extracts user from token and attaches to req.user
```

#### **scripts/seedData.js** (Data Generator)
```javascript
// Generates 100,000+ realistic records
// - Batch processing (1,000 orders per batch)
// - Realistic data with proper relationships
// - Progress tracking
// - Time range: 2 years of historical data
// - Runs with: npm run seed
```

### Frontend Files

#### **App.jsx** (Root Component)
```javascript
// Application routing and structure
// - BrowserRouter for routing
// - AuthProvider for global auth state
// - Route definitions for all pages
// - PrivateRoute wrapper for protected routes
```

#### **utils/api.js** (API Client)
```javascript
// Centralized Axios instance
// - Base URL: http://localhost:5000/api
// - Request interceptor: Adds JWT token to headers
// - Response interceptor: Handles 401 errors
// - Organized API endpoints by module:
//   - authAPI, productAPI, orderAPI, analyticsAPI, etc.
```

#### **context/AuthContext.jsx** (State Management)
```javascript
// Global authentication state
// - login(email, password)
// - register(name, email, password)
// - logout()
// - Stores token in localStorage
// - Provides user, loading, error states
```

#### **pages/AdminDashboard.jsx** (Main Dashboard)
```javascript
// Dashboard with analytics visualizations
// - 8 KPI cards (Sales, Orders, Customers, Profit, etc.)
// - LineChart for sales trends
// - PieChart for revenue by category
// - BarChart for top products
// - Low stock alerts table
// - Pending deliveries table
```

#### **pages/Analytics.jsx** (Advanced Analytics)
```javascript
// Detailed analytics page
// - Sales trend AreaChart
// - Fast-moving products list
// - Slow-moving products list
// - Top customers BarChart
// - Regional sales PieChart
// - Top 10 products table
// - Profitability metrics
```

#### **components/Sidebar.jsx**
```javascript
// Navigation menu with icons
// - 11 menu items:
//   Dashboard, Products, Orders, Inventory,
//   Deliveries, Customers, Suppliers, Vehicles,
//   Analytics, Reports, Settings
// - Active state highlighting
// - Logout button
```

---

## Module Dependencies

### Backend Dependencies (package.json)
```json
{
  "express": "^4.18.2",          // Web framework
  "mongoose": "^8.0.3",          // MongoDB ODM
  "jsonwebtoken": "^9.0.2",      // JWT tokens
  "bcryptjs": "^2.4.3",          // Password hashing
  "dotenv": "^16.3.1",           // Environment config
  "cors": "^2.8.5",              // CORS handling
  "morgan": "^1.10.0",           // HTTP logging
  "nodemon": "^3.0.2"            // Auto-restart (dev)
}
```

### Frontend Dependencies (package.json)
```json
{
  "react": "^18.2.0",            // UI library
  "react-dom": "^18.2.0",        // React DOM
  "react-router-dom": "^6.20.1", // Routing
  "axios": "^1.6.2",             // HTTP client
  "recharts": "^2.10.3",         // Charts
  "lucide-react": "^0.294.0",    // Icons
  "date-fns": "^3.0.6",          // Date utilities
  "react-hot-toast": "^2.4.1",   // Notifications
  "tailwindcss": "^3.3.6",       // CSS framework
  "vite": "^5.0.8"               // Build tool
}
```

---

## API Route Mapping

```
Backend Routes → Frontend Pages

/api/auth/*           → Login.jsx, AuthContext
/api/products/*       → Products.jsx
/api/orders/*         → Orders.jsx
/api/inventory/*      → Inventory.jsx
/api/deliveries/*     → Deliveries.jsx
/api/customers/*      → Customers.jsx
/api/suppliers/*      → Suppliers.jsx
/api/vehicles/*       → Vehicles.jsx
/api/analytics/*      → AdminDashboard.jsx, Analytics.jsx
/api/reports/*        → Reports.jsx
/api/users/*          → Settings.jsx
```

---

## Data Flow Architecture

```
User Action (Frontend)
    ↓
React Component (pages/)
    ↓
API Call (utils/api.js)
    ↓
HTTP Request (Axios)
    ↓
Express Route (routes/)
    ↓
Authentication Middleware (middleware/auth.js)
    ↓
Controller Function (controllers/)
    ↓
Mongoose Model (models/)
    ↓
MongoDB Database
    ↓
Response Back Through Chain
    ↓
Update React State
    ↓
Re-render Component
```

---

## Important Files for Demonstration

### Must-Show Files in Viva/Demo:

1. **backend/server.js** - Application entry point
2. **backend/models/Order.js** - Complex schema with nested items
3. **backend/controllers/analyticsController.js** - Advanced analytics
4. **backend/scripts/seedData.js** - 100k+ record generation
5. **frontend/src/App.jsx** - Routing structure
6. **frontend/src/utils/api.js** - API integration
7. **frontend/src/pages/AdminDashboard.jsx** - Main dashboard
8. **frontend/src/pages/Analytics.jsx** - Analytics visualization

### Files to Explain Architecture:

- **backend/middleware/auth.js** - Security implementation
- **backend/config/db.js** - Database connection
- **frontend/src/context/AuthContext.jsx** - State management
- **frontend/src/components/Layout.jsx** - Page structure

---

## Configuration Files

| File | Purpose |
|------|---------|
| **backend/.env.example** | Environment variables template |
| **backend/package.json** | Backend dependencies, scripts |
| **frontend/package.json** | Frontend dependencies, scripts |
| **frontend/vite.config.js** | Vite build configuration, proxy setup |
| **frontend/tailwind.config.js** | Tailwind theme customization |
| **frontend/postcss.config.js** | PostCSS with Tailwind plugin |
| **.gitignore** | Files to exclude from version control |

---

## Scripts Available

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server (nodemon)
npm run seed       # Seed database with 100k+ records
```

### Frontend Scripts
```bash
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## Size Estimates

| Component | Estimated Size |
|-----------|----------------|
| Backend code | ~40 KB |
| Frontend code | ~80 KB |
| Dependencies (node_modules) | ~400 MB |
| MongoDB data (100k records) | ~50 MB |
| Total project | ~530 MB |

---

## Git Repository Structure (Suggested)

```
.git/
.gitignore          # Ignore node_modules, .env, build files
README.md           # Project overview and setup
LICENSE             # MIT or appropriate license
.env.example        # Share config template, not actual secrets
```

**Files to ignore (.gitignore):**
```
node_modules/
.env
dist/
build/
*.log
.DS_Store
```

---

## Color Coding (For Presentation)

- 🔵 **Core Files** - Essential for application to run
- 🟢 **Feature Files** - Implement specific features
- 🟡 **Config Files** - Configuration and setup
- 🟠 **Documentation** - Guides and explanations
- 🔴 **Generated Files** - Build output, dependencies

---

This structure demonstrates a **professional, modular, and scalable** architecture suitable for both academic evaluation and real-world application development.

