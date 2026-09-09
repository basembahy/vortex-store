import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, ShieldCheck, LogOut, Menu, X, Gamepad2, HelpCircle, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { totalCount } = useCart();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full max-w-full overflow-hidden">
      {/* Top Announcement Bar */}
      {settings.store_announcement && (
        <div className="bg-gradient-to-r from-emerald-900 via-xbox-dark to-purple-950 text-white text-[11px] sm:text-xs py-1 px-3 text-center border-b border-emerald-500/20 flex flex-wrap items-center justify-center gap-1.5 leading-tight">
          <span className="font-bold text-xbox-neon animate-pulse shrink-0">⚡ VORTEX STORE:</span>
          <span className="break-words">{settings.store_announcement}</span>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="glass-panel border-b border-slate-800/80 w-full max-w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-xbox-green to-purple-600 p-0.5 shadow-neon-green group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-vortex-dark rounded-[10px] flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-xbox-neon group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-black text-lg sm:text-xl tracking-wider text-white">VORTEX</span>
                  <span className="text-[10px] sm:text-xs font-black bg-xbox-neon text-black px-1.5 py-0.5 rounded tracking-widest uppercase">STORE</span>
                </div>
                <span className="text-[9px] tracking-widest text-emerald-400 font-semibold hidden sm:inline">PLAY MORE .. PAY LESS</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="/" className="text-slate-200 hover:text-xbox-neon transition-colors py-1">
                Store
              </Link>
              <Link to="/how-it-works" className="flex items-center gap-1.5 text-slate-300 hover:text-xbox-neon transition-colors py-1">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <span>How It Works (Guide)</span>
              </Link>
              <Link to="/track" className="flex items-center gap-1.5 text-slate-300 hover:text-xbox-neon transition-colors py-1">
                <Package className="w-4 h-4 text-cyan-400" />
                <span>Track Order</span>
              </Link>
              {user && (
                <Link to="/my-orders" className="text-slate-300 hover:text-xbox-neon transition-colors py-1">
                  My Orders
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 bg-purple-950/70 border border-purple-500/40 text-purple-300 hover:text-purple-100 hover:border-purple-400 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm shadow-purple-500/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>

            {/* Actions: Cart + User Profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative p-2 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                {totalCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-xbox-neon text-black font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-neon-green animate-bounce">
                    {totalCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown or Login */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-1.5 transition-all text-left"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full border border-emerald-500" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-xs text-emerald-400 font-bold">
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-800 text-xs">
                        <p className="text-slate-400">Signed in as</p>
                        <p className="font-bold text-slate-200 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[10px] bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded border border-purple-600/40 font-bold">
                            ADMINISTRATOR
                          </span>
                        )}
                      </div>

                      <Link
                        to="/my-orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        My Orders & Game Accounts
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-4 py-2 text-xs text-purple-300 hover:bg-purple-950/50 hover:text-purple-100 font-semibold"
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-950/30 flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 bg-gradient-to-r from-xbox-green to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-black font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-neon-green transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Nav */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-800/80 space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Store
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-purple-300 hover:bg-slate-800"
              >
                How It Works (Guide)
              </Link>
              <Link
                to="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-cyan-300 hover:bg-slate-800"
              >
                Track Order
              </Link>
              {user && (
                <Link
                  to="/my-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  My Orders
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-bold text-purple-400 bg-purple-950/40 border border-purple-500/30"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
