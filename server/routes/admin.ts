import { Router, Response } from 'express';
import { db } from '../db';
import { requireAdmin, AuthRequest } from '../auth';
import { Product, Category, Brand, Coupon, Banner, FAQ, StoreSettings, OrderStatus, PaymentStatus } from '../../src/types';

const router = Router();

// Protect all admin routes
router.use(requireAdmin);

// ==========================================
// 1. DASHBOARD ANALYTICS & RECHARTS METRICS
// ==========================================
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const [products, orders, users, categories] = await Promise.all([
      db.getProducts(),
      db.getOrders(),
      db.getUsers(),
      db.getCategories(),
    ]);

    const totalProducts = products.length;
    const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
    const outOfStockProducts = products.filter((p) => p.stock <= 0).length;

    const totalCustomers = users.filter((u) => u.role === 'CUSTOMER').length;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.orderStatus === 'PENDING').length;
    const completedOrders = orders.filter((o) => o.orderStatus === 'DELIVERED').length;

    // Sales calculations
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalSales = 0;
    let todaySales = 0;
    let monthlySales = 0;

    orders.forEach((o) => {
      // Include paid orders and confirmed COD orders
      if (o.paymentStatus === 'PAID' || (o.paymentMethod === 'COD' && o.orderStatus !== 'CANCELLED')) {
        totalSales += o.grandTotal;

        const orderDate = new Date(o.createdAt);
        const orderDateStr = o.createdAt.split('T')[0];

        if (orderDateStr === todayStr) {
          todaySales += o.grandTotal;
        }

        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          monthlySales += o.grandTotal;
        }
      }
    });

    // Chart: 7-day revenue trend
    const last7Days: { date: string; label: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      let dayTotal = 0;
      let dayOrderCount = 0;

      orders.forEach((o) => {
        if (o.createdAt.startsWith(dayStr)) {
          dayOrderCount++;
          if (o.paymentStatus === 'PAID' || (o.paymentMethod === 'COD' && o.orderStatus !== 'CANCELLED')) {
            dayTotal += o.grandTotal;
          }
        }
      });

      last7Days.push({
        date: dayStr,
        label: dayLabel,
        sales: dayTotal,
        orders: dayOrderCount,
      });
    }

    // Chart: Payment methods
    const paymentMethodsMap: Record<string, number> = {
      'Cash on Delivery': 0,
      'SSLCOMMERZ Online': 0,
    };
    orders.forEach((o) => {
      if (o.paymentMethod === 'COD') {
        paymentMethodsMap['Cash on Delivery']++;
      } else {
        paymentMethodsMap['SSLCOMMERZ Online']++;
      }
    });
    const paymentMethodsData = Object.entries(paymentMethodsMap).map(([name, count]) => ({
      name,
      value: count,
    }));

    // Chart: Category distribution
    const categorySalesMap: Record<string, number> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const cat = prod?.category || 'General';
        categorySalesMap[cat] = (categorySalesMap[cat] || 0) + item.totalPrice;
      });
    });
    const categoryChartData = Object.entries(categorySalesMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent 5 orders
    const recentOrders = orders.slice(0, 5);

    res.json({
      success: true,
      data: {
        summary: {
          totalSales,
          todaySales,
          monthlySales,
          totalOrders,
          pendingOrders,
          completedOrders,
          totalCustomers,
          totalProducts,
          lowStockProducts,
          outOfStockProducts,
        },
        charts: {
          salesTrend: last7Days,
          paymentMethods: paymentMethodsData,
          topCategories: categoryChartData,
        },
        recentOrders,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to generate dashboard analytics' });
  }
});

// ==========================================
// 2. PRODUCT MANAGEMENT (CRUD & STOCK)
// ==========================================
router.get('/products', async (req: AuthRequest, res: Response) => {
  const { search, category, status } = req.query as Record<string, string>;
  let products = await db.getProducts();

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'all') {
    products = products.filter((p) => p.categorySlug === category);
  }

  if (status && status !== 'all') {
    products = products.filter((p) => p.status === status);
  }

  res.json({ success: true, data: products });
});

router.post('/products', async (req: AuthRequest, res: Response) => {
  try {
    const payload = req.body;
    const slug = (payload.slug || payload.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newProduct: Product = {
      ...payload,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      slug,
      productCode: payload.productCode || `STB-${Math.floor(1000 + Math.random() * 9000)}`,
      sku: payload.sku || `SKU-${Math.floor(10000 + Math.random() * 90000)}`,
      regularPrice: Number(payload.regularPrice) || 0,
      salePrice: Number(payload.salePrice) || Number(payload.regularPrice) || 0,
      costPrice: Number(payload.costPrice) || 0,
      discountPercentage:
        payload.regularPrice && payload.salePrice && payload.regularPrice > payload.salePrice
          ? Math.round(((payload.regularPrice - payload.salePrice) / payload.regularPrice) * 100)
          : 0,
      stock: Number(payload.stock) || 0,
      lowStockThreshold: Number(payload.lowStockThreshold) || 3,
      status: payload.status || 'PUBLISHED',
      specifications: payload.specifications || [],
      features: payload.features || [],
      images: payload.images?.length > 0 ? payload.images : ['/src/assets/images/hero_laptop_showcase_1790771906222.jpg'],
      tags: payload.tags || [],
      averageRating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.createProduct(newProduct);

    // Record initial inventory purchase transaction
    if (newProduct.stock > 0) {
      await db.adjustProductStock(
        newProduct.id,
        0, // just initialize transaction entry
        'PURCHASE',
        'Initial product stock entry',
        req.user?.name || 'Admin',
        newProduct.id
      );
    }

    res.status(201).json({ success: true, message: 'Product created successfully', data: newProduct });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
});

router.put('/products/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.regularPrice || updates.salePrice) {
      const reg = updates.regularPrice ?? 0;
      const sale = updates.salePrice ?? reg;
      if (reg > sale) {
        updates.discountPercentage = Math.round(((reg - sale) / reg) * 100);
      }
    }

    const updated = await db.updateProduct(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const deleted = await db.deleteProduct(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, message: 'Product removed successfully' });
});

router.post('/products/:id/duplicate', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const original = await db.getProductById(id);
  if (!original) return res.status(404).json({ success: false, message: 'Product not found' });

  const random = Math.floor(1000 + Math.random() * 9000);
  const copy: Product = {
    ...original,
    id: `prod-${Date.now()}-${random}`,
    name: `${original.name} (Copy)`,
    slug: `${original.slug}-copy-${random}`,
    sku: `${original.sku}-CP`,
    productCode: `${original.productCode}-CP`,
    stock: 0,
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.createProduct(copy);
  res.json({ success: true, message: 'Product duplicated as draft', data: copy });
});

// ==========================================
// 3. INVENTORY MANAGEMENT & STOCK ADJUSTMENTS
// ==========================================
router.get('/inventory', async (_req: AuthRequest, res: Response) => {
  const products = await db.getProducts();
  const transactions = await db.getInventoryTransactions();

  const inventorySummary = {
    totalItems: products.length,
    totalUnits: products.reduce((acc, p) => acc + p.stock, 0),
    totalValuation: products.reduce((acc, p) => acc + p.stock * p.salePrice, 0),
    lowStockCount: products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length,
    outOfStockCount: products.filter((p) => p.stock <= 0).length,
  };

  res.json({
    success: true,
    data: {
      summary: inventorySummary,
      products,
      transactions: transactions.slice(0, 100),
    },
  });
});

router.post('/inventory/adjust', async (req: AuthRequest, res: Response) => {
  const { productId, change, type, reason } = req.body;

  if (!productId || typeof change !== 'number' || !type || !reason) {
    return res.status(400).json({
      success: false,
      message: 'Product ID, quantity change number, adjustment type, and reason are required.',
    });
  }

  const result = await db.adjustProductStock(
    productId,
    change,
    type,
    reason,
    req.user?.name || 'Administrator'
  );

  if (!result.success) {
    return res.status(400).json({ success: false, message: result.error });
  }

  res.json({
    success: true,
    message: 'Stock adjustment recorded successfully',
    data: { newStock: result.newStock },
  });
});

// ==========================================
// 4. ORDER MANAGEMENT & INVOICE
// ==========================================
router.get('/orders', async (req: AuthRequest, res: Response) => {
  const { status, paymentStatus, search } = req.query as Record<string, string>;
  let orders = await db.getOrders();

  if (status && status !== 'all') {
    orders = orders.filter((o) => o.orderStatus === status);
  }
  if (paymentStatus && paymentStatus !== 'all') {
    orders = orders.filter((o) => o.paymentStatus === paymentStatus);
  }
  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        (o.transactionId && o.transactionId.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, data: orders });
});

router.get('/orders/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const order = await db.getOrderById(id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
});

router.put('/orders/:id/status', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus, internalNotes, note } = req.body as {
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    internalNotes?: string;
    note?: string;
  };

  const order = await db.getOrderById(id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const history = [...order.history];
  if (orderStatus && orderStatus !== order.orderStatus) {
    history.push({
      status: orderStatus,
      note: note || `Order status updated to ${orderStatus}`,
      timestamp: new Date().toISOString(),
      updatedBy: req.user?.name || 'Admin',
    });
  }

  // If order is being cancelled and was previously confirmed/decreased, restore stock
  if (orderStatus === 'CANCELLED' && order.orderStatus !== 'CANCELLED') {
    for (const item of order.items) {
      await db.adjustProductStock(
        item.productId,
        item.quantity,
        'CANCELLATION',
        `Restored from cancelled Order #${order.orderNumber}`,
        req.user?.name || 'Admin',
        order.id
      );
    }
  }

  const updated = await db.updateOrder(id, {
    ...(orderStatus ? { orderStatus } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(internalNotes !== undefined ? { internalNotes } : {}),
    history,
  });

  res.json({ success: true, message: 'Order updated successfully', data: updated });
});

// ==========================================
// 5. CATEGORIES & BRANDS CRUD
// ==========================================
router.get('/categories', async (_req, res: Response) => {
  const cats = await db.getCategories();
  res.json({ success: true, data: cats });
});

router.post('/categories', async (req: AuthRequest, res: Response) => {
  const { name, slug, description, image, icon, order, isActive } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

  const catSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    name,
    slug: catSlug,
    description,
    image: image || '/src/assets/images/hero_laptop_showcase_1790771906222.jpg',
    icon: icon || 'Laptop',
    order: Number(order) || 1,
    isActive: isActive !== false,
  };

  await db.createCategory(newCat);
  res.status(201).json({ success: true, message: 'Category created', data: newCat });
});

router.put('/categories/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updated = await db.updateCategory(id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, message: 'Category updated', data: updated });
});

router.delete('/categories/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const deleted = await db.deleteCategory(id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, message: 'Category deleted' });
});

router.get('/brands', async (_req, res: Response) => {
  const brands = await db.getBrands();
  res.json({ success: true, data: brands });
});

router.post('/brands', async (req: AuthRequest, res: Response) => {
  const { name, slug, description, website, isActive } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Brand name is required' });

  const brandSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newBrand: Brand = {
    id: `b-${Date.now()}`,
    name,
    slug: brandSlug,
    description,
    website,
    isActive: isActive !== false,
  };

  await db.createBrand(newBrand);
  res.status(201).json({ success: true, message: 'Brand created', data: newBrand });
});

router.put('/brands/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updated = await db.updateBrand(id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Brand not found' });
  res.json({ success: true, message: 'Brand updated', data: updated });
});

router.delete('/brands/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const deleted = await db.deleteBrand(id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Brand not found' });
  res.json({ success: true, message: 'Brand deleted' });
});

// ==========================================
// 6. CUSTOMER MANAGEMENT
// ==========================================
router.get('/customers', async (_req, res: Response) => {
  const users = await db.getUsers();
  const orders = await db.getOrders();

  const customerList = users
    .filter((u) => u.role === 'CUSTOMER')
    .map((u) => {
      const userOrders = orders.filter((o) => o.customerId === u.id || o.customerEmail.toLowerCase() === u.email.toLowerCase());
      const totalSpend = userOrders.reduce((sum, o) => {
        if (o.paymentStatus === 'PAID' || (o.paymentMethod === 'COD' && o.orderStatus !== 'CANCELLED')) {
          return sum + o.grandTotal;
        }
        return sum;
      }, 0);

      const { passwordHash: _, ...safeUser } = u;
      return {
        ...safeUser,
        orderCount: userOrders.length,
        totalSpend,
        lastOrderDate: userOrders[0]?.createdAt || null,
      };
    });

  res.json({ success: true, data: customerList });
});

router.put('/customers/:id/status', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const updated = await db.updateUser(id, { isActive });
  if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: `Customer account ${isActive ? 'activated' : 'deactivated'}` });
});

// ==========================================
// 7. COUPONS MANAGEMENT
// ==========================================
router.get('/coupons', async (_req, res: Response) => {
  const coupons = await db.getCoupons();
  res.json({ success: true, data: coupons });
});

router.post('/coupons', async (req: AuthRequest, res: Response) => {
  const { code, type, discountValue, minOrder, maxDiscount, startDate, expiryDate, usageLimit, perUserLimit } = req.body;

  if (!code || !discountValue) {
    return res.status(400).json({ success: false, message: 'Coupon code and discount value required' });
  }

  const newCoupon: Coupon = {
    id: `cp-${Date.now()}`,
    code: code.trim().toUpperCase(),
    type: type || 'PERCENTAGE',
    discountValue: Number(discountValue),
    minOrder: Number(minOrder) || 0,
    maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
    startDate: startDate || new Date().toISOString(),
    expiryDate: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: Number(usageLimit) || 100,
    usedCount: 0,
    perUserLimit: Number(perUserLimit) || 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  await db.createCoupon(newCoupon);
  res.status(201).json({ success: true, message: 'Coupon created successfully', data: newCoupon });
});

router.put('/coupons/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updated = await db.updateCoupon(id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Coupon not found' });
  res.json({ success: true, message: 'Coupon updated', data: updated });
});

router.delete('/coupons/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const deleted = await db.deleteCoupon(id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Coupon not found' });
  res.json({ success: true, message: 'Coupon deleted' });
});

// ==========================================
// 8. REVIEWS MODERATION
// ==========================================
router.get('/reviews', async (_req, res: Response) => {
  const reviews = await db.getReviews();
  const products = await db.getProducts();

  const enriched = reviews.map((r) => {
    const prod = products.find((p) => p.id === r.productId);
    return {
      ...r,
      productName: prod?.name || 'Unknown Product',
      productImage: prod?.images[0] || '',
    };
  });

  res.json({ success: true, data: enriched });
});

router.put('/reviews/:id/moderate', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { isApproved, isFeatured } = req.body;
  const updated = await db.updateReview(id, {
    ...(isApproved !== undefined ? { isApproved } : {}),
    ...(isFeatured !== undefined ? { isFeatured } : {}),
  });
  if (!updated) return res.status(404).json({ success: false, message: 'Review not found' });
  res.json({ success: true, message: 'Review status updated', data: updated });
});

router.delete('/reviews/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const deleted = await db.deleteReview(id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Review not found' });
  res.json({ success: true, message: 'Review deleted' });
});

// ==========================================
// 9. BANNERS & FAQS
// ==========================================
router.get('/banners', async (_req, res: Response) => {
  const banners = await db.getBanners();
  res.json({ success: true, data: banners });
});

router.post('/banners', async (req: AuthRequest, res: Response) => {
  const newBanner: Banner = {
    ...req.body,
    id: `ban-${Date.now()}`,
    order: Number(req.body.order) || 1,
    isActive: req.body.isActive !== false,
  };
  await db.createBanner(newBanner);
  res.status(201).json({ success: true, message: 'Banner created', data: newBanner });
});

router.put('/banners/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updated = await db.updateBanner(id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'Banner not found' });
  res.json({ success: true, message: 'Banner updated', data: updated });
});

router.delete('/banners/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const deleted = await db.deleteBanner(id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Banner not found' });
  res.json({ success: true, message: 'Banner deleted' });
});

router.get('/faqs', async (_req, res: Response) => {
  const faqs = await db.getFAQs();
  res.json({ success: true, data: faqs });
});

router.post('/faqs', async (req: AuthRequest, res: Response) => {
  const newFaq: FAQ = {
    ...req.body,
    id: `faq-${Date.now()}`,
    order: Number(req.body.order) || 1,
  };
  await db.createFAQ(newFaq);
  res.status(201).json({ success: true, message: 'FAQ created', data: newFaq });
});

router.put('/faqs/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updated = await db.updateFAQ(id, req.body);
  if (!updated) return res.status(404).json({ success: false, message: 'FAQ not found' });
  res.json({ success: true, message: 'FAQ updated', data: updated });
});

router.delete('/faqs/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const deleted = await db.deleteFAQ(id);
  if (!deleted) return res.status(404).json({ success: false, message: 'FAQ not found' });
  res.json({ success: true, message: 'FAQ deleted' });
});

// ==========================================
// 10. REPORTS & CSV EXPORT
// ==========================================
router.get('/reports/sales', async (_req: AuthRequest, res: Response) => {
  const orders = await db.getOrders();
  const products = await db.getProducts();

  const productSalesMap: Record<string, { name: string; sku: string; units: number; revenue: number }> = {};

  orders.forEach((o) => {
    if (o.paymentStatus === 'PAID' || (o.paymentMethod === 'COD' && o.orderStatus !== 'CANCELLED')) {
      o.items.forEach((item) => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            name: item.productName,
            sku: item.sku,
            units: 0,
            revenue: 0,
          };
        }
        productSalesMap[item.productId].units += item.quantity;
        productSalesMap[item.productId].revenue += item.totalPrice;
      });
    }
  });

  const productSales = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue);

  res.json({
    success: true,
    data: {
      productSales,
      totalOrders: orders.length,
      paidOrdersCount: orders.filter((o) => o.paymentStatus === 'PAID').length,
    },
  });
});

router.get('/reports/export-csv', async (_req: AuthRequest, res: Response) => {
  const orders = await db.getOrders();
  let csv = 'Order ID,Date,Customer,Phone,Total,Payment Method,Payment Status,Order Status\n';

  orders.forEach((o) => {
    const date = o.createdAt.split('T')[0];
    csv += `"${o.orderNumber}","${date}","${o.customerName.replace(/"/g, '""')}","${o.customerPhone}","${o.grandTotal}","${o.paymentMethod}","${o.paymentStatus}","${o.orderStatus}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="saturn-orders-report.csv"');
  res.send(csv);
});

// ==========================================
// 11. SETTINGS
// ==========================================
router.get('/settings', async (_req, res: Response) => {
  const settings = await db.getSettings();
  res.json({ success: true, data: settings });
});

router.put('/settings', async (req: AuthRequest, res: Response) => {
  const updated = await db.updateSettings(req.body);
  res.json({ success: true, message: 'Settings saved successfully', data: updated });
});

export default router;
