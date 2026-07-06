import request from 'supertest';
import { createApp } from '../src/app';
import { createUser } from './helpers';

const app = createApp();

describe('Tasks API', () => {
  describe('POST /api/tasks', () => {
    it('creates a task owned by the requester', async () => {
      const { token } = await createUser(app);

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Write tests', description: 'Cover the tasks API' });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ title: 'Write tests', status: 'TODO' });
    });

    it('rejects requests without a token', async () => {
      const res = await request(app).post('/api/tasks').send({ title: 'Write tests' });
      expect(res.status).toBe(401);
    });

    it('rejects an empty title', async () => {
      const { token } = await createUser(app);
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/tasks', () => {
    it('paginates and only returns the requester own tasks for USER role', async () => {
      const { token: tokenA } = await createUser(app, { email: 'a@example.com' });
      const { token: tokenB } = await createUser(app, { email: 'b@example.com' });

      for (let i = 0; i < 3; i += 1) {
        await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${tokenA}`)
          .send({ title: `A task ${i}` });
      }
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'B task' });

      const res = await request(app)
        .get('/api/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
      expect(res.body.data.every((t: { title: string }) => t.title.startsWith('A task'))).toBe(
        true,
      );
    });

    it('filters by status', async () => {
      const { token } = await createUser(app);
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Todo task', status: 'TODO' });
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Done task', status: 'DONE' });

      const res = await request(app)
        .get('/api/tasks?status=DONE')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Done task');
    });

    it('allows ADMIN to view all tasks and filter by owner', async () => {
      const { user: userA, token: tokenA } = await createUser(app, { email: 'a2@example.com' });
      const { token: adminToken } = await createUser(app, {
        email: 'admin2@example.com',
        role: 'ADMIN',
      });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Owned by A' });

      const all = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(all.body.data.length).toBeGreaterThanOrEqual(1);

      const filtered = await request(app)
        .get(`/api/tasks?owner=${userA.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(filtered.body.data).toHaveLength(1);
      expect(filtered.body.data[0].ownerId).toBe(userA.id);
    });
  });

  describe('ownership enforcement (RBAC)', () => {
    it('returns 403 when a USER tries to read another user task', async () => {
      const { token: tokenA } = await createUser(app, { email: 'owner@example.com' });
      const { token: tokenB } = await createUser(app, { email: 'intruder@example.com' });

      const created = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Private task' });

      const res = await request(app)
        .get(`/api/tasks/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(403);
    });

    it('returns 403 when a USER tries to update another user task', async () => {
      const { token: tokenA } = await createUser(app, { email: 'owner2@example.com' });
      const { token: tokenB } = await createUser(app, { email: 'intruder2@example.com' });

      const created = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Private task' });

      const res = await request(app)
        .patch(`/api/tasks/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'Hijacked' });

      expect(res.status).toBe(403);
    });

    it('returns 403 when a USER tries to delete another user task', async () => {
      const { token: tokenA } = await createUser(app, { email: 'owner3@example.com' });
      const { token: tokenB } = await createUser(app, { email: 'intruder3@example.com' });

      const created = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Private task' });

      const res = await request(app)
        .delete(`/api/tasks/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(403);
    });

    it('allows ADMIN to update and delete any task', async () => {
      const { token: userToken } = await createUser(app, { email: 'owner4@example.com' });
      const { token: adminToken } = await createUser(app, {
        email: 'admin4@example.com',
        role: 'ADMIN',
      });

      const created = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Managed task' });

      const updated = await request(app)
        .patch(`/api/tasks/${created.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'DONE' });
      expect(updated.status).toBe(200);
      expect(updated.body.status).toBe('DONE');

      const deleted = await request(app)
        .delete(`/api/tasks/${created.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(deleted.status).toBe(204);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('returns 404 for a non-existent task', async () => {
      const { token } = await createUser(app);
      const res = await request(app)
        .get('/api/tasks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
});
