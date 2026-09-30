import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const categories = await db.getCategories();
  const active = categories.filter((c) => c.isActive);
  res.json({ success: true, data: active });
});

router.get('/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const categories = await db.getCategories();
  const category = categories.find((c) => c.slug === slug || c.id === slug);

  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  res.json({ success: true, data: category });
});

export default router;
