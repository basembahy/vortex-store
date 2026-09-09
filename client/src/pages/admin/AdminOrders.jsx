import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Image, KeyRound, CheckCircle2, ExternalLink, X, Save, MessageCircle } from 'lucide-react';
import api from '../../api/client';
import AccountBadge from '../../components/AccountBadge';

export default function AdminOrders() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [search, setSearch] = useState('');

  // Modals state
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState(null);
  const [fulfillingOrder, setFulfillingOrder] = useState(null);
  const [credentialsForm, setCredentialsForm] = useState([]);
  const [submittingFulfill, setSubmittingFulfill] = useState(false);
  const [message, setMessage] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/admin/all');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/admin/${orderId}/status`, { status: newStatus });
      setMessage(`Order ${orderId} status updated to ${newStatus}`);
      loadOrders();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const openFulfillModal = (order) => {
    setFulfillingOrder(order);
    const initialCreds = (order.items || []).map((item) => ({
      id: item.id,
      product_title: item.product_title,
      account_type: item.account_type,
      account_email: item.account_email || '',
      account_password: item.account_password || '',
      account_instructions:
        item.account_instructions ||
        (item.account_type === 'HOME'
          ? '1. Add the account to your Xbox console (Add new).\n2. Navigate to Settings > General > Personalization > My home Xbox > Select "Make this my home Xbox".\n3. Start downloading the game, then switch back to your own personal profile to play and earn achievements!'
          : item.account_type === 'SIGN'
          ? '1. Sign into the account on your Xbox console.\n2. Launch the game, then switch to your main profile or play directly.\n3. Make sure your console stays connected to internet while playing.'
          : 'Full Account: You own this account exclusively. You can change the password, email, and add your own mobile verification.')
    }));
    setCredentialsForm(initialCreds);
  };

  const handleSaveCredentials = async () => {
    if (!fulfillingOrder) return;
    setSubmittingFulfill(true);

    try {
      await api.post(`/orders/admin/${fulfillingOrder.id}/fulfill`, {
        items_credentials: credentialsForm,
        mark_completed: true
      });

      setMessage(`Xbox credentials for order ${fulfillingOrder.id} successfully delivered to customer!`);
      setFulfillingOrder(null);
      loadOrders();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      alert('Error saving credentials: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingFulfill(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !search ||
      o.id.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Notifications banner */}
      {message && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 shadow-neon-green">
          <CheckCircle2 className="w-4 h-4 text-xbox-neon shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
        
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'PENDING', label: 'Pending Review 🕒' },
            { id: 'IN_PROGRESS', label: 'In Progress ⚙️' },
            { id: 'COMPLETED', label: 'Completed & Delivered ✅' },
            { id: 'CANCELLED', label: 'Cancelled ❌' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-purple-600 text-white shadow-neon-purple'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search by Order ID, Name, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute top-2.5 left-3" />
        </div>

      </div>

      {/* Orders List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading customer orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-slate-900/40 rounded-3xl border border-slate-800">
          No orders matching current filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isCompleted = order.status === 'COMPLETED';
            const isPending = order.status === 'PENDING';
            const whatsappUrl = `https://wa.me/${(order.whatsapp_number || order.customer_phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${order.customer_name}, regarding your order ${order.id} at Vortex Store:`)}`;

            return (
              <div
                key={order.id}
                className={`bg-slate-900/90 border rounded-3xl p-6 transition-all ${
                  isPending
                    ? 'border-amber-500/50 shadow-sm'
                    : isCompleted
                    ? 'border-slate-800 hover:border-emerald-500/40'
                    : 'border-slate-800'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-mono font-black text-white">{order.id}</span>
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
                        ? 'Completed & Delivered ✅'
                        : order.status === 'IN_PROGRESS'
                        ? 'In Progress ⚙️'
                        : order.status === 'CANCELLED'
                        ? 'Cancelled ❌'
                        : 'Pending Review 🕒'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Change Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-2.5 py-1 outline-none focus:border-purple-500"
                    >
                      <option value="PENDING">Pending Review</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Customer & Items grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs mb-4">
                  {/* Customer details */}
                  <div className="space-y-1 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    <span className="font-bold text-slate-300 block mb-2">Customer Details:</span>
                    <p className="text-white font-semibold">Name: {order.customer_name}</p>
                    <p className="text-slate-400">Email: {order.customer_email}</p>
                    <p className="text-slate-400">Phone: <span className="font-mono text-white">{order.customer_phone}</span></p>
                    {order.whatsapp_number && (
                      <p className="text-slate-400">WhatsApp: <span className="font-mono text-emerald-400">{order.whatsapp_number}</span></p>
                    )}
                    {order.notes && (
                      <p className="text-amber-300/90 pt-1 border-t border-slate-800 mt-2">
                        Notes: {order.notes}
                      </p>
                    )}
                    <div className="pt-2">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-lg hover:bg-emerald-900 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Message Customer on WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Payment Details & Receipt */}
                  <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-slate-300 block mb-2">Payment Details:</span>
                      <p className="text-slate-300">
                        Method: <strong className="text-purple-400 capitalize">{order.payment_method}</strong>
                      </p>
                      <p className="text-white text-sm font-black mt-1">
                        Total Amount: <span className="text-xbox-neon">{order.total_amount} EGP</span>
                      </p>
                    </div>

                    {order.payment_receipt_url ? (
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptUrl(order.payment_receipt_url)}
                        className="w-full py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Image className="w-4 h-4" />
                        <span>Inspect Receipt Screenshot</span>
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[11px]">No receipt uploaded</span>
                    )}
                  </div>

                  {/* Order Items list */}
                  <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    <span className="font-bold text-slate-300 block mb-2">Ordered Games:</span>
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {order.items?.map((item) => (
                        <div key={item.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                          <div>
                            <p className="font-bold text-white">{item.product_title}</p>
                            <AccountBadge type={item.account_type} />
                          </div>
                          <span className="font-black text-white">{item.price} EGP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fulfillment Action Bar */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    {isCompleted ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Xbox account credentials delivered to customer.
                      </span>
                    ) : (
                      <span>Inspect the payment screenshot, then click "Fulfill & Deliver Account" to provide login details.</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openFulfillModal(order)}
                    className="py-2 px-4 rounded-xl bg-gradient-to-r from-xbox-neon to-emerald-400 hover:from-emerald-400 text-black font-black text-xs flex items-center gap-1.5 shadow-neon-green transition-all"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isCompleted ? 'Edit Delivered Credentials' : 'Fulfill & Deliver Xbox Account ⚡'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal: View Receipt Screenshot */}
      {selectedReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Payment Receipt Screenshot</h3>
              <button
                onClick={() => setSelectedReceiptUrl(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] flex justify-center bg-black/50 rounded-2xl p-2">
              <img
                src={selectedReceiptUrl}
                alt="Receipt"
                className="max-w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>
            <div className="text-right">
              <a
                href={selectedReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-purple-400 hover:underline"
              >
                <span>Open full image in new tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Fulfill Order with Xbox Credentials */}
      {fulfillingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-xbox-neon" />
                  <span>Deliver Xbox Credentials for Order {fulfillingOrder.id}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customer: {fulfillingOrder.customer_name} ({fulfillingOrder.customer_phone})
                </p>
              </div>
              <button
                onClick={() => setFulfillingOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inputs for each game item */}
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
              {credentialsForm.map((item, idx) => (
                <div key={item.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-white">
                      {idx + 1}. {item.product_title}
                    </h4>
                    <AccountBadge type={item.account_type} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Xbox Account Email:
                      </label>
                      <input
                        type="text"
                        placeholder="vortex.gamer12@outlook.com"
                        value={item.account_email}
                        onChange={(e) => {
                          const updated = [...credentialsForm];
                          updated[idx].account_email = e.target.value;
                          setCredentialsForm(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Xbox Account Password:
                      </label>
                      <input
                        type="text"
                        placeholder="Vortex#2026!Pass"
                        value={item.account_password}
                        onChange={(e) => {
                          const updated = [...credentialsForm];
                          updated[idx].account_password = e.target.value;
                          setCredentialsForm(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Activation / Setup Instructions (Visible to Customer):
                    </label>
                    <textarea
                      rows="3"
                      value={item.account_instructions}
                      onChange={(e) => {
                        const updated = [...credentialsForm];
                        updated[idx].account_instructions = e.target.value;
                        setCredentialsForm(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs text-emerald-400 font-semibold">
                * Order status will be updated to "Completed" and credentials will appear on customer's tracking page immediately.
              </span>

              <button
                type="button"
                onClick={handleSaveCredentials}
                disabled={submittingFulfill}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-xbox-neon to-emerald-400 hover:from-emerald-400 text-black font-extrabold text-xs shadow-neon-green flex items-center gap-2 transition-all hover:scale-105"
              >
                {submittingFulfill ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Deliver Credentials to Customer</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
