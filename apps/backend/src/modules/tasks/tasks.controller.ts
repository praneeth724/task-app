import type { Request, Response } from 'express';
import { asyncHandler } from '../../common/asyncHandler';
import * as tasksService from './tasks.service';
import type { ListTasksQuery } from './tasks.dto';

export const listTasksHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await tasksService.listTasks(req.user!, req.query as unknown as ListTasksQuery);
  res.status(200).json(result);
});

export const getTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  const task = await tasksService.getTaskById(req.user!, req.params.id);
  res.status(200).json(task);
});

export const createTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  const task = await tasksService.createTask(req.user!, req.body);
  res.status(201).json(task);
});

export const updateTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  const task = await tasksService.updateTask(req.user!, req.params.id, req.body);
  res.status(200).json(task);
});

export const deleteTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  await tasksService.deleteTask(req.user!, req.params.id);
  res.status(204).send();
});
