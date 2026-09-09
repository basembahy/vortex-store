import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, CreditCard, MessageCircle } from 'lucide-react';
import api from '../../api/client';
import { useSettings } from '../../context/SettingsContext';

export default function AdminSettings() {
  const { settings, fetchSettings } = useSettings();
  const [form, setForm] = useState({
    instapay_username: '',
    vodafone_cash_number: '',
    orange_cash_number: '',
    etisalat_cash_number: '',
    whatsapp_number: '',
    store_announcement: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (settings) {
      setForm({
        instapay_username: settings.instapay_username || '',
        vodafone_cash_number: settings.vodafone_cash_number || '',
        orange_cash_number: settings.orange_cash_number || '',
        etisalat_cash_number: settings.etisalat_cash_number || '',
        whatsapp_number: settings.whatsapp_number || '',
        store_announcement: settings.store_announcement || ''
      });
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await api.put('/settings', form);
      setMessage('Store settings and payment methods updated successfully!');
      fetchSettings();
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      alert('Error saving settings');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-yellow-400" />
          <span>Store & Payment Configurations</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure your InstaPay handle, mobile wallet numbers, and customer announcement ticker
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 shadow-neon-green">
          <CheckCircle2 className="w-4 h-4 text-xbox-neon shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        
        {/* Payment Methods Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <CreditCard className="w-4 h-4 text-purple-400" />
            <span>Transfer & Mobile Wallets:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-purple-300 mb-1">⚡ InstaPay Username / Address:</label>
              <input
                type="text"
                required
                placeholder="vortex.store@instapay"
                value={form.instapay_username}
                onChange={(e) => setForm({ ...form, instapay_username: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-red-400 mb-1">🔴 Vodafone Cash Number:</label>
              <input
                type="text"
                required
                placeholder="01012345678"
                value={form.vodafone_cash_number}
                onChange={(e) => setForm({ ...form, vodafone_cash_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-orange-400 mb-1">🟠 Orange Cash Number:</label>
              <input
                type="text"
                placeholder="01212345678"
                value={form.orange_cash_number}
                onChange={(e) => setForm({ ...form, orange_cash_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-emerald-400 mb-1">🟢 Etisalat Cash Number:</label>
              <input
                type="text"
                placeholder="01112345678"
                value={form.etisalat_cash_number}
                onChange={(e) => setForm({ ...form, etisalat_cash_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Support & Announcements Section */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Support & Store Announcements:</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">WhatsApp Customer Support Number:</label>
              <input
                type="text"
                required
                placeholder="+201012345678"
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white outline-none focus:border-purple-500 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Tip: Include country code (e.g. +20) for automatic direct WhatsApp chat links.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Top Announcement Banner Text:</label>
              <textarea
                rows="2"
                placeholder="NEW GAMES ARRIVED! Hot Xbox deals starting from 50 EGP! Instant digital delivery..."
                value={form.store_announcement}
                onChange={(e) => setForm({ ...form, store_announcement: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="py-3 px-8 rounded-2xl bg-gradient-to-r from-xbox-neon to-emerald-400 hover:from-emerald-400 text-black font-black text-xs shadow-neon-green flex items-center gap-2 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
