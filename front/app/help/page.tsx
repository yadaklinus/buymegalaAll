"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, MessageSquare, ShieldCheck, Zap, DollarSign } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is Buy Me Gala?",
      a: "Buy Me Gala is a fast, friendly creator support platform designed to help creators, artists, developers, and writers receive financial support directly from their fans.",
    },
    {
      q: "How do payouts and withdrawals work?",
      a: "All Gala earnings accumulate directly in your Wallet Balance. You can request a withdrawal to your Nigerian bank account anytime from the Withdraw page. Withdrawals are processed within 24 hours.",
    },
    {
      q: "Is there a transaction fee for supporters?",
      a: "Supporters pay the exact Gala amount set by the creator. All card and bank transfers are securely processed via Flutterwave.",
    },
    {
      q: "How do I set or change my Gala price?",
      a: "Go to your Settings page, enter your desired price per Gala (between ₦500 and ₦5,000), and click Save Changes.",
    },
    {
      q: "What happens if a supporter leaves a message?",
      a: "Messages appear live in your Dashboard under the Supporters tab. You can view supporters, amounts, and messages in real time.",
    },
    {
      q: "How do I share my page with my audience?",
      a: "Copy your unique page link (`gala.codegit.tech/@yourname`) or download your unique QR Code from Settings to share on social media.",
    },
    {
      q: "How do I get paid?",
      a: "Go to Settings -> Payout Details, add your local NGN bank account details, and request a withdrawal anytime. Payouts are reviewed and approved directly by the platform admin.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Banner */}
      <div className="text-center bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
        <div className="bg-yellow-100 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="h-7 w-7 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h1>
        <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-md mx-auto">
          Have questions about Buy Me Gala? Here’s everything you need to know.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border border-gray-100 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-gray-800 hover:bg-yellow-50/50 transition-colors"
              >
                <span className="text-base sm:text-lg">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-yellow-600" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support CTA */}
      <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl p-8 text-center shadow-md">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Still need help?</h2>
        <p className="text-gray-800/80 text-sm mb-6 max-w-sm mx-auto">
          Our support team is here to assist you with any questions or account issues.
        </p>
        <Link
          href="mailto:support@codegit.tech"
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow-lg transition-all"
        >
          <MessageSquare className="h-4 w-4" />
          Contact Support
        </Link>
      </div>
    </div>
  );
}
