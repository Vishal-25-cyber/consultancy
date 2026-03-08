import User from '../models/User.js';
import { successResponse, errorResponse } from '../middleware/responseHandler.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    return successResponse(res, 200, 'Users retrieved successfully', {
      count: users.length,
      users
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    
    return successResponse(res, 200, 'User retrieved successfully', user);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    return successResponse(res, 200, 'User updated successfully', updatedUser);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    return successResponse(res, 200, 'User deleted successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 500, error.message);
  }
};
