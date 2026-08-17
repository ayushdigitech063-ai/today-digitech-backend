import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestLogger } from './middlewares/requestLogger';
import { globalRateLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/appError';
import v1Routes from './routes/v1';

const app: Express = express();

// 1. Security Headers, CORS, and Cookie Parsing
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: [env.CLIENT_URL, env.ADMIN_URL],
    credentials: true,
  }),
);

// 2. Request Logging & Global Rate Limiting
app.use(requestLogger);
app.use(globalRateLimiter);

import { sanitizerMiddleware } from './middlewares/sanitizer.middleware';
import { checkMaintenanceMode } from './middlewares/maintenance.middleware';

// 3. Body Parsers & Sanitization
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizerMiddleware);
app.use(checkMaintenanceMode);

// Public Read Caching Middleware
app.use('/api/v1/public', (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200');
  }
  next();
});

import path from 'path';

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// 4. Versioned API Routes (/api/v1)
app.use('/api/v1', v1Routes);

// 5. 404 Route Handler
app.use('*', (_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError('Requested endpoint not found', 404, 'NOT_FOUND'));
});

// 6. Central Error Handling Middleware
app.use(errorHandler);

export default app;
