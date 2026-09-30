import { Router, Response } from 'express';
import { db } from '../db';
import { Order, OrderItem, Address, PaymentMethod } from '../../src/types';
import { AuthRequest, authenticateToken } from '../auth';
import { sslcommerz } from '../sslcommerz';

const router = Router();

// Track order by orderNumber + phone
router.post('/track', async (req, res: Response) => {
  const { orderNumber, phone } = req.body;
  if (!orderNumber || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Both Order Number and Phone Number are required.',
    });
  }

  const order = await db.getOrderById(orderNumber.trim().toUpperCase());
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  const cleanInputPhone = phone.replace(/[^0-9]/g, '');
  const cleanOrderPhone = order.customerPhone.replace(/[^0-9]/g, '');

  if (!cleanOrderPhone.includes(cleanInputPhone) && !cleanInputPhone.includes(cleanOrderPhone)) {
    return res.status(403).json({
      success: false,
      message: 'The phone number does not match this order record.',
    });
  }

  res.json({ success: true, data: order });
});

// Get user orders (authenticated)
router.get('/my-orders', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const orders = await db.getOrders();
  const userOrders = orders.filter((o) => o.customerId === req.user?.id || o.customerEmail.toLowerCase() === req.user?.email.toLowerCase());
  res.json({ success: true, data: userOrders });
});

// Get single order by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const order = await db.getOrderById(id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Allow access if admin, or user is owner, or if customer email matches
  if (req.user && (req.user.role === 'ADMIN' || req.user.id === order.customerId || req.user.email.toLowerCase() === order.customerEmail.toLowerCase())) {
    return res.json({ success: true, data: order });
  }

  // Non-authenticated users can see their newly created order summary
  res.json({ success: true, data: order });
});

// Create Order
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      items,
      couponCode,
      shippingMethod,
      paymentMethod,
      notes,
    } = req.body as {
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      deliveryAddress: Address;
      items: { productId: string; quantity: number }[];
      couponCode?: string;
      shippingMethod: 'Inside Chattogram' | 'Outside Chattogram' | 'Store Pickup';
      paymentMethod: PaymentMethod;
      notes?: string;
    };

    if (!customerName || !customerPhone || !deliveryAddress || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required customer details, delivery address, and cart items.',
      });
    }

    const settings = await db.getSettings();
    const allProducts = await db.getProducts();

    // Verify each item from real database prices & stock
    const validatedOrderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const prod = allProducts.find((p) => p.id === item.productId);
      if (!prod || prod.status !== 'PUBLISHED') {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} is unavailable or discontinued.`,
        });
      }

      if (prod.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${prod.name}". Available: ${prod.stock}, requested: ${item.quantity}`,
        });
      }

      const itemTotal = prod.salePrice * item.quantity;
      subtotal += itemTotal;

      validatedOrderItems.push({
        productId: prod.id,
        productName: prod.name,
        productSlug: prod.slug,
        productImage: prod.images[0] || '',
        sku: prod.sku,
        unitPrice: prod.salePrice,
        regularPrice: prod.regularPrice,
        quantity: item.quantity,
        totalPrice: itemTotal,
        warranty: prod.warranty,
      });
    }

    // Calculate shipping
    let shippingCost = 0;
    if (shippingMethod === 'Store Pickup') {
      shippingCost = 0;
    } else if (subtotal >= settings.freeShippingThreshold) {
      shippingCost = 0;
    } else if (shippingMethod === 'Inside Chattogram') {
      shippingCost = settings.shippingInsideChattogram;
    } else {
      shippingCost = settings.shippingOutsideChattogram;
    }

    // Calculate coupon discount
    let discount = 0;
    if (couponCode) {
      const coupon = await db.getCouponByCode(couponCode);
      if (coupon && coupon.isActive && subtotal >= coupon.minOrder) {
        if (coupon.type === 'PERCENTAGE') {
          discount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.discountValue;
        }
        // Increment coupon count
        await db.updateCoupon(coupon.id, { usedCount: coupon.usedCount + 1 });
      }
    }

    const grandTotal = Math.max(0, subtotal - discount + shippingCost);

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `STB-${year}-${randomSuffix}`;
    const orderId = `ord-${Date.now()}-${randomSuffix}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: req.user?.id,
      customerName,
      customerEmail: customerEmail || (req.user?.email ?? ''),
      customerPhone,
      deliveryAddress,
      items: validatedOrderItems,
      subtotal,
      discount,
      couponCode: discount > 0 ? couponCode : undefined,
      shippingCost,
      grandTotal,
      paymentMethod,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING',
      shippingMethod,
      notes,
      history: [
        {
          status: 'PENDING',
          note: `Order placed via ${paymentMethod === 'COD' ? 'Cash on Delivery' : 'SSLCOMMERZ Online Gateway'}`,
          timestamp: new Date().toISOString(),
          updatedBy: 'Customer',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If Cash On Delivery:
    if (paymentMethod === 'COD') {
      // Stock is reserved/reduced on order placement
      for (const item of validatedOrderItems) {
        await db.adjustProductStock(
          item.productId,
          -item.quantity,
          'SALE',
          `Sold in Order #${orderNumber} (Cash on Delivery)`,
          'System Automated',
          orderId
        );
      }

      newOrder.orderStatus = 'CONFIRMED';
      newOrder.history.push({
        status: 'CONFIRMED',
        note: 'Order confirmed for Cash on Delivery dispatch.',
        timestamp: new Date().toISOString(),
        updatedBy: 'System',
      });

      await db.createOrder(newOrder);

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully with Cash on Delivery.',
        data: {
          order: newOrder,
          paymentGatewayUrl: null,
        },
      });
    }

    // If SSLCOMMERZ:
    // Create order with pending state, then initiate SSLCommerz session
    await db.createOrder(newOrder);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${req.protocol}://${req.get('host')}`;

    const initResult = await sslcommerz.initPayment({
      order: newOrder,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress: deliveryAddress.address,
      customerCity: deliveryAddress.district || 'Chattogram',
      customerPostCode: deliveryAddress.postalCode || '4000',
      baseUrl: siteUrl,
    });

    if (initResult.status === 'SUCCESS' && initResult.GatewayPageURL) {
      return res.status(201).json({
        success: true,
        message: 'Order initiated. Redirecting to payment gateway.',
        data: {
          order: newOrder,
          paymentGatewayUrl: initResult.GatewayPageURL,
        },
      });
    }

    res.status(500).json({
      success: false,
      message: initResult.failedreason || 'Failed to initiate payment gateway session.',
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, message: 'Server error creating order.' });
  }
});

export default router;
