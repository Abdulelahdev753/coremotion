import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { healthRouter } from './routes/health';

export function createApp(): Application {
  const app = express();

  // Security & core middleware
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' }));
  app.use(express.json());
  app.use(morgan('dev'));

  // API routes
  app.use('/api', healthRouter);

  // Root
  app.get('/', (_req, res) => {
    res.json({ name: 'CoreMotion API', status: 'ok' });
  });

  return app;
}
