"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/config/api";

function AlertWidgetContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";

  const [currentAlert, setCurrentAlert] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const processedAlertIds = useRef<Set<string>>(new Set());

  // Web Audio API chime synthesizer (plays crisp alert sound automatically without external file dependencies)
  const playAlertSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5

      osc2.frequency.setValueAtTime(261.63, now); // C4
      osc2.frequency.exponentialRampToValueAtTime(329.63, now + 0.3); // E4

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.0);
      osc2.stop(now + 1.0);
    } catch (e) {
      console.warn("Audio Context playback prevented:", e);
    }
  };

  const alertQueue = useRef<any[]>([]);
  const isPlayingRef = useRef(false);

  // Queue Processor Function
  const processQueue = () => {
    if (isPlayingRef.current || alertQueue.current.length === 0) return;

    isPlayingRef.current = true;
    const nextAlert = alertQueue.current.shift();
    setCurrentAlert(nextAlert);
    setIsVisible(true);
    playAlertSound();

    // Adjust display speed based on queue depth (dynamic burst mode)
    const queueLength = alertQueue.current.length;
    const displayDuration = queueLength > 10 ? 2200 : queueLength > 3 ? 3500 : 5500;

    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentAlert(null);
        isPlayingRef.current = false;
        processQueue(); // Play next queued alert seamlessly
      }, 400);
    }, displayDuration);
  };

  useEffect(() => {
    if (!username) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/user/alerts-feed?username=${encodeURIComponent(username)}`);
        const alertData = response.data?.alert;

        if (alertData && !processedAlertIds.current.has(alertData.id)) {
          processedAlertIds.current.add(alertData.id);
          alertQueue.current.push(alertData);
          processQueue();
        }
      } catch (err) {
        // Silent poll error handling
      }
    }, 2000); // Poll every 2s

    return () => clearInterval(pollInterval);
  }, [username]);

  if (!username) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="bg-black/70 backdrop-blur-md text-white px-6 py-3 rounded-full text-xs font-semibold">
          OBS Alert URL Missing Username: Add <code className="text-yellow-400">?username=yourhandle</code>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex items-start justify-center pt-12 overflow-hidden select-none">
      {currentAlert && isVisible && (
        <div className="animate-in fade-in zoom-in slide-in-from-top-6 duration-500 ease-out max-w-sm w-full mx-4">
          <div className="bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-400 rounded-3xl p-6 shadow-2xl text-center border-4 border-white text-gray-900 relative overflow-hidden">
            {/* Background sparkle effect */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/20 rounded-full blur-xl" />

            {/* Bouncing Gala Icon */}
            <div className="relative mb-3">
              <img
                src="/gala.png"
                alt="Gala"
                className="w-20 h-20 mx-auto object-contain drop-shadow-xl animate-bounce"
              />
            </div>

            {/* Supporter Banner */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-md border border-white/60">
              <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
                {currentAlert.supporter}
              </h2>
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mt-0.5">
                Bought {currentAlert.galas} Gala{currentAlert.galas > 1 ? "s" : ""}! 🍩
              </p>
            </div>

            {/* Supporter Message */}
            {currentAlert.message && (
              <div className="mt-3 bg-gray-900/90 text-white rounded-xl p-3 shadow-inner">
                <p className="text-xs leading-relaxed italic">
                  "{currentAlert.message}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WidgetAlertsPage() {
  return (
    <Suspense fallback={null}>
      <AlertWidgetContent />
    </Suspense>
  );
}
