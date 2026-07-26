"use client"
import { User, BarChart2, LogIn, LogOut, Landmark, X, Menu, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/config/api';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const isAuthenticated = !!user;
  const [username, setUsername] = useState<any>('');
  const role = user?.role || 'USER';
  const router = useRouter();
  const pathname = usePathname();

  // Hide Navbar completely on transparent overlay widgets (for OBS Studio)
  if (pathname?.startsWith('/widget')) {
    return null;
  }

  useEffect(() => {
    const main = async () => {
      if (user?.email) {
        try {
          const response = await api.post("/user/nav", { email: user.email });
          if (response?.data?.username) setUsername(response.data.username);
        } catch (e) {
          console.error("Error fetching nav info:", e);
        }
      }
    };
    if (isAuthenticated) main();
  }, [isAuthenticated, user]);

  const rawUsername = user?.username || username;
  const activeUsername = (rawUsername && rawUsername !== "null" && rawUsername !== "undefined") ? rawUsername : "";
  const myPageHref = activeUsername ? `/@${activeUsername}` : '/setup';

  const isActive = (href: string) => pathname === href;

  const navLinkClass = (href: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(href)
        ? 'bg-yellow-100 text-yellow-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const mobileNavLinkClass = (href: string) =>
    `flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      isActive(href)
        ? 'bg-yellow-50 text-yellow-700 border border-yellow-100'
        : 'text-gray-700 hover:bg-gray-50'
    }`;

  return (
    <nav className="bg-white/70 backdrop-blur-xl shadow-sm w-full sticky top-0 z-50 border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img width={28} src="/gala.png" alt="gala" className="rounded-md" />
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              Buy Me <span className="text-yellow-500">Gala</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/explore" className={navLinkClass('/explore')}>Explore</Link>
            <Link href="/help" className={navLinkClass('/help')}>Help</Link>
            {isAuthenticated ? (
              <>
                <Link href={myPageHref} className={navLinkClass(myPageHref)}>My Page</Link>
                <Link href="/dashboard" className={navLinkClass('/dashboard')}>Dashboard</Link>
                <Link href="/checkout" className={navLinkClass('/checkout')}>Withdraw</Link>
                <Link href="/setting" className={navLinkClass('/setting')}>Settings</Link>
                {role === 'ADMIN' && (
                  <Link href="/admin" className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all">
                    <Shield className="h-3.5 w-3.5" /> Admin
                  </Link>
                )}
                <div className="w-px h-5 bg-gray-200 mx-1" />
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/signin"
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-5 py-2 rounded-xl text-sm transition-all shadow-sm hover:shadow ml-2"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-200 p-4 z-40">
          <div className="flex flex-col gap-1.5">
            <Link href="/explore" onClick={() => setIsMenuOpen(false)} className={mobileNavLinkClass('/explore')}>
              Explore Creators
            </Link>
            <Link href="/help" onClick={() => setIsMenuOpen(false)} className={mobileNavLinkClass('/help')}>
              Help & FAQ
            </Link>
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-sm">
                    <span className="text-sm font-bold text-white">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-400">@{activeUsername || 'setup required'}</p>
                  </div>
                </div>

                <Link href={myPageHref} onClick={() => setIsMenuOpen(false)} className={mobileNavLinkClass(myPageHref)}>
                  <User className="h-4 w-4" /> My Page
                </Link>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className={mobileNavLinkClass('/dashboard')}>
                  <BarChart2 className="h-4 w-4" /> Dashboard
                </Link>
                <Link href="/checkout" onClick={() => setIsMenuOpen(false)} className={mobileNavLinkClass('/checkout')}>
                  <Landmark className="h-4 w-4" /> Withdraw
                </Link>
                <Link href="/setting" onClick={() => setIsMenuOpen(false)} className={mobileNavLinkClass('/setting')}>
                  <SettingsIcon className="h-4 w-4" /> Settings
                </Link>
                {role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-purple-700 bg-purple-50 border border-purple-100">
                    <Shield className="h-4 w-4" /> Admin Portal
                  </Link>
                )}
                <div className="border-t border-gray-100 pt-2 mt-1">
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/signin"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-gray-900 bg-yellow-500 hover:bg-yellow-400 transition-all justify-center"
              >
                <LogIn className="h-4 w-4" /> Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
