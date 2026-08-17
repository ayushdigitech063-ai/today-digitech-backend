import { Request, Response } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { env } from '../config/env';
import { getDatabaseState } from '../config/database';

export const getSystemHealth = (_req: Request, res: Response): void => {
  sendSuccess(
    res,
    {
      status: 'UP',
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: 'v1.0.0',
    },
    'Today Digitech Backend API Services Operational',
  );
};

export const getDatabaseHealth = (_req: Request, res: Response): void => {
  const dbState = getDatabaseState();
  const isHealthy = dbState.readyState === 1;

  sendSuccess(
    res,
    {
      status: isHealthy ? 'UP' : 'DOWN',
      database: dbState,
      timestamp: new Date().toISOString(),
    },
    isHealthy ? 'Database connection healthy' : 'Database connection unavailable',
    isHealthy ? 200 : 503,
  );
};
