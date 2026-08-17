export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;
  public readonly errors?: Array<{ field?: string; message: string }>;

  constructor(
    message: string,
    statusCode = 500,
    errorCode?: string,
    errors?: Array<{ field?: string; message: string }>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errorCode = errorCode;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}
