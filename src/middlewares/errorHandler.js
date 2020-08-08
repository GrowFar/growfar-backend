const { NODE_ENV } = require('../config');

const notFound = (req, res, next) => {
  const error = new Error('not found - ' + req.originalUrl);
  error.statusCode = 404;
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    stack: NODE_ENV === 'development' ? error.stack : {},
  });
};

module.exports = { notFound, errorHandler };
