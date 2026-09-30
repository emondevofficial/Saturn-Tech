import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  Scale,
  User as UserIcon,
  Menu,
  X,
  Phone,
  ShieldCheck,
  Truck,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Package,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { Category } from '../types';

interface HeaderProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPath }) => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { wishlist } = useWishlist();
  const { compareList } = useCompare();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCategories(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Search autocomplete suggestions
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        fetch(`/api/products/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setSuggestions(data.data || []);
              setShowSuggestions(true);
            }
          })
          .catch(() => {});
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      onNavigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Announcement Bar */}
      <div className="bg-[#0F172A] text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              Hotline: <strong className="text-white">+880 1812-345678</strong>
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Genuine Products with Official Warranty
            </span>
            <span className="hidden lg:inline text-slate-500">|</span>
            <span className="hidden lg:flex items-center gap-1 text-slate-300">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              Express Delivery Across Bangladesh
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <button
              onClick={() => onNavigate('/orders')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Track Order
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => onNavigate('/faq')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => onNavigate('/contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Store Location
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Open navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-950 flex items-center justify-center text-white shadow-md shadow-blue-950/20 group-hover:scale-105 transition-transform duration-200">
              {/* Custom Saturn tech planetary orbit mark */}
              <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="#2563EB" fillOpacity="0.2" />
                <ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(-25 12 12)" stroke="#60A5FA" strokeWidth="1.75" />
              </svg>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                SATURN <span className="text-blue-600">TECH</span> BD
              </div>
              <div className="text-[10px] uppercase font-semibold tracking-widest text-slate-600 mt-0.5">
                Bangladesh
              </div>
            </div>
          </button>
        </div>

        {/* Search Bar Zone */}
        <div ref={searchRef} className="hidden md:block flex-1 max-w-xl relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Search laptops, RTX GPUs, Intel/AMD CPUs, RAM, SSDs..."
              className="w-full pl-10 pr-24 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-600 absolute left-3.5 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in-50">
              <div className="p-2 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Product Matches
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setShowSuggestions(false);
                      setSearchQuery('');
                      onNavigate(`/products/${item.slug}`);
                    }}
                    className="w-full p-2.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-contain rounded bg-slate-100 p-0.5 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">{item.name}</div>
                      <div className="text-[11px] text-slate-600">
                        {item.brand} · {item.category}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-blue-600 tabular-nums">
                      ৳{item.price.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={handleSearchSubmit}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View all results for "{searchQuery}"
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls Zone */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile search toggle */}
          <button
            onClick={() => onNavigate('/search')}
            className="md:hidden p-2 text-slate-700 hover:text-blue-600 rounded-lg hover:bg-slate-100"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Product Comparison Link */}
          <button
            onClick={() => onNavigate('/compare')}
            className="hidden sm:flex relative p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Compare Products"
            aria-label="Compare Products"
          >
            <Scale className="w-5 h-5" />
            {compareList.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                {compareList.length}
              </span>
            )}
          </button>

          {/* Wishlist Link */}
          <button
            onClick={() => onNavigate('/wishlist')}
            className="relative p-2 text-slate-700 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative flex items-center gap-2 p-2 sm:px-3 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Shopping Cart"
            aria-label="Shopping Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white font-bold text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden lg:inline text-xs font-semibold text-slate-900">Cart</span>
          </button>

          {/* Account Button & Dropdown */}
          <div ref={accountRef} className="relative">
            {user ? (
              <button
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/login')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:text-white bg-slate-100 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Account Dropdown Menu */}
            {isAccountDropdownOpen && user && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                  <div className="text-[11px] text-slate-600 truncate">{user.email}</div>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                    {user.role}
                  </span>
                </div>

                <div className="py-1">
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsAccountDropdownOpen(false);
                        onNavigate('/admin');
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsAccountDropdownOpen(false);
                      onNavigate('/profile');
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    My Account
                  </button>
                  <button
                    onClick={() => {
                      setIsAccountDropdownOpen(false);
                      onNavigate('/orders');
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    My Orders
                  </button>
                  <button
                    onClick={() => {
                      setIsAccountDropdownOpen(false);
                      onNavigate('/wishlist');
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Saved Wishlist
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setIsAccountDropdownOpen(false);
                      logout();
                      onNavigate('/');
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories Navigation Bar */}
      <nav className="hidden md:block bg-slate-900 border-t border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onNavigate('/products')}
            className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentPath === '/products' ? 'text-blue-400 bg-slate-800' : 'text-slate-200 hover:text-white'
            }`}
          >
            All Products
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate(`/products?category=${cat.slug}`)}
              className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
                currentPath.includes(cat.slug) ? 'text-blue-400 bg-slate-800' : 'text-slate-300 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}

          <button
            onClick={() => onNavigate('/products?flashSale=true')}
            className="ml-auto px-3 py-2.5 text-xs font-bold text-amber-400 hover:text-amber-300 whitespace-nowrap flex items-center gap-1"
          >
            ⚡ Flash Deals
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[108px] bg-slate-950/60 backdrop-blur-xs z-50 animate-in fade-in-50">
          <div className="bg-white w-4/5 max-w-sm h-full overflow-y-auto p-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Explore Categories
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('/products');
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 rounded-lg"
                >
                  All Products
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate(`/products?category=${c.slug}`);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    {c.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('/products?flashSale=true');
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-bold text-amber-600 hover:bg-amber-50 rounded-lg"
                >
                  ⚡ Flash Deals
                </button>
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Customer Center
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('/orders');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Track Order
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('/compare');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Compare Products
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('/warranty');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Warranty Policy
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('/contact');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Contact & Support
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              {user ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                    onNavigate('/');
                  }}
                  className="w-full py-2.5 text-center text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg"
                >
                  Log Out ({user.name})
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate('/login');
                    }}
                    className="py-2 text-center text-xs font-semibold text-white bg-slate-900 rounded-lg"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate('/register');
                    }}
                    className="py-2 text-center text-xs font-semibold text-slate-900 bg-slate-100 rounded-lg"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
