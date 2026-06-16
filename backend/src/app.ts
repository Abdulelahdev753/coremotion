import path from 'path';
import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { healthRouter } from './routes/health';

export function createApp(): Application {
  const app = express();

  // Security & core middleware. CSP is disabled because the statically
  // exported Next.js frontend ships its own inline bootstrap; the default
  // strict policy would block it. Transport security is handled by the host.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' }));
  app.use(express.json());
  app.use(morgan('dev'));

  // API routes
  app.use('/api', healthRouter);

  // Serve the statically-exported Next.js frontend so the whole site runs as a
  // single app on one port. In the monorepo the export lives at frontend/out;
  // the Docker build sets FRONTEND_DIR to its absolute runtime location.
  const frontendDir =
    process.env.FRONTEND_DIR ?? path.resolve(__dirname, '../../frontend/out');
  app.use(express.static(frontendDir));

  // Fallback for any non-/api request: serve the exported HTML. Next's
  // trailingSlash export already resolves directory routes to index.html via
  // express.static; this covers deep links and unknown paths.
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
  });

  return app;
}
