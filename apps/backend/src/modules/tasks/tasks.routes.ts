import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskIdParamsSchema,
  updateTaskSchema,
} from './tasks.dto';
import {
  createTaskHandler,
  deleteTaskHandler,
  getTaskHandler,
  listTasksHandler,
  updateTaskHandler,
} from './tasks.controller';

export const tasksRouter = Router();

tasksRouter.use(authenticate);

tasksRouter.get('/', validate({ query: listTasksQuerySchema }), listTasksHandler);
tasksRouter.post('/', validate({ body: createTaskSchema }), createTaskHandler);
tasksRouter.get('/:id', validate({ params: taskIdParamsSchema }), getTaskHandler);
tasksRouter.patch(
  '/:id',
  validate({ params: taskIdParamsSchema, body: updateTaskSchema }),
  updateTaskHandler,
);
tasksRouter.delete('/:id', validate({ params: taskIdParamsSchema }), deleteTaskHandler);
