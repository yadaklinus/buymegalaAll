"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import api from "@/config/api";
import Auths from "@/components/protect";
import Loading from "@/components/loading";
import { formatCurrency } from "@/components/format-currency";
import { User, DollarSign, Settings, Save, QrCode, Download, Share2, Gift, Tv, Copy } from "lucide-react";
import QRCode from "qrcode";
import { toPng } from "html-to-image";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [galaPrice, setGalaPrice] = useState<any>(500);
  const [activate, setActivate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);

  // Social Share Card Exporter State
  const [showCardModal, setShowCardModal] = useState(false);
  const [isExportingCard, setIsExportingCard] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownloadShareCard = async () => {
    if (!cardRef.current) return;
    setIsExportingCard(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `buymegala-${username}-share-card.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Social Share Card downloaded! 📸");
    } catch (err) {
      toast.error("Failed to generate share card image");
    } finally {
      setIsExportingCard(false);
    }
  };

  const handleTriggerTestObsAlert = async () => {
    try {
      await api.post("/user/test-alert");
      toast.success("Test alert sent to OBS Studio! 📺");
    } catch {
      toast.error("Failed to send test alert");
    }
  };

  // Goal state
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState<any>(10);
  const [goalActive, setGoalActive] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  // KYC Tier state
  const [kycTier, setKycTier] = useState(1);
  const [bvnInput, setBvnInput] = useState("");
  const [ninInput, setNinInput] = useState("");
  const [dobInput, setDobInput] = useState("");
  const [bvnVerified, setBvnVerified] = useState(false);
  const [ninVerified, setNinVerified] = useState(false);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/signin"); return; }
    if (user?.email) {
      setEmail(user.email);
      main(user.email);
    }
  }, [authLoading, user, router]);

  async function main(userEmail?: string) {
    try {
      setIsLoading(true);
      const res = await api.post(`/user/setting`, { email: userEmail || email });
      setActivate(res.data.pageStatus);
      setGalaPrice(!res.data.galaPrice || res.data.galaPrice === 0 ? 500 : res.data.galaPrice);
      setDisplayName(res.data.name);
      setGoalTitle(res.data.goalTitle || "");
      setGoalTarget(res.data.goalTarget || 10);
      setGoalActive(Boolean(res.data.goalActive));
      setKycTier(res.data.kycTier || 1);
      setBvnVerified(Boolean(res.data.bvnVerified));
      setNinVerified(Boolean(res.data.ninVerified));
      const userHandle = res.data.username || "";
      setUsername(userHandle);

      if (userHandle && typeof window !== "undefined") {
        const fullPageUrl = `${window.location.origin}/@${userHandle}`;
        
        // Generate QR code with High error correction (H)
        QRCode.toCanvas(fullPageUrl, { width: 340, margin: 2, errorCorrectionLevel: 'H' }, (err: Error | null | undefined, canvas: HTMLCanvasElement) => {
          if (!err && canvas) {
            const ctx = canvas.getContext('2d');
            const logo = new Image();
            logo.src = '/gala.png';
            logo.onload = () => {
              if (ctx) {
                // Calculate size keeping natural aspect ratio
                const targetWidth = canvas.width * 0.22;
                const aspectRatio = logo.naturalWidth / (logo.naturalHeight || 1);
                const targetHeight = targetWidth / aspectRatio;
                
                const x = (canvas.width - targetWidth) / 2;
                const y = (canvas.height - targetHeight) / 2;

                // Draw transparent PNG directly without white circle overlay
                ctx.drawImage(logo, x, y, targetWidth, targetHeight);
              }
              setQrUrl(canvas.toDataURL('image/png'));
            };
          }
        });
      }
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    if (galaPrice < 500 || galaPrice > 5000) {
      toast.error("Price must be between ₦500 and ₦5,000");
      setIsSaving(false);
      return;
    }
    try {
      const res = await api.post(`/user/changePrice`, { email, newPrice: galaPrice });
      if (res.status === 200) toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGoal(true);
    try {
      const res = await api.post(`/user/goal`, {
        goalTitle,
        goalTarget,
        goalActive,
      });
      if (res.status === 200) toast.success("Gala Goal updated successfully! 🎯");
    } catch {
      toast.error("Failed to update Gala Goal");
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingKyc(true);
    try {
      const res = await api.post(`/user/submit-kyc`, {
        bvn: bvnInput,
        nin: ninInput,
        dob: dobInput,
      });
      if (res.status === 200) {
        toast.success(res.data.message);
        setKycTier(res.data.kycTier);
        setBvnVerified(res.data.bvnVerified);
        setNinVerified(res.data.ninVerified);
        setBvnInput("");
        setNinInput("");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit verification details");
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  if (authLoading || isLoading) return <Loading />;

  return (
    <>
      <Auths />
      <div className="max-w-4xl mx-auto min-h-screen space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 p-3 rounded-xl">
            <Settings className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Settings</h1>
            <p className="text-gray-500 text-sm">Manage your account and page preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Preview & QR Code */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">Profile Preview</h3>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center mx-auto mb-4 shadow-md ring-4 ring-yellow-100">
                  <span className="text-2xl font-bold text-white">
                    {displayName?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-gray-800">{displayName}</h4>
                <p className="text-gray-400 text-sm">@{username}</p>

                <div className="mt-5 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                  <p className="text-xs text-gray-400 mb-1">Price per Gala</p>
                  <p className="text-2xl font-extrabold text-yellow-600">{formatCurrency(galaPrice || 500)}</p>
                </div>

                {qrUrl && (
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => setShowQrModal(true)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm"
                    >
                      <QrCode className="h-4 w-4 text-yellow-400" />
                      Get Page QR Code
                    </button>
                    <button
                      onClick={() => setShowCardModal(true)}
                      className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-sm"
                    >
                      <Share2 className="h-4 w-4" />
                      Create Social Share Card 📸
                    </button>
                  </div>
                )}

                {/* OBS Alert Widget Link Card */}
                {username && (
                  <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200 text-left space-y-2">
                    <div className="flex items-center gap-2 text-gray-800 font-bold text-xs">
                      <Tv className="h-4 w-4 text-yellow-600" />
                      OBS Live Stream Alert
                    </div>
                    <p className="text-[11px] text-gray-500 leading-snug">
                      Paste this URL as a Browser Source in OBS or Streamlabs:
                    </p>
                    <div className="bg-white border border-gray-200 rounded-lg p-2 flex items-center justify-between text-[11px] font-mono text-gray-600 truncate">
                      <span className="truncate">{typeof window !== "undefined" ? window.location.origin : ""}/widget/alerts?username={username}</span>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/widget/alerts?username=${username}`;
                          navigator.clipboard.writeText(url);
                          toast.success("OBS Widget URL copied!");
                        }}
                        className="p-1 text-gray-500 hover:text-gray-800 shrink-0"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={handleTriggerTestObsAlert}
                      className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Tv className="h-3.5 w-3.5" />
                      Send Sample Stream Alert 📺
                    </button>
                  </div>
                )}

                <div className="mt-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    activate
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${activate ? "bg-green-500" : "bg-gray-400"}`} />
                    {activate ? "Page Active" : "Page Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">Account Settings</h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      id="displayName"
                      value={displayName}
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Display name is tied to your account</p>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">@</span>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      disabled
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Username cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="galaPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Gala
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">₦</span>
                    <input
                      type="number"
                      id="galaPrice"
                      value={galaPrice}
                      onChange={(e) => setGalaPrice(e.target.value)}
                      min="500"
                      max="5000"
                      step="50"
                      className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all text-sm"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Min: ₦500 · Max: ₦5,000</p>
                </div>

                <div className="pt-2">
                  <button
                    disabled={isSaving}
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-gray-900/30 border-t-gray-900 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Gala Goal Configuration Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mt-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    🎯 Gala Goal Progress Bar
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Show fans what you are raising Galas for</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={goalActive}
                    onChange={(e) => setGoalActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>

              <form onSubmit={handleGoalSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Goal Title</label>
                  <input
                    type="text"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g. Help me buy a new camera 📷"
                    maxLength={70}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Number of Galas</label>
                  <input
                    type="number"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    min={1}
                    max={10000}
                    placeholder="e.g. 50"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Target value: {formatCurrency((parseInt(goalTarget, 10) || 0) * (galaPrice || 500))}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSavingGoal}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSavingGoal ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Updating Goal...
                    </>
                  ) : (
                    "Save Gala Goal 🎯"
                  )}
                </button>
              </form>
            </div>

            {/* Account Verification & Fixed Tier 1 Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mt-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    🛡️ Standard Tier 1 Creator Limits
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">All platform creators operate on fixed Tier 1 limits</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold border bg-yellow-50 text-yellow-800 border-yellow-200">
                  Tier 1 Starter Active
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400">Max Gala Price</p>
                  <p className="text-base font-bold text-gray-800">₦1,000</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Daily Payout Limit</p>
                  <p className="text-base font-bold text-gray-800">₦10,000</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Monthly Payout Limit</p>
                  <p className="text-base font-bold text-gray-800">₦50,000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Share Card Exporter Modal */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Social Media Share Card</h3>
            <p className="text-xs text-gray-400">Share this image on Instagram Stories, Twitter, or WhatsApp!</p>

            {/* Rendered Share Card Element */}
            <div
              ref={cardRef}
              className="bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-400 p-6 rounded-2xl text-gray-900 text-center shadow-md relative overflow-hidden space-y-3"
            >
              <div className="inline-flex items-center gap-1.5 bg-white/40 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-extrabold text-gray-900">
                <Gift className="h-3.5 w-3.5" /> Buy Me Gala
              </div>

              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto shadow-md ring-4 ring-white/50">
                <span className="text-2xl font-extrabold text-yellow-600">
                  {displayName?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>

              <div>
                <h4 className="text-xl font-extrabold tracking-tight">{displayName}</h4>
                <p className="text-xs font-semibold text-gray-800/80">@{username}</p>
              </div>

              <div className="bg-white/90 backdrop-blur-md rounded-xl p-2.5 text-center shadow-sm">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Support Price</p>
                <p className="text-lg font-extrabold text-yellow-600">{formatCurrency(galaPrice || 500)} / Gala</p>
              </div>

              {qrUrl && (
                <div className="bg-white p-2 rounded-xl inline-block shadow-sm">
                  <img src={qrUrl} alt="QR Code" className="w-24 h-24 mx-auto rounded" />
                </div>
              )}

              <p className="text-[10px] font-bold text-gray-800/70 tracking-wide uppercase">gala.codegit.tech/@{username}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleDownloadShareCard}
                disabled={isExportingCard}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isExportingCard ? (
                  <>
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-900/30 border-t-gray-900 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Download Card PNG
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCardModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-3 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Download Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Your Creator QR Code</h3>
            <p className="text-xs text-gray-400">Scan to open @{username}'s Gala page</p>

            {qrUrl && (
              <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 inline-block">
                <img src={qrUrl} alt="Creator QR Code" className="w-52 h-52 mx-auto rounded-lg" />
              </div>
            )}

            <div className="flex gap-2">
              <a
                href={qrUrl}
                download={`buymegala-${username}-qr.png`}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </a>
              <button
                onClick={() => setShowQrModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-3 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}