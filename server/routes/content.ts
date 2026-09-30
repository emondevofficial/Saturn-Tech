import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

router.get('/banners', async (_req: Request, res: Response) => {
  const banners = await db.getBanners();
  const active = banners.filter((b) => b.isActive);
  res.json({ success: true, data: active });
});

router.get('/faqs', async (_req: Request, res: Response) => {
  const faqs = await db.getFAQs();
  res.json({ success: true, data: faqs });
});

router.get('/settings', async (_req: Request, res: Response) => {
  const settings = await db.getSettings();
  res.json({ success: true, data: settings });
});

export default router;
