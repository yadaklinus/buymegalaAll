"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Search, Compass, Gift, ArrowRight, UserCheck, Sparkles } from "lucide-react";
import api from "@/config/api";
import { formatCurrency } from "@/components/format-currency";

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [creators, setCreators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchCreators = async (query = "") => {
    try {
      const response = await api.get(`/user/explore?q=${encodeURIComponent(query)}`);
      setCreators(response.data?.creators || []);
    } catch (error) {
      console.error("Failed to fetch creators:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced live search
  useEffect(() => {
    const handler = setTimeout(() => {
      startTransition(() => {
        fetchCreators(searchTerm);
      });
    }, 250);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-300 p-8 sm:p-12 overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-900 mb-4">
            <Compass className="h-4 w-4" />
            Discover Community Creators
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight flex items-center gap-3 flex-wrap">
            <span>Find & Support Your Favorite Creators</span>
            <img src="/gala.png" alt="Gala" className="w-10 h-10 object-contain inline-block" />
          </h1>
          <p className="mt-3 text-gray-800/80 text-base sm:text-lg">
            Explore active creator pages, send them Galas, and help fuel their work.
          </p>
        </div>

        {/* Search Bar inside Hero */}
        <div className="relative z-10 mt-8 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, handle (@username), or topic..."
              className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl text-gray-800 placeholder-gray-400 shadow-xl focus:ring-4 focus:ring-yellow-400/50 focus:outline-none transition-all text-base"
            />
            {isPending && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="h-5 w-5 border-2 border-yellow-500/30 border-t-yellow-600 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Creators Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            {searchTerm ? `Search Results (${creators.length})` : "Featured Creators"}
          </h2>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Instant Live Search
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-gray-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-3 w-full bg-gray-200 rounded mb-2" />
                <div className="h-3 w-3/4 bg-gray-200 rounded mb-6" />
                <div className="h-10 w-full bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : creators.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <div
                key={creator.id}
                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-yellow-200 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    {creator.image ? (
                      <img
                        src={creator.image}
                        alt={creator.name}
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-yellow-400/40"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center font-extrabold text-white text-xl ring-2 ring-yellow-100 shadow-sm">
                        {creator.name?.charAt(0)?.toUpperCase() || "C"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate group-hover:text-yellow-600 transition-colors">
                        {creator.name}
                      </h3>
                      <p className="text-gray-400 text-xs truncate">@{creator.username}</p>
                      <div className="mt-2 inline-flex items-center gap-1 bg-yellow-50 border border-yellow-100 px-2.5 py-0.5 rounded-full text-xs font-semibold text-yellow-700">
                        <Gift className="h-3 w-3" />
                        {formatCurrency(creator.galaPrice || 500)} / Gala
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-6">
                    {creator.bio || "Supporting ideas, one Gala at a time."}
                  </p>
                </div>

                <Link
                  href={`/@${creator.username}`}
                  className="w-full bg-gray-50 hover:bg-yellow-500 hover:text-gray-900 text-gray-700 font-bold py-3 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2 group-hover:shadow-md"
                >
                  Buy a Gala
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8">
            <div className="bg-yellow-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Compass className="h-8 w-8 text-yellow-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No Creators Found</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              We couldn't find any creator matching "{searchTerm}". Try searching for another name or handle!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
