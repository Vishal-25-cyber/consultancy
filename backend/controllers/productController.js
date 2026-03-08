import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../middleware/responseHandler.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Private
export const getProducts = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await Product.countDocuments(query);
    
    return successResponse(res, 200, 'Products retrieved successfully', {
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('supplier', 'name email phone');
    
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }
    
    return successResponse(res, 200, 'Product retrieved successfully', product);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin/Staff
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    
    return successResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin/Staff
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }
    
    return successResponse(res, 200, 'Product updated successfully', product);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return errorResponse(res, 404, 'Product not found');
    }
    
    return successResponse(res, 200, 'Product deleted successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get low stock products
// @route   GET /api/products/alerts/low-stock
// @access  Private/Admin/Staff
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$currentStock', '$reorderLevel'] },
      status: 'active'
    })
      .populate('category', 'name')
      .sort({ currentStock: 1 });
    
    return successResponse(res, 200, 'Low stock products retrieved successfully', {
      count: products.length,
      products
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};
