function notFound(req, res, next) {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.originalUrl}`,
  })
}

function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal server error',
  })
}

module.exports = {
  notFound,
  errorHandler,
}
