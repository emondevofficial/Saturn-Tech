import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, ArrowLeft, CreditCard } from 'lucide-react';

export const PaymentSandboxPage: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const tran_id = params.get('tran_id') || `STB-TXN-${Date.now()}`;
  const amount = params.get('amount') || '0';
  const currency = params.get('currency') || 'BDT';
  const order_id = params.get('order_id') || '';

  const [paymentOption, setPaymentOption] = useState<'bkash' | 'nagad' | 'card'>('bkash');
  const [phoneNumber, setPhoneNumber] = useState('01812345678');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimulateSuccess = () => {
    setIsProcessing(true);
    // Post directly to official backend success callback route
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/payment/sslcommerz/success';

    const fields: Record<string, string> = {
      tran_id,
      val_id: `SANDBOX_${Date.now()}_VALIDATED`,
      amount,
      card_type: paymentOption.toUpperCase(),
      bank_tran_id: `BANK_${Date.now()}`,
      status: 'VALID',
    };

    Object.entries(fields).forEach(([k, v]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = k;
      input.value = v;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleSimulateFail = () => {
    setIsProcessing(true);
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/payment/sslcommerz/fail';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'tran_id';
    input.value = tran_id;
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
  };

  const handleSimulateCancel = () => {
    setIsProcessing(true);
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/payment/sslcommerz/cancel';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'tran_id';
    input.value = tran_id;
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* SSLCOMMERZ Sandbox Gateway Header */}
        <div className="bg-[#0052CC] text-white p-5 space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-lg font-black tracking-tight">SSLCOMMERZ</div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
              Sandbox Test Gateway
            </span>
          </div>
          <div className="text-xs text-blue-100">
            Saturn Tech BD Merchant Checkout
          </div>
        </div>

        {/* Transaction Details */}
        <div className="p-6 space-y-5">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-500 block">Total Amount:</span>
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                ৳{Number(amount).toLocaleString()} {currency}
              </span>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <span>Txn Ref:</span>
              <div className="font-mono text-slate-800 font-bold">{tran_id}</div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Simulate Payment Channel:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentOption('bkash')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-colors ${
                  paymentOption === 'bkash'
                    ? 'border-pink-500 bg-pink-50 text-pink-700 ring-2 ring-pink-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                bKash
              </button>
              <button
                type="button"
                onClick={() => setPaymentOption('nagad')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-colors ${
                  paymentOption === 'nagad'
                    ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Nagad
              </button>
              <button
                type="button"
                onClick={() => setPaymentOption('card')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-colors ${
                  paymentOption === 'card'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Visa / Master
              </button>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-slate-700">Account / Card Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          {/* Simulation Trigger Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleSimulateSuccess}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simulate Successful Payment (Auto-Validates & Reduces Stock)
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSimulateFail}
                disabled={isProcessing}
                className="py-2.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" /> Simulate Decline
              </button>
              <button
                onClick={handleSimulateCancel}
                disabled={isProcessing}
                className="py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Cancel Payment
              </button>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Official SSLCOMMERZ 128-bit Encrypted Session
          </div>
        </div>
      </div>
    </div>
  );
};
