import type { Request, Response } from 'express';
import { asyncHandler } from '../../common/asyncHandler';
import * as usersService from './users.service';

export const listUsersHandler = asyncHandler(async (_req: Request, res: Response) => {
  const users = await usersService.listUsers();
  res.status(200).json(users);
});
