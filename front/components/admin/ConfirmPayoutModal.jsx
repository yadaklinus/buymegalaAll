import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, X, KeyRound } from 'lucide-react';

export default function ConfirmPayoutModal({ isOpen, onClose, onConfirm, user, approving, twoFactorEnabled }) {
  const [totpCode, setTotpCode] = useState('');

  if (!isOpen || !user) return null;

  const formattedAmount = `₦${((user.balance || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  const handleSubmit = () => {
    onConfirm(totpCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-amber-500 font-semibold text-lg">
            <AlertTriangle className="w-5 h-5" />
            <span>Confirm Payout Approval</span>
          </div>
          <button 
            onClick={onClose}
            disabled={approving}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p>You are about to approve and authorize a payout transfer for the following creator:</p>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Creator:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{user.name} (@{user.username || 'n/a'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payout Amount:</span>
              <span className="font-bold text-emerald-500">{formattedAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Bank Name:</span>
              <span className="font-medium text-slate-900 dark:text-white">{user.bankName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Account Number:</span>
              <span className="font-mono text-slate-900 dark:text-white">{user.accountNumber || 'N/A'}</span>
            </div>
          </div>

          {twoFactorEnabled && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
                Authenticator 2FA Code Required
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            ⚠️ This action will mark the withdrawal as successful and reset the user's withdrawable balance to ₦0.00.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            disabled={approving}
            className="px-4 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={approving || (twoFactorEnabled && totpCode.length !== 6)}
            className="px-5 py-2.5 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
          >
            {approving ? (
              <span>Processing...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Approve Payout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
