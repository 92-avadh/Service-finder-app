import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EarningsTab = ({ totalEarnings, pendingEarnings, completedJobsCount, chartData }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Earnings Overview</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-6 rounded-2xl text-white shadow-lg"><p className="text-teal-100 text-sm mb-1 uppercase tracking-wide">Total Cleared</p><h3 className="text-4xl font-black">₹{totalEarnings.toLocaleString()}</h3></div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm"><p className="text-slate-500 text-sm mb-1 uppercase tracking-wide">Pending</p><h3 className="text-4xl font-black dark:text-white">₹{pendingEarnings.toLocaleString()}</h3></div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm"><p className="text-slate-500 text-sm mb-1 uppercase tracking-wide">Jobs Completed</p><h3 className="text-4xl font-black dark:text-white">{completedJobsCount}</h3></div>
      </div>
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Earnings History</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="Earnings" stroke="#0d9488" strokeWidth={3} fillOpacity={0.2} fill="#0d9488" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EarningsTab;