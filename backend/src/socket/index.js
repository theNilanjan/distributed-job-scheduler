import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { verifyAccessToken } from '../utils/jwt.js';

let io;

export function configureSocket(server) {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Socket authentication required'));
    try {
      socket.user = verifyAccessToken(token);
      return next();
    } catch {
      return next(new Error('Invalid socket token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected', { socketId: socket.id, userId: socket.user.sub });
    socket.join(`user:${socket.user.sub}`);
    socket.on('subscribe:project', (projectId) => socket.join(`project:${projectId}`));
    socket.on('disconnect', () => logger.info('Socket disconnected', { socketId: socket.id }));
  });

  return io;
}

export function getIo() {
  return io;
}

export function emitSystemEvent(event, payload) {
  if (io) io.emit(event, payload);
}
