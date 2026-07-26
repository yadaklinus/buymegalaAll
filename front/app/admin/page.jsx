"use client"

import React, { useState, useEffect } from 'react';
import { User, CheckCircle, Clock, ArrowLeft, Search, Shield, FileSpreadsheet, ShieldAlert, Copy, Lock, Unlock, FileText } from 'lucide-react';
import Auths from "@/components/protect";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/config/api";
import toast from "react-hot-toast";
import Loading from "@/components/loading";

import AdminStatsHeader from '@/components/admin/AdminStatsHeader';
import ConfirmPayoutModal from '@/components/admin/ConfirmPayoutModal';
import AuditLogTable from '@/components/admin/AuditLogTable';
import TwoFactorSetupModal from '@/components/admin/TwoFactorSetupModal';


export default function AdminTransactionPage() {
  const [activeTab, setActiveTab] = useState('payouts'); // 'payouts' | 'audit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState({});
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Governance state
  const [adminNotesText, setAdminNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [togglingFreeze, setTogglingFreeze] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetupModal, setShow2FASetupModal] = useState(false);

  // Payout confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [approving, setApproving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [globalStats, setGlobalStats] = useState({
    totalBalance: 0,
    totalTransferred: 0,
    totalEverReceived: 0,
    totalPendingTransactions: 0
  });

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/signin");
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [authLoading, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/dashboard`);
      
      setUsers(response.data.users || []);
      setTransactions(response.data.transactions || {});
      setGlobalStats(response.data.globalStats || {});

      // Fetch 2FA status
      const statusRes = await api.get(`/admin/2fa/status`);
      setTwoFactorEnabled(!!statusRes.data.twoFactorEnabled);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || "Failed to load admin dashboard";
      toast.error(errMsg);
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.replace("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const response = await api.get(`/admin/audit-logs`);
      setAuditLogs(response.data.logs || []);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to load audit logs");
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const handleUserClick = (u) => {
    setSelectedUser(u);
    setAdminNotesText(u.adminNotes || '');
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  const copyToClipboard = (text, label) => {
    if (!text) {
      toast.error(`No ${label} available to copy`);
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleToggleFreeze = async () => {
    if (!selectedUser) return;
    try {
      setTogglingFreeze(true);
      const response = await api.post(`/admin/user/toggle-freeze`, { userId: selectedUser.id });
      const newStatus = response.data.isFrozen;
      
      setSelectedUser(prev => prev ? { ...prev, isFrozen: newStatus } : null);
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, isFrozen: newStatus } : u));
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user status");
    } finally {
      setTogglingFreeze(false);
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedUser) return;
    try {
      setSavingNotes(true);
      await api.post(`/admin/user/update-notes`, { userId: selectedUser.id, notes: adminNotesText });
      
      setSelectedUser(prev => prev ? { ...prev, adminNotes: adminNotesText } : null);
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, adminNotes: adminNotesText } : u));
      toast.success("Admin notes saved!");
    } catch (error) {
      toast.error("Failed to save admin notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleOpenPayoutModal = () => {
    if (!selectedUser || selectedUser.balance <= 0) {
      toast.error("User has no pending balance for payout");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmPayout = async (totpCode) => {
    if (!selectedUser) return;

    setApproving(true);

    try {
      const response = await api.post(`/admin/approve-payout`, {
        userId: selectedUser.id,
        totpCode
      });

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

      const updatedSelectedUser = updatedUsers.find(u => u.id === selectedUser.id);
      setSelectedUser(updatedSelectedUser);

      const updatedTransactions = { ...transactions };
      if (updatedTransactions[selectedUser.id]) {
        updatedTransactions[selectedUser.id] = updatedTransactions[selectedUser.id].map(t => ({
          ...t,
          status: 'approved'
        }));
        setTransactions(updatedTransactions);
      }

      toast.success("Payout approved and logged successfully!");
      setShowConfirmModal(false);

    } catch (error) {
      console.error("Error approving payout:", error);
      toast.error(error.response?.data?.message || "Failed to approve payout");
    } finally {
      setApproving(false);
    }
  };

  const exportCSV = () => {
    if (!users || users.length === 0) return;

    const headers = ["User ID", "Name", "Email", "Current Balance (NGN)", "Total Received (NGN)", "Total Transferred (NGN)", "Pending Count"];
    const rows = users.map(u => [
      u.id,
      `"${u.name}"`,
      u.email,
      (u.balance / 100).toFixed(2),
      (u.totalReceived / 100).toFixed(2),
      (u.totalTransferred / 100).toFixed(2),
      u.pendingCount
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `buy_me_gala_payouts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userTransactions = selectedUser ? transactions[selectedUser.id] || [] : [];
  const pendingTransactions = userTransactions.filter(t => t.status === 'pending');
  const approvedTransactions = userTransactions.filter(t => t.status === 'approved');

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Auths />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 mb-8 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-sm mb-1">
              <Shield className="w-4 h-4" />
              <span>Admin Governance</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Financial Admin Suite</h1>
            <p className="text-sm text-slate-500 mt-1">Manage creator payouts, monitor platform volume, and audit administrative activity.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShow2FASetupModal(true)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 transition border ${
                twoFactorEnabled
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>{twoFactorEnabled ? 'Google 2FA Enabled' : 'Enable Google 2FA'}</span>
            </button>

            <button
              onClick={exportCSV}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-sm font-semibold flex items-center gap-2 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>

        {/* Global KPI Stats */}
        <AdminStatsHeader globalStats={globalStats} />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6">
          <button
            onClick={() => { setActiveTab('payouts'); setSelectedUser(null); }}
            className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'payouts'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Creators & Payouts ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>

        {/* Tab Content: Audit Logs */}
        {activeTab === 'audit' && (
          <AuditLogTable logs={auditLogs} loading={auditLoading} />
        )}

        {/* Tab Content: Creators & Payouts */}
        {activeTab === 'payouts' && (
          !selectedUser ? (
            /* User List View */
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search creators by name or email address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Registered Creators</h2>
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleUserClick(u)}
                    className="border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-5 hover:border-purple-500/40 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-2xl flex items-center justify-center font-bold text-lg">
                          {u.name?.charAt(0).toUpperCase() || <User className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-purple-600 transition">
                              {u.name}
                            </h3>
                            {u.isFrozen && (
                              <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Frozen
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                      {u.pendingCount > 0 && (
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-xs font-semibold">
                          {u.pendingCount} pending payout
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-800">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Withdrawable Balance</p>
                        <p className="text-base font-bold text-emerald-500">₦{((u.balance || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Total Volume Received</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white">₦{((u.totalReceived || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Total Paid Out</p>
                        <p className="text-base font-bold text-blue-500">₦{((u.totalTransferred || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Bank Payout Info</p>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 truncate">
                            {u.accountNumber ? `${u.bankName || 'Bank'}: ${u.accountNumber}` : 'No Bank Details'}
                          </p>
                          {u.accountNumber && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); copyToClipboard(u.accountNumber, "Account Number"); }}
                              className="p-1 text-slate-400 hover:text-purple-500 transition rounded"
                              title="Copy Account Number"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <p>No creators match your search query.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Transaction Details View */
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Creators list</span>
              </button>

              <div className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-2xl flex items-center justify-center font-bold text-2xl">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedUser.name}</h2>
                    <p className="text-xs text-slate-400">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Withdrawable Balance</p>
                    <p className="text-2xl font-extrabold text-emerald-500">₦{((selectedUser.balance || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Received</p>
                    <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">₦{((selectedUser.totalReceived || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Paid Out</p>
                    <p className="text-2xl font-extrabold text-blue-500">₦{((selectedUser.totalTransferred || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bank Payout Details</p>
                      {selectedUser.accountNumber && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedUser.accountNumber, "Account Number")}
                          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedUser.accountName || 'N/A'}</p>
                    <p className="text-xs font-mono text-slate-500">{selectedUser.bankName || 'Bank'}: {selectedUser.accountNumber || 'N/A'}</p>
                  </div>
                </div>

                {/* Admin Controls & Private Notes Bar */}
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Private Notes */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-500" />
                      <span>Private Admin Notes</span>
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        rows={2}
                        value={adminNotesText}
                        onChange={(e) => setAdminNotesText(e.target.value)}
                        placeholder="Add private internal notes about this creator (e.g. payout transaction reference, verified bank status)..."
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                      <button
                        onClick={handleSaveAdminNotes}
                        disabled={savingNotes}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition self-end whitespace-nowrap disabled:opacity-50"
                      >
                        {savingNotes ? 'Saving...' : 'Save Notes'}
                      </button>
                    </div>
                  </div>

                  {/* Freeze / Unfreeze Governance Control */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-500" />
                      <span>Account Status Governance</span>
                    </label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {selectedUser.isFrozen ? 'Account is Frozen' : 'Account Active'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {selectedUser.isFrozen ? 'Public donations disabled' : 'Normal platform access'}
                        </p>
                      </div>
                      <button
                        onClick={handleToggleFreeze}
                        disabled={togglingFreeze}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          selectedUser.isFrozen
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        {selectedUser.isFrozen ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" /> Unfreeze
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" /> Freeze
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approve Payout Trigger */}
              {selectedUser.balance > 0 && (
                <div className="mb-6">
                  <button
                    onClick={handleOpenPayoutModal}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Authorize Payout Approval (₦{((selectedUser.balance || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })})</span>
                  </button>
                </div>
              )}

              {/* Transaction History */}
              <div className="space-y-3">
                <h3 className="text-md font-bold text-slate-900 dark:text-white mb-4">Support & Payout History</h3>
                {userTransactions.length > 0 ? (
                  userTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">{tx.supporter || 'Anonymous Supporter'}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              tx.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{tx.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">₦{((tx.amount || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <p>No support transactions recorded for this creator.</p>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* Safety Confirmation Modal */}
      <ConfirmPayoutModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPayout}
        user={selectedUser}
        approving={approving}
        twoFactorEnabled={twoFactorEnabled}
      />

      {/* 2FA Setup Modal */}
      <TwoFactorSetupModal
        isOpen={show2FASetupModal}
        onClose={() => setShow2FASetupModal(false)}
        onSuccess={() => setTwoFactorEnabled(true)}
      />
    </>
  );
}