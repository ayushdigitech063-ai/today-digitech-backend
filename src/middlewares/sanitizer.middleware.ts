import { Request, Response, NextFunction } from 'express';

/**
 * Strips MongoDB operator keys starting with $ or containing . from objects recursively
 */
const sanitizeObject = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      // Basic XSS tag stripping for raw string inputs
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    // Strip Mongo operators
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    sanitized[key] = sanitizeObject(obj[key]);
  }
  return sanitized;
};

export const sanitizerMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};
