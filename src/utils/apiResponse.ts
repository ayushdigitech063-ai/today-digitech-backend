import { Response } from 'express';
import { ApiResponse, ApiErrorResponse, PaginationMeta } from '@today-digitech/shared';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: PaginationMeta | Record<string, any>,
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message = 'An error occurred',
  statusCode = 500,
  errorCode?: string,
  errors?: Array<{ field?: string; message: string }>,
  stack?: string,
): Response => {
  const response: ApiErrorResponse = {
    success: false,
    message,
    errorCode,
    errors,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && stack ? { stack } : {}),
  };
  return res.status(statusCode).json(response);
};
