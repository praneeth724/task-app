import type { Request, Response } from 'express';
import { asyncHandler } from '../../common/asyncHandler';
import * as authService from './auth.service';

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.status(200).json(result);
});
