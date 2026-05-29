import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get('/hello', (_req, res) => {
  res.json({ message: 'Hello from the CoreMotion Express backend 👋' });
});
