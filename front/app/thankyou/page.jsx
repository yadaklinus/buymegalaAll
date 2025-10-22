"use client";
import { useEffect, useRef } from "react";
import { Heart, CheckCircle, Share2, Home } from "lucide-react";
import Link from "next/link";
import { Gift } from "lucide-react";

export default function ThankYouPage() {
  const confettiRef = useRef(null);

  useEffect(() => {
    // Create confetti effect
    const colors = ['#FCD34D', '#FBBF24', '#F59E0B', '#EF4444', '#EC4899'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
      confettiRef.current?.appendChild(confetti);
    }

    return () => {
      if (confettiRef.current) {
        confettiRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
      {/* Confetti Container */}
      <div ref={confettiRef} className="fixed inset-0 pointer-events-none overflow-hidden z-10" />

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          opacity: 0.8;
          animation: fall linear infinite;
        }
      `}</style>

      <div className="relative z-20 max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center transform transition-all duration-500 hover:scale-105">
          {/* Success Icon with Animation */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-30" />
            <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-6">
              <CheckCircle className="h-16 w-16 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Thank You Message */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 animate-fade-in">
            Thank You! 🎉
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="h-6 w-6 text-red-500 animate-pulse" fill="currentColor" />
            <p className="text-xl text-gray-700 font-medium">
              Your support means the world!
            </p>
            <Heart className="h-6 w-6 text-red-500 animate-pulse" fill="currentColor" />
          </div>

          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
            Your generous contribution helps us continue creating amazing content. 
            You've just made someone's day brighter with your Gala! ✨
          </p>

          {/* Stats/Info Box */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-8 border border-yellow-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full p-3 mb-2 shadow-sm">
                  <Gift className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Support Sent</p>
                <p className="text-2xl font-bold text-gray-900">✓</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full p-3 mb-2 shadow-sm">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-sm text-gray-600 font-medium">You're Amazing</p>
                <p className="text-2xl font-bold text-gray-900">100%</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-full p-3 mb-2 shadow-sm">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 font-medium">Impact</p>
                <p className="text-2xl font-bold text-gray-900">High</p>
              </div>
            </div>
          </div>

          {/* Social Share Section */}
          {/* <div className="mb-8">
            <p className="text-sm text-gray-600 mb-4 font-medium">
              Know someone who might want to support too?
            </p>
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
              <Share2 className="h-5 w-5" />
              Share This Page
            </button>
          </div> */}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold py-3 px-8 rounded-full hover:bg-gray-800 transition duration-300 transform hover:scale-105 shadow-md"
            >
              <Home className="h-5 w-5" />
              Back to Home
            </Link>
            {/* <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white border-2 border-yellow-400 text-yellow-600 font-bold py-3 px-8 rounded-full hover:bg-yellow-50 transition duration-300 transform hover:scale-105"
            >
              View Dashboard
            </Link> */}
          </div>

          {/* Footer Message */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 italic">
              "Every Gala makes a difference. Thank you for being part of this journey!" 🌟
            </p>
          </div>
        </div>

        {/* Additional Floating Hearts */}
        <div className="absolute -top-10 -left-10 animate-bounce">
          <Heart className="h-12 w-12 text-yellow-400 opacity-50" fill="currentColor" />
        </div>
        <div className="absolute -bottom-10 -right-10 animate-bounce delay-300">
          <Heart className="h-16 w-16 text-orange-400 opacity-50" fill="currentColor" />
        </div>
      </div>
    </div>
  );
}

// Import this component where needed
