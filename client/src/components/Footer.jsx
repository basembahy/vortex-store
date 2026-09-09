import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Headphones, MessageCircle, Gamepad2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  const whatsappHref = `https://wa.me/${(settings.whatsapp_number || '+201012345678').replace(/\D/g, '')}?text=${encodeURIComponent('Hello Vortex Store, I would like to inquire about Xbox games accounts')}`;

  return (
    <footer className="bg-vortex-darker border-t border-slate-800/80 mt-20 text-slate-400 text-sm">
      {/* Value Proposition Bar */}
      <div className="border-b border-slate-800/60 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-xbox-neon">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm">100% Genuine Accounts</h4>
            <p className="text-[11px] text-slate-400">Direct from Microsoft Store with full warranty</p>
          </div>

          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-yellow-950/80 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm">Fast Digital Delivery</h4>
            <p className="text-[11px] text-slate-400">Credentials delivered directly to your order page</p>
          </div>

          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm">Full Gaming Experience</h4>
            <p className="text-[11px] text-slate-400">Online multiplayer, game updates, and full achievements</p>
          </div>

          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Headphones className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm">After-Sale Support</h4>
            <p className="text-[11px] text-slate-400">Dedicated support team available via WhatsApp</p>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <Gamepad2 className="w-6 h-6 text-xbox-neon" />
            <span className="text-xl font-black text-white tracking-wider">VORTEX STORE</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            The premier store specialized in authentic Xbox game accounts (Xbox Series X|S & Xbox One) at exceptional prices. Offering Sign, Home, and Full ownership accounts.
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 text-sm">Quick Links</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/" className="hover:text-xbox-neon transition-colors">Games Catalog</Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-xbox-neon transition-colors">Account Types Guide (Sign vs Home vs Full)</Link>
            </li>
            <li>
              <Link to="/track" className="hover:text-xbox-neon transition-colors">Track Order by Order ID</Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-xbox-neon transition-colors">Shopping Cart & Checkout</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 text-sm">Accepted Payment Methods</h4>
          <p className="text-xs text-slate-400 mb-3">
            Direct instant transfer via InstaPay & Egyptian Mobile Wallets:
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 bg-purple-950/60 border border-purple-500/40 text-purple-300 rounded text-xs font-semibold">
              ⚡ InstaPay
            </span>
            <span className="px-2.5 py-1 bg-red-950/60 border border-red-500/40 text-red-300 rounded text-xs font-semibold">
              🔴 Vodafone Cash
            </span>
            <span className="px-2.5 py-1 bg-orange-950/60 border border-orange-500/40 text-orange-300 rounded text-xs font-semibold">
              🟠 Orange Cash
            </span>
            <span className="px-2.5 py-1 bg-green-950/60 border border-green-500/40 text-green-300 rounded text-xs font-semibold">
              🟢 Etisalat Cash
            </span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
        <span>All Rights Reserved © Vortex Store {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
