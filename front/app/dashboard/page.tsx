"use client"
import { formatCurrency } from "@/components/format-currency";
import { DollarSign, Gift, User, Copy, ExternalLink, Notebook, ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import api from "@/config/api";
import Auths from "@/components/protect";
import Loading from "@/components/loading";

// Pagination Controls Component
const PaginationControls = ({ currentPage, totalPages, onPageChange, isLoading }:{currentPage:any, totalPages:any, onPageChange:any, isLoading:any}) => {
    const handlePrev = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-end gap-4 mt-4 px-6 py-2">
            <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
                <button
                    onClick={handlePrev}
                    disabled={currentPage === 1 || isLoading}
                    className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages || isLoading}
                    className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [supporters, setSupporters] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);
    const [totalSupporters, setTotalSupporters] = useState(0);
    const [shareLink, setShareLink] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isPaginating, setIsPaginating] = useState(false);
    const [username, setUsername] = useState("");
    const [activeTab, setActiveTab] = useState('supporters');
    const [displayName, setDisplayName] = useState("");
    const router = useRouter();
    const API = process.env.NEXT_PUBLIC_BACKEND_URL;

    // Pagination State
    const [supportersPage, setSupportersPage] = useState(1);
    const [payoutsPage, setPayoutsPage] = useState(1);
    const [supportersTotalPages, setSupportersTotalPages] = useState(0);
    const [payoutsTotalPages, setPayoutsTotalPages] = useState(0);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            toast.success("Link copied to clipboard!");
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    const VerrColor = (status:string) => {
        if(status == "SUCCESS"){
            return "green"
        }else if(status == "PENDING"){
            return "yellow"
        }else{
            return "red"
        }
    }

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.replace("/");
            return;
        }

        async function main(isInitialLoad = false) {
            if (isInitialLoad) {
                setIsLoading(true);
            } else {
                setIsPaginating(true);
            }
            try {
                const res = await api.post(`${API}/user/dashboard`, { 
                    email: session?.user?.email,
                    supportersPage,
                    payoutsPage
                });

                setTotalEarnings(res?.data?.totalEarnings);
                setWalletBalance(res?.data?.walletBalance);
                setTotalSupporters(res?.data?.totalSupporters);
                setSupporters(res?.data?.supports.data);
                setSupportersTotalPages(res?.data?.supports?.totalPages);
                setPayouts(res?.data?.payouts?.data);
                setPayoutsTotalPages(res?.data?.payouts?.totalPages);
                setUsername(res?.data?.username);
                setDisplayName(res?.data?.name);

            } catch (error) {
                console.error("Error loading data:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                if (isInitialLoad) {
                    setIsLoading(false);
                } else {
                    setIsPaginating(false);
                }
            }
        }
        if (status === "authenticated") {
            const isInitial = !username;
            main(isInitial);
            if (typeof window !== 'undefined' && username) {
                setShareLink(`${window.location.origin}/@${username}`);
            }
        }
    }, [status, username, supportersPage, payoutsPage]);

    if (isLoading) {
        return <Loading/>;
    }

    return (
        <>
        <Auths />
        <div className="max-w-6xl mx-auto min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {displayName}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Earnings Card */}
                <div className="bg-white border rounded-xl p-6 transition-all duration-300 shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Earnings</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{formatCurrency(totalEarnings)}</p>
                            <p className="text-xs text-gray-400 mt-1">All-time revenue</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-lg">
                            <DollarSign className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>
                </div>

                {/* Wallet Balance Card */}
                <div className="bg-white border rounded-xl p-6 transition-all duration-300 shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Wallet Balance</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{formatCurrency(walletBalance)}</p>
                            <p className="text-xs text-gray-400 mt-1">Available to withdraw</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <Wallet className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                </div>

                {/* Total Supporters Card */}
                <div className="bg-white border rounded-xl p-6 transition-all duration-300 shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Supporters</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{totalSupporters || 0}</p>
                            <p className="text-xs text-gray-400 mt-1">Unique supporters</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <User className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Link Section */}
            <div className="bg-white border rounded-xl p-6 mb-8 shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Share Your Page</h3>
                    <ExternalLink className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-mono text-sm">
                        {shareLink}
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium px-4 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                        <Copy className="h-4 w-4" />
                        Copy
                    </button>
                </div>
            </div>

            {/* Data Table Section */}
            <div className="bg-white border rounded-xl overflow-hidden shadow-md">
                <div className="flex border-b border-gray-200">
                    <button
                        className={`flex-1 py-4 px-6 text-center text-sm font-medium ${
                            activeTab === 'supporters'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('supporters')}
                    >
                        Supporters
                    </button>
                    <button
                        className={`flex-1 py-4 px-6 text-center text-sm font-medium ${
                            activeTab === 'payouts'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('payouts')}
                    >
                        Payouts
                    </button>
                </div>

                <div className={`${isPaginating ? 'opacity-50' : ''} transition-opacity`}>
                    {activeTab === 'supporters' && (
                        <div>
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Supporters</h2>
                                {supporters?.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-100 border-b border-gray-200">
                                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Supporter</th>
                                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Amount</th>
                                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Message</th>
                                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {supporters.map((supporter:any, index:any) => (
                                                    <tr key={supporter.id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${ index % 2 === 0 ? 'bg-white' : 'bg-gray-50' }`}>
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-gray-900">
                                                                    {supporter?.supporter?.charAt(0).toUpperCase() || "A"}
                                                                </div>
                                                                <span className="font-medium text-gray-700">{supporter?.supporter || "Ghost"}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={`bg-${VerrColor(supporter?.status)}-100 text-${VerrColor(supporter?.status)}-700 border border-${VerrColor(supporter?.status)}-300 text-sm font-medium px-3 py-1 rounded-full`}>
                                                                {formatCurrency(supporter?.amount)}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <p className="text-gray-600 italic max-w-xs truncate">
                                                                "{supporter.message || 'No message'}"
                                                            </p>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-gray-500 text-sm">
                                                                {new Date(supporter.createdAt || Date.now()).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Gift className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-700 mb-2">No supporters yet</h3>
                                        <p className="text-gray-500">Share your page to start receiving support!</p>
                                    </div>
                                )}
                            </div>
                            <PaginationControls currentPage={supportersPage} totalPages={supportersTotalPages} onPageChange={setSupportersPage} isLoading={isPaginating} />
                        </div>
                    )}

                    {activeTab === 'payouts' && (
                         <div>
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Payouts</h2>
                                {payouts?.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-100 border-b border-gray-200">
                                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Amount</th>
                                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                                                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payouts?.map((payout:any, index:any) => (
                                                    <tr key={payout.id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${ index % 2 === 0 ? 'bg-white' : 'bg-gray-50' }`}>
                                                        <td className="py-4 px-6">
                                                            <span className="text-gray-700 font-medium">{formatCurrency(payout.amount)}</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={`text-sm font-medium px-3 py-1 rounded-full ${ payout.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {payout.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-gray-500 text-sm">
                                                                {new Date(payout.createdAt || Date.now()).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Notebook className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-700 mb-2">No payouts yet</h3>
                                        <p className="text-gray-500">All your payments will be listed here.</p>
                                    </div>
                                )}
                            </div>
                             <PaginationControls currentPage={payoutsPage} totalPages={payoutsTotalPages} onPageChange={setPayoutsPage} isLoading={isPaginating} />
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}