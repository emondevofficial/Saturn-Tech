import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface CartPageProps {
  onNavigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    grandTotal,
    appliedCoupon,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { user } = useAuth();

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [shippingType, setShippingType] = useState<'inside' | 'outside' | 'pickup'>('inside');

  // Shipping calculation
  const freeThreshold = 50000;
  const isFreeDelivery = subtotal >= freeThreshold;
  const shippingCost =
    shippingType === 'pickup' || isFreeDelivery
      ? 0
      : shippingType === 'inside'
      ? 70
      : 130;

  const finalPayable = Math.max(0, grandTotal + shippingCost);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponInput.trim(), user?.id);
    setIsApplyingCoupon(false);
    setCouponInput('');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your Shopping Cart is Empty</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Discover high-performance laptops, custom PC components, and gaming accessories ready for express delivery in Bangladesh.
        </p>
        <button
          onClick={() => onNavigate('/products')}
          className="mt-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
        >
          Explore Computer Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your chosen hardware and proceed to secure checkout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart items table (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="hidden sm:grid sm:grid-cols-12 text-xs font-bold uppercase tracking-wider text-slate-600 pb-3 border-b border-slate-100">
            <span className="col-span-6">Product Item</span>
            <span className="col-span-2 text-center">Unit Price</span>
            <span className="col-span-2 text-center">Quantity</span>
            <span className="col-span-2 text-right">Subtotal</span>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="py-4 flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-4"
              >
                {/* Product details */}
                <div className="sm:col-span-6 flex items-center gap-3 w-full">
                  <img
                    src={item.product.images[0] || '/src/assets/images/hero_laptop_showcase_1790771906222.jpg'}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-contain rounded-xl border border-slate-200 p-1 bg-slate-50 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onNavigate(`/products/${item.product.slug}`)}
                      className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-blue-600 text-left line-clamp-2"
                    >
                      {item.product.name}
                    </button>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {item.product.brand} · Warranty: {item.product.warranty}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>

                {/* Unit Price */}
                <div className="sm:col-span-2 sm:text-center text-xs font-semibold text-slate-700 tabular-nums">
                  <span className="sm:hidden text-slate-600 mr-1">Unit: </span>
                  ৳{item.product.salePrice.toLocaleString()}
                </div>

                {/* Quantity Controls */}
                <div className="sm:col-span-2 sm:flex sm:justify-center">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="sm:col-span-2 sm:text-right font-extrabold text-sm text-slate-900 tabular-nums">
                  <span className="sm:hidden text-slate-600 mr-1">Total: </span>
                  ৳{(item.product.salePrice * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('/products')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              ← Continue Shopping
            </button>
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-slate-600 hover:text-rose-600"
            >
              Empty Cart
            </button>
          </div>
        </div>

        {/* Order Summary & Coupon (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
              <Tag className="w-4 h-4 text-blue-600" /> Apply Promo Coupon
            </div>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-800">{appliedCoupon.code}</span>
                  <div className="text-[11px] text-emerald-600">
                    ৳{appliedCoupon.discount.toLocaleString()} discount applied
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-rose-600 hover:text-rose-800 font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SATURN1000 or TECH5"
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  disabled={isApplyingCoupon}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl disabled:opacity-50"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {/* Shipping Estimation */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
              <Truck className="w-4 h-4 text-emerald-600" /> Shipping Destination
            </div>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingType === 'inside'}
                  onChange={() => setShippingType('inside')}
                  className="text-blue-600"
                />
                <span className="flex-1 font-medium text-slate-800">Inside Chattogram City</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {isFreeDelivery ? 'FREE' : '৳70'}
                </span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingType === 'outside'}
                  onChange={() => setShippingType('outside')}
                  className="text-blue-600"
                />
                <span className="flex-1 font-medium text-slate-800">Outside Chattogram (Nationwide)</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {isFreeDelivery ? 'FREE' : '৳130'}
                </span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="shipping"
                  checked={shippingType === 'pickup'}
                  onChange={() => setShippingType('pickup')}
                  className="text-blue-600"
                />
                <span className="flex-1 font-medium text-slate-800">Store Pickup (GEC Circle)</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </label>
            </div>

            {subtotal < freeThreshold && (
              <div className="text-[11px] text-blue-600 bg-blue-50 p-2.5 rounded-xl">
                Add ৳{(freeThreshold - subtotal).toLocaleString()} more to your cart to qualify for free nationwide delivery!
              </div>
            )}
          </div>

          {/* Cost Summary Breakdown */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Order Summary</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Cart Subtotal</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span className="tabular-nums">-৳{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {shippingCost === 0 ? 'FREE' : `৳${shippingCost}`}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Payable</span>
                <span className="text-2xl font-extrabold text-blue-600 tabular-nums">
                  ৳{finalPayable.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/checkout')}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-colors cursor-pointer"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-[11px] text-slate-400 text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Secure Checkout with SSLCOMMERZ or Cash on Delivery
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
