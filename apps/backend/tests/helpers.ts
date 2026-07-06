import bcrypt from 'bcryptjs';
import type { Express } from 'express';
import request from 'supertest';
import { prisma } from '../src/config/prisma';

export async function createUser(
  app: Express,
  overrides: { name?: string; email?: string; password?: string; role?: 'USER' | 'ADMIN' } = {},
) {
  const email = overrides.email ?? `user-${Date.now()}-${Math.random()}@example.com`;
  const password = overrides.password ?? 'Password123!';
  const name = overrides.name ?? 'Test User';

  if (overrides.role === 'ADMIN') {
    const passwordHash = await bcrypt.hash(password, 4);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'ADMIN' },
    });
    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    return { user, token: loginRes.body.token as string };
  }

  const res = await request(app).post('/api/auth/register').send({ name, email, password });
  return { user: res.body.user, token: res.body.token as string };
}
