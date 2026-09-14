import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Clock, ExternalLink, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, isAdmin } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live Clock */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60">
          <Clock className="w-3.5 h-3.5 text-brand-600" />
          <span>
            {time.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-700">
            {time.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Kiosk Mode link */}
        <Link
          to="/kiosk"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-brand-600 bg-slate-50 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg border border-slate-200 transition"
          title="Open Public Visitor Self-Registration Terminal"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Visitor Kiosk</span>
        </Link>

        {/* User profile dropdown / info */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-xs ${
                isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {user?.name ? user.name.slice(0, 2) : <User className="w-4 h-4" />}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    isAdmin ? 'bg-indigo-500' : 'bg-emerald-500'
                  }`}
                />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {user?.role === 'admin' ? 'Administrator' : 'Reception / Security'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
