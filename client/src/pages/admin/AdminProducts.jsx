import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, CheckCircle2, X } from 'lucide-react';
import api from '../../api/client';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editModalProduct, setEditModalProduct] = useState(null);
  const [isNewModal, setIsNewModal] = useState(false);
  const [message, setMessage] = useState(null);

  const initialForm = {
    title: '',
    category: 'Action / Adventure',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    price_sign: '',
    price_home: '',
    price_full: '',
    is_available_sign: true,
    is_available_home: true,
    is_available_full: true,
    featured: false
  };

  const [formData, setFormData] = useState(initialForm);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openNewModal = () => {
    setIsNewModal(true);
    setFormData(initialForm);
    setEditModalProduct(true);
  };

  const openEditModal = (prod) => {
    setIsNewModal(false);
    setEditModalProduct(prod);
    setFormData({
      title: prod.title || '',
      category: prod.category || 'Action',
      description: prod.description || '',
      image_url: prod.image_url || '',
      price_sign: prod.price_sign != null ? prod.price_sign : '',
      price_home: prod.price_home != null ? prod.price_home : '',
      price_full: prod.price_full != null ? prod.price_full : '',
      is_available_sign: prod.is_available_sign !== false,
      is_available_home: prod.is_available_home !== false,
      is_available_full: prod.is_available_full !== false,
      featured: Boolean(prod.featured)
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isNewModal) {
        await api.post('/products', formData);
        setMessage('New game added successfully!');
      } else {
        await api.put(`/products/${editModalProduct.id}`, formData);
        setMessage(`Game "${formData.title}" updated successfully!`);
      }
      setEditModalProduct(null);
      loadProducts();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      alert('Error saving game: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await api.delete(`/products/${id}`);
      setMessage('Game deleted successfully');
      loadProducts();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      alert('Error deleting game');
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = search.trim().toLowerCase();
    return (
      !search ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Notifications */}
      {message && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 shadow-neon-green">
          <CheckCircle2 className="w-4 h-4 text-xbox-neon shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6">
        <div>
          <h2 className="text-lg font-black text-white">Games Catalog & Price Editor</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total active titles: {products.length} games
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute top-2.5 left-3" />
          </div>

          <button
            type="button"
            onClick={openNewModal}
            className="whitespace-nowrap bg-gradient-to-r from-xbox-neon to-emerald-400 hover:from-emerald-400 text-black font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-neon-green transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Game</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading catalog...</div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <th className="p-4 font-semibold">Game Title</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold text-center">Sign Price (🎮)</th>
                  <th className="p-4 font-semibold text-center">Home Price (🏠)</th>
                  <th className="p-4 font-semibold text-center">Full Price (👑)</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="w-10 h-12 rounded-lg object-cover bg-slate-950 border border-slate-800"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{p.title}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-400">{p.category}</td>

                    {/* Price Sign */}
                    <td className="p-4 text-center">
                      {p.price_sign != null ? (
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                          {p.price_sign} EGP
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Price Home */}
                    <td className="p-4 text-center">
                      {p.price_home != null ? (
                        <span className="font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                          {p.price_home} EGP
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Price Full */}
                    <td className="p-4 text-center">
                      {p.price_full != null ? (
                        <span className="font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                          {p.price_full} EGP
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      {p.featured && (
                        <span className="bg-amber-950 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                          FEATURED 🔥
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Edit Prices & Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.title)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400"
                          title="Delete Game"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      {editModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white">
                {isNewModal ? 'Add New Game to Store' : `Edit Game: ${formData.title}`}
              </h3>
              <button
                onClick={() => setEditModalProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Game Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Far Cry Primal"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="Action, Shooter, RPG..."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Poster Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Pricing Grid for 3 account types */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="font-bold text-white block">Account Pricing & Availability:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Sign Price */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/30">
                    <label className="block font-bold text-emerald-400 mb-1">🎮 Sign Price (EGP):</label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={formData.price_sign}
                      onChange={(e) => setFormData({ ...formData, price_sign: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-none"
                    />
                    <label className="flex items-center gap-1.5 mt-2 cursor-pointer text-[11px] text-slate-400">
                      <input
                        type="checkbox"
                        checked={formData.is_available_sign}
                        onChange={(e) => setFormData({ ...formData, is_available_sign: e.target.checked })}
                      />
                      <span>Available</span>
                    </label>
                  </div>

                  {/* Home Price */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/30">
                    <label className="block font-bold text-cyan-400 mb-1">🏠 Home Price (EGP):</label>
                    <input
                      type="number"
                      placeholder="e.g. 70"
                      value={formData.price_home}
                      onChange={(e) => setFormData({ ...formData, price_home: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-none"
                    />
                    <label className="flex items-center gap-1.5 mt-2 cursor-pointer text-[11px] text-slate-400">
                      <input
                        type="checkbox"
                        checked={formData.is_available_home}
                        onChange={(e) => setFormData({ ...formData, is_available_home: e.target.checked })}
                      />
                      <span>Available</span>
                    </label>
                  </div>

                  {/* Full Price */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/30">
                    <label className="block font-bold text-amber-400 mb-1">👑 Full Price (EGP):</label>
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={formData.price_full}
                      onChange={(e) => setFormData({ ...formData, price_full: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-none"
                    />
                    <label className="flex items-center gap-1.5 mt-2 cursor-pointer text-[11px] text-slate-400">
                      <input
                        type="checkbox"
                        checked={formData.is_available_full}
                        onChange={(e) => setFormData({ ...formData, is_available_full: e.target.checked })}
                      />
                      <span>Available</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Game Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured_check"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="featured_check" className="font-bold text-slate-300 cursor-pointer">
                  Mark as Featured Game on Homepage 🔥
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-xbox-neon to-emerald-400 hover:from-emerald-400 text-black font-black text-xs shadow-neon-green"
                >
                  Save Game
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
