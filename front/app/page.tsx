"use client"
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ScrollTrigger from "gsap/ScrollTrigger";
import ScrollSmoother from "gsap/ScrollSmoother";
import { Info, BarChart2, Gift, Edit3, Zap, PiggyBank } from "lucide-react";


// Register GSAP plugins
gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger, ScrollSmoother);

export default function LandingPage() {
  const main = useRef(null);
  const buttonRef = useRef(null);

  useGSAP(() => {
    // Create a smooth scrolling effect
    ScrollSmoother.create({
      smooth: 1,
      effects: true,
    });

    // Animate the main headline characters
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
      stagger: 0.15,
    });

    // Create a pulsing effect for the main call-to-action button
    gsap.to("#pulse-button", {
      scale: 1.1,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    // Animate the feature cards on scroll
    gsap.from(".feature-card", {
        opacity: 0,
        y: 50,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.2,
        scrollTrigger: {
            trigger: "#features-section",
            start: "top 80%", // Start animation when the top of the section is 80% down the viewport
            toggleActions: "play none none none",
        }
    });


  }); // Scope the animations to the main container

  // Function to create a "swallow" page transition
  const handleSwallow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    gsap.to(buttonRef.current, {
      scale: 50,
      duration: 1.2,
      ease: "power3.inOut",
      onComplete: () => {
        // Redirect after the animation is complete
        window.location.href = "/signin";
      },
    });
  };

  return (
    // GSAP ScrollSmoother requires this specific wrapper structure
    <>
        
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-2xl shadow-xl">
              
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-white to-yellow-100" />
              <div className="relative text-center py-20 px-6">
                <h1
                  id="animate-text-lader"
                  className="text-4xl font-poppins md:text-6xl font-extrabold text-gray-900 tracking-tight"
                >
                  Support creators <br /> with a Gala
                </h1>
                <p className="mt-4 text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
                  A friendly, fast way for fans to support your work. <br /> Set your
                  Gala price and share your page.
                </p>
                <div className="mt-8 flex items-center justify-center gap-4">
                  <Link
                    href={"/#"}
                    ref={buttonRef}
                    id="pulse-button"
                    onClick={handleSwallow}
                    className="bg-yellow-500 text-gray-900 scale-90 font-bold py-3 px-8 rounded-full text-lg hover:bg-yellow-600 transition duration-300 transform hover:scale-105 shadow-md"
                  >
                    Start my Page
                  </Link>
                </div>
              </div>
            </section>

            {/* Why Section */}
            <div className="mt-10 text-left py-12 px-8 bg-white rounded-lg shadow-xl">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Info className="mr-3 h-8 w-8 text-yellow-500" /> Why Buy Me A Gala?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700">
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                  Simple pricing per Gala. Support that adds up, one snack at a time.
                </div>
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                  Share your page link and get support instantly. No code needed.
                </div>
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                  Built with modern tech, secure auth, and optimized checkout.
                </div>
              </div>
            </div>

            {/* Features Section */}
            <section id="features-section" className="mt-10 py-12 px-8 bg-white rounded-lg shadow-xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-800">Everything You Need to Succeed</h2>
                    <p className="mt-2 text-lg text-gray-600">All the tools to grow your creative business.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Feature Card 1 */}
                    <div className="feature-card flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-yellow-400 p-3 rounded-full mb-4">
                            <Edit3 className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Create Your Campaign Page</h3>
                        <p className="text-gray-600">Easily design a beautiful page that reflects your brand. No coding skills required. Add your story, goals, and what you offer.</p>
                    </div>

                    {/* Feature Card 2 */}
                    <div className="feature-card flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-yellow-400 p-3 rounded-full mb-4">
                            <Gift className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Get Support From Fans</h3>
                        <p className="text-gray-600">Share your unique page link across your social media. Fans can support you with just a few clicks in a secure and simple checkout process.</p>
                    </div>

                    {/* Feature Card 3 */}
                    <div className="feature-card flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-yellow-400 p-3 rounded-full mb-4">
                            <PiggyBank className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Withdraw Support Gotten</h3>
                        <p className="text-gray-600">Your earnings go directly to you. Withdraw your funds easily and securely to your bank account whenever you want.</p>
                    </div>

                     {/* Feature Card 4 */}
                    <div className="feature-card flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-yellow-400 p-3 rounded-full mb-4">
                            <Zap className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Engage Your Supporters</h3>
                        <p className="text-gray-600">Unlock exclusive content, offer digital downloads, or simply send a thank you message to your amazing supporters.</p>
                    </div>
                    
                    {/* Feature Card 5 */}
                    <div className="feature-card flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-yellow-400 p-3 rounded-full mb-4">
                            <BarChart2 className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Track Your Progress</h3>
                        <p className="text-gray-600">A simple dashboard shows you who supported you, your earnings over time, and your page views to help you grow.</p>
                    </div>
                </div>
            </section>
       </>
  );
}
