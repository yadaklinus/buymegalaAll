"use client"
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Info, BarChart2, Gift, Edit3, Zap, PiggyBank, ArrowRight, Star, CheckCircle } from "lucide-react";

// Register GSAP plugins
gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger);

export default function LandingPage() {
  const main = useRef(null);
  const buttonRef = useRef(null);

  useGSAP(() => {
    ScrollTrigger.getAll().forEach((t) => t.kill());

    let splitText = new SplitText("#animate-text-lader", {
      type: "chars",
      charsClass: "animate-char",
    });

    gsap.from(splitText.chars, {
      y: -100,
      opacity: 0,
      rotation: "random(-80, 80)",
      duration: 0.7,
      ease: "back",
      stagger: 0.12,
    });

    gsap.to("#pulse-button", {
      scale: 1.05,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    gsap.from(".feature-card", {
      opacity: 0,
      y: 60,
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.15,
      scrollTrigger: {
        trigger: "#features-section",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    gsap.from(".stat-card", {
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      ease: "back",
      stagger: 0.1,
      scrollTrigger: {
        trigger: "#stats-section",
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, { scope: main });

  const handleSwallow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    gsap.to(buttonRef.current, {
      scale: 50,
      duration: 1.2,
      ease: "power3.inOut",
      onComplete: () => { window.location.href = "/signin"; },
    });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-yellow-100 to-white" />
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300/40 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-yellow-400/30 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />

        <div className="relative text-center py-24 px-6">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/40 text-yellow-800 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
            Nigeria's #1 Creator Support Platform
          </div>
          <h1
            id="animate-text-lader"
            className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight"
          >
            Support creators <br />
            <span className="text-yellow-500">with a Gala</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A friendly, fast way for fans to support your work. <br />
            Set your Gala price and share your page — it's that simple.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={"/#"}
              ref={buttonRef}
              id="pulse-button"
              onClick={handleSwallow}
              className="bg-yellow-500 text-gray-900 font-bold py-4 px-10 rounded-full text-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg shadow-yellow-500/30 flex items-center gap-2"
            >
              Start My Page
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/about"
              className="text-gray-700 font-semibold py-4 px-8 rounded-full text-lg border border-gray-300 hover:border-gray-400 hover:bg-white transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">No credit card required · Free to start</p>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Creators Supported", value: "1,000+" },
          { label: "Galas Sent", value: "50,000+" },
          { label: "Total Paid Out", value: "₦25M+" },
        ].map((stat) => (
          <div key={stat.label} className="stat-card bg-white rounded-xl p-6 text-center shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <p className="text-3xl font-extrabold text-yellow-500">{stat.value}</p>
            <p className="text-gray-500 mt-1 text-sm font-medium">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Why Section */}
      <div className="mt-8 py-12 px-8 bg-white rounded-2xl shadow-md border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <span className="bg-yellow-100 p-2 rounded-lg">
            <Info className="h-6 w-6 text-yellow-500" />
          </span>
          Why Buy Me A Gala?
        </h2>
        <p className="text-gray-500 mb-8 ml-14">Everything you need, nothing you don't.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              title: "Simple Pricing",
              desc: "Set your price per Gala once. Support that adds up naturally, one snack at a time.",
            },
            {
              title: "Instant Share",
              desc: "Share your page link across socials and get support instantly. Zero tech skills needed.",
            },
            {
              title: "Secure & Fast",
              desc: "Built with modern security — secure auth, encrypted payments, and fast payouts.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-5 rounded-xl bg-gradient-to-br from-yellow-50 to-white border border-yellow-100 hover:border-yellow-300 transition-all hover:shadow-md group"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-yellow-500" />
                <h3 className="font-bold text-gray-800 group-hover:text-yellow-600 transition-colors">{item.title}</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <section id="features-section" className="mt-8 py-14 px-8 bg-white rounded-2xl shadow-md border border-gray-100">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-800">Everything You Need to Succeed</h2>
          <p className="mt-3 text-lg text-gray-500 max-w-lg mx-auto">All the tools to grow your creative business — in one clean platform.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Edit3 className="h-7 w-7 text-white" />,
              title: "Create Your Campaign Page",
              desc: "Easily design a beautiful page that reflects your brand. Add your story, goals, and what you offer.",
              color: "from-yellow-400 to-orange-400",
            },
            {
              icon: <Gift className="h-7 w-7 text-white" />,
              title: "Get Support From Fans",
              desc: "Share your unique page link across socials. Fans can support you in just a few clicks.",
              color: "from-yellow-400 to-yellow-500",
            },
            {
              icon: <PiggyBank className="h-7 w-7 text-white" />,
              title: "Withdraw Your Earnings",
              desc: "Withdraw your funds easily and securely to your bank account whenever you want.",
              color: "from-amber-400 to-yellow-400",
            },
            {
              icon: <Zap className="h-7 w-7 text-white" />,
              title: "Engage Your Supporters",
              desc: "Send thank you messages to your amazing supporters and keep them coming back.",
              color: "from-yellow-500 to-orange-500",
            },
            {
              icon: <BarChart2 className="h-7 w-7 text-white" />,
              title: "Track Your Progress",
              desc: "A simple dashboard shows who supported you, your earnings, and your page stats.",
              color: "from-orange-400 to-yellow-400",
            },
          ].map((feat) => (
            <div
              key={feat.title}
              className="feature-card group flex flex-col p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-yellow-300 hover:bg-white hover:shadow-lg transition-all duration-300 cursor-default"
            >
              <div className={`bg-gradient-to-br ${feat.color} p-3 rounded-xl w-fit mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition-colors">{feat.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="mt-8 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 p-12 text-center shadow-xl shadow-yellow-400/30">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Ready to start?</h2>
        <p className="text-gray-800/80 text-lg mb-8 max-w-md mx-auto">
          Join thousands of creators already receiving support from their fans.
        </p>
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg"
        >
          Create My Page
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>
    </>
  );
}
