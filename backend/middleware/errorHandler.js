/**
 * Express Global Error Handling Middleware
 * Catch-all route error handler to prevent crashing the server and structure responses.
 */
const errorHandler = (err, req, res, next) => {
  // Log the detailed error stack trace for debugging in terminal
  console.error('[Error Handler] Caught exception:', err.message);
  if (err.stack) {
    console.error(err.stack);
  }

  // Determine response status code.
  // Use custom error status if provided (e.g. from validation error), default to 500 (Internal Server Error)
  const statusCode = err.status || 500;

  // Format error payload
  const responsePayload = {
    error: err.message || 'An unexpected server error occurred.',
  };

  // Provide additional debug details in development environment
  if (process.env.NODE_ENV === 'development') {
    responsePayload.stack = err.stack;
  }

  // Send the error JSON response
  res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;
