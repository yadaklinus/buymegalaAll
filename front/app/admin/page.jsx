"use client"

import React, { useState,useEffect } from 'react';
import { User, DollarSign, CheckCircle, Clock, ArrowLeft, Search, TrendingUp, Wallet, Send } from 'lucide-react';
import Auths from "@/components/protect";
import { useSession } from "next-auth/react";

// Mock data for users and their transactions
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    avatar: "JD",
    balance: 450.00,
    totalReceived: 2850.00,
    totalTransferred: 2400.00,
    pendingCount: 5
  },
  {
    id: 2,
    name: "Sarah Smith",
    email: "sarah@example.com",
    avatar: "SS",
    balance: 890.00,
    totalReceived: 4560.00,
    totalTransferred: 3670.00,
    pendingCount: 8
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    avatar: "MJ",
    balance: 230.00,
    totalReceived: 1890.00,
    totalTransferred: 1660.00,
    pendingCount: 3
  },
  {
    id: 4,
    name: "Emily Brown",
    email: "emily@example.com",
    avatar: "EB",
    balance: 670.00,
    totalReceived: 3420.00,
    totalTransferred: 2750.00,
    pendingCount: 6
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david@example.com",
    avatar: "DW",
    balance: 1200.00,
    totalReceived: 5670.00,
    totalTransferred: 4470.00,
    pendingCount: 12
  }
];

const mockTransactions = {
  1: [
    { id: 101, supporter: "Alice Wonder", amount: 50.00, date: "2025-09-28", status: "pending", message: "Love your work!" },
    { id: 102, supporter: "Bob Builder", amount: 100.00, date: "2025-09-27", status: "pending", message: "Keep it up!" },
    { id: 103, supporter: "Carol Singer", amount: 75.00, date: "2025-09-26", status: "pending", message: "" },
    { id: 104, supporter: "Dan Trader", amount: 125.00, date: "2025-09-25", status: "pending", message: "Amazing content" },
    { id: 105, supporter: "Eve Coder", amount: 100.00, date: "2025-09-24", status: "pending", message: "Thanks for sharing" },
    { id: 106, supporter: "Frank Ocean", amount: 200.00, date: "2025-09-20", status: "approved", message: "Great!" },
    { id: 107, supporter: "Grace Lee", amount: 150.00, date: "2025-09-18", status: "approved", message: "" }
  ],
  2: [
    { id: 201, supporter: "Frank Ocean", amount: 150.00, date: "2025-09-29", status: "pending", message: "Excellent!" },
    { id: 202, supporter: "Grace Lee", amount: 80.00, date: "2025-09-28", status: "pending", message: "" },
    { id: 203, supporter: "Henry Ford", amount: 120.00, date: "2025-09-27", status: "pending", message: "Great job" },
    { id: 204, supporter: "Iris West", amount: 90.00, date: "2025-09-26", status: "pending", message: "Keep going!" },
    { id: 205, supporter: "Jack Black", amount: 110.00, date: "2025-09-25", status: "pending", message: "" },
    { id: 206, supporter: "Kate Bush", amount: 85.00, date: "2025-09-24", status: "pending", message: "Love this" },
    { id: 207, supporter: "Leo Mars", amount: 95.00, date: "2025-09-23", status: "pending", message: "" },
    { id: 208, supporter: "Mary Jane", amount: 160.00, date: "2025-09-22", status: "pending", message: "Fantastic work" },
    { id: 209, supporter: "Nancy Drew", amount: 180.00, date: "2025-09-15", status: "approved", message: "" }
  ],
  3: [
    { id: 301, supporter: "Nancy Drew", amount: 70.00, date: "2025-09-28", status: "pending", message: "" },
    { id: 302, supporter: "Oliver Twist", amount: 90.00, date: "2025-09-27", status: "pending", message: "Amazing!" },
    { id: 303, supporter: "Penny Lane", amount: 70.00, date: "2025-09-26", status: "pending", message: "" },
    { id: 304, supporter: "Quinn Park", amount: 120.00, date: "2025-09-20", status: "approved", message: "" }
  ],
  4: [
    { id: 401, supporter: "Quinn Park", amount: 110.00, date: "2025-09-29", status: "pending", message: "Great content" },
    { id: 402, supporter: "Ryan Star", amount: 105.00, date: "2025-09-28", status: "pending", message: "" },
    { id: 403, supporter: "Sophie Turner", amount: 115.00, date: "2025-09-27", status: "pending", message: "Keep it up" },
    { id: 404, supporter: "Tom Hardy", amount: 120.00, date: "2025-09-26", status: "pending", message: "" },
    { id: 405, supporter: "Uma Stone", amount: 100.00, date: "2025-09-25", status: "pending", message: "Wonderful" },
    { id: 406, supporter: "Victor Hugo", amount: 120.00, date: "2025-09-24", status: "pending", message: "" },
    { id: 407, supporter: "Wendy Bird", amount: 200.00, date: "2025-09-18", status: "approved", message: "" }
  ],
  5: [
    { id: 501, supporter: "Wendy Bird", amount: 100.00, date: "2025-09-30", status: "pending", message: "Excellent work!" },
    { id: 502, supporter: "Xander Cage", amount: 95.00, date: "2025-09-29", status: "pending", message: "" },
    { id: 503, supporter: "Yara Green", amount: 110.00, date: "2025-09-28", status: "pending", message: "Love it" },
    { id: 504, supporter: "Zack Moon", amount: 105.00, date: "2025-09-27", status: "pending", message: "" },
    { id: 505, supporter: "Amy Lake", amount: 90.00, date: "2025-09-26", status: "pending", message: "Keep going" },
    { id: 506, supporter: "Ben River", amount: 100.00, date: "2025-09-25", status: "pending", message: "" },
    { id: 507, supporter: "Chloe Sky", amount: 115.00, date: "2025-09-24", status: "pending", message: "Amazing" },
    { id: 508, supporter: "Dylan Storm", amount: 95.00, date: "2025-09-23", status: "pending", message: "" },
    { id: 509, supporter: "Ella Rain", amount: 120.00, date: "2025-09-22", status: "pending", message: "Fantastic" },
    { id: 510, supporter: "Finn Snow", amount: 85.00, date: "2025-09-21", status: "pending", message: "" },
    { id: 511, supporter: "Gina Sun", amount: 90.00, date: "2025-09-20", status: "pending", message: "Great job" },
    { id: 512, supporter: "Hugo Cloud", amount: 95.00, date: "2025-09-19", status: "pending", message: "" },
    { id: 513, supporter: "Ivy Moon", amount: 250.00, date: "2025-09-15", status: "approved", message: "" }
  ]
};



export default function AdminTransactionPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [approving, setApproving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
    const { data: session, status } = useSession();


  // Calculate global stats
  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
  const totalTransferred = users.reduce((sum, u) => sum + u.totalTransferred, 0);
  const totalEverReceived = users.reduce((sum, u) => sum + u.totalReceived, 0);
  const totalPendingTransactions = users.reduce((sum, u) => sum + u.pendingCount, 0);

  useEffect(()=>{
    if (status === "loading") return;

        if (status === "unauthenticated") {
            router.replace("/");
            return;
        }
  },[])

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  const handleApproveAll = () => {
    if (!selectedUser) return;

    setApproving(true);

    // Simulate API call
    setTimeout(() => {
      // Update all pending transactions to approved
      const updatedTransactions = { ...transactions };
      const userPendingAmount = updatedTransactions[selectedUser.id]
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);

      updatedTransactions[selectedUser.id] = updatedTransactions[selectedUser.id].map(t => ({
        ...t,
        status: 'approved'
      }));
      setTransactions(updatedTransactions);

      // Update user's balance, transferred amount, and pending count
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

      setApproving(false);
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 2000);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userTransactions = selectedUser ? transactions[selectedUser.id] || [] : [];
  const pendingTransactions = userTransactions.filter(t => t.status === 'pending');
  const approvedTransactions = userTransactions.filter(t => t.status === 'approved');

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
