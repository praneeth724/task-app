import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './env';
import type { JwtPayload } from '../common/types';

let io: SocketIOServer | undefined;

export const ADMIN_ROOM = 'admins';
export const userRoom = (userId: string) => `user:${userId}`;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.corsOrigins,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error('Missing auth token'));
      return;
    }
    try {
      const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as JwtPayload;
    socket.join(userRoom(user.sub));
    if (user.role === 'ADMIN') {
      socket.join(ADMIN_ROOM);
    }
  });

  return io;
}

export type TaskEventType = 'task:created' | 'task:updated' | 'task:deleted';

export function emitTaskEvent(event: TaskEventType, ownerId: string, payload: unknown) {
  if (!io) return;
  io.to(userRoom(ownerId)).to(ADMIN_ROOM).emit(event, payload);
}
