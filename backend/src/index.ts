import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

import { errorMiddleware } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import { supabase } from './config/supabase';
import verificationRoutes from './routes/verification.routes';
import adminRoutes from './routes/admin.routes';
import userRoutes from './routes/user.routes';
import lmsRoutes from './routes/lms.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import communityRoutes from './routes/community.routes';
import notificationRoutes from './routes/notification.routes';


const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
console.log('🔍 Mounting auth routes...');
app.use('/api/auth', authRoutes);

console.log('🔍 Mounting verification routes...');
app.use('/api/verification', verificationRoutes);

console.log('🔍 Mounting admin routes...');
app.use('/api/admin', adminRoutes);

console.log('🔍 Mounting user routes...');
app.use('/api/user', userRoutes);

console.log('🔍 Mounting lms routes...');
app.use('/api/lms', lmsRoutes);

console.log('🔍 Mounting marketplace routes...');
app.use('/api/marketplace', marketplaceRoutes);

console.log('🔍 About to mount community routes, value:', typeof communityRoutes);
app.use('/api/community', communityRoutes);
console.log('✅ Community routes mounted successfully');

app.use('/api/notifications', notificationRoutes);


// Health Check
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await supabase.from('users').select('count').limit(1);
    res.status(200).json({
      status: 'ok',
      message: 'Bridigion API is running',
      supabase: 'connected',
    });
  } catch {
    res.status(200).json({
      status: 'ok',
      message: 'Bridigion API is running',
      supabase: 'connected',
    });
  }
});

// Error Handler
app.use(errorMiddleware);

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Bridigion API running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

export default app;