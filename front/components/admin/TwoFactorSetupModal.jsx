import React, { useState } from 'react';
import { QrCode, ShieldCheck, X, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/config/api';


export default function TwoFactorSetupModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: QR Setup, 2: Code Verification
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/admin/2fa/setup`);
      setQrCodeUrl(response.data.qrCodeUrl);
      setSecret(response.data.secret);
      setStep(1);
    } catch (error) {
      toast.error("Failed to generate 2FA setup details");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchQRCode();
    }
  }, [isOpen]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!totpCode || totpCode.length < 6) {
      toast.error("Please enter a valid 6-digit TOTP code");
      return;
    }

    try {
      setLoading(true);
      await api.post(`/admin/2fa/verify`, { code: totpCode });
      toast.success("Google Authenticator 2FA enabled!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-lg">
            <ShieldCheck className="w-5 h-5" />
            <span>Setup Google Authenticator (2FA)</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 space-y-4">
          {step === 1 ? (
            <div className="text-center space-y-4">
              <p className="text-xs text-slate-500">Scan this QR code using Google Authenticator, Authy, or 1Password app:</p>
              
              {qrCodeUrl ? (
                <div className="p-3 bg-white border border-slate-200 rounded-2xl inline-block shadow-sm">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-44 h-44 mx-auto" />
                </div>
              ) : (
                <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                  Generating QR code...
                </div>
              )}

              <div className="text-xs text-slate-400">
                <span>Secret key: </span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-200 select-all">{secret}</span>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-semibold text-sm transition"
              >
                I've Scanned the QR Code
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <p className="text-xs text-slate-500">Enter the 6-digit code shown in your authenticator app to activate 2FA:</p>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">6-Digit Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-center tracking-widest text-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/2 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-semibold text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || totpCode.length !== 6}
                  className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-semibold text-sm disabled:opacity-50 transition"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
