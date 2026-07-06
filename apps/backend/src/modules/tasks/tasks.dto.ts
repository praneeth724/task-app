import { z } from 'zod';

export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(5000).optional().default(''),
  status: taskStatusSchema.optional().default('TODO'),
  dueDate: z.coerce.date().optional(),
  // Only honored when the requester is an ADMIN; ignored otherwise (owner = requester).
  ownerId: z.string().uuid().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  status: taskStatusSchema.optional(),
  dueDate: z.coerce.date().nullable().optional(),
});

export const taskIdParamsSchema = z.object({
  id: z.string().uuid('Invalid task id'),
});

export const listTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  status: taskStatusSchema.optional(),
  owner: z.string().uuid().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
