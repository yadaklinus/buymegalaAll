"use client";

import "@/styles/globals.css";
import "@/styles/style.css";
import clsx from "clsx";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/navbar";
import SessionProvide from "@/components/sessionProvider";
import { usePathname } from "next/navigation";

const year = new Date().getFullYear();

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWidget = pathname?.startsWith("/widget");

  if (isWidget) {
    return (
      <SessionProvide>
        <html suppressHydrationWarning lang="en" className="bg-transparent">
          <body className="bg-transparent overflow-hidden">
            {children}
          </body>
        </html>
      </SessionProvide>
    );
  }

  return (
    <SessionProvide>
      <html suppressHydrationWarning lang="en">
        <head>
          <title>Buy Me Gala - Support Creators Effortlessly</title>
          <meta name="description" content="Buy Me Gala is the fastest, simplest platform for fans to support creators, streamers, and developers directly." />
          <meta name="keywords" content="Buy Me Gala, creator support, micro-donations, creator platform, Nigerian creators" />
          <meta name="robots" content="index, follow, max-image-preview:large" />
          <link rel="icon" type="image/png" href="/gala.png" />
          <link rel="apple-touch-icon" href="/gala.png" />
          <meta property="og:site_name" content="Buy Me Gala" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Buy Me Gala - Support Creators Effortlessly" />
          <meta property="og:description" content="A friendly, fast way for fans to support your work. Set your Gala price and share your page." />
          <meta name="twitter:card" content="summary_large_image" />
        </head>
        <body className={clsx("min-h-screen bg-gray-50 font-sans antialiased text-gray-900")}>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    borderRadius: "12px",
                    background: "#1f2937",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "500",
                  },
                }}
              />
              <Analytics />
              {children}
            </main>
            <footer className="border-t border-gray-200 bg-white mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
                <p className="text-gray-400 text-sm">
                  Buy Me A Gala &copy; {year} &mdash; Developed with ❤️ by{" "}
                  <span className="text-yellow-500 font-semibold">Code Git</span>
                </p>
              </div>
            </footer>
          </div>
        </body>
      </html>
    </SessionProvide>
  );
}
