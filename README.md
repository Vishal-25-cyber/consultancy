# Inventory, Sales and Delivery Analytics Management System

A production-ready full-stack web application for trading/distribution companies to manage inventory, sales, deliveries, and analytics with 100,000+ transaction records.

## 🎯 Project Overview

This system helps trading companies that purchase goods from suppliers, store them in inventory, and sell/distribute them to customers using their own delivery vehicles. It features advanced data analytics, real-time reporting, and comprehensive business intelligence.

## ✨ Features

### Core Modules
- **Authentication & Authorization** - JWT-based auth with role management (Admin, Staff, Customer)
- **Master Data Management** - Products, Categories, Suppliers, Customers, Vehicles, Employees
- **Inventory Management** - Stock tracking, low stock alerts, stock movements, warehouse management
- **Order & Sales Management** - Order processing, invoice generation, payment tracking, sales returns
- **Delivery Management** - Vehicle assignment, delivery tracking, route management, performance metrics
- **Advanced Analytics** - Sales trends, product performance, customer segmentation, delivery analytics
- **Reporting** - Daily/Monthly reports, Inventory reports, Delivery performance, Profit/Loss analysis

### Analytics Features (100,000+ Records)
- Demand forecasting
- Sales trend analysis
- Seasonal pattern detection
- Fast/slow-moving item classification
- Customer segmentation
- Delivery delay pattern analysis
- Reorder suggestions
- Profitability analysis

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Notifications:** React Hot Toast

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Logging:** Morgan
- **Environment:** dotenv

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (v5.0 or higher) - Running locally or MongoDB Atlas
- **npm** or **yarn**

## 🚀 Installation & Setup

### 1. Clone or Extract the Project

```bash
cd "consultancy project"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env file with your MongoDB connection string
# Example: MONGODB_URI=mongodb://localhost:27017/inventory_analytics
```

Edit the `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inventory_analytics
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Frontend Setup

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
copy .env.example .env
```

### 4. Seed Database with 100,000+ Records

This step is **crucial** for demonstration purposes as it generates realistic data.

```bash
# From the backend directory
cd backend

# Run the seed script (takes 2-3 minutes)
npm run seed
```

Expected output:
```
✅ MongoDB Connected
🗑️  Clearing existing data...
✅ Database cleared
👥 Creating users...
✅ Created 3 users
📁 Creating categories...
✅ Created 10 categories
🏭 Creating suppliers...
✅ Created 50 suppliers
👤 Creating customers...
✅ Created 1000 customers
📦 Creating products...
✅ Created 500 products
🚚 Creating vehicles...
✅ Created 30 vehicles
📝 Creating 100,000+ orders (this may take a few minutes)...
   Progress: 100.0% (100000 orders created)
✅ Created 100000 orders
🚛 Creating deliveries...
✅ Created 45234 deliveries
📊 Creating inventory transactions...
✅ Created 1000 inventory transactions

✅ Database seeding completed successfully!

📊 Summary:
   Users: 3
   Categories: 10
   Suppliers: 50
   Customers: 1000
   Products: 500
   Vehicles: 30
   Orders: 100000
   Deliveries: 45234
   Inventory Transactions: 1000

🔑 Login Credentials:
   Admin - Email: admin@inventory.com, Password: admin123
   Staff - Email: staff@inventory.com, Password: staff123
   Customer - Email: customer@example.com, Password: customer123
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server is running on port 5000
✅ MongoDB Connected: localhost
📊 Environment: development
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 350 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 🔐 Login Credentials

### Admin Account
- **Email:** admin@inventory.com
- **Password:** admin123
- **Access:** Full system access

### Staff Account
- **Email:** staff@inventory.com
- **Password:** staff123
- **Access:** Limited to operations

### Customer Account
- **Email:** customer@example.com
- **Password:** customer123
- **Access:** View orders only

## 📱 Application Structure

```
consultancy project/
├── backend/                    # Backend API
│   ├── config/                # Database configuration
│   ├── controllers/           # Request handlers
│   ├── middleware/            # Authentication & validation
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API routes
│   ├── scripts/               # Seed script
│   ├── server.js              # Entry point
│   └── package.json
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React context (Auth)
│   │   ├── pages/             # Page components
│   │   ├── utils/             # API client & helpers
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## 📊 Key Features Demo

### 1. Dashboard
- Real-time KPI cards (Sales, Orders, Customers, Profit)
- Sales trend charts
- Revenue by category
- Top selling products
- Low stock alerts
- Pending deliveries

### 2. Products Management
- Add/Edit/Delete products
- Product search and filtering
- Stock level indicators
- Low stock warnings
- Category management

### 3. Order Management
- Create new orders
- Track order status
- Payment tracking
- Order history
- Invoice generation

### 4. Inventory Tracking
- Real-time stock levels
- Stock in/out transactions
- Batch tracking
- Warehouse management
- Stock movement history

### 5. Delivery Management
- Assign vehicles
- Track delivery status
- Driver management
- Delivery performance metrics

### 6. Advanced Analytics (100K+ Records)
- Monthly sales trends
- Top performing products
- Customer revenue analysis
- Revenue by category
- Sales by region/state
- Fast vs Slow moving products
- Delivery performance metrics
- Profitability analysis
- Product turnover rates

### 7. Reports
- Daily sales report
- Monthly sales report
- Inventory report
- Delivery performance report
- Customer report
- Profit/Loss report

## 🎨 UI/UX Features

- Modern, clean SaaS-style dashboard
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Beautiful gradient cards
- Status badges with color coding
- Loading states and skeletons
- Toast notifications
- Professional charts and graphs

## 🗂️ Database Collections

The system uses MongoDB with the following collections:

- **users** - System users (Admin, Staff, Customer)
- **categories** - Product categories
- **suppliers** - Supplier information
- **customers** - Customer database
- **products** - Product catalog
- **vehicles** - Delivery vehicles
- **orders** - Order records (100,000+)
- **deliveries** - Delivery tracking
- **inventories** - Stock movement history

## 🔧 API Endpoints

### Authentication
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- PUT `/api/auth/profile` - Update profile

### Products
- GET `/api/products` - Get all products
- POST `/api/products` - Create product
- PUT `/api/products/:id` - Update product
- DELETE `/api/products/:id` - Delete product

### Orders
- GET `/api/orders` - Get all orders
- POST `/api/orders` - Create order
- PUT `/api/orders/:id/status` - Update order status
- PUT `/api/orders/:id/payment` - Update payment

### Analytics
- GET `/api/analytics/dashboard` - Dashboard overview
- GET `/api/analytics/sales-trend` - Sales trends
- GET `/api/analytics/top-products` - Top products
- GET `/api/analytics/profitability` - Profit analysis

[See full API documentation for all endpoints]

## 📈 Performance Considerations

- Efficient MongoDB indexing for 100K+ records
- Pagination on large datasets
- Optimized aggregation pipelines
- Batch inserts for seed data
- Lazy loading and code splitting
- Responsive chart rendering

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# If not, start MongoDB service
# Windows: Start MongoDB service from Services
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Port Already in Use
```bash
# Change port in backend/.env
PORT=5001

# Or kill process using port 5000
# Windows: netstat -ano | findstr :5000
# Then: taskkill /PID <PID> /F
```

### Frontend Not Loading
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

## 🎓 For College Project Demonstration

### Viva Questions & Answers

**Q: What is the main objective of your project?**
A: To create an analytics-driven inventory and sales management system for trading companies that handles 100,000+ transaction records with advanced analytics features.

**Q: Why did you use MongoDB over SQL?**
A: MongoDB's flexible schema is ideal for handling nested order items, dynamic product attributes, and varying address formats. It also performs well with large datasets and aggregations.

**Q: How do you handle 100,000+ records efficiently?**
A: We use MongoDB indexing, aggregation pipelines, pagination, batch processing during seeding, and optimized queries with proper filtering.

**Q: Explain the authentication flow.**
A: We use JWT tokens. User logs in → Server validates credentials → Generates JWT token → Client stores token → Sends token in Authorization header for protected routes.

**Q: What analytics features did you implement?**
A: Sales trends, product performance (fast/slow moving), customer segmentation, delivery performance, profitability analysis, revenue by category, and regional sales analysis.

## 📝 Project Report Sections

This project includes:
✅ Problem Statement
✅ Objectives
✅ System Architecture
✅ Module Description
✅ Database Schema
✅ 100,000+ Record Dataset
✅ Analytics Implementation
✅ Screenshots
✅ Future Enhancements
✅ Conclusion

See PROJECT_DOCUMENTATION.md for detailed documentation.

## 🚀 Future Enhancements

- PDF export for reports
- Excel export functionality
- Email notifications
- SMS alerts for low stock
- Barcode scanning
- Mobile app (React Native)
- Real-time notifications with WebSocket
- Machine learning for demand forecasting
- Multi-warehouse support
- Multi-currency support

## 👨‍💻 Developed By

[Your Name]
[Your College Name]
[Year & Department]

## 📄 License

This project is created for educational purposes as part of a college consultancy project.

## 🙏 Acknowledgments

- React & Vite documentation
- MongoDB documentation
- Recharts library
- Tailwind CSS
- Express.js community

---

**Note:** This is a demonstration project with synthetic data. Do not use in production without proper security audits and enhancements.

## 💡 Support

For any issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check console logs for errors
4. Ensure MongoDB is running
5. Verify all dependencies are installed

---

**Happy Coding! 🎉**
