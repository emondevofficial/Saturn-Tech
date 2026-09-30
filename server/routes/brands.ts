import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const brands = await db.getBrands();
  const active = brands.filter((b) => b.isActive);
  res.json({ success: true, data: active });
});

router.get('/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const brands = await db.getBrands();
  const brand = brands.find((b) => b.slug === slug || b.id === slug);

  if (!brand) {
    return res.status(404).json({ success: false, message: 'Brand not found' });
  }

  res.json({ success: true, data: brand });
});

export default router;
