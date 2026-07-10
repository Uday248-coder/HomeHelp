import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './lib/constants';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://homehelp-admin.vercel.app',
  'https://homehelp-website.vercel.app',
];

export function setupSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ALLOWED_ORIGINS,
      credentials: true,
    },
  });

  const userSockets = new Map<string, string>(); // userId -> socketId

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId?: string };
      if (!payload.userId) return next(new Error('Invalid token'));
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    userSockets.set(userId, socket.id);
    socket.join(`user:${userId}`);

    socket.on('update_location', ({ location }) => {
      io.to(`user:${userId}`).emit('location_updated', { userId, location });
    });

    socket.on('join_booking', (bookingId: string) => {
      socket.join(`booking:${bookingId}`);
    });

    socket.on('update_booking_location', ({ bookingId, location }) => {
      io.to(`booking:${bookingId}`).emit('worker_location', location);
    });

    socket.on('disconnect', () => {
      if (userSockets.get(userId) === socket.id) {
        userSockets.delete(userId);
      }
    });
  });

  return io;
}
