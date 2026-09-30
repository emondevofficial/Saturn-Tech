import fs from 'fs';
import path from 'path';
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

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

async function seed() {
  console.log('Seeding Saturn Tech BD database...');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const defaultData = {
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

  fs.writeFileSync(STORE_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');

  console.log('✅ Saturn Tech BD database seeded successfully!');
  console.log('---------------------------------------------');
  console.log('Default Admin Account:');
  console.log('Email:    admin@saturntechbd.com');
  console.log('Password: Admin@123456');
  console.log('---------------------------------------------');
  console.log(`Seeded Products:   ${initialProducts.length}`);
  console.log(`Seeded Categories: ${initialCategories.length}`);
  console.log(`Seeded Brands:     ${initialBrands.length}`);
  console.log(`Seeded Coupons:    ${initialCoupons.length}`);
}

seed().catch(console.error);
