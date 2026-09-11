// A typed application error carrying an HTTP status code and optional field-level errors.
// Thrown from anywhere in the request lifecycle; the central error handler formats it.
export class ApiError extends Error {
  statusCode: number;
  errors: { field?: string; message: string }[];
  isOperational: boolean;

  constructor(statusCode: number, message: string, errors: { field?: string; message: string }[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors: { field?: string; message: string }[] = []) {
    return new ApiError(400, message, errors);
  }
  static unauthorized(message = "Authentication required") {
    return new ApiError(401, message);
  }
  static forbidden(message = "You do not have permission to perform this action", errors: { field?: string; message: string }[] = []) {
    return new ApiError(403, message, errors);
  }
  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }
  static conflict(message: string) {
    return new ApiError(409, message);
  }
  static internal(message = "Something went wrong. Please try again.") {
    return new ApiError(500, message);
  }
}
