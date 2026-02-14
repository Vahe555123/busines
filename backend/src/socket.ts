import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { verifyToken } from './utils/jwt.js';

let io: Server | null = null;

export function createSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    try {
      const payload = verifyToken(token as string);
      (socket as unknown as { data: { userId?: string } }).data = { userId: payload.userId };
      next();
    } catch {
      next();
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as unknown as { data: { userId?: string } }).data?.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  return io;
}

export function getIO(): Server | null {
  return io;
}

export function emitPaymentSucceeded(userId: string, data: { paymentId: string; purchaseId: string }) {
  const s = getIO();
  if (s) s.to(`user:${userId}`).emit('payment_succeeded', data);
}
