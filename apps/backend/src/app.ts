import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { authRouter } from './modules/auth/auth.routes';
import { tasksRouter } from './modules/tasks/tasks.routes';
import { usersRouter } from './modules/users/users.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  app.use('/api/auth', authRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/users', usersRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
