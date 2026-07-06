import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { listUsersHandler } from './users.controller';

export const usersRouter = Router();

usersRouter.use(authenticate, authorize('ADMIN'));
usersRouter.get('/', listUsersHandler);
