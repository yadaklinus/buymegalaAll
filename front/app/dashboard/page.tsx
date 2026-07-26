"use client"
import { useEffect, useState } from "react";
import { formatCurrency } from "@/components/format-currency";
import { DollarSign, Gift, User, Copy, ExternalLink, Notebook, ChevronLeft, ChevronRight, Wallet, TrendingUp, Zap, Link2, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import api from "@/config/api";
import Auths from "@/components/protect";
import Loading from "@/components/loading";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import SharePageModal from "@/components/SharePageModal";

// Pagination Controls Component
const PaginationControls = ({ currentPage, totalPages, onPageChange, isLoading }: { currentPage: any; totalPages: any; onPageChange: any; isLoading: any }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-3 mt-4 px-6 py-3 border-t border-gray-100">
      <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="p-2 rounded-lg bg-gray-100 hover:bg-yellow-100 hover:text-yellow-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="p-2 rounded-lg bg-gray-100 hover:bg-yellow-100 hover:text-yellow-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [supporters, setSupporters] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalSupporters, setTotalSupporters] = useState(0);
  const [shareLink, setShareLink] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);
  const [username, setUsername] = useState("");
  const [activeTab, setActiveTab] = useState("supporters");
  const [displayName, setDisplayName] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const router = useRouter();

  const [supportersPage, setSupportersPage] = useState(1);
  const [payoutsPage, setPayoutsPage] = useState(1);
  const [supportersTotalPages, setSupportersTotalPages] = useState(0);
  const [payoutsTotalPages, setPayoutsTotalPages] = useState(0);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const statusColor = (status: string) => {
    if (status === "SUCCESS") return "bg-green-100 text-green-700 border-green-200";
    if (status === "PENDING") return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/signin"); return; }

    async function main(isInitialLoad = false) {
      if (isInitialLoad) setIsLoading(true);
      else setIsPaginating(true);

      try {
        const res = await api.post(`/user/dashboard`, {
          email: user?.email,
          supportersPage,
          payoutsPage,
        });
        setTotalEarnings(res?.data?.totalEarnings);
        setWalletBalance(res?.data?.walletBalance);
        setTotalSupporters(res?.data?.totalSupporters);
        setSupporters(res?.data?.supports?.data || []);
        setSupportersTotalPages(res?.data?.supports?.totalPages || 0);
        setPayouts(res?.data?.payouts?.data || []);
        setPayoutsTotalPages(res?.data?.payouts?.totalPages || 0);
        setUsername(res?.data?.username);
        setDisplayName(res?.data?.name);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        if (isInitialLoad) setIsLoading(false);
        else setIsPaginating(false);
      }
    }

    if (user) {
      const isInitial = !username;
      main(isInitial);
      if (typeof window !== "undefined" && username) {
        setShareLink(`${window.location.origin}/@${username}`);
      }
    }
  }, [authLoading, user, username, supportersPage, payoutsPage]);

  if (isLoading) return <Loading />;

  return (
    <>
      <Auths />
      <div className="max-w-6xl mx-auto min-h-screen space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, <span className="font-semibold text-yellow-600">{displayName}</span> 👋
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm text-sm"
            >
              <Share2 className="h-4 w-4" />
              Share & QR Code
            </button>
            <Link
              href={`/@${username}`}
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              View My Page
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              label: "Total Earnings",
              value: formatCurrency(totalEarnings),
              sub: "All-time revenue",
              icon: <TrendingUp className="h-6 w-6 text-yellow-600" />,
              bg: "bg-yellow-50",
              ring: "ring-yellow-200",
            },
            {
              label: "Wallet Balance",
              value: formatCurrency(walletBalance),
              sub: "Available to withdraw",
              icon: <Wallet className="h-6 w-6 text-green-600" />,
              bg: "bg-green-50",
              ring: "ring-green-200",
            },
            {
              label: "Total Supporters",
              value: totalSupporters || 0,
              sub: "Unique supporters",
              icon: <User className="h-6 w-6 text-blue-600" />,
              bg: "bg-blue-50",
              ring: "ring-blue-200",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-extrabold text-gray-800 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                </div>
                <div className={`${stat.bg} ring-1 ${stat.ring} p-3 rounded-xl`}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Share Link */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="h-4 w-4 text-yellow-500" />
            <h3 className="text-base font-semibold text-gray-800">Your Share Link</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-600 font-mono text-sm truncate">
              {shareLink || `${typeof window !== "undefined" ? window.location.origin : ""}/@${username}`}
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-5 py-3 rounded-xl transition-all text-sm"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
          </div>
        </div>

        {/* Data Tables */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {["supporters", "payouts"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 text-sm font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? "text-yellow-600 border-b-2 border-yellow-500 bg-yellow-50/50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab === "supporters" ? `Supporters` : "Payouts"}
              </button>
            ))}
          </div>

          <div className={`transition-opacity ${isPaginating ? "opacity-50" : ""}`}>
            {activeTab === "supporters" && (
              <div>
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Supporters</h2>
                  {supporters?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-left">
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Supporter</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Message</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {supporters.map((supporter: any) => (
                            <tr
                              key={supporter.id}
                              className="border-b border-gray-50 hover:bg-yellow-50/30 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center font-bold text-white text-sm shadow-sm">
                                    {supporter?.supporter?.charAt(0)?.toUpperCase() || "A"}
                                  </div>
                                  <span className="font-medium text-gray-700 text-sm">{supporter?.supporter || "Ghost"}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor(supporter?.status)}`}>
                                  {formatCurrency(supporter?.amount)}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <p className="text-gray-500 italic text-sm max-w-xs truncate">
                                  "{supporter.message || "No message"}"
                                </p>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-gray-400 text-xs">
                                  {new Date(supporter.createdAt || Date.now()).toLocaleDateString("en-NG", {
                                    day: "numeric", month: "short", year: "numeric",
                                  })}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-14">
                      <div className="bg-yellow-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Gift className="h-8 w-8 text-yellow-400" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-700 mb-1">No supporters yet</h3>
                      <p className="text-gray-400 text-sm">Share your page to start receiving support!</p>
                    </div>
                  )}
                </div>
                <PaginationControls currentPage={supportersPage} totalPages={supportersTotalPages} onPageChange={setSupportersPage} isLoading={isPaginating} />
              </div>
            )}

            {activeTab === "payouts" && (
              <div>
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Payouts</h2>
                  {payouts?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100 text-left">
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payouts?.map((payout: any) => (
                            <tr key={payout.id} className="border-b border-gray-50 hover:bg-yellow-50/30 transition-colors">
                              <td className="py-4 px-4">
                                <span className="font-semibold text-gray-800">{formatCurrency(payout.amount)}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                  payout.status === "SUCCESS"
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                }`}>
                                  {payout.status}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-gray-400 text-xs">
                                  {new Date(payout.createdAt || Date.now()).toLocaleDateString("en-NG", {
                                    day: "numeric", month: "short", year: "numeric",
                                  })}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-14">
                      <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Notebook className="h-8 w-8 text-gray-300" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-700 mb-1">No payouts yet</h3>
                      <p className="text-gray-400 text-sm">All your payments will be listed here.</p>
                    </div>
                  )}
                </div>
                <PaginationControls currentPage={payoutsPage} totalPages={payoutsTotalPages} onPageChange={setPayoutsPage} isLoading={isPaginating} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Page Modal */}
      <SharePageModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        username={username}
        creatorName={displayName || username}
      />
    </>
  );
}