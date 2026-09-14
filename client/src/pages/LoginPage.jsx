import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight, UserCheck, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin'); // 'admin' or 'security'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address.';

    if (!password) errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password, role);
      toast.success(`Welcome back! Logged in as ${role === 'admin' ? 'Administrator' : 'Security Staff'}.`);
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoRole) => {
    if (demoRole === 'admin') {
      setEmail('admin@office.com');
      setPassword('admin123');
      setRole('admin');
    } else {
      setEmail('security@office.com');
      setPassword('security123');
      setRole('security');
    }
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-xl shadow-brand-500/20 mb-4 border border-white/10">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Apex Global Technologies
          </h1>
          <p className="text-sm text-slate-400 mt-1">Digital Visitor Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Role selector tabs */}
          <div className="flex rounded-xl bg-slate-900/80 p-1 mb-6 border border-slate-700/50">
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'admin'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Administrator
            </button>
            <button
              type="button"
              onClick={() => setRole('security')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'security'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Reception / Security
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                  }}
                  placeholder={role === 'admin' ? 'admin@office.com' : 'security@office.com'}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
                    errors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                  }}
                  placeholder="Enter password"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
                    errors.password ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In as {role === 'admin' ? 'Admin' : 'Security'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-700/70">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 text-center flex items-center justify-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-brand-400" />
              Instant Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="px-3 py-2 bg-slate-700/60 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-xl text-xs font-semibold transition flex flex-col items-center gap-0.5"
              >
                <span>Admin Login</span>
                <span className="text-[10px] text-slate-400 font-mono">admin@office.com</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('security')}
                className="px-3 py-2 bg-slate-700/60 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-xl text-xs font-semibold transition flex flex-col items-center gap-0.5"
              >
                <span>Security Login</span>
                <span className="text-[10px] text-slate-400 font-mono">security@office.com</span>
              </button>
            </div>
          </div>
        </div>

        {/* Public Visitor Link */}
        <div className="text-center mt-6">
          <a
            href="/kiosk"
            className="text-xs text-slate-400 hover:text-brand-400 transition inline-flex items-center gap-1 font-medium"
          >
            Visiting as a guest? Click here for Visitor Self-Registration Kiosk &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
