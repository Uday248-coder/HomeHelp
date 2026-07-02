import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

interface UserSocket {
  userId: string;
  role: 'customer' | 'worker';
}

export function setupSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  const userSockets = new Map<string, string>(); // userId -> socketId

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    
    // In a real app, verify JWT here. For now, we trust the token if present.
    // We'll extract userId from token if needed.
    next();
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join', ({ userId, role }) => {
      userSockets.set(userId, socket.id);
      socket.join(`user:${userId}`);
      console.log(`User ${userId} (${role}) joined socket ${socket.id}`);
    });

    socket.on('update_location', ({ userId, location }) => {
      // location: { lat: number, lng: number }
      // Broadcast to all bookings where this worker is assigned and the booking is 'in_progress'
      // For now, just broadcast to a room based on userId
      io.to(`user:${userId}`).emit('location_updated', { userId, location });
      
      // In a full implementation, we'd find the active booking and emit to the customer
      // For MVP, we can use a simpler room strategy: `booking:bookingId`
    });

    socket.on('join_booking', (bookingId: string) => {
      socket.join(`booking:${bookingId}`);
      console.log(`Socket ${socket.id} joined booking room ${bookingId}`);
    });

    socket.on('update_booking_location', ({ bookingId, location }) => {
      io.to(`booking:${bookingId}`).emit('worker_location', location);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Remove from userSockets map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });

  return io;
}
