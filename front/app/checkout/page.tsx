"use client"
import React, { useState, useEffect } from 'react';
import { Banknote, CreditCard, AlertCircle, CheckCircle, DollarSign, ShieldCheck, X, Building2, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/config/api';
import Auths from '@/components/protect';
import Loading from '@/components/loading';
import { useRouter } from "next/navigation";
import { formatCurrency } from '@/components/format-currency';

export default function WithdrawPage() {
  const [userData, setUserData] = useState<any>(null);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/signin"); return; }

    const fetchUserData = async () => {
      setIsFetchingData(true);
      try {
        const response = await api.post('/user/checkoutData', { email: user?.email });
        const data = response.data;
        setUserData({ accountBalance: data.accountBalance, currency: "NGN" });
        setFormData({
          bankName: data.bank || '',
          accountNumber: data.accountNumber || '',
          accountName: data.accountName || '',
        });
      } catch {
        setFetchError("Could not load withdrawal information. Please try again later.");
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchUserData();
  }, [authLoading, user, router]);

  const handleInitiateWithdrawal = (e: any) => {
    e.preventDefault();
    if (userData && userData?.accountBalance > 0) {
      setPinError('');
      setIsPinModalOpen(true);
    }
  };

  const handleConfirmWithdrawal = async () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setPinError('Please enter a valid 4-digit PIN.');
      return;
    }
    setIsLoading(true);
    setPinError('');
    try {
      await api.post('/user/withdraw', { email: user?.email, pin });
      setShowSuccess(true);
      setIsPinModalOpen(false);
      setPin('');
      setTimeout(() => setShowSuccess(false), 5000);
    } catch {
      setPinError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setPin('');
    }
  };

  if (isFetchingData) return <Loading />;

  if (fetchError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white rounded-2xl p-10 shadow-sm border border-gray-100 max-w-sm">
          <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Couldn't Load Data</h2>
          <p className="text-gray-500 text-sm">{fetchError}</p>
        </div>
      </div>
    );
  }

  const hasBalance = userData?.accountBalance > 0;

  return (
    <>
      <Auths />
      <div className="max-w-4xl mx-auto min-h-screen space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 p-3 rounded-xl">
            <Banknote className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Withdraw Funds</h1>
            <p className="text-gray-500 text-sm">Transfer your earnings to your bank account</p>
          </div>
        </div>

        {/* Success Banner */}
        {showSuccess && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl p-4">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Withdrawal Request Submitted!</p>
              <p className="text-green-600 text-xs mt-0.5">Funds will be processed within 24 hours.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Available Balance</p>
              <div className="text-center py-4">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <p className="text-4xl font-extrabold text-gray-800">
                  {formatCurrency(userData?.accountBalance, userData?.currency)}
                </p>
                <p className="text-gray-400 text-xs mt-2">Ready to withdraw</p>
              </div>

              {!hasBalance && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                  <p className="text-xs text-gray-500">Share your page to start earning!</p>
                </div>
              )}
            </div>
          </div>

          {/* Withdrawal Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              {/* Info notice */}
              <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
                <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-700 text-xs leading-relaxed">
                  Withdrawals are processed within 24 hours on business days. Ensure your bank details are correct to avoid delays.
                </p>
              </div>

              <form onSubmit={handleInitiateWithdrawal} className="space-y-5">
                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      value={formData.bankName}
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed text-sm"
                    />
                  </div>
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed text-sm"
                  />
                </div>

                {/* Account Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.accountName}
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed text-sm"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
                  <h3 className="text-sm font-bold text-gray-700">Withdrawal Summary</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Available Balance</span>
                    <span className="text-gray-700 font-medium">{formatCurrency(userData?.accountBalance, userData?.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Processing Fee</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="text-gray-800 font-bold text-sm">You'll Receive</span>
                    <span className="text-yellow-600 font-extrabold">{formatCurrency(userData?.accountBalance, userData?.currency)}</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!hasBalance || isLoading}
                  className={`w-full font-bold py-4 px-4 rounded-xl text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                    hasBalance
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900 shadow-md hover:shadow-lg hover:scale-[1.01]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Banknote className="h-5 w-5" />
                  Withdraw {formatCurrency(userData?.accountBalance, userData?.currency)}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsPinModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-800 mb-1">Confirm Withdrawal</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your 4-digit transaction PIN to confirm.</p>

            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              pattern="\d{4}"
              required
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-center text-3xl tracking-[0.5em] focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all mb-2"
              placeholder="····"
            />
            {pinError && <p className="text-red-500 text-xs mb-4">{pinError}</p>}

            <button
              onClick={handleConfirmWithdrawal}
              disabled={isLoading}
              className={`w-full font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-3 ${
                isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-gray-400/30 border-t-gray-600 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm & Withdraw'
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
