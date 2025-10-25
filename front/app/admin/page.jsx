"use client"

import React, { useState, useEffect } from 'react';
import { User, DollarSign, CheckCircle, Clock, ArrowLeft, Search, TrendingUp, Wallet, Send } from 'lucide-react';
import Auths from "@/components/protect";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import api from "@/config/api";
import toast from "react-hot-toast";
import Loading from "@/components/loading";



export default function AdminTransactionPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState({});
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [approving, setApproving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    totalBalance: 0,
    totalTransferred: 0,
    totalEverReceived: 0,
    totalPendingTransactions: 0
  });
  const { data: session, status } = useSession();
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Calculate global stats from state
  const totalBalance = globalStats.totalBalance;
  const totalTransferred = globalStats.totalTransferred;
  const totalEverReceived = globalStats.totalEverReceived;
  const totalPendingTransactions = globalStats.totalPendingTransactions;

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${API}/admin/dashboard`);
      
      setUsers(response.data.users);
      setTransactions(response.data.transactions);
      setGlobalStats(response.data.globalStats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  const handleApproveAll = async () => {
    if (!selectedUser) return;

    setApproving(true);

    try {
      const response = await api.post(`${API}/admin/approve-payout`, {
        userId: selectedUser.id
      });

      // Update user's balance and stats
      const updatedUsers = users.map(u => {
        if (u.id === selectedUser.id) {
          return { 
            ...u, 
            balance: 0,
            totalTransferred: u.totalTransferred + u.balance,
            pendingCount: 0 
          };
        }
        return u;
      });
      setUsers(updatedUsers);

      // Update selected user to reflect changes
      const updatedSelectedUser = updatedUsers.find(u => u.id === selectedUser.id);
      setSelectedUser(updatedSelectedUser);

      // Update transactions to show as approved
      const updatedTransactions = { ...transactions };
      if (updatedTransactions[selectedUser.id]) {
        updatedTransactions[selectedUser.id] = updatedTransactions[selectedUser.id].map(t => ({
          ...t,
          status: 'approved'
        }));
        setTransactions(updatedTransactions);
      }

      setShowSuccess(true);
      toast.success("Payout approved successfully!");

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Error approving payout:", error);
      toast.error("Failed to approve payout");
    } finally {
      setApproving(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userTransactions = selectedUser ? transactions[selectedUser.id] || [] : [];
  const pendingTransactions = userTransactions.filter(t => t.status === 'pending');
  const approvedTransactions = userTransactions.filter(t => t.status === 'approved');

  // Loading state
  if (loading) {
    return <Loading />;
  }

  return (
    <>
    <Auths/>
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage user transactions and approve payouts</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">Payouts Approved Successfully!</h3>
            <p className="text-sm text-green-700">All pending transactions have been processed and transferred.</p>
          </div>
        </div>
      )}

      {!selectedUser ? (
        /* User List View */
        <div>
          {/* Global Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="h-8 w-8 opacity-80" />
                <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">BALANCE</span>
              </div>
              <p className="text-3xl font-bold mb-1">₦{totalBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm opacity-90">Total Remaining Balance</p>
            </div>

            <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Send className="h-8 w-8 opacity-80" />
                <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">TRANSFERRED</span>
              </div>
              <p className="text-3xl font-bold mb-1">₦{totalTransferred.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm opacity-90">Total Money Transferred</p>
            </div>

            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 opacity-80" />
                <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">RECEIVED</span>
              </div>
              <p className="text-3xl font-bold mb-1">₦{totalEverReceived.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm opacity-90">Total Money Ever Received</p>
            </div>

            <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 opacity-80" />
                <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">PENDING</span>
              </div>
              <p className="text-3xl font-bold mb-1">{totalPendingTransactions}</p>
              <p className="text-sm opacity-90">Pending Transactions</p>
            </div>
          </div>

          {/* Users Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900 mb-4">All Users</h2>
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="border border-gray-200 rounded-lg p-5 hover:border-yellow-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-yellow-600">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    {user.pendingCount > 0 && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                        {user.pendingCount} pending
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Current Balance</p>
                      <p className="text-lg font-bold text-yellow-600">₦{user.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Received</p>
                      <p className="text-lg font-bold text-blue-600">₦{user.totalReceived.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Transferred</p>
                      <p className="text-lg font-bold text-green-600">₦{user.totalTransferred.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No users found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Transaction Details View */
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Users
          </button>

          {/* User Info Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {selectedUser.avatar}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{selectedUser.name}</h2>
                <p className="text-gray-600 text-lg">{selectedUser.email}</p>
              </div>
            </div>

            {/* User Financial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm font-semibold text-gray-600">CURRENT BALANCE</p>
                </div>
                <p className="text-3xl font-bold text-yellow-600">₦{selectedUser.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                {pendingTransactions.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{pendingTransactions.length} pending transactions</p>
                )}
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <p className="text-sm font-semibold text-gray-600">TOTAL RECEIVED</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">₦{selectedUser.totalReceived.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-500 mt-1">{userTransactions.length} total transactions</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Send className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-semibold text-gray-600">TOTAL TRANSFERRED</p>
                </div>
                <p className="text-3xl font-bold text-green-600">₦{selectedUser.totalTransferred.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-500 mt-1">{approvedTransactions.length} approved payouts</p>
              </div>
            </div>
          </div>

          {/* Approve All Button */}
          {pendingTransactions.length > 0 && (
            <div className="mb-6">
              <button
                onClick={handleApproveAll}
                disabled={approving}
                className={`w-full bg-green-500 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2 ${
                  approving ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'
                }`}
              >
                {approving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Transfer...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Approve & Transfer All Pending Payouts (₦
                    {selectedUser.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })})
                  </>
                )}
              </button>
            </div>
          )}

          {/* Transactions List */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Transaction History</h3>
            {userTransactions.length > 0 ? (
              userTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`border rounded-lg p-4 ${
                    transaction.status === 'pending'
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{transaction.supporter}</h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            transaction.status === 'pending'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-green-200 text-green-800'
                          }`}
                        >
                          {transaction.status === 'pending' ? (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Pending
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Transferred
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{transaction.date}</p>
                      {transaction.message && (
                        <p className="text-sm text-gray-700 mt-2 italic">"{transaction.message}"</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">₦{transaction.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No transactions found for this user.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}