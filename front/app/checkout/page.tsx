"use client"
import React, { useMemo, useState, useEffect } from 'react';
import { Banknote, CreditCard, AlertCircle, CheckCircle, DollarSign, ShieldCheck, X } from 'lucide-react';
import axios from 'axios';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import api from '@/config/api';
import Auths from '@/components/protect';
import { useRouter } from "next/navigation";

// Helper function to format currency, included for completeness.
const formatCurrency = (amount:any, currency = "NGN") => {
    // Handle cases where amount might be null or undefined during initial load
    if (amount === null || typeof amount === 'undefined') {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency,
        }).format(0);
    }
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

export default function WithdrawPage(){
    // --- STATE MANAGEMENT ---
    const [userData, setUserData] = useState<any>(null);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
        accountName: ''
    });
    
    // State for PIN Modal
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');

    const {data:session,status} = useSession()

    // --- DATA FETCHING ---
    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.replace("/");
            return;
        }

        const fetchUserData = async () => {
            setIsFetchingData(true);
            try {
                // In a real application, you would get the user's email from an authentication context or session.
                const userEmail = session?.user.email; // Using a placeholder email for the API call.
                
                // Replace '/api/checkout' with your actual endpoint path
                const response = await api.post('/user/checkoutData', { email: userEmail });
                
                const data = response.data;

                console.log(data)
                setUserData({
                    accountBalance: data.accountBalance,
                    currency: "NGN", // Currency is not in the API response, so we add it.
                });

                // Pre-fill form with fetched data
                setFormData({
                    bankName: data.bank || '',
                    accountNumber: data.accountNumber || '',
                    accountName: data.accountName || '',
                });

            } catch (err) {
                console.error("Failed to fetch user data:", err);
                setFetchError("Could not load withdrawal information. Please try again later.");
            } finally {
                setIsFetchingData(false);
                
            }
        };

        fetchUserData();
    }, [session,status]); // Empty dependency array ensures this runs once on mount

    // --- EVENT HANDLERS ---
    const handleInputChange = (e:any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Opens the PIN modal
    const handleInitiateWithdrawal = (e:any) => {
        e.preventDefault();
        if (userData && userData?.accountBalance > 0) {
            setPinError(''); // Clear previous errors
            setIsPinModalOpen(true);
        }
    };

    // Handles the final withdrawal after PIN is entered
    const handleConfirmWithdrawal = async () => {
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            setPinError('Please enter a valid 4-digit PIN.');
            return;
        }

        setIsLoading(true);
        setPinError('');

        try {
            //await new Promise(resolve => setTimeout(resolve, 2000));

            await api.post('/user/withdraw', { email: session?.user.email,pin });

            console.log({
                email:session?.user.email,
                pin
            })
            
            setShowSuccess(true);
            setIsPinModalOpen(false);
            setPin(''); // Reset PIN input

            // Hide success message after 5 seconds
            setTimeout(() => {
                setShowSuccess(false);
            }, 5000);
        } catch (error) {
            console.error('Withdrawal error:', error);
            setPinError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
            setPin('')
        }
    };

    if (isFetchingData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-yellow-500 animate-spin"></div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Error</h2>
                    <p className="text-gray-500">{fetchError}</p>
                </div>
            </div>
        );
    }
    
    return (
       <>
       <Auths/>
         <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                            <Banknote className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">Withdraw Funds</h1>
                            <p className="text-gray-500">Transfer your earnings to your bank account</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Balance Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6 shadow-sm">
                            <div className="text-center">
                                <div className="bg-yellow-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border-4 border-white ring-2 ring-yellow-200">
                                    <DollarSign className="h-10 w-10 text-yellow-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Available Balance</h3>
                                <p className="text-4xl font-bold text-yellow-600 mb-4">
                                    {formatCurrency(userData?.accountBalance, userData?.currency)}
                                </p>
                                {/* Recent supporters section removed as it's not in the new API data */}
                            </div>
                        </div>
                    </div>

                    {/* Withdrawal Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                            {showSuccess && (
                                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-yellow-800 font-medium">Withdrawal Request Submitted!</p>
                                        <p className="text-yellow-700 text-sm">Funds will be processed within 24 hours.</p>
                                    </div>
                                </div>
                            )}

                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-yellow-800 font-medium text-sm">Processing Information</p>
                                    <p className="text-yellow-700 text-sm mt-1">
                                        Withdrawals are processed within 24 hours on business days. Ensure your bank details are correct to avoid delays.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleInitiateWithdrawal} className="space-y-6">
                                {/* Bank Selection */}
                                <div>
                                    <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Bank
                                    </label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            id="bankName" 
                                            name="bankName"
                                            value={formData.bankName}
                                            onChange={handleInputChange}
                                            required
                                            disabled
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors appearance-none"
                                        />
                                           
                                    </div>
                                </div>

                                {/* Account Number */}
                                <div>
                                    <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Number
                                    </label>
                                    <input 
                                        type="text" 
                                        id="accountNumber" 
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleInputChange}
                                        required 
                                        pattern="\d{10}" 
                                        title="Please enter a 10-digit account number" 
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors" 
                                        placeholder="0123456789" 
                                        maxLength={10}
                                        disabled
                                    />
                                </div>

                                {/* Account Name */}
                                <div>
                                    <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Holder Name
                                    </label>
                                    <input 
                                        type="text" 
                                        id="accountName" 
                                        name="accountName"
                                        value={formData.accountName}
                                        onChange={handleInputChange}
                                        required 
                                        disabled
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors" 
                                        placeholder="Enter account holder name"
                                    />
                                </div>

                                {/* Withdrawal Summary */}
                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Withdrawal Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Available Balance</span>
                                            <span className="text-gray-700 font-medium">{formatCurrency(userData?.accountBalance, userData?.currency)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Processing Fee</span>
                                            <span className="text-gray-700 font-medium">Free</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-3 flex justify-between">
                                            <span className="text-gray-800 font-semibold">You'll Receive</span>
                                            <span className="text-yellow-600 font-bold text-lg">{formatCurrency(userData?.accountBalance, userData?.currency)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={!userData || userData?.accountBalance <= 0 || isLoading}
                                        className={`w-full font-bold py-4 px-4 rounded-lg text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                                            !userData || userData?.accountBalance <= 0 || isLoading
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 transform hover:scale-[1.02] shadow-lg shadow-yellow-500/25'
                                        }`}
                                    >
                                        <Banknote className="h-5 w-5" />
                                        Withdraw {formatCurrency(userData?.accountBalance, userData?.currency)}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PIN INPUT MODAL --- */}
            {isPinModalOpen && (
                <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-gray-200 rounded-xl max-w-sm w-full p-6 text-center shadow-2xl relative">
                         <button onClick={() => setIsPinModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                            <X size={20} />
                        </button>
                        <ShieldCheck className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirm Withdrawal</h2>
                        <p className="text-gray-500 mb-6">For your security, please enter your 4-digit transaction PIN.</p>
                        
                        <div className="mb-4">
                            <input
                                id="pin"
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                
                                pattern="\d{4}"
                                required
                                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 text-center text-2xl tracking-[1em] focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                                placeholder="----"
                            />
                            {pinError && <p className="text-red-500 text-sm mt-2">{pinError}</p>}
                        </div>

                        <button
                            onClick={handleConfirmWithdrawal}
                            disabled={isLoading}
                            className={`w-full font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                                isLoading
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-5 w-5 rounded-full border-2 border-gray-400/30 border-t-gray-500 animate-spin"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                'Confirm & Withdraw'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
       </>
    );
}

