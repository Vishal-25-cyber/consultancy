import Category from '../models/Category.js';
import { successResponse, errorResponse } from '../middleware/responseHandler.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return successResponse(res, 200, 'Categories retrieved successfully', categories);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return errorResponse(res, 404, 'Category not found');
    }
    return successResponse(res, 200, 'Category retrieved successfully', category);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    return successResponse(res, 201, 'Category created successfully', category);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!category) {
      return errorResponse(res, 404, 'Category not found');
    }
    return successResponse(res, 200, 'Category updated successfully', category);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return errorResponse(res, 404, 'Category not found');
    }
    return successResponse(res, 200, 'Category deleted successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
