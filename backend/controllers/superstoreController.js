import SuperstoreOrder from '../models/SuperstoreOrder.js';

// Get dashboard overview
export const getDashboardOverview = async (req, res) => {
  try {
    // Total sales and profit
    const totalStats = await SuperstoreOrder.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$sales' },
          totalProfit: { $sum: '$profit' },
          totalOrders: { $sum: 1 },
          avgSales: { $avg: '$sales' }
        }
      }
    ]);

    // Sales by category
    const categoryStats = await SuperstoreOrder.aggregate([
      {
        $group: {
          _id: '$category',
          sales: { $sum: '$sales' },
          profit: { $sum: '$profit' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { sales: -1 } }
    ]);

    // Sales by region
    const regionStats = await SuperstoreOrder.aggregate([
      {
        $group: {
          _id: '$region',
          sales: { $sum: '$sales' },
          profit: { $sum: '$profit' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { sales: -1 } }
    ]);

    // Sales by segment
    const segmentStats = await SuperstoreOrder.aggregate([
      {
        $group: {
          _id: '$segment',
          sales: { $sum: '$sales' },
          profit: { $sum: '$profit' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { sales: -1 } }
    ]);

    // Monthly sales trend
    const monthlySales = await SuperstoreOrder.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' }
          },
          sales: { $sum: '$sales' },
          profit: { $sum: '$profit' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 24 }
    ]);

    // Top products
    const topProducts = await SuperstoreOrder.aggregate([
      {
        $group: {
          _id: '$productName',
          category: { $first: '$category' },
          totalSales: { $sum: '$sales' },
          totalProfit: { $sum: '$profit' },
          quantity: { $sum: '$quantity' }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 }
    ]);

    // Top customers
    const topCustomers = await SuperstoreOrder.aggregate([
      {
        $group: {
          _id: '$customerId',
          customerName: { $first: '$customerName' },
          segment: { $first: '$segment' },
          totalSales: { $sum: '$sales' },
          totalProfit: { $sum: '$profit' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: totalStats[0] || {},
        categoryStats,
        regionStats,
        segmentStats,
        monthlySales,
        topProducts,
        topCustomers
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all orders with filters
export const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.region) filter.region = req.query.region;
    if (req.query.segment) filter.segment = req.query.segment;
    if (req.query.search) {
      filter.$or = [
        { orderId: new RegExp(req.query.search, 'i') },
        { customerName: new RegExp(req.query.search, 'i') },
        { productName: new RegExp(req.query.search, 'i') }
      ];
    }

    const total = await SuperstoreOrder.countDocuments(filter);
    const orders = await SuperstoreOrder.find(filter)
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get sales analytics
export const getSalesAnalytics = async (req, res) => {
  try {
    // Yearly comparison
    const yearlyComparison = await SuperstoreOrder.aggregate([
      {
        $group: {
          _id: { $year: '$orderDate' },
          sales: { $sum: '$sales' },
          profit: { $sum: '$profit' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Category performance
    const categoryPerformance = await SuperstoreOrder.aggregate([
      {
        $group: {
          _id: {
            category: '$category',
            subCategory: '$subCategory'
          },
          sales: { $sum: '$sales' },
          profit: { $sum: '$profit' },
          profitMargin: { 
            $avg: { 
              $multiply: [ 
                { $divide: ['$profit', '$sales'] }, 
                100 
              ] 
            } 
          }
        }
      },
      { $sort: { sales: -1 } }
    ]);

    // Ship mode analysis
    const shipModeAnalysis = await SuperstoreOrder.aggregate([
      {
        $group: {
          _id: '$shipMode',
          orders: { $sum: 1 },
          sales: { $sum: '$sales' },
          avgShipDays: {
            $avg: {
              $divide: [
                { $subtract: ['$shipDate', '$orderDate'] },
                86400000 // milliseconds in a day
              ]
            }
          }
        }
      },
      { $sort: { orders: -1 } }
    ]);

    // State-wise performance
    const statePerformance = await SuperstoreOrder.aggregate([
      {
        $group: {
          _id: '$state',
          region: { $first: '$region' },
          sales: { $sum: '$sales' },
          profit: { $sum: '$profit' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      data: {
        yearlyComparison,
        categoryPerformance,
        shipModeAnalysis,
        statePerformance
      }
    });
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get profit analysis
// Create new order
export const createOrder = async (req, res) => {
  try {
    const { 
      productName, 
      category, 
      subCategory, 
      quantity, 
      customerName, 
      shipMode, 
      segment, 
      city, 
      state, 
      region, 
      postalCode,
      sales 
    } = req.body;

    // Generate unique order ID
    const year = new Date().getFullYear();
    const count = await SuperstoreOrder.countDocuments();
    const orderId = `US-${year}-${String(count + 1).padStart(7, '0')}`;

    // Generate customer ID if not provided
    const customerId = req.body.customerId || `${customerName.substring(0, 2).toUpperCase()}-${Math.floor(Math.random() * 90000) + 10000}`;

    // Generate product ID
    const productId = `${category.substring(0, 3).toUpperCase()}-${subCategory.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`;

    // Calculate dates
    const orderDate = new Date();
    const shipDays = shipMode === 'Same Day' ? 0 : 
                     shipMode === 'First Class' ? 1 : 
                     shipMode === 'Second Class' ? 3 : 5;
    const shipDate = new Date(orderDate.getTime() + shipDays * 24 * 60 * 60 * 1000);

    // Calculate profit (20-35% of sales)
    const profitMargin = 0.20 + Math.random() * 0.15;
    const profit = parseFloat((sales * profitMargin).toFixed(2));

    const newOrder = await SuperstoreOrder.create({
      orderId,
      orderDate,
      shipDate,
      shipMode,
      customerId,
      customerName,
      segment,
      country: 'United States',
      city,
      state,
      postalCode,
      region,
      productId,
      category,
      subCategory,
      productName,
      sales: parseFloat(sales),
      quantity: parseInt(quantity),
      discount: 0,
      profit
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: newOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get available products for ordering
export const getAvailableProducts = async (req, res) => {
  try {
    const products = await SuperstoreOrder.aggregate([
      {
        $group: {
          _id: {
            productName: '$productName',
            category: '$category',
            subCategory: '$subCategory'
          },
          avgPrice: { $avg: '$sales' },
          totalSold: { $sum: '$quantity' }
        }
      },
      {
        $project: {
          _id: 0,
          productName: '$_id.productName',
          category: '$_id.category',
          subCategory: '$_id.subCategory',
          price: { $round: ['$avgPrice', 2] },
          popularity: '$totalSold'
        }
      },
      { $sort: { popularity: -1 } },
      { $limit: 100 }
    ]);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfitAnalysis = async (req, res) => {
  try {
    // Most and least profitable products
    const profitableProducts = await SuperstoreOrder.aggregate([
      {
        $group: {
          _id: '$productName',
          category: { $first: '$category' },
          totalProfit: { $sum: '$profit' },
          totalSales: { $sum: '$sales' },
          profitMargin: {
            $avg: {
              $multiply: [
                { $divide: ['$profit', '$sales'] },
                100
              ]
            }
          }
        }
      },
      { $sort: { totalProfit: -1 } }
    ]);

    const mostProfitable = profitableProducts.slice(0, 10);
    const leastProfitable = profitableProducts.slice(-10).reverse();

    // Discount impact
    const discountImpact = await SuperstoreOrder.aggregate([
      {
        $bucket: {
          groupBy: '$discount',
          boundaries: [0, 0.1, 0.2, 0.3, 1],
          default: 'No Discount',
          output: {
            orders: { $sum: 1 },
            avgProfit: { $avg: '$profit' },
            avgSales: { $avg: '$sales' },
            totalSales: { $sum: '$sales' }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        mostProfitable,
        leastProfitable,
        discountImpact
      }
    });
  } catch (error) {
    console.error('Profit analysis error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
