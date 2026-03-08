import Customer from '../models/Customer.js';
import { successResponse, errorResponse } from '../middleware/responseHandler.js';

export const getCustomers = async (req, res) => {
  try {
    const { search, customerType, status } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (customerType) {
      query.customerType = customerType;
    }
    
    if (status) {
      query.status = status;
    }
    
    const customers = await Customer.find(query).sort({ name: 1 });
    return successResponse(res, 200, 'Customers retrieved successfully', customers);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return errorResponse(res, 404, 'Customer not found');
    }
    return successResponse(res, 200, 'Customer retrieved successfully', customer);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    return successResponse(res, 201, 'Customer created successfully', customer);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!customer) {
      return errorResponse(res, 404, 'Customer not found');
    }
    return successResponse(res, 200, 'Customer updated successfully', customer);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return errorResponse(res, 404, 'Customer not found');
    }
    return successResponse(res, 200, 'Customer deleted successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
