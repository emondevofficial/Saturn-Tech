import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { code, subtotal, customerId } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
    }

    const coupon = await db.getCouponByCode(code);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    const now = new Date().toISOString();
    if (coupon.startDate && coupon.startDate > now) {
      return res.status(400).json({ success: false, message: 'This coupon is not active yet' });
    }
    if (coupon.expiryDate && coupon.expiryDate < now) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
    }

    const currentSubtotal = Number(subtotal) || 0;
    if (currentSubtotal < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order of ৳${coupon.minOrder.toLocaleString()} required for this coupon.`,
      });
    }

    // Check customer per-user limit if customer is provided
    if (customerId) {
      const orders = await db.getOrders();
      const userUses = orders.filter(
        (o) => o.customerId === customerId && o.couponCode === coupon.code
      ).length;
      if (userUses >= coupon.perUserLimit) {
        return res.status(400).json({
          success: false,
          message: 'You have already utilized this coupon code.',
        });
      }
    }

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = Math.round((currentSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully! You saved ৳${discount.toLocaleString()}`,
      data: {
        code: coupon.code,
        discount,
        type: coupon.type,
        discountValue: coupon.discountValue,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to validate coupon' });
  }
});

export default router;
