"use client"
import { Gift, CheckCircle, Heart, Lock, AlertCircle, Sparkles, MessageSquare, Trophy, Share2, Shield, Landmark, Zap, ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/components/format-currency";
import SharePageModal from "@/components/SharePageModal";
import VirtualAccountModal from "@/components/VirtualAccountModal";
import axios from "axios";
import toast from "react-hot-toast";
import postRequest from "@/hook/postRequest";
import Loading from "@/components/loading";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

export default function UserProfilePage() {
  const path = usePathname();
  const router = useRouter();

  const [galas, setGalas] = useState<any>(1);
  const [message, setMessage] = useState('');
  const [supporterName, setSupporterName] = useState('');
  const [user, setUser] = useState<any>({});
  const [processing, setProcessing] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [vaData, setVaData] = useState<any>(null);
  const [showVaModal, setShowVaModal] = useState(false);
  const [generatingVa, setGeneratingVa] = useState(false);

  const decodedPath = decodeURIComponent(path || "");
  const username = decodedPath.includes("@") ? decodedPath.split("@")[1]?.replace(/\/$/, "") : "";

  const { data, loading, error } = postRequest(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/page`,
    { username }
  ) as any;

  useEffect(() => {
    if (data) setUser(data);
  }, [data]);

  if (!decodedPath.includes("@") || !username) return notFound();
  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center bg-white rounded-2xl p-10 shadow-sm border border-gray-100 max-w-sm">
          <div className="bg-red-50 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <Zap className="h-6 w-6 text-red-400" />
          </div>
          <h2 className="font-bold text-gray-800 mb-1">Failed to load profile</h2>
          <p className="text-gray-400 text-sm">Please try again later.</p>
        </div>
      </div>
    );
  }
  if (!data?.goLive) return notFound();

  const amountValue = (parseInt(user?.galaPrice || 0) * (galas || 0));
  const pricePerGala = parseInt(user?.galaPrice || 0);
  const presetAmounts = [1, 2, 5, 10];

  const generateTxRef = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `BMG-${user.id}-${timestamp}-${random}`;
  };

  const handlePayment = async () => {
    if (!galas || galas < 1) { toast.error("Please enter a valid number of galas"); return; }
    if (amountValue < 100) { toast.error("Minimum amount is ₦100"); return; }

    setProcessing(true);
    try {
      const tx_ref = generateTxRef();

      const supportResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/support`,
        {
          tx_ref,
          tx_id: tx_ref,
          supporterName: supporterName || "Anonymous",
          message: message || "",
          amountValue,
        }
      );

      if (supportResponse.status !== 201 && supportResponse.status !== 200) {
        throw new Error("Failed to create support record");
      }

      const config = {
        public_key: `${process.env.NEXT_PUBLIC_FLUTTER_KEY}`,
        tx_ref,
        amount: amountValue,
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd,banktransfer',
        customer: {
          email: 'support@codegit.tech',
          phone_number: '08000000000',
          name: supporterName || 'Anonymous Supporter',
        },
        customizations: {
          title: 'Buy Me Gala',
          description: `Buying ${galas} Gala(s) for @${username}`,
          logo: 'https://gala.codegit.tech/gala.png',
        },
      };

      const handleFlutterPayment = useFlutterwave(config as any);

      handleFlutterPayment({
        callback: async (response) => {
          try {
            if (response.status === "successful" || response.status === "completed") {
              toast.success("Payment completed! Processing via secure Webhook... 🎉");
              setTimeout(() => {
                router.push(`/thankyou?ref=${response.tx_ref}&amount=${amountValue}&name=${encodeURIComponent(supporterName || 'Anonymous')}`);
              }, 1200);
            } else {
              toast.error("Payment was not successful. Please try again.");
            }
          } catch {
            toast.error("An error occurred. Webhook will process your payment if deducted.");
          }
          closePaymentModal();
          setProcessing(false);
        },
        onClose: () => {
          toast.error("Payment cancelled");
          setProcessing(false);
        },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to initiate payment. Please try again.");
      setProcessing(false);
    }
  };

  // Avatar initials fallback
  const initials = (user?.displayName || username || "?").charAt(0).toUpperCase();

  const handleBankTransfer = async () => {
    if (!galas || galas < 1) { toast.error("Please enter a valid number of galas"); return; }
    if (amountValue < 100) { toast.error("Minimum amount is ₦100"); return; }

    try {
      setGeneratingVa(true);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/flutter/create-virtual-account`, {
        creatorId: user.id,
        username,
        supporterName: supporterName || "Anonymous Supporter",
        amount: amountValue,
        message
      });
      setVaData(res.data);
      setShowVaModal(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to generate bank transfer details. Please use card payment.");
    } finally {
      setGeneratingVa(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Profile Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <div className="h-36 bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-300" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          {!avatarError && user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.displayName}
              className="w-24 h-24 rounded-full ring-4 ring-white shadow-xl object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="w-24 h-24 rounded-full ring-4 ring-white shadow-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
              <span className="text-3xl font-extrabold text-white">{initials}</span>
            </div>
          )}
        </div>
      </div>

      {/* Name + username below banner */}
      <div className="text-center pt-14 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900">{user?.displayName || username}</h2>
        <p className="text-gray-400 text-sm mt-0.5">@{user?.username || username}</p>
        {user?.bio && (
          <p className="mt-3 text-gray-600 text-sm max-w-md mx-auto leading-relaxed">{user.bio}</p>
        )}
        {/* Price badge & Share Button */}
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <div className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-3.5 py-1.5 rounded-full text-yellow-700 text-sm font-semibold">
            <Gift className="h-3.5 w-3.5" />
            {formatCurrency(pricePerGala)} per Gala
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="inline-flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 px-3.5 py-1.5 rounded-full text-sm font-semibold transition shadow-sm"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share Page
          </button>
        </div>
      </div>

      {/* Goal Progress Widget (If active) */}
      {user?.goalActive && user?.goalTitle && (
        <div className="max-w-xl mx-auto mb-8 bg-white rounded-2xl p-6 shadow-sm border border-yellow-200/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">{user.goalTitle}</h3>
            </div>
            <span className="text-xs font-bold text-yellow-600 bg-yellow-50 border border-yellow-100 px-2.5 py-1 rounded-full">
              {Math.min(100, Math.round(((user.totalRaised || 0) / (user.goalTarget * pricePerGala || 1)) * 100))}%
            </span>
          </div>

          {/* Progress bar track */}
          <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-gray-200/60">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{
                width: `${Math.min(100, Math.max(5, Math.round(((user.totalRaised || 0) / (user.goalTarget * pricePerGala || 1)) * 100)))}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between mt-2.5 text-xs text-gray-500">
            <span>Raised: <strong className="text-gray-800">{formatCurrency(user.totalRaised || 0)}</strong></span>
            <span>Target: <strong className="text-gray-800">{user.goalTarget} Galas ({formatCurrency(user.goalTarget * pricePerGala)})</strong></span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-4">
        {/* Support Form — wider */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Card top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-orange-400" />
            <div className="p-6 sm:p-8">
              <h1 className="text-xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                <span>Buy <span className="text-yellow-500">@{username}</span> a Gala</span>
                <img src="/gala.png" alt="Gala" className="w-6 h-6 object-contain inline-block" />
              </h1>
              <p className="text-gray-400 text-sm mb-6">Show your appreciation — every Gala counts!</p>

              <form
                onSubmit={(e) => { e.preventDefault(); handleBankTransfer(); }}
                className="space-y-5"
              >
                {/* Gala Quantity Picker */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    How many Galas?
                  </label>

                  {/* Preset cards */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {presetAmounts.map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setGalas(num)}
                        disabled={processing}
                        className={`relative flex flex-col items-center justify-center py-3.5 rounded-xl border-2 font-bold transition-all duration-150 disabled:opacity-50 ${
                          galas === num
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-md shadow-yellow-100'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-yellow-300 hover:bg-yellow-50/40'
                        }`}
                      >
                        {galas === num && (
                          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-yellow-500" />
                        )}
                        <img src="/gala.png" alt="gala" className="w-8 h-8 object-contain" />
                        <span className="text-lg font-extrabold mt-0.5">{num}</span>
                        <span className="text-[10px] text-gray-400 font-normal mt-0.5">{formatCurrency(num * pricePerGala)}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom amount input */}
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Custom</span>
                    <input
                      type="number"
                      value={galas}
                      onChange={(e) => setGalas(e.target.value ? parseInt(e.target.value, 10) : '')}
                      disabled={processing}
                      className="w-full pl-16 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-center focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all disabled:opacity-50"
                      min="1"
                      max="100"
                      placeholder="Enter any number..."
                    />
                  </div>

                  {/* Live total */}
                  <div className="mt-3 flex items-center justify-between bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-2.5">
                    <span className="text-xs text-yellow-600 font-medium">{galas || 0} gala{galas !== 1 ? 's' : ''} × {formatCurrency(pricePerGala)}</span>
                    <span className="text-base font-extrabold text-yellow-700">{formatCurrency(amountValue)}</span>
                  </div>
                </div>

                {/* Supporter Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    placeholder="Stay anonymous or tell them your name..."
                    value={supporterName}
                    onChange={(e) => setSupporterName(e.target.value)}
                    disabled={processing}
                    maxLength={50}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all disabled:opacity-50"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Leave a Message</label>
                  <textarea
                    placeholder="Say something nice... ✨"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={processing}
                    maxLength={500}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all disabled:opacity-50 resize-none"
                  />
                  <p className="text-right text-xs text-gray-400 mt-1">{message.length}/500</p>
                </div>

                {/* Single Primary Payment CTA Button */}
                <button
                  type="submit"
                  disabled={generatingVa || !galas || galas < 1}
                  className={`w-full font-bold py-4 rounded-2xl text-base transition-all duration-200 flex items-center justify-center gap-2.5 ${
                    generatingVa || !galas || galas < 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-900 shadow-lg shadow-yellow-500/25 hover:scale-[1.01]'
                  }`}
                >
                  {generatingVa ? (
                    <>
                      <div className="h-5 w-5 rounded-full border-2 border-slate-900/30 border-t-slate-900 animate-spin" />
                      Generating Secure Bank Details...
                    </>
                  ) : (
                    <>
                      <Landmark className="h-5 w-5 text-slate-900" />
                      Support {formatCurrency(amountValue)} via Bank Transfer
                    </>
                  )}
                </button>

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Shield className="h-3.5 w-3.5 text-green-500" />
                    Secure payment
                  </span>
                  <span className="text-gray-200">|</span>
                  <span className="text-xs text-gray-400">Powered by Flutterwave</span>
                </div>
              </form>
            </div>

            {/* Supporter Wall & Recent Activity Feed */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mt-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-yellow-500/10 text-yellow-600 rounded-xl">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg">Supporters Wall</h3>
                    <p className="text-xs text-gray-400">Recent Galas & messages sent by fans</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-bold">
                  {user?.supports?.length || 0} Total Supports
                </span>
              </div>

              {user?.supports && user.supports.length > 0 ? (
                <div className="space-y-4">
                  {user.supports.map((sup: any, idx: number) => (
                    <div key={sup.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center font-bold text-white text-sm shrink-0">
                        {sup.supporter?.charAt(0)?.toUpperCase() || "A"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{sup.supporter || "Anonymous Fan"}</h4>
                          <span className="px-2.5 py-0.5 bg-yellow-500/10 text-yellow-700 border border-yellow-500/20 rounded-full text-[11px] font-extrabold whitespace-nowrap flex items-center gap-1">
                            <img src="/gala.png" alt="Gala" className="w-3 h-3 object-contain" />
                            {sup.amount ? Math.round(sup.amount / (pricePerGala || 500)) : 1} Gala
                          </span>
                        </div>
                        {sup.message && (
                          <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100 mt-1">
                            "{sup.message}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-yellow-400" />
                  <p className="text-sm font-semibold text-gray-600">Be the First Supporter!</p>
                  <p className="text-xs">Send a Gala above to leave your name and message on this wall.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar — creator info + tips */}
        <div className="lg:col-span-2 space-y-4">
          {/* Creator Bio Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">About</h3>
            <div className="border-l-4 border-yellow-400 bg-yellow-50 rounded-r-xl p-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                {user?.bio || `Support ${user?.displayName || username} by buying them a Gala!`}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">Price per Gala</p>
                <p className="font-extrabold text-yellow-600">{formatCurrency(pricePerGala)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">Your Total</p>
                <p className="font-extrabold text-gray-800">{formatCurrency(amountValue)}</p>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">How it Works</h3>
            <div className="space-y-3">
              {[
                { icon: <img src="/gala.png" alt="Gala" className="w-5 h-5 object-contain" />, text: "Choose how many Galas to send" },
                { icon: "💬", text: "Leave an optional message" },
                { icon: "💳", text: "Complete secure payment" },
                { icon: "🎉", text: "Creator gets notified instantly!" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{step.icon}</span>
                  <p className="text-gray-600 text-sm leading-snug">{step.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 px-2 leading-relaxed">
            This page is hosted on <span className="font-semibold text-yellow-600">Buy Me Gala</span>. Your payment goes directly to the creator.
          </p>
        </div>
      </div>

      {/* Share Modal Component */}
      <SharePageModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        username={user?.username || username}
        creatorName={user?.displayName || user?.name || username}
      />
      {/* Virtual Account Modal */}
      <VirtualAccountModal
        isOpen={showVaModal}
        onClose={() => setShowVaModal(false)}
        vaData={vaData}
        supporterName={supporterName}
      />
    </div>
  );
}