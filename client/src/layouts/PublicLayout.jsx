import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-wide">Apex Global Technologies</h1>
            <p className="text-xs text-brand-300">Self-Service Visitor Kiosk</p>
          </div>
        </div>

        <Link
          to="/login"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Staff Login</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800/60">
        &copy; {new Date().getFullYear()} Apex Global Technologies &bull; Secure Digital Visitor Management
      </footer>
    </div>
  );
}
