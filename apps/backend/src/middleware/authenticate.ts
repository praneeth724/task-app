import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../common/AppError';
import type { JwtPayload } from '../common/types';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length);

  try {
    req.user = jwt.verify(token, env.jwtSecret) as JwtPayload;
    next();
  } catch {
    throw AppError.unauthorized('Invalid or expired token');
  }
}
