import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const requiredString = (name: string) =>
  z.string().trim().min(1, `${name} is required`);

const urlString = (name: string) =>
  requiredString(name).refine(
    (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    `${name} must be a valid URL`,
  );

const mongoConnectionString = requiredString('MONGODB_URI').refine(
  (value) => /^mongodb(?:\+srv)?:\/\//i.test(value),
  'MONGODB_URI must use the mongodb:// or mongodb+srv:// protocol',
);

const positiveInteger = (name: string) =>
  z.coerce.number().int().positive(`${name} must be a positive integer`);

const tokenDuration = (name: string) =>
  requiredString(name).regex(
    /^\d+(?:ms|s|m|h|d|w|y)$/,
    `${name} must be a JWT duration such as 15m or 7d`,
  );

const optionalString = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().min(1).optional(),
);

const optionalPositiveInteger = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.coerce.number().int().positive().optional(),
);

const optionalBoolean = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
);

const requiredBoolean = z.enum(['true', 'false']).transform((value) => value === 'true');

const withDevFallback = <T extends z.ZodTypeAny>(schema: T, fallback: unknown) =>
  z.preprocess((value) => (value === undefined || value === '' ? fallback : value), schema);

const envSchema = z.object({
  PORT: withDevFallback(positiveInteger('PORT'), '5000'),
  NODE_ENV: withDevFallback(z.enum(['development', 'production', 'test']), 'development'),
  MONGODB_URI: withDevFallback(mongoConnectionString, 'mongodb://localhost:27017/today-digitech'),
  CLIENT_URL: withDevFallback(urlString('CLIENT_URL'), 'http://localhost:3000'),
  FRONTEND_URL: withDevFallback(urlString('FRONTEND_URL'), 'http://localhost:3000'),
  ADMIN_URL: withDevFallback(urlString('ADMIN_URL'), 'http://localhost:3001'),
  JWT_SECRET: withDevFallback(
    requiredString('JWT_SECRET').min(32, 'JWT_SECRET must be at least 32 characters'),
    'dev_jwt_secret_key_min_32_characters_long_string_for_local_testing',
  ),
  JWT_REFRESH_SECRET: withDevFallback(
    requiredString('JWT_REFRESH_SECRET').min(
      32,
      'JWT_REFRESH_SECRET must be at least 32 characters',
    ),
    'dev_jwt_refresh_secret_key_min_32_characters_long_string',
  ),
  JWT_EXPIRES_IN: withDevFallback(tokenDuration('JWT_EXPIRES_IN'), '15m'),
  JWT_REFRESH_EXPIRES_IN: withDevFallback(tokenDuration('JWT_REFRESH_EXPIRES_IN'), '7d'),
  RATE_LIMIT_WINDOW_MS: withDevFallback(positiveInteger('RATE_LIMIT_WINDOW_MS'), '900000'),
  RATE_LIMIT_MAX: withDevFallback(positiveInteger('RATE_LIMIT_MAX'), '100'),
  CLOUDINARY_CLOUD_NAME: withDevFallback(requiredString('CLOUDINARY_CLOUD_NAME'), 'dev_cloud'),
  CLOUDINARY_API_KEY: withDevFallback(
    requiredString('CLOUDINARY_API_KEY').regex(
      /^\d+$/,
      'CLOUDINARY_API_KEY must contain only digits',
    ),
    '123456789012345',
  ),
  CLOUDINARY_API_SECRET: withDevFallback(
    requiredString('CLOUDINARY_API_SECRET').min(
      20,
      'CLOUDINARY_API_SECRET must be at least 20 characters',
    ),
    'dev_cloudinary_api_secret_key_min_20_chars',
  ),
  TURNSTILE_SITE_KEY: withDevFallback(
    requiredString('TURNSTILE_SITE_KEY'),
    '1x00000000000000000000AA',
  ),
  TURNSTILE_SECRET_KEY: withDevFallback(
    requiredString('TURNSTILE_SECRET_KEY'),
    '1x0000000000000000000000000000000AA',
  ),
  EMAIL_ENABLED: withDevFallback(requiredBoolean, 'false'),
  SMTP_HOST: optionalString,
  SMTP_PORT: optionalPositiveInteger,
  SMTP_USER: optionalString,
  SMTP_PASSWORD: optionalString,
  SMTP_SECURE: optionalBoolean,
  SMTP_FROM: optionalString,
  SMTP_REPLY_TO: optionalString,
  ADMIN_NOTIFICATION_EMAILS: optionalString,
  SMTP_TIMEOUT_MS: optionalPositiveInteger,
  EMAIL_RETRY_MAX: optionalPositiveInteger,
  EMAIL_RETRY_BASE_DELAY_MS: optionalPositiveInteger,
  EMAIL_BRAND_NAME: optionalString,
  EMAIL_CONTACT_EMAIL: optionalString,
}).superRefine((value, context) => {
  if (!value.EMAIL_ENABLED) return;

  const requiredEmailFields: Array<keyof typeof value> = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'SMTP_SECURE',
    'SMTP_FROM',
    'SMTP_REPLY_TO',
    'ADMIN_NOTIFICATION_EMAILS',
    'SMTP_TIMEOUT_MS',
    'EMAIL_RETRY_MAX',
    'EMAIL_RETRY_BASE_DELAY_MS',
    'EMAIL_BRAND_NAME',
    'EMAIL_CONTACT_EMAIL',
  ];

  requiredEmailFields.forEach((field) => {
    if (value[field] === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field],
        message: `${field} is required when EMAIL_ENABLED is true`,
      });
    }
  });

  const emailFields: Array<keyof typeof value> = [
    'SMTP_REPLY_TO',
    'EMAIL_CONTACT_EMAIL',
  ];
  emailFields.forEach((field) => {
    const email = value[field];
    if (typeof email === 'string' && !z.string().email().safeParse(email).success) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field],
        message: `${field} must be a valid email address`,
      });
    }
  });

  const recipients = value.ADMIN_NOTIFICATION_EMAILS
    ?.split(',')
    .map((email) => email.trim())
    .filter(Boolean) ?? [];

  if (recipients.length === 0 || recipients.some((email) => !z.string().email().safeParse(email).success)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['ADMIN_NOTIFICATION_EMAILS'],
      message: 'ADMIN_NOTIFICATION_EMAILS must be a comma-separated list of valid email addresses',
    });
  }
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment configuration:', parsedEnv.error.flatten().fieldErrors);
  throw new Error('Backend startup aborted because required environment variables are missing or invalid');
}

export const env = {
  ...parsedEnv.data,
  ADMIN_NOTIFICATION_EMAILS: parsedEnv.data.ADMIN_NOTIFICATION_EMAILS
    ?.split(',')
    .map((email) => email.trim())
    .filter(Boolean) ?? [],
  isProduction: parsedEnv.data.NODE_ENV === 'production',
};
