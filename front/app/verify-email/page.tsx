"use client";

import React, { useState, useEffect } from "react";
import { Mail, KeyRound, ArrowRight, RefreshCw, CheckCircle2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/config/api";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (user?.emailVerified) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) {
      toast.error("User email not found. Please log in again.");
      return;
    }
    if (otp.length !== 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/verify-otp", {
        email: user.email,
        code: otp
      });
      toast.success("Email verified successfully!");
      if (refreshUser) await refreshUser();
      router.replace("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Invalid or expired verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!user?.email) return;
    if (cooldown > 0) return;

    try {
      setResending(true);
      await api.post("/auth/send-otp", { email: user.email });
      toast.success("New verification code sent to your email!");
      setCooldown(60); // 60s cooldown timer
    } catch (error: any) {
      const errMsg = error.response?.data?.error || "Failed to resend verification code";
      toast.error(errMsg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Verify Your Email</h1>
          <p className="text-sm text-slate-500">
            We sent a 6-digit code to <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.email || "your email"}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Enter 6-Digit Code
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-center tracking-[0.5em] text-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-2xl transition shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying Code...</span>
            ) : (
              <>
                <span>Verify & Continue</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-3">
          <p className="text-xs text-slate-400">Didn't receive the email code?</p>
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 hover:underline inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
            <span>{cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Verification Code"}</span>
          </button>

          <p className="text-[11px] text-slate-400 pt-2">
            🛡️ Protected by anti-bot rate limits to prevent email spam.
          </p>
        </div>
      </div>
    </div>
  );
}
