import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeSocket } from './sockets/socketManager';
import authRoutes from './routes/auth';
import reportRoutes from './routes/reports';
import incidentRoutes from './routes/incidents';
import resourceRoutes from './routes/resources';
import alertRoutes from './routes/alerts';
import assignmentRoutes from './routes/assignments';
import dashboardRoutes from './routes/dashboard';
import aiRoutes from './routes/ai';
import notificationRoutes from './routes/notifications';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Initialize Socket.IO
initializeSocket(httpServer);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`\n🚀 RescueGrid AI Backend running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'development'}\n`);
});

export { httpServer };
