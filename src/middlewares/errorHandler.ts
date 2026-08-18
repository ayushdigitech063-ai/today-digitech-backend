import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { sendError } from '../utils/apiResponse';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errorCode, err.errors, err.stack);
    return;
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 'Validation Error', 400, 'VALIDATION_ERROR', formattedErrors, err.stack);
    return;
  }

  if (err.name === 'ValidationError') {
    const mongooseErr = err as any;
    const formattedErrors = Object.keys(mongooseErr.errors || {}).map((key) => ({
      field: key,
      message: mongooseErr.errors[key]?.message || 'Invalid value',
    }));
    sendError(res, err.message || 'Database Validation Error', 400, 'VALIDATION_ERROR', formattedErrors, err.stack);
    return;
  }

  if ((err as any).code === 11000) {
    const keys = Object.keys((err as any).keyValue || {});
    sendError(
      res,
      `A record with this ${keys.join(', ') || 'value'} already exists. Please use a unique title or slug.`,
      400,
      'DUPLICATE_ENTRY',
      undefined,
      err.stack,
    );
    return;
  }

  // Fallback for unhandled errors
  console.error('Unhandled System Error:', err);
  sendError(
    res,
    err.message || 'Internal Server Error',
    500,
    'INTERNAL_SERVER_ERROR',
    undefined,
    err.stack,
  );
};
