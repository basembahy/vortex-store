import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Gamepad2, ShieldCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const redirectPath = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError(null);
      await googleLogin(credentialResponse.credential);
      navigate(redirectPath);
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.response?.data?.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  // One-click demo login for admin testing
  const handleQuickAdminLogin = async () => {
    setEmail('admin@vortex.store');
    setPassword('admin123456');
    setLoading(true);
    setError(null);
    try {
      await login('admin@vortex.store', 'admin123456');
      navigate('/admin');
    } catch (err) {
      setError('Could not sign in as demo admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-xbox-green to-purple-600 p-0.5 mx-auto shadow-neon-green">
            <div className="w-full h-full bg-vortex-dark rounded-[14px] flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-xbox-neon" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white">Sign In</h1>
          <p className="text-xs text-slate-400">Welcome back to Vortex Store</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <div className="flex justify-center flex-col items-center">
          <div className="w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Sign-In failed')}
              useOneTap
              theme="filled_black"
              shape="pill"
              text="signin_with"
            />
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-500 font-semibold">Or with Email</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Standard Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute top-3 left-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute top-3 left-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-xbox-green to-emerald-600 hover:from-emerald-600 text-black font-extrabold text-xs shadow-neon-green flex items-center justify-center gap-2 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Quick Admin Demo Button */}
        <div className="pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleQuickAdminLogin}
            className="w-full py-2.5 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Instant Demo Admin Login ⚡</span>
          </button>
        </div>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-xbox-neon hover:underline font-bold">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
}
