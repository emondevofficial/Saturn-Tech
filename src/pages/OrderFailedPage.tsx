import React from 'react';
import { AlertCircle, RefreshCw, ShoppingCart, HelpCircle } from 'lucide-react';

interface OrderFailedPageProps {
  onNavigate: (path: string) => void;
}

export const OrderFailedPage: React.FC<OrderFailedPageProps> = ({ onNavigate }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const tranId = urlParams.get('tran_id');
  const errorMsg = urlParams.get('error') || 'The transaction was declined or interrupted.';

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
        <AlertCircle className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900">Payment Could Not Be Completed</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          We were unable to process your online payment with SSLCOMMERZ. No funds have been deducted from your account.
        </p>
      </div>

      {tranId && (
        <div className="p-3 bg-slate-100 rounded-xl text-xs font-mono text-slate-700 max-w-sm mx-auto">
          Transaction Reference: {tranId}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => onNavigate('/checkout')}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Try Again / Select Cash on Delivery
        </button>
        <button
          onClick={() => onNavigate('/cart')}
          className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" /> Return to Cart
        </button>
      </div>

      <div className="text-xs text-slate-500 pt-4 flex items-center justify-center gap-1">
        <HelpCircle className="w-4 h-4 text-slate-400" />
        Need assistance? Call our hotline: <strong className="text-slate-800">+880 1812-345678</strong>
      </div>
    </div>
  );
};
