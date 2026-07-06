import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../common/AppError';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message, details: err.details });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
}
