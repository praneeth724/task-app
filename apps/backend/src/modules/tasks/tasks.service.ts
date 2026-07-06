import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../common/AppError';
import { toPaginatedResult } from '../../common/pagination';
import { emitTaskEvent } from '../../config/socket';
import type { JwtPayload } from '../../common/types';
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from './tasks.dto';

function assertCanAccess(requester: JwtPayload, ownerId: string) {
  if (requester.role !== 'ADMIN' && requester.sub !== ownerId) {
    throw AppError.forbidden('You do not have access to this task');
  }
}

export async function listTasks(requester: JwtPayload, query: ListTasksQuery) {
  const { page, limit, status, owner } = query;

  const where: Prisma.TaskWhereInput = {};
  if (status) where.status = status;

  if (requester.role === 'ADMIN') {
    if (owner) where.ownerId = owner;
  } else {
    where.ownerId = requester.sub;
  }

  const [data, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.task.count({ where }),
  ]);

  return toPaginatedResult(data, total, { page, limit });
}

export async function getTaskById(requester: JwtPayload, id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    throw AppError.notFound('Task not found');
  }
  assertCanAccess(requester, task.ownerId);
  return task;
}

export async function createTask(requester: JwtPayload, input: CreateTaskInput) {
  const ownerId = requester.role === 'ADMIN' && input.ownerId ? input.ownerId : requester.sub;

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      status: input.status,
      dueDate: input.dueDate,
      ownerId,
    },
  });

  emitTaskEvent('task:created', task.ownerId, task);
  return task;
}

export async function updateTask(requester: JwtPayload, id: string, input: UpdateTaskInput) {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Task not found');
  }
  assertCanAccess(requester, existing.ownerId);

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
    },
  });

  emitTaskEvent('task:updated', task.ownerId, task);
  return task;
}

export async function deleteTask(requester: JwtPayload, id: string) {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    throw AppError.notFound('Task not found');
  }
  assertCanAccess(requester, existing.ownerId);

  await prisma.task.delete({ where: { id } });
  emitTaskEvent('task:deleted', existing.ownerId, { id });
}
