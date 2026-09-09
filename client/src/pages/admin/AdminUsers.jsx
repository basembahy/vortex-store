import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ShieldCheck, CheckCircle2, X, Search, User } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user: currentLoggedAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const targetRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    const confirmMsg =
      targetRole === 'ADMIN'
        ? 'Are you sure you want to promote this user to Administrator? They will receive full access to store orders and catalog.'
        : 'Are you sure you want to revoke admin privileges from this user?';

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.patch(`/admin/users/${userId}/role`, { role: targetRole });
      setMessage(`User role updated to ${targetRole}`);
      loadUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/admin/users/admin', newAdminForm);
      setMessage(`New admin user (${newAdminForm.email}) created successfully!`);
      setShowAddModal(false);
      setNewAdminForm({ name: '', email: '', password: '' });
      loadUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    return (
      !search ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>Admins & Users Management (Multi-Admin System)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Add new administrators to assist with order fulfillment or manage user roles
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute top-2.5 left-3" />
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="whitespace-nowrap bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-neon-purple transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Admin</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading users...</div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold text-center">Role</th>
                  <th className="p-4 font-semibold text-center">Registration Date</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => {
                  const isSelf = currentLoggedAdmin?.id === u.id;
                  const isAdminRole = u.role === 'ADMIN';

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full border border-slate-700" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white">
                              {u.name ? u.name[0].toUpperCase() : 'U'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-sm">{u.name || 'Gamer'}</p>
                            {isSelf && (
                              <span className="text-[10px] text-emerald-400 font-bold">(Current Account)</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-slate-300 font-mono">{u.email}</td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${
                            isAdminRole
                              ? 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-sm'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          {isAdminRole ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                              <span>ADMIN</span>
                            </>
                          ) : (
                            <>
                              <User className="w-3.5 h-3.5 text-slate-500" />
                              <span>USER</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="p-4 text-center text-slate-400">
                        {new Date(u.created_at || Date.now()).toLocaleDateString('en-US')}
                      </td>

                      <td className="p-4 text-right">
                        {isSelf ? (
                          <span className="text-[11px] text-slate-500 italic">Protected Self</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRoleToggle(u.id, u.role)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                              isAdminRole
                                ? 'bg-slate-800 hover:bg-red-950/50 text-slate-300 hover:text-red-400 border border-slate-700'
                                : 'bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 hover:text-white'
                            }`}
                          >
                            {isAdminRole ? 'Revoke Admin' : 'Promote to Admin ⚡'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add New Admin */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-md w-full bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>Create New Administrator</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950 border border-red-500/40 text-red-200 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Admin Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Miller"
                  value={newAdminForm.name}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin2@vortex.store"
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Password (6+ chars)</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  placeholder="••••••••"
                  value={newAdminForm.password}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black shadow-neon-purple"
                >
                  {submitting ? 'Creating...' : 'Create Administrator'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
