import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/appError';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = result.error.errors.map((e) => e.message).join(', ');
      return next(new AppError(`Validation error: ${formattedErrors}`, 400, 'VALIDATION_ERROR'));
    }
    req.body = result.data;
    next();
  };
};
