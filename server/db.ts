import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import {
  User,
  Product,
  Category,
  Brand,
  Order,
  Coupon,
  Review,
  InventoryTransaction,
  Banner,
  FAQ,
  StoreSettings,
} from '../src/types';
import {
  initialSettings,
  initialCategories,
  initialBrands,
  initialBanners,
  initialProducts,
  initialCoupons,
  initialFAQs,
  initialAdminUser,
} from './seedData';

interface UserRecord extends User {
  passwordHash: string;
}

interface DataStore {
  users: UserRecord[];
  products: Product[];
  categories: Category[];
  brands: Brand[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  inventoryTransactions: InventoryTransaction[];
  banners: Banner[];
  faqs: FAQ[];
  settings: StoreSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

class DatabaseService {
  private data: DataStore;
  private isMongoConnected: boolean = false;

  constructor() {
    this.data = this.loadInitialData();
    this.initMongoIfConfigured();
  }

  private loadInitialData(): DataStore {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || [initialAdminUser],
          products: parsed.products || initialProducts,
          categories: parsed.categories || initialCategories,
          brands: parsed.brands || initialBrands,
          orders: parsed.orders || [],
          coupons: parsed.coupons || initialCoupons,
          reviews: parsed.reviews || [],
          inventoryTransactions: parsed.inventoryTransactions || [],
          banners: parsed.banners || initialBanners,
          faqs: parsed.faqs || initialFAQs,
          settings: parsed.settings || initialSettings,
        };
      }
    } catch (err) {
      console.error('Error reading store file, initializing from seed:', err);
    }

    const defaultData: DataStore = {
      users: [initialAdminUser],
      products: initialProducts,
      categories: initialCategories,
      brands: initialBrands,
      orders: [],
      coupons: initialCoupons,
      reviews: [],
      inventoryTransactions: [],
      banners: initialBanners,
      faqs: initialFAQs,
      settings: initialSettings,
    };

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    } catch (writeErr) {
      console.error('Could not persist default store to disk:', writeErr);
    }

    return defaultData;
  }

  public save(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to file:', err);
    }
  }

  private async initMongoIfConfigured(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri && mongoUri.trim().length > 0) {
      try {
        await mongoose.connect(mongoUri, {
          dbName: process.env.MONGODB_DB || 'saturn_tech_bd',
        });
        this.isMongoConnected = true;
        console.log('Successfully connected to MongoDB instance');
      } catch (err) {
        console.warn('MongoDB connection attempt failed, maintaining active local data store:', err);
      }
    }
  }

  // --- Users ---
  public async getUsers(): Promise<UserRecord[]> {
    return this.data.users;
  }

  public async getUserById(id: string): Promise<UserRecord | undefined> {
    return this.data.users.find((u) => u.id === id);
  }

  public async getUserByEmail(email: string): Promise<UserRecord | undefined> {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public async createUser(user: UserRecord): Promise<UserRecord> {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public async updateUser(id: string, updates: Partial<UserRecord>): Promise<UserRecord | null> {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.users[index];
  }

  // --- Products ---
  public async getProducts(): Promise<Product[]> {
    return this.data.products;
  }

  public async getProductById(id: string): Promise<Product | undefined> {
    return this.data.products.find((p) => p.id === id);
  }

  public async getProductBySlug(slug: string): Promise<Product | undefined> {
    return this.data.products.find((p) => p.slug === slug || p.id === slug);
  }

  public async createProduct(product: Product): Promise<Product> {
    this.data.products.unshift(product);
    this.save();
    return product;
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.data.products[index] = {
      ...this.data.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.products[index];
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.data.products.splice(index, 1);
    this.save();
    return true;
  }

  public async adjustProductStock(
    productId: string,
    change: number,
    type: InventoryTransaction['type'],
    reason: string,
    performedBy: string,
    referenceId?: string
  ): Promise<{ success: boolean; newStock?: number; error?: string }> {
    const product = this.data.products.find((p) => p.id === productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    const previousStock = product.stock;
    const newStock = previousStock + change;

    if (newStock < 0) {
      return { success: false, error: `Insufficient stock for ${product.name}. Available: ${previousStock}` };
    }

    product.stock = newStock;
    product.updatedAt = new Date().toISOString();

    const transaction: InventoryTransaction = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type,
      previousStock,
      quantityChange: change,
      newStock,
      reason,
      referenceId,
      performedBy,
      createdAt: new Date().toISOString(),
    };

    this.data.inventoryTransactions.unshift(transaction);
    this.save();
    return { success: true, newStock };
  }

  // --- Categories ---
  public async getCategories(): Promise<Category[]> {
    return this.data.categories.sort((a, b) => a.order - b.order);
  }

  public async createCategory(category: Category): Promise<Category> {
    this.data.categories.push(category);
    this.save();
    return category;
  }

  public async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.save();
    return this.data.categories[idx];
  }

  public async deleteCategory(id: string): Promise<boolean> {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Brands ---
  public async getBrands(): Promise<Brand[]> {
    return this.data.brands;
  }

  public async createBrand(brand: Brand): Promise<Brand> {
    this.data.brands.push(brand);
    this.save();
    return brand;
  }

  public async updateBrand(id: string, updates: Partial<Brand>): Promise<Brand | null> {
    const idx = this.data.brands.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.data.brands[idx] = { ...this.data.brands[idx], ...updates };
    this.save();
    return this.data.brands[idx];
  }

  public async deleteBrand(id: string): Promise<boolean> {
    const idx = this.data.brands.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.data.brands.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Orders ---
  public async getOrders(): Promise<Order[]> {
    return this.data.orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async getOrderById(id: string): Promise<Order | undefined> {
    return this.data.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public async getOrderByTranId(tranId: string): Promise<Order | undefined> {
    return this.data.orders.find((o) => o.transactionId === tranId);
  }

  public async createOrder(order: Order): Promise<Order> {
    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  public async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const idx = this.data.orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (idx === -1) return null;
    this.data.orders[idx] = {
      ...this.data.orders[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.orders[idx];
  }

  // --- Coupons ---
  public async getCoupons(): Promise<Coupon[]> {
    return this.data.coupons;
  }

  public async getCouponByCode(code: string): Promise<Coupon | undefined> {
    return this.data.coupons.find(
      (c) => c.code.trim().toUpperCase() === code.trim().toUpperCase() && c.isActive
    );
  }

  public async createCoupon(coupon: Coupon): Promise<Coupon> {
    this.data.coupons.push(coupon);
    this.save();
    return coupon;
  }

  public async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | null> {
    const idx = this.data.coupons.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.coupons[idx] = { ...this.data.coupons[idx], ...updates };
    this.save();
    return this.data.coupons[idx];
  }

  public async deleteCoupon(id: string): Promise<boolean> {
    const idx = this.data.coupons.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.coupons.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Reviews ---
  public async getReviews(productId?: string): Promise<Review[]> {
    if (productId) {
      return this.data.reviews.filter((r) => r.productId === productId);
    }
    return this.data.reviews;
  }

  public async createReview(review: Review): Promise<Review> {
    this.data.reviews.unshift(review);
    // Recalculate product rating
    const prodReviews = this.data.reviews.filter((r) => r.productId === review.productId && r.isApproved);
    const prod = this.data.products.find((p) => p.id === review.productId);
    if (prod && prodReviews.length > 0) {
      const sum = prodReviews.reduce((acc, curr) => acc + curr.rating, 0);
      prod.averageRating = Number((sum / prodReviews.length).toFixed(1));
      prod.reviewCount = prodReviews.length;
    }
    this.save();
    return review;
  }

  public async updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
    const idx = this.data.reviews.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.data.reviews[idx] = { ...this.data.reviews[idx], ...updates };
    this.save();
    return this.data.reviews[idx];
  }

  public async deleteReview(id: string): Promise<boolean> {
    const idx = this.data.reviews.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.data.reviews.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Inventory Transactions ---
  public async getInventoryTransactions(): Promise<InventoryTransaction[]> {
    return this.data.inventoryTransactions;
  }

  // --- Banners ---
  public async getBanners(): Promise<Banner[]> {
    return this.data.banners.sort((a, b) => a.order - b.order);
  }

  public async createBanner(banner: Banner): Promise<Banner> {
    this.data.banners.push(banner);
    this.save();
    return banner;
  }

  public async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner | null> {
    const idx = this.data.banners.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.data.banners[idx] = { ...this.data.banners[idx], ...updates };
    this.save();
    return this.data.banners[idx];
  }

  public async deleteBanner(id: string): Promise<boolean> {
    const idx = this.data.banners.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.data.banners.splice(idx, 1);
    this.save();
    return true;
  }

  // --- FAQs ---
  public async getFAQs(): Promise<FAQ[]> {
    return this.data.faqs.sort((a, b) => a.order - b.order);
  }

  public async createFAQ(faq: FAQ): Promise<FAQ> {
    this.data.faqs.push(faq);
    this.save();
    return faq;
  }

  public async updateFAQ(id: string, updates: Partial<FAQ>): Promise<FAQ | null> {
    const idx = this.data.faqs.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.data.faqs[idx] = { ...this.data.faqs[idx], ...updates };
    this.save();
    return this.data.faqs[idx];
  }

  public async deleteFAQ(id: string): Promise<boolean> {
    const idx = this.data.faqs.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    this.data.faqs.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Settings ---
  public async getSettings(): Promise<StoreSettings> {
    return this.data.settings;
  }

  public async updateSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }
}

export const db = new DatabaseService();
