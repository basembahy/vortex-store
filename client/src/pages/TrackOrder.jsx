import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, Clock, CheckCircle2, AlertCircle, Copy, Check, Eye, EyeOff, ShieldCheck, KeyRound, Mail } from 'lucide-react';
import api from '../api/client';
import AccountBadge from '../components/AccountBadge';

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orderId, setOrderId] = useState(initialOrderId);
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const fetchOrder = async (idToFetch, phoneToVerify) => {
    if (!idToFetch || !idToFetch.trim()) {
      setError('Please enter an Order ID (e.g. VTX-12345)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `/orders/${idToFetch.trim()}${phoneToVerify ? `?phone=${phoneToVerify.trim()}` : ''}`;
      const res = await api.get(url);
      setOrder(res.data.order);
    } catch (err) {
      console.error('Track order error:', err);
      setError(err.response?.data?.message || 'No order found with this ID. Please double check your order number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchOrder(initialOrderId, '');
    }
  }, [initialOrderId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchOrder(orderId, phone);
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePasswordVisibility = (itemId) => {
    setShowPassword((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold px-3 py-1 rounded-full mb-3">
          <Package className="w-3.5 h-3.5" />
          <span>Order Tracking & Account Delivery</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">Track Order & Get Credentials</h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Enter your Order ID and phone number to track your payment review and receive your Xbox account details.
        </p>
      </div>

      {/* Search Box Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 mb-10 max-w-2xl mx-auto shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Order ID <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. VTX-12345"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white uppercase font-mono tracking-wider outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Phone Number on Order
            </label>
            <input
              type="tel"
              placeholder="01012345678 (to unlock credentials)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          {loading ? (
            <span>Searching for order...</span>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Track Order Status</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="max-w-2xl mx-auto mb-8 p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Result Display */}
      {order && (
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Status Stepper Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-6">
              <div>
                <span className="text-xs text-slate-400">Order Reference:</span>
                <h2 className="text-xl font-mono font-black text-white">{order.id}</h2>
              </div>
              <div className="text-right sm:text-left">
                <span className="text-xs text-slate-400 block">Total Amount:</span>
                <span className="text-lg font-black text-xbox-neon">{order.total_amount} EGP</span>
              </div>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className={`p-3 rounded-2xl border ${
                order.status === 'PENDING'
                  ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                <Clock className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-bold block">1. Pending Review</span>
                <span className="text-[10px] opacity-75">Verifying payment receipt</span>
              </div>

              <div className={`p-3 rounded-2xl border ${
                order.status === 'IN_PROGRESS'
                  ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                <Package className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-bold block">2. In Progress</span>
                <span className="text-[10px] opacity-75">Preparing account details</span>
              </div>

              <div className={`p-3 rounded-2xl border ${
                order.status === 'COMPLETED'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-neon-green'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-xbox-neon" />
                <span className="text-xs font-bold block">3. Delivered</span>
                <span className="text-[10px] opacity-75">Account credentials ready!</span>
              </div>
            </div>

            {/* Status notice */}
            {order.status === 'PENDING' && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs text-center">
                Your payment screenshot is currently under review by our admin team. Once confirmed, your Xbox account credentials will appear here immediately!
              </div>
            )}
            {order.status === 'IN_PROGRESS' && (
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs text-center">
                Payment verified successfully! We are generating your account login details.
              </div>
            )}
            {order.status === 'COMPLETED' && (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs text-center flex items-center justify-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-xbox-neon" />
                <span>Your order is completed! Your Xbox login credentials and setup instructions are provided below.</span>
              </div>
            )}
          </div>

          {/* DELIVERED XBOX CREDENTIALS SECTION */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-xbox-neon" />
                <span>Xbox Game Account Credentials</span>
              </h3>

              {order.items.map((item) => {
                const hasCredentials = item.account_email && item.account_password;

                return (
                  <div
                    key={item.id}
                    className={`rounded-3xl p-6 border transition-all ${
                      hasCredentials
                        ? 'bg-slate-900 border-emerald-500/60 shadow-neon-green'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-4">
                      <div>
                        <h4 className="font-bold text-base text-white">{item.product_title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <AccountBadge type={item.account_type} />
                          <span className="text-xs text-slate-400">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-xbox-neon">{item.price} EGP</span>
                    </div>

                    {hasCredentials ? (
                      <div className="space-y-4 bg-slate-950/90 p-4 sm:p-5 rounded-2xl border border-emerald-500/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Xbox Account Login Details:</span>
                          </span>
                          <span className="text-[11px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                            Active & Verified
                          </span>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>Account Email:</span>
                          </span>
                          <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                            <span className="text-xs sm:text-sm font-mono text-white select-all">
                              {item.account_email}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.account_email, `email_${item.id}`)}
                              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                            >
                              {copiedKey === `email_${item.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedKey === `email_${item.id}` ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                            <span>Account Password:</span>
                          </span>
                          <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                            <span className="text-xs sm:text-sm font-mono text-white select-all">
                              {showPassword[item.id] ? item.account_password : '••••••••••••'}
                            </span>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(item.id)}
                                className="text-slate-400 hover:text-white"
                                title={showPassword[item.id] ? 'Hide Password' : 'Show Password'}
                              >
                                {showPassword[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopy(item.account_password, `pass_${item.id}`)}
                                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                              >
                                {copiedKey === `pass_${item.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedKey === `pass_${item.id}` ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Instructions */}
                        {item.account_instructions && (
                          <div className="space-y-1 pt-2 border-t border-slate-800/80">
                            <span className="text-[11px] font-bold text-slate-300">Activation & Setup Instructions:</span>
                            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                              {item.account_instructions}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-950/40 p-4 rounded-xl text-center border border-slate-800/80">
                        <Clock className="w-5 h-5 text-slate-500 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-400">
                          Credentials will be posted here as soon as payment is confirmed by our team.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Verification requirement warning if phone not entered */}
          {order.requires_verification && (
            <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs text-center space-y-2">
              <p className="font-bold">To protect your account security, please provide the phone number used during checkout to view the credentials.</p>
              <p className="text-[11px] text-amber-300/80">Enter your phone number in the search box above and click Track Order again.</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
