"use client";

import React, { useState, useEffect } from "react";
import { Landmark, X, Copy, Check, ShieldCheck, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency } from "@/components/format-currency";
import api from "@/config/api";
import { useRouter } from "next/navigation";

interface VirtualAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaData: {
    accountNumber: string;
    bankName: string;
    accountName: string;
    amount: number;
    tx_ref: string;
    note?: string;
  } | null;
  supporterName?: string;
}

export default function VirtualAccountModal({ isOpen, onClose, vaData, supporterName }: VirtualAccountModalProps) {
  const [copied, setCopied] = useState(false);
  const [isConfirmedPaid, setIsConfirmedPaid] = useState(false);
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  // Real-time polling every 3 seconds while modal is open
  useEffect(() => {
    if (!isOpen || !vaData?.tx_ref || isConfirmedPaid) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/flutter/va-status?tx_ref=${vaData.tx_ref}`);
        if (res.data?.isPaid || res.data?.status === "SUCCESS") {
          setIsConfirmedPaid(true);
          toast.success("Payment Received & Confirmed! 🎉");
          clearInterval(interval);
        }
      } catch (err) {
        // Silent error during background polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, vaData, isConfirmedPaid]);

  if (!isOpen || !vaData) return null;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(vaData.accountNumber);
    setCopied(true);
    toast.success("Account Number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualCheck = async () => {
    try {
      setChecking(true);
      const res = await api.get(`/flutter/va-status?tx_ref=${vaData.tx_ref}`);
      if (res.data?.isPaid || res.data?.status === "SUCCESS") {
        setIsConfirmedPaid(true);
        toast.success("Payment Received & Confirmed! 🎉");
      } else {
        toast("Transfer not detected yet. If you just sent it, please wait a few seconds...", { icon: "⏳" });
      }
    } catch (err) {
      toast.error("Failed to check payment status");
    } finally {
      setChecking(false);
    }
  };

  const handleFinish = () => {
    router.push(`/thankyou?ref=${vaData.tx_ref}&amount=${vaData.amount}&name=${encodeURIComponent(supporterName || "Anonymous")}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Brand Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 absolute top-0 left-0 right-0" />

        {/* Modal Header */}
        <div className="flex justify-between items-center pt-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-xl">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Bank Transfer Checkout</h3>
              <p className="text-[11px] text-slate-400">Powered by Buy Me Gala Secure Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic State: Paid vs Awaiting */}
        {isConfirmedPaid ? (
          /* Payment Success Confirmation View */
          <div className="text-center py-6 space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Transfer Confirmed! 🎉</h2>
              <p className="text-xs text-slate-500">
                We received your payment of <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(vaData.amount)}</span>.
              </p>
            </div>

            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-xs text-emerald-700 dark:text-emerald-400">
              Thank you for supporting this creator! Your support has been recorded live on their page.
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <span>Continue to Thank You Page</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Awaiting Transfer View */
          <div className="space-y-5">
            {/* Amount Banner */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-0.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transfer Amount Exact</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {formatCurrency(vaData.amount)}
              </p>
            </div>

            {/* Bank Credentials Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Bank Name</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{vaData.bankName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Account Name</span>
                <span className="font-bold text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                  {vaData.accountName}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="block text-xs font-semibold text-slate-400 mb-1.5">Bank Account Number</span>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-mono text-xl font-black tracking-widest text-slate-900 dark:text-white">
                    {vaData.accountNumber}
                  </span>
                  <button
                    onClick={handleCopyAccount}
                    className="px-3.5 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Polling Indicator */}
            <div className="flex items-center justify-between p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
              <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-400">
                <Loader2 className="w-4 h-4 animate-spin shrink-0 text-yellow-500" />
                <span>Listening for bank transfer completion...</span>
              </div>
              <button
                onClick={handleManualCheck}
                disabled={checking}
                className="text-[11px] font-bold text-yellow-700 dark:text-yellow-400 underline whitespace-nowrap"
              >
                {checking ? "Checking..." : "I've Paid"}
              </button>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Encrypted & Verified via Bank API</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
