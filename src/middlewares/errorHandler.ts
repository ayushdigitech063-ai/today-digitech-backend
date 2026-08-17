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

  // Fallback for unhandled errors
  console.error('Unhandled System Error:', err);
  sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    500,
    'INTERNAL_SERVER_ERROR',
    undefined,
    err.stack,
  );
};
