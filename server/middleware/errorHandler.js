// Global error handler middleware
function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

// 404 handler
function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found.` });
}

module.exports = { errorHandler, notFound };
