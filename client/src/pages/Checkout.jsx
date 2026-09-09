import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, Check, Copy, AlertCircle, ShieldCheck, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import api from '../api/client';
import AccountBadge from '../components/AccountBadge';

export default function Checkout() {
  const { cartItems, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    customer_phone: '',
    whatsapp_number: '',
    payment_method: 'instapay',
    notes: ''
  });

  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">No items in your cart</h2>
        <Link to="/" className="text-xs text-emerald-400 hover:underline font-bold">
          Return to Store to pick games
        </Link>
      </div>
    );
  }

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.customer_name.trim() || !formData.customer_email.trim() || !formData.customer_phone.trim()) {
      setError('Please fill in all required fields (Name, Email, and Phone number)');
      return;
    }

    if (!receiptFile) {
      setError('Please upload a transaction screenshot or receipt to confirm your order');
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('customer_name', formData.customer_name);
      data.append('customer_email', formData.customer_email);
      data.append('customer_phone', formData.customer_phone);
      data.append('whatsapp_number', formData.whatsapp_number || formData.customer_phone);
      data.append('payment_method', formData.payment_method);
      data.append('notes', formData.notes);
      data.append('items', JSON.stringify(cartItems));
      data.append('receipt', receiptFile);

      const res = await api.post('/orders', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Clear shopping cart
      clearCart();

      // Navigate to success page
      navigate(`/order-success/${res.data.order_id}`, {
        state: {
          orderId: res.data.order_id,
          total: res.data.total_amount,
          customerName: formData.customer_name,
          phone: formData.customer_phone
        }
      });
    } catch (err) {
      console.error('Order submission error:', err);
      setError(err.response?.data?.message || 'Error creating order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="mb-8">
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Shopping Cart</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Checkout & Payment</h1>
        <p className="text-xs text-slate-400 mt-1">
          Transfer the total amount via InstaPay or Mobile Wallet and upload your receipt screenshot to confirm and receive your Xbox account.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Details & Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Customer Contact Info */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-xbox-neon text-xs font-black flex items-center justify-center">1</span>
              <span>Contact & Delivery Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Smith"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="example@gmail.com"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01012345678"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  WhatsApp Number (For fast delivery)
                </label>
                <input
                  type="tel"
                  placeholder="Same as phone or different"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Order Notes (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="Any special notes or console details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Step 2: Payment Instructions & Numbers */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-black flex items-center justify-center">2</span>
              <span>Payment Details (Total: {totalAmount} EGP)</span>
            </h2>

            <p className="text-xs text-slate-400">
              Select your payment method, copy the address or phone number, and complete your transfer:
            </p>

            {/* Payment options boxes with copy button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* InstaPay */}
              <div
                onClick={() => setFormData({ ...formData, payment_method: 'instapay' })}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  formData.payment_method === 'instapay'
                    ? 'bg-purple-950/40 border-purple-500 shadow-neon-purple'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-purple-300">⚡ InstaPay Transfer</span>
                  <input
                    type="radio"
                    name="pay_method"
                    checked={formData.payment_method === 'instapay'}
                    onChange={() => setFormData({ ...formData, payment_method: 'instapay' })}
                    className="text-purple-500"
                  />
                </div>
                <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 mt-2">
                  <span className="text-xs font-mono font-bold text-white select-all">
                    {settings.instapay_username}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(settings.instapay_username, 'instapay');
                    }}
                    className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    {copiedKey === 'instapay' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'instapay' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Vodafone Cash */}
              <div
                onClick={() => setFormData({ ...formData, payment_method: 'vodafone_cash' })}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  formData.payment_method === 'vodafone_cash'
                    ? 'bg-red-950/40 border-red-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-red-300">🔴 Vodafone Cash</span>
                  <input
                    type="radio"
                    name="pay_method"
                    checked={formData.payment_method === 'vodafone_cash'}
                    onChange={() => setFormData({ ...formData, payment_method: 'vodafone_cash' })}
                    className="text-red-500"
                  />
                </div>
                <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 mt-2">
                  <span className="text-xs font-mono font-bold text-white select-all">
                    {settings.vodafone_cash_number}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(settings.vodafone_cash_number, 'vodafone');
                    }}
                    className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    {copiedKey === 'vodafone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'vodafone' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Orange Cash */}
              <div
                onClick={() => setFormData({ ...formData, payment_method: 'orange_cash' })}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  formData.payment_method === 'orange_cash'
                    ? 'bg-orange-950/40 border-orange-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-orange-300">🟠 Orange Cash</span>
                  <input
                    type="radio"
                    name="pay_method"
                    checked={formData.payment_method === 'orange_cash'}
                    onChange={() => setFormData({ ...formData, payment_method: 'orange_cash' })}
                    className="text-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 mt-2">
                  <span className="text-xs font-mono font-bold text-white select-all">
                    {settings.orange_cash_number}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(settings.orange_cash_number, 'orange');
                    }}
                    className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                  >
                    {copiedKey === 'orange' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'orange' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Etisalat Cash */}
              <div
                onClick={() => setFormData({ ...formData, payment_method: 'etisalat_cash' })}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  formData.payment_method === 'etisalat_cash'
                    ? 'bg-emerald-950/40 border-emerald-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-emerald-300">🟢 Etisalat Cash</span>
                  <input
                    type="radio"
                    name="pay_method"
                    checked={formData.payment_method === 'etisalat_cash'}
                    onChange={() => setFormData({ ...formData, payment_method: 'etisalat_cash' })}
                    className="text-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 mt-2">
                  <span className="text-xs font-mono font-bold text-white select-all">
                    {settings.etisalat_cash_number}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(settings.etisalat_cash_number, 'etisalat');
                    }}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    {copiedKey === 'etisalat' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'etisalat' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Step 3: Upload Receipt Screenshot */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-black flex items-center justify-center">3</span>
              <span>Upload Transfer Receipt Screenshot <span className="text-red-400">*</span></span>
            </h2>

            <p className="text-xs text-slate-400">
              Please upload a clear screenshot of your transaction showing the reference number and transferred amount.
            </p>

            <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center transition-all bg-slate-950/40">
              {receiptPreview ? (
                <div className="space-y-3">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="max-h-56 mx-auto rounded-xl border border-slate-700 object-contain"
                  />
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Screenshot Selected
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptFile(null);
                        setReceiptPreview(null);
                      }}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Change File
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400">Click to upload screenshot</span>
                    <span className="text-xs text-slate-400"> or drag & drop here</span>
                  </div>
                  <span className="text-[10px] text-slate-500">JPG, PNG, WebP up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </label>
              )}
            </div>
          </div>

        </div>

        {/* Right Col: Order Items Summary & Submit Button */}
        <div className="space-y-6">
          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-black text-white border-b border-slate-800 pb-3">Games in Your Order</h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={`${item.product_id}_${item.account_type}`} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img src={item.image_url} alt={item.product_title} className="w-10 h-12 object-cover rounded-lg bg-slate-950" />
                    <div>
                      <h4 className="font-bold text-white line-clamp-1">{item.product_title}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <AccountBadge type={item.account_type} />
                        <span className="text-slate-400">× {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-extrabold text-white whitespace-nowrap">
                    {item.price * item.quantity} EGP
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Delivery:</span>
                <span className="text-emerald-400 font-bold">Free Instant Delivery</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-800 font-black">
                <span className="text-white">Total Amount:</span>
                <span className="text-xl text-xbox-neon">{totalAmount} EGP</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-neon-green flex items-center justify-center gap-2 transition-all ${
                submitting
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-xbox-neon to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black hover:scale-[1.02]'
              }`}
            >
              {submitting ? (
                <span>Submitting & Confirming Order...</span>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Confirm & Place Order Now</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Guaranteed & Safe Delivery</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
