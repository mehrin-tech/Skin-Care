export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message || 'Validation failed', 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message) {
    super(message || 'Authentication required', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message) {
    super(message || 'Not authorized to access this resource', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message) {
    super(message || 'Resource not found', 404);
  }
}

export class ServerError extends AppError {
  constructor(message) {
    super(message || 'Internal Server Error', 500);
  }
}
