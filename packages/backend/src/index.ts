import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import weeksRouter from './routes/weeks';
import metaRouter from './routes/meta';
import alertsRouter from './routes/alerts';
import { seedDatabase } from './seed';

const app = express();

app.use(cors());
app.use(express.json());

// Simple auth middleware
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return next();

  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${password}`) return next();

  // Allow requests without auth in development
  if (!process.env.RAILWAY_ENVIRONMENT) return next();

  res.status(401).json({ success: false, error: 'Unauthorized' });
};

// Unauthenticated health check for Railway
app.get('/api/meta/status', async (_req, res) => {
  try {
    const token = process.env.META_ACCESS_TOKEN;
    if (!token) {
      return res.json({ success: true, data: { connected: false, reason: 'No access token configured' } });
    }
    const { validateToken } = await import('./services/metaApi');
    const tokenInfo = await validateToken(token);
    res.json({
      success: true,
      data: {
        connected: tokenInfo.isValid,
        expiresAt: tokenInfo.expiresAt,
        scopes: tokenInfo.scopes,
        adAccountId: process.env.META_AD_ACCOUNT_ID || 'not set',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API routes
app.use('/api/weeks', authMiddleware, weeksRouter);
app.use('/api/meta', authMiddleware, metaRouter);
app.use('/api/alerts', authMiddleware, alertsRouter);

// Serve frontend static files in production
if (process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
}

// Seed database with initial data
seedDatabase();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  process.exit(0);
});
