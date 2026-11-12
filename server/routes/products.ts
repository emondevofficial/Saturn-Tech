import { Router, Request, Response } from 'express';
import { db } from '../db';
import { Product } from '../../src/types';

const router = Router();

// GET /api/products/search/suggestions
router.get('/search/suggestions', async (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim().toLowerCase();
  if (!query) {
    return res.json({ success: true, data: [] });
  }

  const products = await db.getProducts();
  const matched = products
    .filter(
      (p) =>
        p.status === 'PUBLISHED' &&
        (p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query)))
    )
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      price: p.salePrice,
      image: p.images[0] || '',
      category: p.category,
    }));

  res.json({ success: true, data: matched });
});

// GET /api/products
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      availability,
      processor,
      ram,
      storage,
      gpu,
      sort,
      featured,
      newArrival,
      bestSeller,
      flashSale,
      page = '1',
      limit = '12',
    } = req.query as Record<string, string>;

    let list = await db.getProducts();

    // Only published products for public store
    list = list.filter((p) => p.status === 'PUBLISHED');

    // Search query
    if (search) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.productCode.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category && category !== 'all') {
      const catVal = category.toLowerCase().trim();
      list = list.filter((p) => {
        const cSlug = p.categorySlug.toLowerCase();
        const cName = p.category.toLowerCase();
        return (
          cSlug === catVal ||
          cName === catVal ||
          (catVal === 'components' && cSlug === 'pc-components') ||
          (catVal === 'pc-components' && cSlug === 'components') ||
          (catVal === 'peripherals' && cSlug === 'accessories') ||
          (catVal === 'accessories' && cSlug === 'peripherals') ||
          (catVal === 'custom-pc' && cSlug === 'desktops') ||
          (catVal === 'desktops' && (cSlug === 'custom-pc' || cSlug === 'desktops'))
        );
      });
    }

    // Brand filter
    if (brand && brand !== 'all') {
      const brandVal = brand.toLowerCase().trim();
      list = list.filter((p) => p.brandSlug.toLowerCase() === brandVal || p.brand.toLowerCase() === brandVal);
    }

    // Price range
    if (minPrice && !isNaN(Number(minPrice))) {
      list = list.filter((p) => p.salePrice >= Number(minPrice));
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      list = list.filter((p) => p.salePrice <= Number(maxPrice));
    }

    // Availability
    if (availability === 'in-stock') {
      list = list.filter((p) => p.stock > 0);
    } else if (availability === 'out-of-stock') {
      list = list.filter((p) => p.stock <= 0);
    }

    // Specifications filters (Processor, RAM, Storage, GPU)
    if (processor) {
      const procVal = processor.toLowerCase();
      list = list.filter((p) =>
        p.specifications.some(
          (s) =>
            (s.name.toLowerCase().includes('cpu') || s.name.toLowerCase().includes('processor')) &&
            s.value.toLowerCase().includes(procVal)
        )
      );
    }

    if (ram) {
      const ramVal = ram.toLowerCase();
      list = list.filter((p) =>
        p.specifications.some(
          (s) => s.name.toLowerCase().includes('ram') && s.value.toLowerCase().includes(ramVal)
        )
      );
    }

    if (storage) {
      const storVal = storage.toLowerCase();
      list = list.filter((p) =>
        p.specifications.some(
          (s) => (s.name.toLowerCase().includes('ssd') || s.name.toLowerCase().includes('storage')) &&
            s.value.toLowerCase().includes(storVal)
        )
      );
    }

    if (gpu) {
      const gpuVal = gpu.toLowerCase();
      list = list.filter((p) =>
        p.specifications.some(
          (s) => (s.name.toLowerCase().includes('gpu') || s.name.toLowerCase().includes('graphics')) &&
            s.value.toLowerCase().includes(gpuVal)
        )
      );
    }

    // Flag filters
    if (featured === 'true') {
      list = list.filter((p) => p.featured);
    }
    if (newArrival === 'true') {
      list = list.filter((p) => p.newArrival);
    }
    if (bestSeller === 'true') {
      list = list.filter((p) => p.bestSeller);
    }
    if (flashSale === 'true') {
      list = list.filter((p) => p.flashSale);
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
      case 'price-low':
        list.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case 'price-desc':
      case 'price-high':
        list.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case 'rating':
        list.sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount);
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'discount':
        list.sort((a, b) => b.discountPercentage - a.discountPercentage);
        break;
      default:
        // Default: featured first, then newest
        list.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
    }

    // Pagination
    const total = list.length;
    let paginatedItems = list;
    let pageNum = Math.max(1, parseInt(page, 10) || 1);
    let limitNum = total;
    let totalPages = 1;

    if (limit && limit !== 'all' && limit !== '0' && limit !== '-1') {
      limitNum = Math.max(1, parseInt(limit, 10) || 12);
      totalPages = Math.ceil(total / limitNum);
      paginatedItems = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    }

    res.json({
      success: true,
      data: paginatedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve products' });
  }
});

// GET /api/products/:slugOrId
router.get('/:slugOrId', async (req: Request, res: Response) => {
  const { slugOrId } = req.params;
  const product = await db.getProductBySlug(slugOrId);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Related products from same category
  const allProducts = await db.getProducts();
  const related = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        p.status === 'PUBLISHED' &&
        (p.categorySlug === product.categorySlug || p.brandSlug === product.brandSlug)
    )
    .slice(0, 4);

  res.json({
    success: true,
    data: {
      product,
      related,
    },
  });
});

export default router;
