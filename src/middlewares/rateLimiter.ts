import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !env.isProduction,
  handler: (_req, _res, next) => {
    next(
      new AppError(
        'Too many requests from this IP. Please try again after 15 minutes.',
        429,
        'TOO_MANY_REQUESTS',
      ),
    );
  },
});
