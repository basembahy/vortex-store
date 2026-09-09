import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vortex_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('vortex_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyUser() {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('vortex_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.warn('Could not verify existing token:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    verifyUser();
  }, [token]);

  const saveAuth = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('vortex_token', newToken);
    localStorage.setItem('vortex_user', JSON.stringify(newUser));
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    saveAuth(res.data.token, res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    saveAuth(res.data.token, res.data.user);
    return res.data;
  };

  const googleLogin = async (credential) => {
    const res = await api.post('/auth/google', { credential });
    saveAuth(res.data.token, res.data.user);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vortex_token');
    localStorage.removeItem('vortex_user');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        googleLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
