import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Clock, Gamepad2, ArrowRight } from 'lucide-react';
import api from '../../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/orders/admin/all')
        ]);
        setStats(statsRes.data);
        setRecentOrders((ordersRes.data.orders || []).slice(0, 5));
      } catch (err) {
        console.error('Admin stats error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading store analytics...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Completed Sales Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-xbox-neon">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {stats?.total_revenue || 0} <span className="text-xs text-emerald-400">EGP</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Pending Orders: {stats?.pending_revenue || 0} EGP
          </p>
        </div>

        {/* Pending Orders (Action Required) */}
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-300">New Orders (Pending Review)</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 animate-pulse">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {stats?.pending_orders || 0} <span className="text-xs text-amber-400">Orders</span>
          </div>
          <Link
            to="/admin/orders?status=PENDING"
            className="text-[11px] text-amber-400 hover:underline font-bold mt-2 inline-flex items-center gap-1"
          >
            <span>Review & Deliver Accounts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Total Orders Placed</span>
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {stats?.total_orders || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Completed: {stats?.completed_orders || 0}
          </p>
        </div>

        {/* Total Products */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Games in Catalog</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {stats?.total_products || 0} <span className="text-xs text-purple-400">Games</span>
          </div>
          <Link
            to="/admin/products"
            className="text-[11px] text-purple-400 hover:underline font-bold mt-2 inline-flex items-center gap-1"
          >
            <span>Manage Titles & Prices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/admin/orders"
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500 text-left space-y-1 transition-all group"
        >
          <span className="text-xs font-bold text-white group-hover:text-xbox-neon block">Review Orders</span>
          <span className="text-[11px] text-slate-500">Inspect receipts & deliver accounts</span>
        </Link>
        <Link
          to="/admin/products"
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500 text-left space-y-1 transition-all group"
        >
          <span className="text-xs font-bold text-white group-hover:text-purple-400 block">Add New Game</span>
          <span className="text-[11px] text-slate-500">Set Sign, Home, and Full prices</span>
        </Link>
        <Link
          to="/admin/excel"
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500 text-left space-y-1 transition-all group"
        >
          <span className="text-xs font-bold text-white group-hover:text-cyan-400 block">Bulk Excel Import</span>
          <span className="text-[11px] text-slate-500">Upload multiple games from sheet</span>
        </Link>
        <Link
          to="/admin/settings"
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-yellow-500 text-left space-y-1 transition-all group"
        >
          <span className="text-xs font-bold text-white group-hover:text-yellow-400 block">Payment Methods</span>
          <span className="text-[11px] text-slate-500">Edit InstaPay and Mobile Wallets</span>
        </Link>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">Recent Customer Orders</h3>
          <Link to="/admin/orders" className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-bold">
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No orders placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Phone</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Method</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-white">{order.id}</td>
                    <td className="py-3 text-slate-300">{order.customer_name}</td>
                    <td className="py-3 text-slate-400 font-mono">{order.customer_phone}</td>
                    <td className="py-3 font-bold text-xbox-neon">{order.total_amount} EGP</td>
                    <td className="py-3 text-slate-400 capitalize">{order.payment_method}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          order.status === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                            : order.status === 'IN_PROGRESS'
                            ? 'bg-cyan-950 text-cyan-400 border-cyan-500/40'
                            : 'bg-amber-950 text-amber-400 border-amber-500/40'
                        }`}
                      >
                        {order.status === 'COMPLETED' ? 'Delivered' : order.status === 'IN_PROGRESS' ? 'In Progress' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to="/admin/orders"
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg text-xs font-semibold"
                      >
                        Details & Fulfill
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
