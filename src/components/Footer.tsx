import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#0F172A] text-slate-400 text-sm border-t border-slate-800">
      {/* Value Proposition Highlights Banner */}
      <div className="border-b border-slate-800 py-8 px-4 bg-slate-950/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">100% Genuine Products</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Brand new products sourced directly with official Bangladesh warranty.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Fast & Safe Delivery</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Same-day delivery in Chattogram and 24-48 hr nationwide shipping.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Secure Payment Gateway</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Cash on Delivery or SSLCOMMERZ with bKash, Nagad & Cards.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Dedicated Tech Support</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Expert hardware diagnostics, PC assembly & warranty support.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand & Store Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center text-white border border-blue-500/30">
              <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="#2563EB" fillOpacity="0.2" />
                <ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(-25 12 12)" stroke="#60A5FA" strokeWidth="1.75" />
              </svg>
            </div>
            <div className="text-lg font-bold text-white tracking-tight">
              SATURN <span className="text-blue-500">TECH</span> BD
            </div>
          </div>

          <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
            Saturn Tech BD is a premier computer hardware and electronics retailer in Bangladesh.
            We provide official laptops, gaming PCs, custom builds, components, monitors, and peripherals with reliable warranty and unmatched post-sales service.
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Shop #402, 4th Floor, Computer City Centre, GEC Circle, Chattogram, Bangladesh</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>+880 1812-345678, +880 1888-999000</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>support@saturntechbd.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400 shrink-0" />
              <span>10:00 AM – 9:00 PM (Everyday except Friday morning)</span>
            </div>
          </div>

          {/* Social connection */}
          <div className="pt-2">
            <a
              href="https://www.facebook.com/saturntechbd"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Follow Facebook Page
            </a>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <div className="text-white font-semibold text-xs uppercase tracking-wider">
            Popular Categories
          </div>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => onNavigate('/products?category=laptops')}
                className="hover:text-white transition-colors"
              >
                Gaming & Work Laptops
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/products?category=pc-components')}
                className="hover:text-white transition-colors"
              >
                Processors & GPUs
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/products?category=monitors')}
                className="hover:text-white transition-colors"
              >
                Gaming & High-Res Monitors
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/products?category=desktops')}
                className="hover:text-white transition-colors"
              >
                Custom PC Builds
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/products?category=accessories')}
                className="hover:text-white transition-colors"
              >
                Mechanical Keyboards & Mice
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/products?category=networking')}
                className="hover:text-white transition-colors"
              >
                Gigabit & Wi-Fi 6 Routers
              </button>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <div className="text-white font-semibold text-xs uppercase tracking-wider">
            Customer Services
          </div>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('/orders')} className="hover:text-white transition-colors">
                Track Your Order
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/compare')} className="hover:text-white transition-colors">
                Product Comparison
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/warranty')} className="hover:text-white transition-colors">
                Warranty Policy & Claim
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/return-policy')} className="hover:text-white transition-colors">
                Return & Replacement
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/shipping-policy')} className="hover:text-white transition-colors">
                Shipping & Delivery Fees
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/faq')} className="hover:text-white transition-colors">
                Help & Frequently Asked
              </button>
            </li>
          </ul>
        </div>

        {/* About & Corporate */}
        <div className="space-y-3">
          <div className="text-white font-semibold text-xs uppercase tracking-wider">
            Company
          </div>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors">
                About Saturn Tech BD
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors">
                Contact & Showroom
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/privacy-policy')} className="hover:text-white transition-colors">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors">
                Terms & Conditions
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/login')} className="hover:text-white transition-colors">
                Customer Login / Register
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/admin')} className="text-slate-500 hover:text-slate-300 transition-colors">
                Staff Portal
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar: Payment Logos & Copyright */}
      <div className="border-t border-slate-800/80 py-6 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 text-center md:text-left">
            © {new Date().getFullYear()} <strong className="text-slate-300">Saturn Tech BD</strong>. All rights reserved.
            Official computer and electronics retailer in Bangladesh.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <span className="text-slate-500">Official Gateway:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">SSLCOMMERZ</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-pink-400 border border-slate-700">bKash</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-orange-400 border border-slate-700">Nagad</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-400 border border-slate-700">Rocket</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">Visa / Master</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">COD Available</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
