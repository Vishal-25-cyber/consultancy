import Vehicle from '../models/Vehicle.js';
import { successResponse, errorResponse } from '../middleware/responseHandler.js';

export const getVehicles = async (req, res) => {
  try {
    const { status, vehicleType } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (vehicleType) {
      query.vehicleType = vehicleType;
    }
    
    const vehicles = await Vehicle.find(query).sort({ vehicleNumber: 1 });
    return successResponse(res, 200, 'Vehicles retrieved successfully', vehicles);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return errorResponse(res, 404, 'Vehicle not found');
    }
    return successResponse(res, 200, 'Vehicle retrieved successfully', vehicle);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    return successResponse(res, 201, 'Vehicle created successfully', vehicle);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!vehicle) {
      return errorResponse(res, 404, 'Vehicle not found');
    }
    return successResponse(res, 200, 'Vehicle updated successfully', vehicle);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return errorResponse(res, 404, 'Vehicle not found');
    }
    return successResponse(res, 200, 'Vehicle deleted successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
