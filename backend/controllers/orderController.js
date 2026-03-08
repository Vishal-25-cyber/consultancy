import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import { successResponse, errorResponse } from '../middleware/responseHandler.js';

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const { 
      orderStatus, 
      paymentStatus, 
      customer, 
      startDate, 
      endDate,
      page = 1,
      limit = 20
    } = req.query;
    
    const query = {};
    
    if (orderStatus) {
      query.orderStatus = orderStatus;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    if (customer) {
      query.customer = customer;
    }
    
    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) query.orderDate.$lte = new Date(endDate);
    }
    
    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .populate('customer', 'name email phone customerType')
      .populate('items.product', 'name sku')
      .populate('createdBy', 'name')
      .sort({ orderDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Order.countDocuments(query);
    
    return successResponse(res, 200, 'Orders retrieved successfully', {
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address customerType')
      .populate('items.product', 'name sku unit')
      .populate('createdBy', 'name email');
    
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    
    return successResponse(res, 200, 'Order retrieved successfully', order);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { customer, items, discount, tax, paymentMethod, notes } = req.body;
    
    if (!items || items.length === 0) {
      return errorResponse(res, 400, 'Order must have at least one item');
    }
    
    // Calculate order totals and prepare items
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return errorResponse(res, 404, `Product ${item.product} not found`);
      }
      
      if (product.currentStock < item.quantity) {
        return errorResponse(res, 400, `Insufficient stock for ${product.name}`);
      }
      
      const itemTotal = (product.sellingPrice * item.quantity) - (item.discount || 0);
      subtotal += itemTotal;
      
      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        costPrice: product.costPrice,
        discount: item.discount || 0,
        total: itemTotal
      });
    }
    
    const totalAmount = subtotal - (discount || 0) + (tax || 0);
    
    // Create order
    const order = await Order.create({
      customer,
      items: orderItems,
      subtotal,
      discount: discount || 0,
      tax: tax || 0,
      totalAmount,
      paymentMethod,
      notes,
      createdBy: req.user._id
    });
    
    // Update product stock and create inventory transactions
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      const stockBefore = product.currentStock;
      const stockAfter = stockBefore - item.quantity;
      
      // Create inventory transaction
      await Inventory.create({
        product: item.product,
        transactionType: 'stock-out',
        quantity: item.quantity,
        stockBefore,
        stockAfter,
        reason: 'Sale',
        referenceType: 'sale',
        referenceId: order._id,
        performedBy: req.user._id
      });
      
      // Update product stock
      product.currentStock = stockAfter;
      await product.save();
    }
    
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name sku');
    
    return successResponse(res, 201, 'Order created successfully', populatedOrder);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customer', 'name email phone');
    
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    
    return successResponse(res, 200, 'Order updated successfully', order);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Staff
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    
    order.orderStatus = orderStatus;
    
    if (orderStatus === 'completed') {
      order.deliveryDate = new Date();
    }
    
    await order.save();
    
    return successResponse(res, 200, 'Order status updated successfully', order);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin/Staff
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paidAmount } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    
    order.paymentStatus = paymentStatus;
    
    if (paidAmount !== undefined) {
      order.paidAmount = paidAmount;
    }
    
    await order.save();
    
    return successResponse(res, 200, 'Payment status updated successfully', order);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    
    return successResponse(res, 200, 'Order deleted successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats/overview
// @access  Private
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'completed' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });
    
    const revenueStats = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' }
        }
      }
    ]);
    
    return successResponse(res, 200, 'Order statistics retrieved successfully', {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
      totalPaid: revenueStats[0]?.totalPaid || 0,
      pendingPayments: (revenueStats[0]?.totalRevenue || 0) - (revenueStats[0]?.totalPaid || 0)
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
