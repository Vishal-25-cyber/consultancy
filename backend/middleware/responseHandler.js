// Error response handler
export const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    status: 'error',
    message
  });
};

// Success response handler
export const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    status: 'success',
    message
  };
  
  if (data) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};
