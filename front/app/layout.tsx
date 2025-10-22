import "@/styles/globals.css";
import "@/styles/style.css";
import { Metadata, Viewport } from "next";

import clsx from "clsx";

import {Toaster} from 'react-hot-toast'
import 'dotenv'
import { Analytics } from "@vercel/analytics/next"

import  Navbar  from "@/components/navbar";
import SessionProvide from "@/components/sessionProvider";

export const metadata: Metadata = {
  title: "Buy Me Gala",
  description:
    "A friendly, fast way for fans to support your work. Set your Gala price and share your page.",
  keywords: ["codegit", "code git", "coding", "teaching"],
  // authors: [{ name: "Yadak Linus", url: "https://yadak.com.ng" }],
  // metadataBase: new URL("https://yadak.com.ng"),
  robots: {
    index: true,
    follow: true,
  },
  // alternates: {
  //   canonical: "https://yadak.com.ng",
  // },
  icons: {
    icon: "./gala.png",
  },
  // openGraph: {
  //   title: "Yadak Linus",
  //   description:
  //     "A Creative Developer who builds beautiful, responsive, and unique web experiences. I'm also passionate about teaching the next generation of developers.",
  //   type: "website",
  //   url: "https://yadak.com.ng",
  //   images: [
  //     {
  //       url: "https://placehold.co/1200x630/0a101e/ffffff?text=Yadak-Linus",
  //       width: 1200,
  //       height: 630,
  //       alt: "Yadak Linus Project Preview Image",
  //     },
  //   ],
  // },
  // twitter: {
  //   card: "summary_large_image",
  //   title: "Yadak Linus",
  //   description:
  //     "A Creative Developer who builds beautiful, responsive, and unique web experiences. I'm also passionate about teaching the next generation of developers.",
  //   images: [
  //     "https://placehold.co/1200x630/0a101e/ffffff?text=Yadak-Linus",
  //   ],
  // },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const year = new Date().getFullYear()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvide>
    <html suppressHydrationWarning lang="en">
      
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
        
        )}
      >
        <div className="bg-gray-100 min-h-screen font-sans antialiased">
            <Navbar/>
            <main className="p-4 sm:p-6 lg:p-8">
              <Toaster/>
              <Analytics/>
                {children}
            </main>
             <footer className="text-center py-4 mt-8 text-gray-500 text-sm">
                <p>Buy Me A Gala &copy; {year} Developed by Code Git.</p>
            </footer>
        </div>
      </body>
    </html>
    </SessionProvide>
  );
}
