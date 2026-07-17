import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './lib/constants';
import { getAllowedOrigins } from './lib/origins';

// Reject client-emitted location updates older than this many ms. Mobile clients
// emit every 10s; anything older is a stale buffer or a spoof attempt.
const STALE_LOCATION_MS = 30 * 1000;

export function setupSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: getAllowedOrigins(),
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

    socket.on('update_booking_location', async ({ bookingId, location, ts }, ack?: (resp: unknown) => void) => {
      // Reject obviously stale or future-dated updates.
      if (typeof ts === 'number') {
        const age = Date.now() - ts;
        if (age > STALE_LOCATION_MS || age < -STALE_LOCATION_MS) {
          if (typeof ack === 'function') ack({ ok: false, error: 'stale_timestamp' });
          return;
        }
      }

      // Make sure the user is actually assigned to this booking before we
      // broadcast their location to anyone else subscribed.
      try {
        const booking = await (await import('./lib/prisma')).prisma.booking.findUnique({
          where: { id: bookingId },
          select: { worker: { select: { userId: true } } },
        });
        if (!booking || booking.worker?.userId !== userId) {
          if (typeof ack === 'function') ack({ ok: false, error: 'not_assigned' });
          return;
        }
        io.to(`booking:${bookingId}`).emit('worker_location', { location, ts: Date.now() });
        if (typeof ack === 'function') ack({ ok: true });
      } catch (err) {
        console.error('[socket] update_booking_location error:', err);
        if (typeof ack === 'function') ack({ ok: false, error: 'internal' });
      }
    });

    socket.on('disconnect', () => {
      if (userSockets.get(userId) === socket.id) {
        userSockets.delete(userId);
      }
    });
  });

  return io;
}
