import morgan from 'morgan';
import { env } from '../config/env';

export const requestLogger = morgan(
  env.isProduction
    ? 'combined'
    : '[:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms',
);
