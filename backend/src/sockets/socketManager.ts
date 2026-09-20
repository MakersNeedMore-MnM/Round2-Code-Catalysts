import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketServer;

export function initializeSocket(httpServer: HttpServer) {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`📡 Client connected: ${socket.id}`);

    socket.on('join:command-center', () => {
      socket.join('command-center');
      socket.emit('connected', { message: 'Connected to RescueGrid Command Center' });
    });

    socket.on('disconnect', () => {
      console.log(`📡 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export function emitIncidentNew(incident: any) {
  if (io) io.to('command-center').emit('incident:new', incident);
}

export function emitIncidentUpdated(incident: any) {
  if (io) io.to('command-center').emit('incident:updated', incident);
}

export function emitResourceUpdated(resource: any) {
  if (io) io.to('command-center').emit('resource:updated', resource);
}

export function emitAlertNew(alert: any) {
  if (io) io.to('command-center').emit('alert:new', alert);
}
