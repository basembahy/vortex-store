import React from 'react';
import { NavLink, Outlet, Navigate, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Gamepad2, FileSpreadsheet, Users, Settings, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Verifying administrator permissions...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { to: '/admin', end: true, label: 'Dashboard Overview', icon: LayoutDashboard },
    { to: '/admin/orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
    { to: '/admin/products', label: 'Games & Price Editor', icon: Gamepad2 },
    { to: '/admin/excel', label: 'Bulk Excel Import', icon: FileSpreadsheet },
    { to: '/admin/users', label: 'Admins & Users', icon: Users },
    { to: '/admin/settings', label: 'Store & Payment Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-neon-purple">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Store Admin Dashboard</h1>
            <p className="text-xs text-slate-400">Manage games catalog, verify payment receipts, and deliver Xbox credentials</p>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Storefront</span>
        </Link>
      </div>

      {/* Admin Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-slate-800/80">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-neon-purple'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Admin Content Area */}
      <Outlet />
    </div>
  );
}
