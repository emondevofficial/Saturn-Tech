import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const [categories, products] = await Promise.all([
    db.getCategories(),
    db.getProducts(),
  ]);
  const active = categories.filter((c) => c.isActive);
  const withCounts = active.map((c) => {
    const cSlug = c.slug.toLowerCase();
    const count = products.filter(
      (p) =>
        p.status === 'PUBLISHED' &&
        (p.categorySlug.toLowerCase() === cSlug ||
          p.category.toLowerCase() === c.name.toLowerCase() ||
          (cSlug === 'pc-components' && p.categorySlug.toLowerCase() === 'components') ||
          (cSlug === 'desktops' && p.categorySlug.toLowerCase() === 'custom-pc'))
    ).length;
    return {
      ...c,
      productCount: count,
    };
  });
  res.json({ success: true, data: withCounts });
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
