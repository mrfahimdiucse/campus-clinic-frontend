// File: src/components/ui/KPISummaryCards.jsx

import React from 'react';

const KPISummaryCards = ({ 
  data = { 
    completed: { value: 1284, trend: '↑ 12% this week', isPositive: true },
    active: { value: 42, trend: '↑ 8% this week', isPositive: true },
    earnings: { value: '$14,250', trend: '↓ 3% this week', isPositive: false }
  } 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* 1. Completed Deliveries Card */}
      <div className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2 mb-4">
          <span className="text-sm font-semibold text-slate-500">Completed Deliveries</span>
          
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
            data.completed.isPositive 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {data.completed.trend}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {data.completed.value.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 2. Active Deliveries Card (Pulsing Dot) */}
      <div className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-500">Active Deliveries</span>
            
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Active
            </span>
          </div>

          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
            data.active.isPositive 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {data.active.trend}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {data.active.value.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3. Total Earnings Card */}
      <div className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2 mb-4">
          <span className="text-sm font-semibold text-slate-500">Total Earnings</span>
          
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
            data.earnings.isPositive 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {data.earnings.trend}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {data.earnings.value}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KPISummaryCards;