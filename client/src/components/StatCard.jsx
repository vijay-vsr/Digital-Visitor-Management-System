import React from 'react';

const colorStyles = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100',
    badge: 'bg-blue-100 text-blue-800',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
    badge: 'bg-amber-100 text-amber-800',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-100',
    badge: 'bg-purple-100 text-purple-800',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-100',
    badge: 'bg-rose-100 text-rose-800',
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  trend,
  subtext,
  onClick,
}) {
  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {value !== undefined && value !== null ? value : '-'}
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${styles.bg} ${styles.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(trend || subtext) && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          {trend && (
            <span className={`px-1.5 py-0.5 rounded-md font-semibold text-[11px] ${styles.badge}`}>
              {trend}
            </span>
          )}
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}
