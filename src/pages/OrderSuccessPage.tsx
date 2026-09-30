import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  Package,
  Printer,
  ArrowRight,
  ShieldCheck,
  Truck,
  Phone,
  Calendar,
} from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessPageProps {
  onNavigate: (path: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ onNavigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id') || urlParams.get('order_id') || urlParams.get('order_number');
  const tranId = urlParams.get('tran_id');

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data) {
            setOrder(data.data);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      {/* Success Notification Box */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm no-print">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Thank You! Your Order Has Been Confirmed.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            We have received your order and our hardware dispatch team is preparing your package. A confirmation SMS will be sent to your phone.
          </p>
        </div>

        {order && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-xs font-mono font-bold text-slate-900">
            Order Reference: {order.orderNumber}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
          <button
            onClick={() => onNavigate(`/orders?track=${order?.orderNumber || ''}`)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Package className="w-4 h-4" /> Track Status
          </button>
        </div>
      </div>

      {/* Invoice Details Card (Visible on screen and optimized for window.print) */}
      {order && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          {/* Header of Invoice */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="text-lg font-black text-slate-900">
                SATURN <span className="text-blue-600">TECH</span> BD
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Computer City Centre, GEC Circle, Chattogram, Bangladesh
              </div>
              <div className="text-[11px] text-slate-500">
                Phone: +880 1812-345678 | Email: support@saturntechbd.com
              </div>
            </div>

            <div className="sm:text-right text-xs space-y-1">
              <div className="font-extrabold text-slate-900 text-sm">
                Invoice #{order.orderNumber}
              </div>
              <div className="text-slate-500">
                Date: {new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div className="text-slate-500">
                Payment: <strong className="text-slate-800">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'SSLCOMMERZ Online'}</strong> ({order.paymentStatus})
              </div>
              {order.transactionId && (
                <div className="text-[10px] text-slate-400 font-mono">
                  Txn ID: {order.transactionId}
                </div>
              )}
            </div>
          </div>

          {/* Customer & Delivery address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
              <span className="font-bold text-slate-900 block">Deliver To:</span>
              <p className="font-semibold text-slate-800">{order.customerName}</p>
              <p className="text-slate-600">{order.deliveryAddress.address}</p>
              <p className="text-slate-600">
                {order.deliveryAddress.area}, {order.deliveryAddress.district} - {order.deliveryAddress.postalCode}
              </p>
              <p className="text-slate-700 font-medium">Phone: {order.customerPhone}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
              <span className="font-bold text-slate-900 block">Shipping & Status:</span>
              <p className="text-slate-700">Method: <strong>{order.shippingMethod}</strong></p>
              <p className="text-slate-700">
                Status:{' '}
                <span className="font-bold text-blue-600 uppercase text-[11px]">
                  {order.orderStatus}
                </span>
              </p>
              <p className="text-slate-500 text-[11px]">Official Bangladesh Warranty Card Enclosed</p>
            </div>
          </div>

          {/* Ordered items table */}
          <div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 font-semibold">Item & Specs</th>
                  <th className="py-2 text-center font-semibold">Qty</th>
                  <th className="py-2 text-right font-semibold">Unit Price</th>
                  <th className="py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 pr-2">
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      <div className="text-[11px] text-slate-500">
                        SKU: {item.sku} · Warranty: {item.warranty}
                      </div>
                    </td>
                    <td className="py-3 text-center tabular-nums text-slate-700">{item.quantity}</td>
                    <td className="py-3 text-right tabular-nums text-slate-700">
                      ৳{item.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 tabular-nums">
                      ৳{item.totalPrice.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotals */}
          <div className="pt-4 border-t border-slate-200 text-xs space-y-1.5 max-w-xs ml-auto">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                ৳{order.subtotal.toLocaleString()}
              </span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount:</span>
                <span className="tabular-nums">-৳{order.discount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee:</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {order.shippingCost === 0 ? 'FREE' : `৳${order.shippingCost}`}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-extrabold text-sm text-slate-900">
              <span>Grand Total:</span>
              <span className="text-xl text-blue-600 tabular-nums">
                ৳{order.grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 text-center text-[10px] text-slate-400">
            Thank you for choosing Saturn Tech BD. Please inspect the package contents upon delivery.
          </div>
        </div>
      )}

      <div className="text-center pt-4 no-print">
        <button
          onClick={() => onNavigate('/')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
        >
          Return to Saturn Tech BD Homepage <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
