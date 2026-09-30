import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PaymentMethod } from '../types';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { items, subtotal, discount, grandTotal, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const { error, success } = useToast();

  // Customer & Delivery Address Form
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const [division, setDivision] = useState(defaultAddr?.division || 'Chattogram');
  const [district, setDistrict] = useState(defaultAddr?.district || 'Chattogram');
  const [area, setArea] = useState(defaultAddr?.area || 'GEC Circle');
  const [address, setAddress] = useState(defaultAddr?.address || '');
  const [postalCode, setPostalCode] = useState(defaultAddr?.postalCode || '4000');
  const [notes, setNotes] = useState('');

  // Shipping & Payment selection
  const [shippingMethod, setShippingMethod] = useState<
    'Inside Chattogram' | 'Outside Chattogram' | 'Store Pickup'
  >('Inside Chattogram');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if user logs in during checkout
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Dynamic shipping cost
  const freeThreshold = 50000;
  const isFreeDelivery = subtotal >= freeThreshold;
  const shippingCost =
    shippingMethod === 'Store Pickup' || isFreeDelivery
      ? 0
      : shippingMethod === 'Inside Chattogram'
      ? 70
      : 130;

  const finalPayable = Math.max(0, grandTotal + shippingCost);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">
          Please add computer hardware or laptops before proceeding to checkout.
        </p>
        <button
          onClick={() => onNavigate('/products')}
          className="px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl"
        >
          View Products
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !address.trim()) {
      error('Please complete your name, phone number, and detailed delivery address.');
      return;
    }

    if (customerPhone.replace(/[^0-9]/g, '').length < 11) {
      error('Please provide a valid 11-digit Bangladeshi phone number (e.g. 01812345678).');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: {
          id: `addr-${Date.now()}`,
          fullName: customerName.trim(),
          phone: customerPhone.trim(),
          division,
          district,
          area,
          address: address.trim(),
          postalCode,
        },
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        couponCode: appliedCoupon?.code,
        shippingMethod,
        paymentMethod,
        notes: notes.trim(),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { Authorization: `Bearer ${localStorage.getItem('saturn_token')}` } : {}),
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!data.success) {
        error(data.message || 'Failed to place order.');
        setIsSubmitting(false);
        return;
      }

      // Order created successfully!
      clearCart();

      // If COD: Navigate straight to Order Success page
      if (paymentMethod === 'COD') {
        success('Order placed successfully with Cash on Delivery!');
        onNavigate(`/order-success?id=${data.data.order.id}&order_number=${data.data.order.orderNumber}`);
        return;
      }

      // If SSLCOMMERZ: Redirect to payment gateway URL or internal sandbox gateway simulator
      if (paymentMethod === 'SSLCOMMERZ' && data.data.paymentGatewayUrl) {
        success('Order initiated! Redirecting to secure SSLCOMMERZ gateway...');
        window.location.href = data.data.paymentGatewayUrl;
      }
    } catch (err) {
      error('Server connection error. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete your delivery details and choose your preferred payment option
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Customer Details, Address & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Customer Info */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-bold text-slate-900">Customer Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tanvir Chowdhury"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Phone Number (For Delivery SMS) *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01812345678"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 tabular-nums"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Email Address (For Invoice PDF)</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Delivery Address */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold text-slate-900">Delivery Address in Bangladesh</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Division *</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="Chattogram">Chattogram</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Barishal">Barishal</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">District / City *</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Chattogram / Dhaka / etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Thana / Area *</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="GEC Circle, Nasirabad, Agrabad..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="4000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl tabular-nums"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Detailed Street Address *</label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House number, road number, apartment floor/block..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Order Delivery Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call before delivery, assemble PC, leave at security desk"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Shipping Method Selection */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h2 className="text-sm font-bold text-slate-900">Choose Shipping Method</h2>
            </div>

            <div className="space-y-2.5 text-xs">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  shippingMethod === 'Inside Chattogram'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={shippingMethod === 'Inside Chattogram'}
                  onChange={() => setShippingMethod('Inside Chattogram')}
                  className="mt-0.5 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Inside Chattogram Express</span>
                    <span className="font-extrabold text-slate-900 tabular-nums">
                      {isFreeDelivery ? 'FREE' : '৳70'}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5 text-[11px]">
                    Delivery within 12-24 hours across Chattogram metropolitan area.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  shippingMethod === 'Outside Chattogram'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={shippingMethod === 'Outside Chattogram'}
                  onChange={() => setShippingMethod('Outside Chattogram')}
                  className="mt-0.5 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Outside Chattogram (Nationwide)</span>
                    <span className="font-extrabold text-slate-900 tabular-nums">
                      {isFreeDelivery ? 'FREE' : '৳130'}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5 text-[11px]">
                    Insured courier delivery across all 64 districts in Bangladesh (24-48 hours).
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  shippingMethod === 'Store Pickup'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={shippingMethod === 'Store Pickup'}
                  onChange={() => setShippingMethod('Store Pickup')}
                  className="mt-0.5 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Collect from Chattogram Showroom</span>
                    <span className="font-extrabold text-emerald-600">FREE</span>
                  </div>
                  <p className="text-slate-500 mt-0.5 text-[11px]">
                    Shop #402, 4th Floor, Computer City Centre, GEC Circle.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Step 4: Payment Method Selection */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                4
              </span>
              <h2 className="text-sm font-bold text-slate-900">Select Payment Method</h2>
            </div>

            <div className="space-y-3">
              {/* Option 1: Cash on Delivery */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Pay upon delivery
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pay with cash when the delivery person arrives at your doorstep with the package and invoice.
                  </p>
                </div>
              </label>

              {/* Option 2: SSLCOMMERZ Online Payment */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'SSLCOMMERZ'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'SSLCOMMERZ'}
                  onChange={() => setPaymentMethod('SSLCOMMERZ')}
                  className="mt-1 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      SSLCOMMERZ Online Payment Gateway
                    </span>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Instant & Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pay instantly using bKash, Nagad, Rocket, Upay, Visa, MasterCard, UnionPay, or Bangladeshi internet banking.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-pink-50 text-pink-700 rounded border border-pink-200">
                      bKash
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-orange-50 text-orange-700 rounded border border-orange-200">
                      Nagad
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200">
                      Rocket
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                      Visa / Mastercard
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Order Review ({items.length} items)
            </h3>

            {/* Item list preview */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.product.id} className="pt-2 flex items-center gap-3 text-xs">
                  <img
                    src={item.product.images[0] || '/src/assets/images/hero_laptop_showcase_1790771906222.jpg'}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-contain rounded-lg border border-slate-200 p-0.5 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {item.product.name}
                    </div>
                    <div className="text-[11px] text-slate-500">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-bold text-slate-900 tabular-nums">
                    ৳{(item.product.salePrice * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span className="tabular-nums">-৳{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping ({shippingMethod})</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {shippingCost === 0 ? 'FREE' : `৳${shippingCost}`}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Grand Total</span>
                <span className="text-2xl font-extrabold text-blue-600 tabular-nums">
                  ৳{finalPayable.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              {isSubmitting
                ? 'Processing Your Order...'
                : paymentMethod === 'COD'
                ? `Confirm Cash on Delivery Order (৳${finalPayable.toLocaleString()})`
                : `Pay ৳${finalPayable.toLocaleString()} with SSLCOMMERZ`}
            </button>

            <div className="pt-2 text-[11px] text-slate-500 text-center space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-slate-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                100% Guaranteed Official Warranty & Invoice
              </div>
              <p>By confirming this order, you agree to our Terms of Sale and Warranty Policies.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
