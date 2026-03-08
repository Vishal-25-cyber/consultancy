import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Delivery from '../models/Delivery.js';
import Customer from '../models/Customer.js';
import { successResponse, errorResponse } from '../middleware/responseHandler.js';

// @desc    Get daily sales report
// @route   GET /api/reports/daily-sales
// @access  Private/Admin
export const getDailySalesReport = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
    
    const orders = await Order.find({
      orderDate: { $gte: startOfDay, $lte: endOfDay },
      orderStatus: { $ne: 'cancelled' }
    })
      .populate('customer', 'name customerType')
      .populate('items.product', 'name sku');
    
    const summary = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startOfDay, $lte: endOfDay },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalDiscount: { $sum: '$discount' }
        }
      }
    ]);
    
    return successResponse(res, 200, 'Daily sales report retrieved successfully', {
      date: targetDate,
      summary: summary[0] || { totalOrders: 0, totalRevenue: 0, totalDiscount: 0 },
      orders
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get monthly sales report
// @route   GET /api/reports/monthly-sales
// @access  Private/Admin
export const getMonthlySalesReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    
    const summary = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lte: endDate },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDiscount: { $sum: '$discount' }
        }
      }
    ]);
    
    // Daily breakdown
    const dailyBreakdown = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lte: endDate },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$orderDate' },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    return successResponse(res, 200, 'Monthly sales report retrieved successfully', {
      year: targetYear,
      month: targetMonth,
      summary: summary[0] || { totalOrders: 0, totalRevenue: 0, totalPaid: 0, totalDiscount: 0 },
      dailyBreakdown
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get inventory report
// @route   GET /api/reports/inventory
// @access  Private/Admin
export const getInventoryReport = async (req, res) => {
  try {
    const { category, status } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort({ currentStock: 1 });
    
    const summary = await Product.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStockValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } },
          lowStock: {
            $sum: {
              $cond: [{ $lte: ['$currentStock', '$reorderLevel'] }, 1, 0]
            }
          },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ['$currentStock', 0] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    return successResponse(res, 200, 'Inventory report retrieved successfully', {
      summary: summary[0] || { totalProducts: 0, totalStockValue: 0, lowStock: 0, outOfStock: 0 },
      products
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get delivery performance report
// @route   GET /api/reports/delivery-performance
// @access  Private/Admin
export const getDeliveryPerformanceReport = async (req, res) => {
  try {
    const { startDate, endDate, vehicle } = req.query;
    
    const query = {};
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }
    if (vehicle) query.vehicle = vehicle;
    
    const deliveries = await Delivery.find(query)
      .populate('order', 'orderNumber totalAmount')
      .populate('vehicle', 'vehicleNumber vehicleType')
      .sort({ scheduledDate: -1 });
    
    const summary = await Delivery.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$deliveryStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    return successResponse(res, 200, 'Delivery performance report retrieved successfully', {
      summary,
      deliveries
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get customer report
// @route   GET /api/reports/customer
// @access  Private/Admin
export const getCustomerReport = async (req, res) => {
  try {
    const { customerType, status } = req.query;
    
    const query = {};
    if (customerType) query.customerType = customerType;
    if (status) query.status = status;
    
    const customers = await Customer.find(query).sort({ name: 1 });
    
    // Get order statistics for each customer
    const customerStats = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$customer',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrderDate: { $max: '$orderDate' }
        }
      }
    ]);
    
    // Merge customer data with stats
    const customerMap = {};
    customerStats.forEach(stat => {
      customerMap[stat._id.toString()] = stat;
    });
    
    const enrichedCustomers = customers.map(customer => ({
      ...customer.toObject(),
      stats: customerMap[customer._id.toString()] || { totalOrders: 0, totalSpent: 0 }
    }));
    
    return successResponse(res, 200, 'Customer report retrieved successfully', enrichedCustomers);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get profit/loss report
// @route   GET /api/reports/profit-loss
// @access  Private/Admin
export const getProfitLossReport = async (req, res) => {
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
    
    const profitLoss = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$items.total' },
          totalCost: { $sum: { $multiply: ['$items.quantity', '$items.costPrice'] } },
          totalDiscount: { $sum: '$items.discount' },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $project: {
          totalRevenue: 1,
          totalCost: 1,
          totalDiscount: 1,
          totalOrders: 1,
          grossProfit: { $subtract: ['$totalRevenue', '$totalCost'] },
          netProfit: { $subtract: [{ $subtract: ['$totalRevenue', '$totalCost'] }, '$totalDiscount'] },
          profitMargin: {
            $multiply: [
              { $divide: [{ $subtract: ['$totalRevenue', '$totalCost'] }, '$totalRevenue'] },
              100
            ]
          }
        }
      }
    ]);
    
    // Product-wise profit
    const productProfit = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalRevenue: { $sum: '$items.total' },
          totalCost: { $sum: { $multiply: ['$items.quantity', '$items.costPrice'] } },
          quantity: { $sum: '$items.quantity' }
        }
      },
      {
        $project: {
          productName: 1,
          totalRevenue: 1,
          totalCost: 1,
          quantity: 1,
          profit: { $subtract: ['$totalRevenue', '$totalCost'] }
        }
      },
      { $sort: { profit: -1 } },
      { $limit: 20 }
    ]);
    
    return successResponse(res, 200, 'Profit/Loss report retrieved successfully', {
      summary: profitLoss[0] || {
        totalRevenue: 0,
        totalCost: 0,
        totalDiscount: 0,
        grossProfit: 0,
        netProfit: 0,
        profitMargin: 0
      },
      productProfit
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
