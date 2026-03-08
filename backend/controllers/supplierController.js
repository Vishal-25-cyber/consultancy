import Supplier from '../models/Supplier.js';
import { successResponse, errorResponse } from '../middleware/responseHandler.js';

export const getSuppliers = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    const suppliers = await Supplier.find(query).sort({ name: 1 });
    return successResponse(res, 200, 'Suppliers retrieved successfully', suppliers);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return errorResponse(res, 404, 'Supplier not found');
    }
    return successResponse(res, 200, 'Supplier retrieved successfully', supplier);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    return successResponse(res, 201, 'Supplier created successfully', supplier);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!supplier) {
      return errorResponse(res, 404, 'Supplier not found');
    }
    return successResponse(res, 200, 'Supplier updated successfully', supplier);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return errorResponse(res, 404, 'Supplier not found');
    }
    return successResponse(res, 200, 'Supplier deleted successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
