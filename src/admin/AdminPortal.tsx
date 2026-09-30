import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Users,
  Tag,
  Star,
  Image as ImageIcon,
  HelpCircle,
  FileBarChart,
  Settings,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Copy,
  Edit,
  Printer,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Layers,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
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
  OrderStatus,
  PaymentStatus,
} from '../types';

interface AdminPortalProps {
  onNavigateHome: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onNavigateHome }) => {
  const { user, token, logout } = useAuth();
  const { success, error, showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'products'
    | 'orders'
    | 'inventory'
    | 'categories'
    | 'brands'
    | 'customers'
    | 'coupons'
    | 'reviews'
    | 'banners'
    | 'faqs'
    | 'reports'
    | 'settings'
  >('dashboard');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Data states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventoryData, setInventoryData] = useState<{
    summary: any;
    products: Product[];
    transactions: InventoryTransaction[];
  } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isStockAdjustModalOpen, setIsStockAdjustModalOpen] = useState(false);
  const [adjustTargetProduct, setAdjustTargetProduct] = useState<Product | null>(null);
  const [stockChangeQty, setStockChangeQty] = useState(0);
  const [stockAdjustType, setStockAdjustType] = useState<'PURCHASE' | 'ADJUSTMENT' | 'RETURN'>('PURCHASE');
  const [stockAdjustReason, setStockAdjustReason] = useState('New stock shipment arrived');

  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('CONFIRMED');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('PAID');
  const [internalOrderNote, setInternalOrderNote] = useState('');

  // Fetch data on activeTab switch
  useEffect(() => {
    if (!token) return;
    setIsLoading(true);

    const headers = { Authorization: `Bearer ${token}` };

    if (activeTab === 'dashboard') {
      fetch('/api/admin/dashboard', { headers })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setDashboardData(d.data);
        })
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'products') {
      Promise.all([
        fetch('/api/admin/products', { headers }).then((r) => r.json()),
        fetch('/api/admin/categories', { headers }).then((r) => r.json()),
        fetch('/api/admin/brands', { headers }).then((r) => r.json()),
      ])
        .then(([prodRes, catRes, brandRes]) => {
          if (prodRes.success) setProducts(prodRes.data || []);
          if (catRes.success) setCategories(catRes.data || []);
          if (brandRes.success) setBrands(brandRes.data || []);
        })
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'orders') {
      fetch('/api/admin/orders', { headers })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setOrders(d.data || []);
        })
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'inventory') {
      fetch('/api/admin/inventory', { headers })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setInventoryData(d.data);
        })
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'categories') {
      fetch('/api/admin/categories', { headers })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setCategories(d.data || []);
        })
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'brands') {
      fetch('/api/admin/brands', { headers })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setBrands(d.data || []);
        })
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'customers') {
      fetch('/api/admin/customers', { headers })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setCustomers(d.data || []);
        })
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'coupons') {
      fetch('/api/admin/coupons', { headers })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setCoupons(d.data || []);
        })
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'reviews') {
      fetch('/api/admin/reviews', { headers })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setReviews(d.data || []);
        })
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'banners') {
      fetch('/api/admin/banners', { headers })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setBanners(d.data || []);
        })
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'faqs') {
      fetch('/api/admin/faqs', { headers })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setFaqs(d.data || []);
        })
        .finally(() => setIsLoading(false));
    } else if (activeTab === 'settings') {
      fetch('/api/admin/settings', { headers })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setSettings(d.data);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [activeTab, token]);

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'];

  // Handle Stock Adjustment
  const handleConfirmStockAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTargetProduct) return;

    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: adjustTargetProduct.id,
          change: Number(stockChangeQty),
          type: stockAdjustType,
          reason: stockAdjustReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        success('Stock adjustment saved.');
        setIsStockAdjustModalOpen(false);
        // Refresh inventory
        const invRes = await fetch('/api/admin/inventory', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const invData = await invRes.json();
        if (invData.success) setInventoryData(invData.data);
      } else {
        error(data.message || 'Stock adjustment failed');
      }
    } catch {
      error('Failed to submit stock adjustment');
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForStatus) return;

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrderForStatus.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderStatus: newOrderStatus,
          paymentStatus: newPaymentStatus,
          internalNotes: internalOrderNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        success('Order updated successfully');
        setSelectedOrderForStatus(null);
        // refresh orders
        const ordRes = await fetch('/api/admin/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ordData = await ordRes.json();
        if (ordData.success) setOrders(ordData.data);
      }
    } catch {
      error('Failed to update order');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-[#0F172A] text-slate-300 transition-all duration-300 shrink-0 flex flex-col justify-between border-r border-slate-800 no-print`}
      >
        <div className="p-4 space-y-6">
          {/* Logo brand lockup */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="#2563EB" />
                  <ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(-25 12 12)" stroke="#93C5FD" strokeWidth="1.75" />
                </svg>
              </div>
              {isSidebarOpen && (
                <div>
                  <div className="text-sm font-bold text-white tracking-tight">SATURN ADMIN</div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Management Suite</div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hidden md:block"
            >
              {isSidebarOpen ? '«' : '»'}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'orders', label: 'Orders & Sales', icon: ShoppingCart },
              { id: 'products', label: 'Products Catalog', icon: Package },
              { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
              { id: 'categories', label: 'Categories', icon: Layers },
              { id: 'brands', label: 'Brands', icon: ShieldCheck },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
              { id: 'reviews', label: 'Reviews Moderation', icon: Star },
              { id: 'banners', label: 'Store Banners', icon: ImageIcon },
              { id: 'faqs', label: 'FAQs Management', icon: HelpCircle },
              { id: 'reports', label: 'Reports & Export', icon: FileBarChart },
              { id: 'settings', label: 'Store Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Storefront Jump */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {isSidebarOpen && (
            <div className="text-xs">
              <div className="font-bold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-emerald-400 font-semibold">System Administrator</div>
            </div>
          )}

          <button
            onClick={onNavigateHome}
            className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            {isSidebarOpen && 'View Storefront'}
          </button>

          <button
            onClick={() => {
              logout();
              onNavigateHome();
            }}
            className="w-full py-2 px-3 text-xs font-semibold rounded-xl text-rose-400 hover:bg-rose-950/40 flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            {isSidebarOpen && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 overflow-y-auto max-h-screen">
        {/* Top bar header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6 no-print">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 capitalize">
              {activeTab === 'dashboard' ? 'Overview Analytics' : `${activeTab} Management`}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Saturn Tech BD Operational Control Console
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'products' && (
              <button
                onClick={() => {
                  setEditingProduct({
                    name: '',
                    brand: 'ASUS',
                    brandSlug: 'asus',
                    category: 'Laptops',
                    categorySlug: 'laptops',
                    regularPrice: 0,
                    salePrice: 0,
                    stock: 5,
                    lowStockThreshold: 2,
                    status: 'PUBLISHED',
                    warranty: '2 Years Official Warranty',
                    condition: 'Official Warranty',
                    description: '',
                    shortDescription: '',
                    specifications: [],
                    images: ['/src/assets/images/hero_laptop_showcase_1790771906222.jpg'],
                  });
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            )}

            {activeTab === 'inventory' && (
              <button
                onClick={() => {
                  if (inventoryData?.products && inventoryData.products.length > 0) {
                    setAdjustTargetProduct(inventoryData.products[0]);
                    setStockChangeQty(1);
                    setIsStockAdjustModalOpen(true);
                  }
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Boxes className="w-4 h-4" /> Record Stock Entry
              </button>
            )}

            {activeTab === 'reports' && (
              <a
                href="/api/admin/reports/export-csv"
                download
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" /> Export CSV Report
              </a>
            )}
          </div>
        </div>

        {/* 1. DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && dashboardData && (
          <div className="space-y-6">
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
                <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                  <span>Total Sales Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  ৳{dashboardData.summary.totalSales.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold">
                  Today: ৳{dashboardData.summary.todaySales.toLocaleString()}
                </div>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
                <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                  <span>Total Orders Placed</span>
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {dashboardData.summary.totalOrders}
                </div>
                <div className="text-[11px] text-slate-500">
                  {dashboardData.summary.pendingOrders} pending · {dashboardData.summary.completedOrders} completed
                </div>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
                <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                  <span>Hardware Products</span>
                  <Package className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {dashboardData.summary.totalProducts}
                </div>
                <div className="text-[11px] text-amber-600 font-semibold">
                  {dashboardData.summary.lowStockProducts} low stock warnings
                </div>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
                <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                  <span>Registered Customers</span>
                  <Users className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {dashboardData.summary.totalCustomers}
                </div>
                <div className="text-[11px] text-slate-500">Active accounts</div>
              </div>
            </div>

            {/* Recharts Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 7-Day Revenue Trend (8 cols) */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">7-Day Revenue Trend</h3>
                    <p className="text-[11px] text-slate-500">Daily sales volume in BDT</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardData.charts.salesTrend}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" fontSize={11} stroke="#94A3B8" />
                      <YAxis
                        fontSize={11}
                        stroke="#94A3B8"
                        tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#2563EB"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#salesGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Payment Methods Distribution (4 cols) */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Payment Breakdown</h3>
                  <p className="text-[11px] text-slate-500">COD vs SSLCOMMERZ Online</p>
                </div>

                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.charts.paymentMethods}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {dashboardData.charts.paymentMethods.map((_: any, idx: number) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> COD
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> SSLCOMMERZ
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Orders List */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Recent Customer Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-2.5">Order ID</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Method</th>
                      <th className="py-2.5">Total</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dashboardData.recentOrders.map((ord: Order) => (
                      <tr key={ord.id}>
                        <td className="py-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                        <td className="py-3 text-slate-800">{ord.customerName}</td>
                        <td className="py-3 text-slate-600">{ord.paymentMethod}</td>
                        <td className="py-3 font-bold text-slate-900 tabular-nums">
                          ৳{ord.grandTotal.toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setSelectedOrderForInvoice(ord)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="font-bold text-sm text-slate-900">
                Products Table ({products.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-3">Image</th>
                    <th className="py-3">Product Name & SKU</th>
                    <th className="py-3">Category</th>
                    <th className="py-3">Sale Price</th>
                    <th className="py-3">Stock</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5">
                        <img
                          src={prod.images[0] || '/src/assets/images/hero_laptop_showcase_1790771906222.jpg'}
                          alt=""
                          className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-white p-0.5"
                        />
                      </td>
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-900 line-clamp-1">{prod.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {prod.sku} · {prod.brand}
                        </div>
                      </td>
                      <td className="py-2.5 text-slate-700">{prod.category}</td>
                      <td className="py-2.5 font-bold text-slate-900 tabular-nums">
                        ৳{prod.salePrice.toLocaleString()}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`font-semibold tabular-nums ${
                            prod.stock <= prod.lowStockThreshold
                              ? 'text-rose-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {prod.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setAdjustTargetProduct(prod);
                            setStockChangeQty(1);
                            setIsStockAdjustModalOpen(true);
                          }}
                          className="text-emerald-600 hover:text-emerald-700 font-semibold"
                          title="Adjust stock"
                        >
                          Stock
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setIsProductModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 font-semibold"
                          title="Edit"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-slate-900">
                All Orders ({orders.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-3">Order Number</th>
                    <th className="py-3">Date</th>
                    <th className="py-3">Customer & Phone</th>
                    <th className="py-3">Items</th>
                    <th className="py-3">Total (BDT)</th>
                    <th className="py-3">Payment</th>
                    <th className="py-3">Order Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                      <td className="py-3 text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <div className="font-semibold text-slate-900">{ord.customerName}</div>
                        <div className="text-[11px] text-slate-500">{ord.customerPhone}</div>
                      </td>
                      <td className="py-3 text-slate-700">{ord.items.length} items</td>
                      <td className="py-3 font-bold text-slate-900 tabular-nums">
                        ৳{ord.grandTotal.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className="font-semibold text-slate-700">{ord.paymentMethod}</span>
                        <div className="text-[10px] text-slate-500 uppercase">{ord.paymentStatus}</div>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrderForStatus(ord);
                            setNewOrderStatus(ord.orderStatus);
                            setNewPaymentStatus(ord.paymentStatus);
                            setInternalOrderNote(ord.internalNotes || '');
                          }}
                          className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Status
                        </button>
                        <button
                          onClick={() => setSelectedOrderForInvoice(ord)}
                          className="text-slate-700 hover:text-slate-900 font-semibold"
                        >
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && inventoryData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white border border-slate-200 rounded-2xl">
                <span className="text-xs text-slate-500">Total Stocked Units</span>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {inventoryData.summary.totalUnits}
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-2xl">
                <span className="text-xs text-slate-500">Inventory Valuation</span>
                <div className="text-2xl font-extrabold text-blue-600 tabular-nums">
                  ৳{inventoryData.summary.totalValuation.toLocaleString()}
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-200 rounded-2xl">
                <span className="text-xs text-slate-500">Low Stock Alerts</span>
                <div className="text-2xl font-extrabold text-rose-600 tabular-nums">
                  {inventoryData.summary.lowStockCount} items
                </div>
              </div>
            </div>

            {/* Inventory audit movement transactions */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Recent Inventory Movement Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Product & SKU</th>
                      <th className="py-2.5">Movement Type</th>
                      <th className="py-2.5">Quantity Change</th>
                      <th className="py-2.5">New Stock</th>
                      <th className="py-2.5">Reason & Handler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventoryData.transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="py-2.5 text-slate-500">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 font-semibold text-slate-900">
                          {tx.productName} ({tx.sku})
                        </td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2.5 font-bold tabular-nums">
                          {tx.quantityChange > 0 ? (
                            <span className="text-emerald-600">+{tx.quantityChange}</span>
                          ) : (
                            <span className="text-rose-600">{tx.quantityChange}</span>
                          )}
                        </td>
                        <td className="py-2.5 font-bold tabular-nums text-slate-900">
                          {tx.newStock}
                        </td>
                        <td className="py-2.5 text-slate-600">
                          {tx.reason} <span className="text-[10px] text-slate-400">({tx.performedBy})</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. COUPONS MANAGEMENT */}
        {activeTab === 'coupons' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Promotional Coupons</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-3">Code</th>
                    <th className="py-3">Discount</th>
                    <th className="py-3">Min Order</th>
                    <th className="py-3">Usage</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 font-mono font-bold text-blue-600">{c.code}</td>
                      <td className="py-3 font-semibold text-slate-800">
                        {c.type === 'PERCENTAGE' ? `${c.discountValue}%` : `৳${c.discountValue}`}
                      </td>
                      <td className="py-3 tabular-nums">৳{c.minOrder.toLocaleString()}</td>
                      <td className="py-3 tabular-nums text-slate-600">
                        {c.usedCount} / {c.usageLimit}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. SETTINGS */}
        {activeTab === 'settings' && settings && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 max-w-2xl">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Saturn Tech BD Store Configurations
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Store Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Physical Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Delivery Charge: Inside Chattogram (BDT)</label>
                  <input
                    type="number"
                    value={settings.shippingInsideChattogram}
                    onChange={(e) => setSettings({ ...settings, shippingInsideChattogram: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl tabular-nums"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Delivery Charge: Outside Chattogram (BDT)</label>
                  <input
                    type="number"
                    value={settings.shippingOutsideChattogram}
                    onChange={(e) => setSettings({ ...settings, shippingOutsideChattogram: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Free Delivery Threshold (BDT)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl tabular-nums"
                />
              </div>

              <button
                onClick={async () => {
                  const res = await fetch('/api/admin/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(settings),
                  });
                  if (res.ok) success('Store settings updated.');
                }}
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* STOCK ADJUSTMENT MODAL */}
      {isStockAdjustModalOpen && adjustTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">Record Stock Adjustment</h3>
              <button
                onClick={() => setIsStockAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Product: <strong className="text-slate-900">{adjustTargetProduct.name}</strong>
              <div className="text-slate-500 font-mono mt-0.5">Current Stock: {adjustTargetProduct.stock} units</div>
            </div>

            <form onSubmit={handleConfirmStockAdjust} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Adjustment Type</label>
                <select
                  value={stockAdjustType}
                  onChange={(e) => setStockAdjustType(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="PURCHASE">PURCHASE (New distributor stock arrived)</option>
                  <option value="ADJUSTMENT">ADJUSTMENT (Audit count discrepancy)</option>
                  <option value="RETURN">RETURN (Customer RMA return)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Quantity Change (+ to add, - to subtract)
                </label>
                <input
                  type="number"
                  required
                  value={stockChangeQty}
                  onChange={(e) => setStockChangeQty(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-xl tabular-nums"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason for Adjustment</label>
                <input
                  type="text"
                  required
                  value={stockAdjustReason}
                  onChange={(e) => setStockAdjustReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockAdjustModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER STATUS MODAL */}
      {selectedOrderForStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">
                Update Order #{selectedOrderForStatus.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrderForStatus(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrderStatus} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Order Status</label>
                <select
                  value={newOrderStatus}
                  onChange={(e) => setNewOrderStatus(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="RETURNED">RETURNED</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="FAILED">FAILED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={internalOrderNote}
                  onChange={(e) => setInternalOrderNote(e.target.value)}
                  placeholder="e.g. Verified via phone, courier tracking tracking ID #9988..."
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForStatus(null)}
                  className="px-4 py-2 border rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE MODAL */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 no-print">
              <span className="font-bold text-sm text-slate-900">
                Official Serialized Tax Invoice
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setSelectedOrderForInvoice(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                <div>
                  <div className="text-xl font-black text-slate-900">
                    SATURN <span className="text-blue-600">TECH</span> BD
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Shop #402, 4th Floor, Computer City Centre, GEC Circle, Chattogram
                  </div>
                  <div className="text-slate-500">Hotline: +880 1812-345678</div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-sm text-slate-900">
                    Invoice #{selectedOrderForInvoice.orderNumber}
                  </div>
                  <div className="text-slate-500">
                    Date: {new Date(selectedOrderForInvoice.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-slate-700 font-bold uppercase mt-1">
                    {selectedOrderForInvoice.paymentStatus} via {selectedOrderForInvoice.paymentMethod}
                  </div>
                </div>
              </div>

              {/* Customer and Delivery info */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-900">Customer Details:</span>
                <p className="font-semibold text-slate-800">{selectedOrderForInvoice.customerName}</p>
                <p className="text-slate-600">Phone: {selectedOrderForInvoice.customerPhone}</p>
                <p className="text-slate-600">
                  Address: {selectedOrderForInvoice.deliveryAddress.address},{' '}
                  {selectedOrderForInvoice.deliveryAddress.area},{' '}
                  {selectedOrderForInvoice.deliveryAddress.district}
                </p>
              </div>

              {/* Items */}
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2">Item</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrderForInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2">
                        <div className="font-semibold text-slate-900">{it.productName}</div>
                        <div className="text-[10px] text-slate-500">
                          SKU: {it.sku} · Warranty: {it.warranty}
                        </div>
                      </td>
                      <td className="py-2 text-center tabular-nums">{it.quantity}</td>
                      <td className="py-2 text-right tabular-nums">৳{it.unitPrice.toLocaleString()}</td>
                      <td className="py-2 text-right font-bold tabular-nums">
                        ৳{it.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-3 border-t border-slate-200 text-right space-y-1">
                <div>Subtotal: ৳{selectedOrderForInvoice.subtotal.toLocaleString()}</div>
                <div>Delivery Charge: ৳{selectedOrderForInvoice.shippingCost.toLocaleString()}</div>
                <div className="text-base font-extrabold text-blue-600">
                  Grand Total: ৳{selectedOrderForInvoice.grandTotal.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
