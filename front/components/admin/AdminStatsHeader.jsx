import React from 'react';
import { DollarSign, Send, TrendingUp, Clock } from 'lucide-react';

export default function AdminStatsHeader({ globalStats }) {
  const stats = [
    {
      label: "Platform Wallet Balance",
      value: `₦${((globalStats?.totalBalance || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20"
    },
    {
      label: "Total Paid Out",
      value: `₦${((globalStats?.totalTransferred || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      icon: Send,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20"
    },
    {
      label: "Total Volume Received",
      value: `₦${((globalStats?.totalEverReceived || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-500/10 border-purple-500/20"
    },
    {
      label: "Pending Payout Requests",
      value: globalStats?.totalPendingTransactions || 0,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className={`p-5 rounded-2xl border ${stat.bg} backdrop-blur-md transition-all hover:scale-[1.02] shadow-sm`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.label}</span>
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
