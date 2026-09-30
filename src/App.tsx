import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrderFailedPage } from './pages/OrderFailedPage';
import { OrdersPage } from './pages/OrdersPage';
import { WishlistPage } from './pages/WishlistPage';
import { ComparePage } from './pages/ComparePage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { StaticPages } from './pages/StaticPages';
import { PaymentSandboxPage } from './pages/PaymentSandboxPage';
import { AdminPortal } from './admin/AdminPortal';
import { Product } from './types';

function AppContent() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname + window.location.search);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { user, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pathname = currentPath.split('?')[0];
  const searchParams = new URLSearchParams(currentPath.includes('?') ? currentPath.split('?')[1] : '');

  // Render Admin Portal
  if (pathname.startsWith('/admin')) {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xs">
          Loading Administrative Suite...
        </div>
      );
    }
    if (!user || !isAdmin) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 text-white">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center mx-auto">
              🔒
            </div>
            <h2 className="text-xl font-bold">Admin Authorization Required</h2>
            <p className="text-xs text-slate-400">
              You must be logged in as an administrator to access the Saturn Tech BD management console.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => handleNavigate('/login')}
                className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Sign In with Admin Account
              </button>
              <button
                onClick={() => handleNavigate('/')}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
              >
                Return to Storefront
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <AdminPortal onNavigateHome={() => handleNavigate('/')} />;
  }

  // Render SSLCOMMERZ Sandbox Gateway Simulator
  if (pathname.startsWith('/payment-gateway-sandbox')) {
    return <PaymentSandboxPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header onNavigate={handleNavigate} currentPath={pathname} />

      <main className="flex-1">
        {/* Route: Homepage */}
        {pathname === '/' && (
          <HomePage
            onNavigate={handleNavigate}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        )}

        {/* Route: Products Catalog & Search */}
        {(pathname === '/products' || pathname === '/search' || pathname === '/categories' || pathname === '/brands') && (
          <ProductsPage
            onNavigate={handleNavigate}
            onQuickView={(p) => setQuickViewProduct(p)}
            initialCategory={searchParams.get('category') || undefined}
            initialBrand={searchParams.get('brand') || undefined}
            initialSearch={searchParams.get('q') || undefined}
          />
        )}

        {/* Route: Product Details */}
        {pathname.startsWith('/products/') && (
          <ProductDetailsPage
            slug={pathname.replace('/products/', '')}
            onNavigate={handleNavigate}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        )}

        {/* Route: Cart */}
        {pathname === '/cart' && <CartPage onNavigate={handleNavigate} />}

        {/* Route: Checkout */}
        {pathname === '/checkout' && <CheckoutPage onNavigate={handleNavigate} />}

        {/* Route: Order Success */}
        {pathname === '/order-success' && <OrderSuccessPage onNavigate={handleNavigate} />}

        {/* Route: Order Failed */}
        {pathname === '/order-failed' && <OrderFailedPage onNavigate={handleNavigate} />}

        {/* Route: Orders & Order Tracking */}
        {pathname === '/orders' && <OrdersPage onNavigate={handleNavigate} />}

        {/* Route: Wishlist */}
        {pathname === '/wishlist' && <WishlistPage onNavigate={handleNavigate} />}

        {/* Route: Compare */}
        {pathname === '/compare' && <ComparePage onNavigate={handleNavigate} />}

        {/* Route: Profile */}
        {(pathname === '/profile' || pathname === '/profile/edit') && (
          <ProfilePage onNavigate={handleNavigate} />
        )}

        {/* Route: Login & Register */}
        {pathname === '/login' && <LoginPage onNavigate={handleNavigate} />}
        {pathname === '/register' && <RegisterPage onNavigate={handleNavigate} />}
        {pathname === '/forgot-password' && <ForgotPasswordPage onNavigate={handleNavigate} />}

        {/* Routes: Policy & Information Pages */}
        {pathname === '/about' && <StaticPages type="about" onNavigate={handleNavigate} />}
        {pathname === '/contact' && <StaticPages type="contact" onNavigate={handleNavigate} />}
        {pathname === '/warranty' && <StaticPages type="warranty" onNavigate={handleNavigate} />}
        {pathname === '/shipping-policy' && <StaticPages type="shipping" onNavigate={handleNavigate} />}
        {pathname === '/return-policy' && <StaticPages type="return" onNavigate={handleNavigate} />}
        {pathname === '/privacy-policy' && <StaticPages type="privacy" onNavigate={handleNavigate} />}
        {pathname === '/terms' && <StaticPages type="terms" onNavigate={handleNavigate} />}
        {pathname === '/faq' && <StaticPages type="faq" onNavigate={handleNavigate} />}
      </main>

      <Footer onNavigate={handleNavigate} />
      <CartDrawer onNavigate={handleNavigate} />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              <AppContent />
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
