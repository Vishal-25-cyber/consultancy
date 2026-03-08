import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Delivery from '../models/Delivery.js';
import Inventory from '../models/Inventory.js';
import { successResponse, errorResponse } from '../middleware/responseHandler.js';

// @desc    Get dashboard overview
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
export const getDashboardOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.orderDate = {};
      if (startDate) dateFilter.orderDate.$gte = new Date(startDate);
      if (endDate) dateFilter.orderDate.$lte = new Date(endDate);
    }
    
    // Total Sales
    const salesData = await Order.aggregate([
      { 
        $match: { 
          orderStatus: { $ne: 'cancelled' },
          ...dateFilter
        } 
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          totalProfit: { 
            $sum: { 
              $subtract: [
                { $multiply: ['$items.quantity', { $subtract: ['$items.unitPrice', '$items.costPrice'] }] }
              ] 
            } 
          }
        }
      }
    ]);
    
    const stats = salesData[0] || { totalSales: 0, totalOrders: 0, totalProfit: 0 };
    
    // Customer count
    const totalCustomers = await Customer.countDocuments({ status: 'active' });
    
    // Product count
    const totalProducts = await Product.countDocuments({ status: 'active' });
    
    // Low stock count
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$currentStock', '$reorderLevel'] },
      status: 'active'
    });
    
    // Pending deliveries
    const pendingDeliveries = await Delivery.countDocuments({
      deliveryStatus: { $in: ['pending', 'assigned', 'in-transit'] }
    });
    
    // Payment pending
    const paymentPending = await Order.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['pending', 'partial'] },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } }
        }
      }
    ]);
    
    return successResponse(res, 200, 'Dashboard data retrieved successfully', {
      totalSales: stats.totalSales,
      totalOrders: stats.totalOrders,
      totalProfit: stats.totalProfit,
      totalCustomers,
      totalProducts,
      lowStockCount,
      pendingDeliveries,
      paymentPending: paymentPending[0]?.total || 0
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get sales trend (monthly/daily)
// @route   GET /api/analytics/sales-trend
// @access  Private/Admin
export const getSalesTrend = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;
    
    const matchFilter = {
      orderStatus: { $ne: 'cancelled' }
    };
    
    if (startDate || endDate) {
      matchFilter.orderDate = {};
      if (startDate) matchFilter.orderDate.$gte = new Date(startDate);
      if (endDate) matchFilter.orderDate.$lte = new Date(endDate);
    }
    
    let groupBy;
    if (period === 'daily') {
      groupBy = {
        year: { $year: '$orderDate' },
        month: { $month: '$orderDate' },
        day: { $dayOfMonth: '$orderDate' }
      };
    } else {
      groupBy = {
        year: { $year: '$orderDate' },
        month: { $month: '$orderDate' }
      };
    }
    
    const salesTrend = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 50 }
    ]);
    
    return successResponse(res, 200, 'Sales trend retrieved successfully', salesTrend);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get top selling products
// @route   GET /api/analytics/top-products
// @access  Private/Admin
export const getTopProducts = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    const matchFilter = {
      orderStatus: { $ne: 'cancelled' }
    };
    
    if (startDate || endDate) {
      matchFilter.orderDate = {};
      if (startDate) matchFilter.orderDate.$gte = new Date(startDate);
      if (endDate) matchFilter.orderDate.$lte = new Date(endDate);
    }
    
    const topProducts = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    return successResponse(res, 200, 'Top products retrieved successfully', topProducts);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get revenue by category
// @route   GET /api/analytics/revenue-by-category
// @access  Private/Admin
export const getRevenueByCategory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchFilter = {
      orderStatus: { $ne: 'cancelled' }
    };
    
    if (startDate || endDate) {
      matchFilter.orderDate = {};
      if (startDate) matchFilter.orderDate.$gte = new Date(startDate);
      if (endDate) matchFilter.orderDate.$lte = new Date(endDate);
    }
    
    const revenueByCategory = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetails.category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: '$categoryDetails' },
      {
        $group: {
          _id: '$categoryDetails._id',
          categoryName: { $first: '$categoryDetails.name' },
          totalRevenue: { $sum: '$items.total' },
          totalQuantity: { $sum: '$items.quantity' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
    
    return successResponse(res, 200, 'Revenue by category retrieved successfully', revenueByCategory);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get customer analytics
// @route   GET /api/analytics/customer-analytics
// @access  Private/Admin
export const getCustomerAnalytics = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topCustomers = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$customer',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerDetails'
        }
      },
      { $unwind: '$customerDetails' },
      {
        $project: {
          customerId: '$_id',
          customerName: '$customerDetails.name',
          customerType: '$customerDetails.customerType',
          totalOrders: 1,
          totalSpent: 1,
          avgOrderValue: 1
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    return successResponse(res, 200, 'Customer analytics retrieved successfully', topCustomers);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get delivery performance
// @route   GET /api/analytics/delivery-performance
// @access  Private/Admin
export const getDeliveryPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchFilter = {};
    if (startDate || endDate) {
      matchFilter.scheduledDate = {};
      if (startDate) matchFilter.scheduledDate.$gte = new Date(startDate);
      if (endDate) matchFilter.scheduledDate.$lte = new Date(endDate);
    }
    
    const deliveryStats = await Delivery.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$deliveryStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // On-time delivery rate
    const onTimeDeliveries = await Delivery.aggregate([
      {
        $match: {
          deliveryStatus: 'delivered',
          ...matchFilter
        }
      },
      {
        $project: {
          isOnTime: {
            $cond: [
              { $lte: ['$actualDeliveryDate', '$scheduledDate'] },
              1,
              0
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          onTime: { $sum: '$isOnTime' }
        }
      }
    ]);
    
    const onTimeRate = onTimeDeliveries[0] 
      ? ((onTimeDeliveries[0].onTime / onTimeDeliveries[0].total) * 100).toFixed(2)
      : 0;
    
    return successResponse(res, 200, 'Delivery performance retrieved successfully', {
      statusBreakdown: deliveryStats,
      onTimeDeliveryRate: parseFloat(onTimeRate),
      totalDelivered: onTimeDeliveries[0]?.total || 0,
      onTimeDelivered: onTimeDeliveries[0]?.onTime || 0
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get inventory analytics
// @route   GET /api/analytics/inventory-analytics
// @access  Private/Admin
export const getInventoryAnalytics = async (req, res) => {
  try {
    // Stock value
    const stockValue = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalStockValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } },
          totalProducts: { $sum: 1 }
        }
      }
    ]);
    
    // Low stock items
    const lowStockItems = await Product.countDocuments({
      $expr: { $lte: ['$currentStock', '$reorderLevel'] },
      status: 'active'
    });
    
    // Out of stock
    const outOfStock = await Product.countDocuments({
      currentStock: 0,
      status: 'active'
    });
    
    // Dead stock (no sales in last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const recentSales = await Order.aggregate([
      { 
        $match: { 
          orderDate: { $gte: ninetyDaysAgo },
          orderStatus: { $ne: 'cancelled' }
        } 
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product'
        }
      }
    ]);
    
    const recentSoldProductIds = recentSales.map(item => item._id);
    
    const deadStock = await Product.countDocuments({
      _id: { $nin: recentSoldProductIds },
      status: 'active',
      currentStock: { $gt: 0 }
    });
    
    return successResponse(res, 200, 'Inventory analytics retrieved successfully', {
      totalStockValue: stockValue[0]?.totalStockValue || 0,
      totalProducts: stockValue[0]?.totalProducts || 0,
      lowStockItems,
      outOfStock,
      deadStock
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get sales by region (city/state)
// @route   GET /api/analytics/sales-by-region
// @access  Private/Admin
export const getSalesByRegion = async (req, res) => {
  try {
    const { groupBy = 'state' } = req.query;
    
    const groupField = groupBy === 'city' ? '$customerDetails.address.city' : '$customerDetails.address.state';
    
    const salesByRegion = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerDetails'
        }
      },
      { $unwind: '$customerDetails' },
      {
        $group: {
          _id: groupField,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 20 }
    ]);
    
    return successResponse(res, 200, 'Sales by region retrieved successfully', salesByRegion);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get product performance (fast/slow moving)
// @route   GET /api/analytics/product-performance
// @access  Private/Admin
export const getProductPerformance = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const productSales = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: thirtyDaysAgo },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          productName: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          currentStock: '$productDetails.currentStock',
          turnoverRate: {
            $cond: [
              { $gt: ['$productDetails.currentStock', 0] },
              { $divide: ['$totalQuantity', '$productDetails.currentStock'] },
              0
            ]
          }
        }
      },
      { $sort: { turnoverRate: -1 } }
    ]);
    
    // Classify products
    const fastMoving = productSales.filter(p => p.turnoverRate > 2).slice(0, 10);
    const slowMoving = productSales.filter(p => p.turnoverRate < 0.5 && p.turnoverRate > 0).slice(0, 10);
    
    return successResponse(res, 200, 'Product performance retrieved successfully', {
      fastMoving,
      slowMoving
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get profitability analysis
// @route   GET /api/analytics/profitability
// @access  Private/Admin
export const getProfitabilityAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchFilter = {
      orderStatus: { $ne: 'cancelled' }
    };
    
    if (startDate || endDate) {
      matchFilter.orderDate = {};
      if (startDate) matchFilter.orderDate.$gte = new Date(startDate);
      if (endDate) matchFilter.orderDate.$lte = new Date(endDate);
    }
    
    const profitAnalysis = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$items.total' },
          totalCost: { $sum: { $multiply: ['$items.quantity', '$items.costPrice'] } },
          totalDiscount: { $sum: '$items.discount' }
        }
      },
      {
        $project: {
          totalRevenue: 1,
          totalCost: 1,
          totalDiscount: 1,
          grossProfit: { $subtract: ['$totalRevenue', '$totalCost'] },
          profitMargin: {
            $multiply: [
              { $divide: [{ $subtract: ['$totalRevenue', '$totalCost'] }, '$totalRevenue'] },
              100
            ]
          }
        }
      }
    ]);
    
    return successResponse(res, 200, 'Profitability analysis retrieved successfully', 
      profitAnalysis[0] || {
        totalRevenue: 0,
        totalCost: 0,
        totalDiscount: 0,
        grossProfit: 0,
        profitMargin: 0
      }
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};
