export class AppError extends Error {
  statusCode: number;
  fieldErrors?: Record<string, string[]>;

  constructor(message: string, statusCode = 400, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}
