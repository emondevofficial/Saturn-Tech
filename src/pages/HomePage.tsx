import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Cpu,
  Laptop,
  Monitor,
  Flame,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  Headphones,
  CheckCircle2,
} from 'lucide-react';
import { Product, Category, Banner, Brand, FAQ } from '../types';
import { ProductCard } from '../components/ProductCard';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onQuickView }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'laptops' | 'components' | 'accessories'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Flash sale countdown timer simulation (7 days remaining)
  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/brands').then((r) => r.json()),
      fetch('/api/content/banners').then((r) => r.json()),
      fetch('/api/content/faqs').then((r) => r.json()),
    ])
      .then(([prodRes, catRes, brandRes, banRes, faqRes]) => {
        if (prodRes.success) setProducts(prodRes.data || []);
        if (catRes.success) setCategories(catRes.data || []);
        if (brandRes.success) setBrands(brandRes.data || []);
        if (banRes.success) setBanners(banRes.data || []);
        if (faqRes.success) setFaqs(faqRes.data || []);
      })
      .catch((err) => console.error('Home data load error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // Hero carousel auto-rotate
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const flashSaleProducts = products.filter((p) => p.flashSale);
  const bestSellers = products.filter((p) => p.bestSeller);
  const filteredTabProducts =
    activeTab === 'all'
      ? products
      : activeTab === 'laptops'
      ? products.filter((p) => p.categorySlug === 'laptops')
      : activeTab === 'components'
      ? products.filter((p) => p.categorySlug === 'pc-components')
      : products.filter((p) => p.categorySlug === 'accessories');

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SLIDER SECTION */}
      <section className="relative bg-[#0B1120] text-white overflow-hidden">
        {banners.length > 0 ? (
          <div className="relative min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex items-center">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === activeBannerIndex ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* Background image with contrast scrim gradient */}
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

                {/* Banner Content Container */}
                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-center max-w-2xl py-12">
                  {banner.tag && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{banner.tag}</span>
                    </div>
                  )}

                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance mb-4">
                    {banner.title}
                  </h1>

                  {banner.subtitle && (
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mb-6">
                      {banner.subtitle}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => onNavigate(banner.link)}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-colors"
                    >
                      {banner.buttonText || 'Shop Collection'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onNavigate('/products')}
                      className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm backdrop-blur-md transition-colors"
                    >
                      Explore All
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Slider arrows */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-xs transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveBannerIndex((prev) => (prev + 1) % banners.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-xs transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Slider dots */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveBannerIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeBannerIndex === idx ? 'w-6 bg-blue-500' : 'w-2 bg-white/40'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-20 text-center">
            <h1 className="text-3xl font-bold">Welcome to Saturn Tech BD</h1>
          </div>
        )}
      </section>

      {/* 2. FEATURED CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Featured Categories
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse genuine products by hardware classification
            </p>
          </div>
          <button
            onClick={() => onNavigate('/categories')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            All Categories <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {categories.slice(0, 6).map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate(`/products?category=${cat.slug}`)}
              className="group bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center text-slate-700 group-hover:text-blue-600 transition-colors mb-3">
                {cat.icon === 'Laptop' && <Laptop className="w-7 h-7" />}
                {cat.icon === 'Cpu' && <Cpu className="w-7 h-7" />}
                {cat.icon === 'Monitor' && <Monitor className="w-7 h-7" />}
                {cat.icon === 'Keyboard' && <Headphones className="w-7 h-7" />}
                {cat.icon !== 'Laptop' &&
                  cat.icon !== 'Cpu' &&
                  cat.icon !== 'Monitor' &&
                  cat.icon !== 'Keyboard' && <Laptop className="w-7 h-7" />}
              </div>
              <h3 className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {cat.name}
              </h3>
              <span className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Explore <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FLASH SALE SPOTLIGHT WITH LIVE COUNTDOWN */}
      {flashSaleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 shadow-md">
                  <Flame className="w-6 h-6 fill-current animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      Saturn Flash Deals
                    </h2>
                    <span className="text-xs font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md uppercase">
                      Limited Time
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Massive discounts on premium laptops and top-tier computer components
                  </p>
                </div>
              </div>

              {/* Countdown timer */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Offer Ends In:</span>
                <div className="flex gap-1.5 text-center">
                  <div className="bg-slate-800/90 border border-slate-700 px-2.5 py-1.5 rounded-lg min-w-10">
                    <span className="text-sm font-bold text-amber-400 tabular-nums">{timeLeft.days}d</span>
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700 px-2.5 py-1.5 rounded-lg min-w-10">
                    <span className="text-sm font-bold text-white tabular-nums">
                      {String(timeLeft.hours).padStart(2, '0')}h
                    </span>
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700 px-2.5 py-1.5 rounded-lg min-w-10">
                    <span className="text-sm font-bold text-white tabular-nums">
                      {String(timeLeft.minutes).padStart(2, '0')}m
                    </span>
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700 px-2.5 py-1.5 rounded-lg min-w-10">
                    <span className="text-sm font-bold text-amber-400 tabular-nums">
                      {String(timeLeft.seconds).padStart(2, '0')}s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Flash sale cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {flashSaleProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="text-slate-900">
                  <ProductCard
                    product={product}
                    onNavigate={onNavigate}
                    onQuickView={onQuickView}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. FEATURED PRODUCTS & CATEGORY TABS */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Trending Hardware & Gear
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Handpicked high-performance laptops and enthusiast desktop components
            </p>
          </div>

          {/* Interactive filter tabs (per frontend-design constitution) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Gear
            </button>
            <button
              onClick={() => setActiveTab('laptops')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'laptops'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laptops
            </button>
            <button
              onClick={() => setActiveTab('components')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'components'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Components
            </button>
            <button
              onClick={() => setActiveTab('accessories')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'accessories'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Peripherals
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTabProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
              onQuickView={onQuickView}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => onNavigate('/products')}
            className="px-6 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-xs font-semibold shadow-xs hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
          >
            Explore Complete Inventory ({products.length} Products)
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 5. DUAL PROMOTIONAL SHOWCASE BANNERS */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Banner 1: Custom PC Building */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[260px] flex flex-col justify-end p-6 sm:p-8 border border-slate-800 group">
          <img
            src="/src/assets/images/hero_pc_build_custom_1790771917291.jpg"
            alt="Custom PC Builds"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="relative z-10 space-y-2 max-w-md">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
              Saturn Custom Rigs
            </span>
            <h3 className="text-xl sm:text-2xl font-bold leading-tight">
              Build Your Dream Gaming PC
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hand-selected thermal configurations, cable routing, stress testing, and free assembly.
            </p>
            <button
              onClick={() => onNavigate('/products?category=pc-components')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Configure Components <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Banner 2: Official Warranty & Support */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[260px] flex flex-col justify-end p-6 sm:p-8 border border-slate-800 group">
          <img
            src="/src/assets/images/banner_pc_components_1790771929375.jpg"
            alt="Original Components"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="relative z-10 space-y-2 max-w-md">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
              Guaranteed Authenticity
            </span>
            <h3 className="text-xl sm:text-2xl font-bold leading-tight">
              Official Distributors Warranty
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Never gamble on grey imports. Every product comes with authorized Bangladesh warranty support.
            </p>
            <button
              onClick={() => onNavigate('/warranty')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition-colors"
            >
              Warranty Information <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Customer Best Sellers
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The highest rated and most ordered electronics at Saturn Tech BD
            </p>
          </div>
          <button
            onClick={() => onNavigate('/products?sort=rating')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View Top Rated <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bestSellers.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

      {/* 7. OFFICIAL BRANDS CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8">
          <div className="text-center max-w-md mx-auto mb-6">
            <h2 className="text-lg font-bold text-slate-900">Authorized Brand Partners</h2>
            <p className="text-xs text-slate-500 mt-1">
              Direct sourcing from world-class computer hardware manufacturers
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => onNavigate(`/products?brand=${brand.slug}`)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-xs transition-all text-xs font-bold text-slate-700 hover:text-blue-600 cursor-pointer"
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 8. WHY CHOOSE SATURN TECH BD */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            The Saturn Advantage
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Why Tech Enthusiasts Trust Saturn Tech BD
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Based in Computer City Centre, GEC Circle, Chattogram — serving customers across Bangladesh with unmatched reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Original Serialized Hardware</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every laptop, GPU, processor, and SSD has a verified serial number that you can cross-check with official distributor portals across Bangladesh.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Same-Day Chattogram Express</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Need components urgently? We offer express same-day courier dispatch inside Chattogram city and insured door-to-door courier across all 64 districts.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Dedicated Technician Support</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our hardware engineers provide free technical consultation, BIOS firmware updates, custom water-cooling setup advice, and comprehensive post-warranty servicing.
            </p>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800">
          <div className="text-center max-w-lg mx-auto mb-8">
            <div className="flex justify-center gap-1 text-amber-400 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Trusted by 10,000+ Gamers & Professionals
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Read real feedback from verified customers in Bangladesh
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Bought an ASUS ROG Zephyrus G16 from Saturn Tech BD. The packaging was immaculate and delivery to GEC Chattogram was completed in just 3 hours. Best price in Bangladesh!"
              </p>
              <div className="border-t border-slate-700/60 pt-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Tanvir Ahmed</span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                </span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Built an RTX 4070 SUPER rig with their team. Flawless cable management, stress tested with benchmarks, and official warranty paperwork included. Highly recommended store!"
              </p>
              <div className="border-t border-slate-700/60 pt-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Siam Chowdhury</span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                </span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Ordered Samsung 990 Pro 1TB and Corsair DDR5 RAM online. Paid via SSLCOMMERZ with bKash smoothly. Courier arrived in Dhaka in under 24 hours. Excellent support."
              </p>
              <div className="border-t border-slate-700/60 pt-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Farhanul Haque</span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ ACCORDION PREVIEW */}
      {faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Have questions regarding orders, warranty claims, or deliveries?
            </p>
          </div>

          <div className="space-y-3">
            {faqs.slice(0, 4).map((faq) => (
              <div
                key={faq.id}
                className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5"
              >
                <h4 className="text-sm font-semibold text-slate-900">{faq.question}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => onNavigate('/faq')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All Questions & Answers →
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
