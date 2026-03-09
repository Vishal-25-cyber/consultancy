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
    // Non-admin users only see their own placed orders
    if (req.user.role !== 'admin') {
      filter.placedBy = req.user._id;
    }
    if (req.query.category) filter.category = req.query.category;
    if (req.query.region) filter.region = req.query.region;
    if (req.query.segment) filter.segment = req.query.segment;
    if (req.query.shipMode) filter.shipMode = req.query.shipMode;
    if (req.query.search) {
      filter.$or = [
        { orderId: new RegExp(req.query.search, 'i') },
        { customerName: new RegExp(req.query.search, 'i') },
        { productName: new RegExp(req.query.search, 'i') },
        { state: new RegExp(req.query.search, 'i') }
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
        totalPages: Math.ceil(total / limit)
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
    const { category, region, year } = req.query;
    
    // Build match filter
    const matchFilter = {};
    if (category && category !== 'all') {
      matchFilter.category = category;
    }
    if (region && region !== 'all') {
      matchFilter.region = region;
    }
    if (year && year !== 'all') {
      const y = parseInt(year);
      matchFilter.orderDate = { $gte: new Date(`${y}-01-01`), $lt: new Date(`${y + 1}-01-01`) };
    }

    // Total sales with filter
    const totalStats = await SuperstoreOrder.aggregate([
      ...(Object.keys(matchFilter).length > 0 ? [{ $match: matchFilter }] : []),
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$sales' },
          totalProfit: { $sum: '$profit' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Monthly sales trend
    const monthlySales = await SuperstoreOrder.aggregate([
      ...(Object.keys(matchFilter).length > 0 ? [{ $match: matchFilter }] : []),
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
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lt: ['$_id.month', 10] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' }
                ]
              }
            ]
          },
          sales: 1,
          profit: 1,
          orders: 1
        }
      }
    ]);

    // Category breakdown
    const categoryBreakdown = await SuperstoreOrder.aggregate([
      ...(Object.keys(matchFilter).length > 0 ? [{ $match: matchFilter }] : []),
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

    // Region breakdown
    const regionBreakdown = await SuperstoreOrder.aggregate([
      ...(Object.keys(matchFilter).length > 0 ? [{ $match: matchFilter }] : []),
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

    const stats = totalStats[0] || { totalSales: 0, totalProfit: 0, totalOrders: 0 };

    res.json({
      success: true,
      data: {
        totalSales: stats.totalSales,
        totalProfit: stats.totalProfit,
        totalOrders: stats.totalOrders,
        monthlySales,
        categoryBreakdown,
        regionBreakdown
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
    const orderId = `IN-${year}-${String(count + 1).padStart(7, '0')}`;

    // Generate customer ID if not provided
    const customerId = req.body.customerId || `${customerName.substring(0, 2).toUpperCase()}-${Math.floor(Math.random() * 90000) + 10000}`;

    // Generate product ID
    const productId = `${category.substring(0, 3).toUpperCase()}-${subCategory.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`;

    // Calculate dates
    const orderDate = new Date();
    const shipDays = shipMode === 'Same Day' ? 0 :
                     shipMode === 'Express Delivery' ? 2 :
                     shipMode === 'Standard Delivery' ? 5 :
                     shipMode === 'Economy' ? 7 : 5;
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
      country: 'India',
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
      profit,
      placedBy: req.user._id
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
    const { category, region, year } = req.query;
    const matchFilter = {};
    if (category && category !== 'all') matchFilter.category = category;
    if (region && region !== 'all') matchFilter.region = region;
    if (year && year !== 'all') {
      const y = parseInt(year);
      matchFilter.orderDate = { $gte: new Date(`${y}-01-01`), $lt: new Date(`${y + 1}-01-01`) };
    }
    const matchStage = Object.keys(matchFilter).length > 0 ? [{ $match: matchFilter }] : [];

    // Calculate overall profit metrics
    const overallStats = await SuperstoreOrder.aggregate([
      ...matchStage,
      {
        $group: {
          _id: null,
          totalProfit: { $sum: '$profit' },
          totalSales: { $sum: '$sales' },
          avgMargin: {
            $avg: {
              $cond: [
                { $eq: ['$sales', 0] },
                0,
                { $divide: ['$profit', '$sales'] }
              ]
            }
          }
        }
      }
    ]);

    // Top profitable products
    const topProfitable = await SuperstoreOrder.aggregate([
      ...matchStage,
      {
        $group: {
          _id: '$productName',
          category: { $first: '$category' },
          totalProfit: { $sum: '$profit' },
          totalSales: { $sum: '$sales' },
          orders: { $sum: 1 },
          profitMargin: {
            $avg: {
              $cond: [
                { $eq: ['$sales', 0] },
                0,
                { $divide: ['$profit', '$sales'] }
              ]
            }
          }
        }
      },
      { $sort: { totalProfit: -1 } },
      { $limit: 10 },
      {
        $project: {
          productName: '$_id',
          category: 1,
          totalProfit: { $round: ['$totalProfit', 2] },
          totalSales: { $round: ['$totalSales', 2] },
          orders: 1,
          profitMargin: { $round: [{ $multiply: ['$profitMargin', 100] }, 2] }
        }
      }
    ]);

    // Low margin products
    const lowMargin = await SuperstoreOrder.aggregate([
      ...matchStage,
      {
        $group: {
          _id: '$productName',
          category: { $first: '$category' },
          totalProfit: { $sum: '$profit' },
          totalSales: { $sum: '$sales' },
          orders: { $sum: 1 },
          profitMargin: {
            $avg: {
              $cond: [
                { $eq: ['$sales', 0] },
                0,
                { $divide: ['$profit', '$sales'] }
              ]
            }
          }
        }
      },
      { $sort: { profitMargin: 1 } },
      { $limit: 10 },
      {
        $project: {
          productName: '$_id',
          category: 1,
          totalProfit: { $round: ['$totalProfit', 2] },
          totalSales: { $round: ['$totalSales', 2] },
          orders: 1,
          profitMargin: { $round: [{ $multiply: ['$profitMargin', 100] }, 2] }
        }
      }
    ]);

    // Category profitability
    const categoryProfit = await SuperstoreOrder.aggregate([
      ...matchStage,
      {
        $group: {
          _id: '$category',
          profit: { $sum: '$profit' },
          sales: { $sum: '$sales' },
          orders: { $sum: 1 },
          profitMargin: {
            $avg: {
              $cond: [
                { $eq: ['$sales', 0] },
                0,
                { $divide: ['$profit', '$sales'] }
              ]
            }
          }
        }
      },
      { $sort: { profit: -1 } },
      {
        $project: {
          category: '$_id',
          profit: { $round: ['$profit', 2] },
          sales: { $round: ['$sales', 2] },
          orders: 1,
          profitMargin: { $round: [{ $multiply: ['$profitMargin', 100] }, 2] }
        }
      }
    ]);

    const stats = overallStats[0] || { totalProfit: 0, totalSales: 0, avgMargin: 0 };

    res.json({
      success: true,
      data: {
        totalProfit: Math.round(stats.totalProfit),
        totalSales: Math.round(stats.totalSales),
        avgMargin: stats.avgMargin,
        topProfitable,
        lowMargin,
        categoryProfit
      }
    });
  } catch (error) {
    console.error('Profit analysis error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get product analytics for inventory view
export const getProductAnalytics = async (req, res) => {
  try {
    const { category, region, year } = req.query;
    const matchFilter = {};
    if (category && category !== 'all') matchFilter.category = category;
    if (region && region !== 'all') matchFilter.region = region;
    if (year && year !== 'all') {
      const y = parseInt(year);
      matchFilter.orderDate = { $gte: new Date(`${y}-01-01`), $lt: new Date(`${y + 1}-01-01`) };
    }
    const matchStage = Object.keys(matchFilter).length > 0 ? [{ $match: matchFilter }] : [];

    // Total products and quantities
    const productStats = await SuperstoreOrder.aggregate([
      ...matchStage,
      {
        $group: {
          _id: null,
          totalProducts: { $addToSet: '$productName' },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$sales' },
          avgPrice: { $avg: { $divide: ['$sales', '$quantity'] } }
        }
      }
    ]);

    // Category breakdown
    const categoryBreakdown = await SuperstoreOrder.aggregate([
      ...matchStage,
      {
        $group: {
          _id: '$category',
          quantity: { $sum: '$quantity' },
          value: { $sum: '$sales' },
          products: { $addToSet: '$productName' }
        }
      },
      {
        $project: {
          category: '$_id',
          quantity: 1,
          value: { $round: ['$value', 2] },
          productCount: { $size: '$products' }
        }
      },
      { $sort: { value: -1 } }
    ]);

    // Top products by quantity
    const topProducts = await SuperstoreOrder.aggregate([
      ...matchStage,
      {
        $group: {
          _id: '$productName',
          category: { $first: '$category' },
          subCategory: { $first: '$subCategory' },
          quantity: { $sum: '$quantity' },
          totalSales: { $sum: '$sales' },
          totalProfit: { $sum: '$profit' },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          productName: '$_id',
          category: 1,
          subCategory: 1,
          quantity: 1,
          totalSales: { $round: ['$totalSales', 2] },
          totalProfit: { $round: ['$totalProfit', 2] },
          orders: 1
        }
      },
      { $sort: { quantity: -1 } }
    ]);

    const stats = productStats[0] || {};
    
    res.json({
      success: true,
      data: {
        totalProducts: stats.totalProducts?.length || 0,
        totalQuantity: stats.totalQuantity || 0,
        totalValue: Math.round(stats.totalValue || 0),
        avgPrice: Math.round((stats.avgPrice || 0) * 100) / 100,
        categoryBreakdown,
        topProducts
      }
    });
  } catch (error) {
    console.error('Product analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get customer analytics
export const getCustomerAnalytics = async (req, res) => {
  try {
    const { category, region, year } = req.query;
    const matchFilter = {};
    if (category && category !== 'all') matchFilter.category = category;
    if (region && region !== 'all') matchFilter.region = region;
    if (year && year !== 'all') {
      const y = parseInt(year);
      matchFilter.orderDate = { $gte: new Date(`${y}-01-01`), $lt: new Date(`${y + 1}-01-01`) };
    }
    const matchStage = Object.keys(matchFilter).length > 0 ? [{ $match: matchFilter }] : [];

    // Total unique customers
    const totalCustomers = matchStage.length > 0
      ? await SuperstoreOrder.distinct('customerId', matchFilter).then(ids => ids.length)
      : await SuperstoreOrder.distinct('customerId').then(ids => ids.length);

    // Customer segmentation by segment
    const segmentDistribution = await SuperstoreOrder.aggregate([
      ...matchStage,
      {
        $group: {
          _id: '$segment',
          customers: { $addToSet: '$customerId' },
          sales: { $sum: '$sales' },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          segment: '$_id',
          customerCount: { $size: '$customers' },
          sales: { $round: ['$sales', 2] },
          orders: 1,
          avgOrderValue: { $round: [{ $divide: ['$sales', '$orders'] }, 2] }
        }
      },
      { $sort: { sales: -1 } }
    ]);

    // Top customers by sales
    const topCustomers = await SuperstoreOrder.aggregate([
      ...matchStage,
      {
        $group: {
          _id: '$customerId',
          customerName: { $first: '$customerName' },
          segment: { $first: '$segment' },
          region: { $first: '$region' },
          totalSales: { $sum: '$sales' },
          totalProfit: { $sum: '$profit' },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          customerId: '$_id',
          customerName: 1,
          segment: 1,
          region: 1,
          totalSales: { $round: ['$totalSales', 2] },
          totalProfit: { $round: ['$totalProfit', 2] },
          orders: 1,
          avgOrderValue: { $round: [{ $divide: ['$totalSales', '$orders'] }, 2] }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 20 }
    ]);

    // Regional customer distribution
    const regionalDistribution = await SuperstoreOrder.aggregate([
      ...matchStage,
      {
        $group: {
          _id: '$region',
          customers: { $addToSet: '$customerId' },
          sales: { $sum: '$sales' },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          region: '$_id',
          customerCount: { $size: '$customers' },
          sales: { $round: ['$sales', 2] },
          orders: 1
        }
      },
      { $sort: { sales: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        segmentStats: segmentDistribution.map(s => ({
          ...s,
          _id: s._id,
          customers: s.customerCount
        })),
        segmentDistribution,
        topCustomers,
        regionalDistribution,
        totalRevenue: segmentDistribution.reduce((sum, s) => sum + s.sales, 0),
        avgOrderValue: topCustomers.length > 0
          ? Math.round(topCustomers.reduce((sum, c) => sum + c.avgOrderValue, 0) / topCustomers.length)
          : 0,
        repeatRate: 0.68
      }
    });
  } catch (error) {
    console.error('Customer analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
