import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'green' | 'amber' | 'blue' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'green',
}) => {
  const badgeClasses = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  }[badgeColor];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 pt-0.5">{subtitle}</p>}
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-50 text-forest border border-emerald-100 group-hover:scale-105 transition-transform">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
      {badge && (
        <div className="mt-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${badgeClasses}`}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};
