import React, { useState, useEffect, useCallback } from 'react';
import {
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Product, Category, Brand } from '../types';
import { ProductCard } from '../components/ProductCard';

interface ProductsPageProps {
  onNavigate: (path: string) => void;
  onQuickView: (product: Product) => void;
  initialCategory?: string;
  initialBrand?: string;
  initialSearch?: string;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  onNavigate,
  onQuickView,
  initialCategory,
  initialBrand,
  initialSearch,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [selectedBrand, setSelectedBrand] = useState(initialBrand || 'all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [availability, setAvailability] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [processorFilter, setProcessorFilter] = useState('');
  const [ramFilter, setRamFilter] = useState('');
  const [sort, setSort] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Load categories and brands on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/brands').then((r) => r.json()),
    ])
      .then(([catRes, brandRes]) => {
        if (catRes.success) setCategories(catRes.data || []);
        if (brandRes.success) setBrands(brandRes.data || []);
      })
      .catch(() => {});
  }, []);

  // Sync initial props
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialBrand) setSelectedBrand(initialBrand);
    if (initialSearch !== undefined) setSearch(initialSearch);
  }, [initialCategory, initialBrand, initialSearch]);

  const fetchFilteredProducts = useCallback(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
    if (selectedBrand && selectedBrand !== 'all') params.append('brand', selectedBrand);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (availability !== 'all') params.append('availability', availability);
    if (processorFilter) params.append('processor', processorFilter);
    if (ramFilter) params.append('ram', ramFilter);
    if (sort) params.append('sort', sort);
    params.append('page', page.toString());
    params.append('limit', '12');

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data || []);
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages || 1);
            setTotalCount(data.pagination.total || 0);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [
    search,
    selectedCategory,
    selectedBrand,
    minPrice,
    maxPrice,
    availability,
    processorFilter,
    ramFilter,
    sort,
    page,
  ]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [fetchFilteredProducts]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setMinPrice('');
    setMaxPrice('');
    setAvailability('all');
    setProcessorFilter('');
    setRamFilter('');
    setSort('featured');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Breadcrumb & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Computers & Electronics Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing <strong className="text-slate-800 tabular-nums">{products.length}</strong> of{' '}
            <strong className="text-slate-800 tabular-nums">{totalCount}</strong> products in stock
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 hidden sm:inline">Sort:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="featured">Featured & Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
              <option value="rating">Customer Rating</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="hidden sm:flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-100">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* SIDEBAR FILTERS (DESKTOP) */}
        <div className="hidden lg:block space-y-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Filter Hardware
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Search in results */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Search Keywords</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Product name, GPU, CPU..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Categories</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setPage(1);
                }}
                className={`w-full text-left px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.slug);
                    setPage(1);
                  }}
                  className={`w-full text-left px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === c.slug
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Brands</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setSelectedBrand('all');
                  setPage(1);
                }}
                className={`w-full text-left px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedBrand === 'all'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Brands
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedBrand(b.slug);
                    setPage(1);
                  }}
                  className={`w-full text-left px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedBrand === b.slug
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Price Range (BDT ৳)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ৳"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 tabular-nums"
              />
              <input
                type="number"
                placeholder="Max ৳"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 tabular-nums"
              />
            </div>
          </div>

          {/* Stock Availability */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Availability</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  setAvailability(availability === 'in-stock' ? 'all' : 'in-stock');
                  setPage(1);
                }}
                className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-colors ${
                  availability === 'in-stock'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                In Stock Only
              </button>
              <button
                onClick={() => {
                  setAvailability('all');
                  setPage(1);
                }}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors ${
                  availability === 'all'
                    ? 'bg-slate-100 border-slate-300 text-slate-900'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                Show All
              </button>
            </div>
          </div>

          {/* Specific Hardware Filters: Processor */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Processor Filter</label>
            <select
              value={processorFilter}
              onChange={(e) => {
                setProcessorFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 bg-white"
            >
              <option value="">Any Processor</option>
              <option value="Core Ultra">Intel Core Ultra</option>
              <option value="i7">Intel Core i7</option>
              <option value="i5">Intel Core i5</option>
              <option value="Ryzen 7">AMD Ryzen 7</option>
              <option value="M3">Apple Silicon M3</option>
            </select>
          </div>

          {/* RAM Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">RAM Capacity</label>
            <select
              value={ramFilter}
              onChange={(e) => {
                setRamFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 bg-white"
            >
              <option value="">Any Memory</option>
              <option value="16GB">16 GB</option>
              <option value="32GB">32 GB</option>
              <option value="64GB">64 GB</option>
            </select>
          </div>
        </div>

        {/* MAIN PRODUCT GRID / LIST */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 animate-pulse"
                >
                  <div className="aspect-[4/3] bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-6 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No products match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try loosening your filters, removing search terms, or checking for other computer hardware categories.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-3'
              }
            >
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onNavigate={onNavigate}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="text-xs font-semibold text-slate-700 tabular-nums">
                Page {page} of {totalPages}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div
            onClick={() => setIsFilterDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-white p-5 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="font-bold text-sm text-slate-900">Filter Hardware</span>
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Categories</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brands */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Brands</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2"
                  >
                    <option value="all">All Brands</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.slug}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price range */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Price Range (BDT)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min ৳"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="border border-slate-300 rounded-lg p-2 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Max ৳"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-2">
                <button
                  onClick={handleResetFilters}
                  className="py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
