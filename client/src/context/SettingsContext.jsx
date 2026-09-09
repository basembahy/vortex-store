import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    instapay_username: 'vortex.store@instapay',
    vodafone_cash_number: '01012345678',
    orange_cash_number: '01212345678',
    etisalat_cash_number: '01112345678',
    whatsapp_number: '+201012345678',
    store_announcement: '🔥 NEW GAMES ARRIVED! Hot Xbox deals starting from 50 EGP! Instant digital delivery to your console.'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data && res.data.settings) {
        setSettings((prev) => ({ ...prev, ...res.data.settings }));
      }
    } catch (err) {
      console.warn('Using default store settings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, fetchSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
