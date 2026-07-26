import React from 'react';
import { ShieldAlert, Clock, UserCheck } from 'lucide-react';

export default function AuditLogTable({ logs, loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center text-slate-400">
        Loading audit trail logs...
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <ShieldAlert className="w-10 h-10 mx-auto text-slate-400" />
        <h3 className="font-semibold text-slate-700 dark:text-slate-200">No Audit Records Yet</h3>
        <p className="text-xs text-slate-400">Admin activities such as approving payouts will appear here automatically.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-500" />
            <span>Admin Audit Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time security trail of administrative actions</p>
        </div>
        <span className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-xs font-semibold">
          {logs.length} Actions Logged
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="py-4 px-6">Timestamp</th>
              <th className="py-4 px-6">Action</th>
              <th className="py-4 px-6">Admin ID</th>
              <th className="py-4 px-6">Target User ID</th>
              <th className="py-4 px-6">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                <td className="py-4 px-6 text-xs text-slate-500 flex items-center gap-2 whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="py-4 px-6">
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold">
                    {log.action}
                  </span>
                </td>
                <td className="py-4 px-6 font-mono text-xs text-slate-600 dark:text-slate-300">
                  {log.adminId}
                </td>
                <td className="py-4 px-6 font-mono text-xs text-slate-600 dark:text-slate-300">
                  {log.targetId || 'N/A'}
                </td>
                <td className="py-4 px-6 text-xs font-mono text-slate-500 max-w-xs truncate">
                  {log.details || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
