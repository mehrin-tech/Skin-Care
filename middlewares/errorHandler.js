export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    if (req.originalUrl.startsWith('/api') || req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
      return res.status(err.statusCode).json({
        success: false,
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
      });
    }

    return res.status(err.statusCode).render('error', {
      title: 'Error',
      message: err.message,
      error: err // Full error for development
    });

  } else {
    // Production Mode
    let message = 'Oops! Something went wrong.';
    
    if (err.isOperational) {
      message = err.message;
    }

    if (req.originalUrl.startsWith('/api') || req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
      return res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: message,
      });
    }

    return res.status(err.statusCode).render('error', {
      title: 'Oops!',
      message: message,
      error: null
    });
  }
};
