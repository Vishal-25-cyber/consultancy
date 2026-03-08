import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../middleware/responseHandler.js';

// @desc    Get inventory transactions
// @route   GET /api/inventory
// @access  Private
export const getInventoryTransactions = async (req, res) => {
  try {
    const { product, transactionType, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = {};
    
    if (product) {
      query.product = product;
    }
    
    if (transactionType) {
      query.transactionType = transactionType;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const skip = (page - 1) * limit;
    
    const transactions = await Inventory.find(query)
      .populate('product', 'name sku')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Inventory.countDocuments(query);
    
    return successResponse(res, 200, 'Inventory transactions retrieved successfully', {
      transactions,
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

// @desc    Add stock (Stock In)
// @route   POST /api/inventory/stock-in
// @access  Private/Admin/Staff
export const addStock = async (req, res) => {
  try {
    const { productId, quantity, reason, notes } = req.body;
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }
    
    const stockBefore = product.currentStock;
    const stockAfter = stockBefore + quantity;
    
    // Create inventory transaction
    const transaction = await Inventory.create({
      product: productId,
      transactionType: 'stock-in',
      quantity,
      stockBefore,
      stockAfter,
      reason,
      notes,
      performedBy: req.user._id
    });
    
    // Update product stock
    product.currentStock = stockAfter;
    await product.save();
    
    return successResponse(res, 201, 'Stock added successfully', transaction);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Remove stock (Stock Out)
// @route   POST /api/inventory/stock-out
// @access  Private/Admin/Staff
export const removeStock = async (req, res) => {
  try {
    const { productId, quantity, reason, notes } = req.body;
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }
    
    if (product.currentStock < quantity) {
      return errorResponse(res, 400, 'Insufficient stock');
    }
    
    const stockBefore = product.currentStock;
    const stockAfter = stockBefore - quantity;
    
    // Create inventory transaction
    const transaction = await Inventory.create({
      product: productId,
      transactionType: 'stock-out',
      quantity,
      stockBefore,
      stockAfter,
      reason,
      notes,
      performedBy: req.user._id
    });
    
    // Update product stock
    product.currentStock = stockAfter;
    await product.save();
    
    return successResponse(res, 201, 'Stock removed successfully', transaction);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get stock summary
// @route   GET /api/inventory/summary
// @access  Private
export const getStockSummary = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ status: 'active' });
    
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$currentStock', '$reorderLevel'] },
      status: 'active'
    });
    
    const outOfStockCount = await Product.countDocuments({
      currentStock: 0,
      status: 'active'
    });
    
    const totalStockValue = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } }
        }
      }
    ]);
    
    return successResponse(res, 200, 'Stock summary retrieved successfully', {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalStockValue: totalStockValue[0]?.totalValue || 0
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
