import Delivery from '../models/Delivery.js';
import Order from '../models/Order.js';
import { successResponse, errorResponse } from '../middleware/responseHandler.js';

// @desc    Get all deliveries
// @route   GET /api/deliveries
// @access  Private
export const getDeliveries = async (req, res) => {
  try {
    const { deliveryStatus, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (deliveryStatus) {
      query.deliveryStatus = deliveryStatus;
    }
    
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }
    
    const skip = (page - 1) * limit;
    
    const deliveries = await Delivery.find(query)
      .populate('order', 'orderNumber totalAmount')
      .populate('vehicle', 'vehicleNumber vehicleType')
      .populate('assignedBy', 'name')
      .sort({ scheduledDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Delivery.countDocuments(query);
    
    return successResponse(res, 200, 'Deliveries retrieved successfully', {
      deliveries,
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

// @desc    Get delivery by ID
// @route   GET /api/deliveries/:id
// @access  Private
export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate({
        path: 'order',
        populate: {
          path: 'customer',
          select: 'name email phone address'
        }
      })
      .populate('vehicle', 'vehicleNumber vehicleType model capacity')
      .populate('assignedBy', 'name email');
    
    if (!delivery) {
      return errorResponse(res, 404, 'Delivery not found');
    }
    
    return successResponse(res, 200, 'Delivery retrieved successfully', delivery);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Create delivery
// @route   POST /api/deliveries
// @access  Private/Admin/Staff
export const createDelivery = async (req, res) => {
  try {
    const { order, vehicle, driver, deliveryAddress, scheduledDate, priority, notes } = req.body;
    
    // Check if order exists
    const orderExists = await Order.findById(order);
    if (!orderExists) {
      return errorResponse(res, 404, 'Order not found');
    }
    
    // Create delivery
    const delivery = await Delivery.create({
      order,
      vehicle,
      driver,
      deliveryAddress,
      scheduledDate,
      priority,
      notes,
      assignedBy: req.user._id
    });
    
    // Update order status
    orderExists.orderStatus = 'processing';
    await orderExists.save();
    
    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate('order', 'orderNumber totalAmount')
      .populate('vehicle', 'vehicleNumber vehicleType');
    
    return successResponse(res, 201, 'Delivery created successfully', populatedDelivery);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Update delivery
// @route   PUT /api/deliveries/:id
// @access  Private/Admin/Staff
export const updateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('order', 'orderNumber totalAmount')
      .populate('vehicle', 'vehicleNumber vehicleType');
    
    if (!delivery) {
      return errorResponse(res, 404, 'Delivery not found');
    }
    
    return successResponse(res, 200, 'Delivery updated successfully', delivery);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Update delivery status
// @route   PUT /api/deliveries/:id/status
// @access  Private/Admin/Staff
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryStatus, failureReason, deliveryProof } = req.body;
    
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return errorResponse(res, 404, 'Delivery not found');
    }
    
    delivery.deliveryStatus = deliveryStatus;
    
    if (deliveryStatus === 'delivered') {
      delivery.actualDeliveryDate = new Date();
      delivery.deliveryProof = deliveryProof;
      
      // Update order status
      const order = await Order.findById(delivery.order);
      if (order) {
        order.orderStatus = 'completed';
        order.deliveryDate = new Date();
        await order.save();
      }
    }
    
    if (deliveryStatus === 'failed') {
      delivery.failureReason = failureReason;
    }
    
    await delivery.save();
    
    return successResponse(res, 200, 'Delivery status updated successfully', delivery);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Delete delivery
// @route   DELETE /api/deliveries/:id
// @access  Private/Admin
export const deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id);
    
    if (!delivery) {
      return errorResponse(res, 404, 'Delivery not found');
    }
    
    return successResponse(res, 200, 'Delivery deleted successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get delivery statistics
// @route   GET /api/deliveries/stats/overview
// @access  Private
export const getDeliveryStats = async (req, res) => {
  try {
    const totalDeliveries = await Delivery.countDocuments();
    const pendingDeliveries = await Delivery.countDocuments({ deliveryStatus: 'pending' });
    const inTransitDeliveries = await Delivery.countDocuments({ deliveryStatus: 'in-transit' });
    const deliveredDeliveries = await Delivery.countDocuments({ deliveryStatus: 'delivered' });
    const failedDeliveries = await Delivery.countDocuments({ deliveryStatus: 'failed' });
    
    const successRate = totalDeliveries > 0 
      ? ((deliveredDeliveries / totalDeliveries) * 100).toFixed(2) 
      : 0;
    
    return successResponse(res, 200, 'Delivery statistics retrieved successfully', {
      totalDeliveries,
      pendingDeliveries,
      inTransitDeliveries,
      deliveredDeliveries,
      failedDeliveries,
      successRate: parseFloat(successRate)
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
