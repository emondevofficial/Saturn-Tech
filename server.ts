import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import authRoutes from './server/routes/auth';
import productRoutes from './server/routes/products';
import categoryRoutes from './server/routes/categories';
import brandRoutes from './server/routes/brands';
import orderRoutes from './server/routes/orders';
import couponRoutes from './server/routes/coupons';
import reviewRoutes from './server/routes/reviews';
import paymentRoutes from './server/routes/payment';
import adminRoutes from './server/routes/admin';
import contentRoutes from './server/routes/content';
import uploadRoutes from './server/routes/upload';
import { authenticateToken } from './server/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Body parsing middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static directory setup for direct image and asset resolution
const assetsDir = path.resolve(process.cwd(), 'src/assets');
const publicDir = path.resolve(process.cwd(), 'public');
const uploadsDir = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/src/assets', express.static(assetsDir, { maxAge: '7d' }));
app.use('/assets', express.static(assetsDir, { maxAge: '7d' }));
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d' }));
app.use(express.static(publicDir, { maxAge: '7d' }));

// Global authentication extractor
app.use(authenticateToken as any);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    store: 'Saturn Tech BD',
    timestamp: new Date().toISOString(),
  });
});

// Database error fallback middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (
    err?.name === 'MongooseError' ||
    err?.name === 'MongoNetworkError' ||
    (typeof err?.message === 'string' && err.message.includes('buffering timed out'))
  ) {
    console.warn('[AI Studio] Database offline — returning mock fallback response');
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
    }
    return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
  }
  next(err);
});

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Saturn Tech BD server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
