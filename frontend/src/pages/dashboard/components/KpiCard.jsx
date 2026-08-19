import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

const KpiCard = ({ title, value, change, icon, color }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    sky: 'bg-sky-50 border-sky-100 text-sky-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    rose: 'bg-rose-50 border-rose-100 text-rose-600',
    violet: 'bg-violet-50 border-violet-100 text-violet-600',
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
  };

  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value != null ? value : '-'}</h3>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${colorMap[color] || 'bg-slate-50 border-slate-100'}`}>
          {icon}
        </div>
      </div>
      
      {change != null && (
        <div className="flex items-center gap-1.5 mt-auto">
          {isPositive && <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />}
          {isNegative && <ArrowTrendingDownIcon className="w-4 h-4 text-rose-500" />}
          {!isPositive && !isNegative && <span className="w-4 h-4 text-slate-400 font-bold">-</span>}
          
          <span className={`text-xs font-bold ${isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-500'}`}>
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-xs text-slate-400 font-medium ml-1">vs prev period</span>
        </div>
      )}
    </div>
  );
};

export default KpiCard;
