import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, ShieldCheck, Mail, KeyRound, Copy, Check, Eye, EyeOff, ShoppingCart } from 'lucide-react';
import api from '../api/client';
import AccountBadge from '../components/AccountBadge';
import { useAuth } from '../context/AuthContext';

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    async function loadMyOrders() {
      try {
        setLoading(true);
        const res = await api.get('/orders/my-orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Could not load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    loadMyOrders();
  }, []);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePasswordVisibility = (itemId) => {
    setShowPassword((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400 text-xs">
        <Package className="w-10 h-10 mx-auto mb-3 animate-spin text-emerald-400" />
        <span>Loading your orders...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 text-slate-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">No Past Orders Found</h2>
        <p className="text-xs text-slate-400 mb-6">
          You haven't placed any orders yet. Check out our Xbox games catalog and grab your favorite titles!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-xbox-green to-emerald-600 hover:from-emerald-600 text-black font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-neon-green transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Browse Games</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white">My Orders & Accounts</h1>
        <p className="text-xs text-slate-400 mt-1">
          Track your past purchases and access delivered Xbox login credentials
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-lg transition-all"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-white text-base">{order.id}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      order.status === 'COMPLETED'
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                        : order.status === 'IN_PROGRESS'
                        ? 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40'
                        : order.status === 'CANCELLED'
                        ? 'bg-red-950/80 text-red-400 border-red-500/40'
                        : 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                    }`}
                  >
                    {order.status === 'COMPLETED'
                      ? 'Delivered ✅'
                      : order.status === 'IN_PROGRESS'
                      ? 'In Progress ⚙️'
                      : order.status === 'CANCELLED'
                      ? 'Cancelled ❌'
                      : 'Pending Review 🕒'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="text-right sm:text-left">
                <span className="text-xs text-slate-400 block">Total Amount:</span>
                <span className="text-base font-black text-xbox-neon">{order.total_amount} EGP</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              {order.items?.map((item) => {
                const hasCredentials = item.account_email && item.account_password;

                return (
                  <div key={item.id} className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{item.product_title}</h4>
                        <AccountBadge type={item.account_type} />
                      </div>
                      <span className="text-xs font-bold text-slate-300">{item.price} EGP</span>
                    </div>

                    {/* Credentials Box if delivered */}
                    {hasCredentials ? (
                      <div className="mt-3 bg-slate-900/90 p-4 rounded-xl border border-emerald-500/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Xbox Login Credentials:</span>
                          </span>
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono text-white select-all">{item.account_email}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.account_email, `email_${item.id}`)}
                            className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px] flex items-center gap-1"
                          >
                            {copiedKey === `email_${item.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === `email_${item.id}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>

                        {/* Password */}
                        <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                          <div className="flex items-center gap-2">
                            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono text-white select-all">
                              {showPassword[item.id] ? item.account_password : '••••••••••••'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(item.id)}
                              className="text-slate-400 hover:text-white"
                            >
                              {showPassword[item.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.account_password, `pass_${item.id}`)}
                              className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px] flex items-center gap-1"
                            >
                              {copiedKey === `pass_${item.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedKey === `pass_${item.id}` ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Instructions */}
                        {item.account_instructions && (
                          <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 whitespace-pre-wrap">
                            <span className="font-bold block text-slate-400 mb-1">Setup Instructions:</span>
                            {item.account_instructions}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Account credentials will appear here once payment is confirmed.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
