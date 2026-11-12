import { Router, Request, Response } from 'express';
import { db } from '../db';
import { AuthRequest, authenticateToken } from '../auth';
import { Review } from '../../src/types';

const router = Router();

// GET /api/reviews
router.get('/', async (req: Request, res: Response) => {
  const { productId, featured, limit } = req.query as Record<string, string>;
  let reviews = await db.getReviews(productId);
  let approved = reviews.filter((r) => r.isApproved);

  if (featured === 'true') {
    approved = approved.filter((r) => r.isFeatured || r.rating >= 4);
  }

  if (limit && !isNaN(Number(limit))) {
    approved = approved.slice(0, Number(limit));
  }

  res.json({ success: true, data: approved });
});

// GET /api/reviews/:productId
router.get('/:productId', async (req: Request, res: Response) => {
  const { productId } = req.params;
  const reviews = await db.getReviews(productId);
  const approved = reviews.filter((r) => r.isApproved);
  res.json({ success: true, data: approved });
});

// POST /api/reviews
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, comment, customerName } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product, star rating (1-5), and review feedback are required.',
      });
    }

    const numRating = Math.min(5, Math.max(1, Number(rating)));

    // Check if verified purchaser
    let isVerifiedPurchase = false;
    let customerId = req.user?.id || 'guest';
    const name = req.user?.name || customerName || 'Valued Customer';

    if (req.user) {
      const orders = await db.getOrders();
      const customerOrders = orders.filter(
        (o) =>
          (o.customerId === req.user?.id || o.customerEmail.toLowerCase() === req.user?.email.toLowerCase()) &&
          (o.orderStatus === 'DELIVERED' || o.orderStatus === 'CONFIRMED' || o.paymentStatus === 'PAID')
      );
      const hasPurchased = customerOrders.some((o) =>
        o.items.some((item) => item.productId === productId)
      );
      if (hasPurchased) {
        isVerifiedPurchase = true;
      }
    }

    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId,
      customerId,
      customerName: name,
      rating: numRating,
      comment,
      isVerifiedPurchase,
      isApproved: true, // Auto-approved or moderate in admin
      createdAt: new Date().toISOString(),
    };

    await db.createReview(newReview);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your product review has been submitted.',
      data: newReview,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
});

export default router;
