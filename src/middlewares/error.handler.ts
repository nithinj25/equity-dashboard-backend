import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle AppError instances
  if (error instanceof AppError) {
    logger.error({
      err: error,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method
    }, 'AppError');

    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
    return;
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    logger.error({ err: error }, 'Validation error');
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.message
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    logger.error({ err: error }, 'Cast error');
    res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
    return;
  }

  // Mongoose duplicate key error
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    logger.error({ err: error }, 'Duplicate key error');
    res.status(409).json({
      success: false,
      message: 'Resource already exists'
    });
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    logger.error({ err: error }, 'JWT error');
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    logger.error({ err: error }, 'JWT expired');
    res.status(401).json({
      success: false,
      message: 'Token has expired'
    });
    return;
  }

  // Default error
  logger.error({
    err: error,
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  }, 'Unhandled error');

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};
