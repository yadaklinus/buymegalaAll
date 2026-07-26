"use client";

import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Share2, Check } from "lucide-react";
import toast from "react-hot-toast";

interface SharePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  creatorName: string;
}

export default function SharePageModal({ isOpen, onClose, username, creatorName }: SharePageModalProps) {
  const [copied, setCopied] = React.useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const pageUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/@${username}` 
    : `https://gala.codegit.tech/@${username}`;

  const shareText = `Support ${creatorName} on Buy Me Gala! 🍩 Send a Gala here: ${pageUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    toast.success("Page link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-yellow-500 font-bold text-lg">
            <Share2 className="w-5 h-5" />
            <span>Share Your Page</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="text-center space-y-3">
          <div ref={qrRef} className="inline-block p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <QRCodeSVG
              value={pageUrl}
              size={180}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/gala.png",
                x: undefined,
                y: undefined,
                height: 32,
                width: 32,
                excavate: true,
              }}
            />
          </div>
          <p className="text-xs text-slate-400">Scan QR Code to open your page on mobile</p>
        </div>

        {/* Copy Link Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Your Page Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={pageUrl}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-200 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm whitespace-nowrap"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Quick Social Buttons */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            onClick={shareToWhatsApp}
            className="py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            WhatsApp
          </button>
          <button
            onClick={shareToTwitter}
            className="py-2.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            Twitter / X
          </button>
          <button
            onClick={shareToFacebook}
            className="py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            Facebook
          </button>
        </div>
      </div>
    </div>
  );
}
