import { Router, Request, Response } from 'express';
import { db } from '../db';
import { sslcommerz } from '../sslcommerz';

const router = Router();

// POST /api/payment/sslcommerz/success
router.post('/sslcommerz/success', async (req: Request, res: Response) => {
  try {
    const { tran_id, val_id, amount, card_type, bank_tran_id } = {
      ...req.query,
      ...req.body,
    } as Record<string, string>;

    if (!tran_id) {
      return res.redirect('/order-failed?error=MissingTransactionId');
    }

    const order = await db.getOrderByTranId(tran_id);
    if (!order) {
      return res.redirect(`/order-failed?error=OrderNotFound&tran_id=${tran_id}`);
    }

    // Server-side validation
    const isValid = await sslcommerz.validateTransaction(val_id || '', tran_id, order.grandTotal);

    if (!isValid) {
      await db.updateOrder(order.id, {
        paymentStatus: 'FAILED',
        history: [
          ...order.history,
          {
            status: order.orderStatus,
            note: `Payment validation failed for Transaction ${tran_id}`,
            timestamp: new Date().toISOString(),
            updatedBy: 'SSLCOMMERZ Validator',
          },
        ],
      });
      return res.redirect(`/order-failed?tran_id=${tran_id}&order_id=${order.id}`);
    }

    // Complete order payment and safely reduce inventory
    await sslcommerz.completeOrderPayment(order, tran_id, val_id);

    // Redirect to customer success confirmation page
    res.redirect(`/order-success?id=${order.id}&tran_id=${tran_id}&order_number=${order.orderNumber}`);
  } catch (err: any) {
    console.error('SSLCommerz success handler error:', err);
    res.redirect('/order-failed?error=InternalProcessingError');
  }
});

// POST /api/payment/sslcommerz/fail
router.post('/sslcommerz/fail', async (req: Request, res: Response) => {
  try {
    const { tran_id, error } = { ...req.query, ...req.body } as Record<string, string>;

    if (tran_id) {
      const order = await db.getOrderByTranId(tran_id);
      if (order && order.paymentStatus !== 'PAID') {
        await db.updateOrder(order.id, {
          paymentStatus: 'FAILED',
          history: [
            ...order.history,
            {
              status: 'CANCELLED',
              note: `Payment failed on gateway: ${error || 'Declined by bank or user'}`,
              timestamp: new Date().toISOString(),
              updatedBy: 'SSLCOMMERZ Gateway',
            },
          ],
        });
        return res.redirect(`/order-failed?id=${order.id}&tran_id=${tran_id}`);
      }
    }

    res.redirect(`/order-failed?tran_id=${tran_id || 'unknown'}`);
  } catch (err: any) {
    res.redirect('/order-failed');
  }
});

// POST /api/payment/sslcommerz/cancel
router.post('/sslcommerz/cancel', async (req: Request, res: Response) => {
  try {
    const { tran_id } = { ...req.query, ...req.body } as Record<string, string>;

    if (tran_id) {
      const order = await db.getOrderByTranId(tran_id);
      if (order && order.paymentStatus !== 'PAID') {
        await db.updateOrder(order.id, {
          paymentStatus: 'CANCELLED',
          history: [
            ...order.history,
            {
              status: 'CANCELLED',
              note: 'Payment was cancelled by the customer.',
              timestamp: new Date().toISOString(),
              updatedBy: 'Customer',
            },
          ],
        });
      }
    }

    res.redirect('/cart?payment_cancelled=1');
  } catch (err: any) {
    res.redirect('/cart');
  }
});

// POST /api/payment/sslcommerz/ipn
router.post('/sslcommerz/ipn', async (req: Request, res: Response) => {
  try {
    const { tran_id, val_id, status } = req.body;

    if (!tran_id) {
      return res.status(400).send('Missing tran_id');
    }

    const order = await db.getOrderByTranId(tran_id);
    if (!order) {
      return res.status(404).send('Order not found');
    }

    if (status === 'VALID' || status === 'VALIDATED') {
      const isValid = await sslcommerz.validateTransaction(val_id, tran_id, order.grandTotal);
      if (isValid) {
        await sslcommerz.completeOrderPayment(order, tran_id, val_id);
        return res.status(200).send('IPN_SUCCESS');
      }
    }

    res.status(200).send('IPN_ACK');
  } catch (err: any) {
    console.error('IPN processing error:', err);
    res.status(500).send('IPN_ERROR');
  }
});

// GET /api/payment/sslcommerz/validate/:val_id
router.get('/sslcommerz/validate/:val_id', async (req: Request, res: Response) => {
  const { val_id } = req.params;
  const tran_id = req.query.tran_id as string;
  const amount = Number(req.query.amount) || 0;

  const valid = await sslcommerz.validateTransaction(val_id, tran_id, amount);
  res.json({ success: true, isValid: valid });
});

export default router;
