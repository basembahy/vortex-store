import React, { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Copy, Check, MessageCircle, ArrowRight, Package, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function OrderSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const { settings } = useSettings();
  const [copied, setCopied] = useState(false);

  const orderId = id || location.state?.orderId || 'VTX-00000';
  const total = location.state?.total;

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Vortex Store team, I placed a new order with ID: ${orderId}${total ? ` for ${total} EGP` : ''} and attached the transfer receipt. Please verify and deliver the account credentials.`
  );
  const whatsappHref = `https://wa.me/${(settings.whatsapp_number || '+201012345678').replace(/\D/g, '')}?text=${whatsappMessage}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      
      {/* Animated Success Badge */}
      <div className="w-20 h-20 rounded-3xl bg-emerald-950/80 border-2 border-emerald-500/80 text-xbox-neon flex items-center justify-center mx-auto mb-6 shadow-neon-green">
        <CheckCircle2 className="w-12 h-12 animate-pulse" />
      </div>

      <div className="inline-flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Order Received Successfully!</span>
      </div>

      <h1 className="text-3xl font-black text-white mb-2">Thank you for choosing Vortex Store!</h1>
      <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mb-8 leading-relaxed">
        Your order and payment receipt have been recorded. Our team is reviewing the transfer and preparing your Xbox game account credentials.
      </p>

      {/* Order ID Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 mb-8 max-w-md mx-auto space-y-3">
        <span className="text-xs text-slate-400 font-semibold">Your Unique Order ID (Save for Tracking):</span>
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl sm:text-3xl font-mono font-black text-xbox-neon tracking-wider">
            {orderId}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Copy Order ID"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        {copied && <p className="text-[11px] text-emerald-400 font-bold">Order ID copied to clipboard!</p>}
      </div>

      {/* WhatsApp Fast Notification Button */}
      <div className="space-y-4 mb-10 max-w-md mx-auto">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Notify Support on WhatsApp for Faster Delivery</span>
        </a>

        <div className="grid grid-cols-2 gap-3">
          <Link
            to={`/track?orderId=${orderId}`}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
          >
            <Package className="w-4 h-4 text-cyan-400" />
            <span>Track Order Status</span>
          </Link>
          <Link
            to="/"
            className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-800 transition-all"
          >
            <span>Back to Store</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Info note */}
      <div className="text-[11px] text-slate-500 max-w-md mx-auto">
        Once verified, your Xbox account email, password, and activation steps will appear directly on your order tracking page.
      </div>

    </div>
  );
}
