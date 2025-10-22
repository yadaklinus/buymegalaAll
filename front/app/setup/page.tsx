"use client"
import React, { useState, useEffect } from 'react';
import { Check, User, CreditCard, Settings, ArrowRight, ArrowLeft, AlertCircle, CheckCircle, Upload, Camera, Shield } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from 'axios';
import toast from 'react-hot-toast';
import Loading from '@/components/loading';
import api from '@/config/api';

export default function SetupPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    // Step 1 - Display name & Username
    const [profileData, setProfileData] = useState({
        displayName: '',
        username: ''
    });
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<any>(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    
    // Step 2 - Bank details
    const [bankDetails, setBankDetails] = useState({
        accountNumber: '',
        bankName: '',
        accountName: ''
    });
    const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
    const [accountVerified, setAccountVerified] = useState(false);

    // Step 3 - Transaction PIN
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [pinError, setPinError] = useState('');

    // Step 4 - Profile setup
    const [profileSetup, setProfileSetup] = useState({
        galaPrice: '500',
        bio: '',
        profilePicture: null
    });

    const banks = [
        { "name": "Access Bank", "code": "044" },
        { "name": "First Bank of Nigeria", "code": "011" },
        { "name": "United Bank for Africa (UBA)", "code": "033" },
        { "name": "Guaranty Trust Bank", "code": "058" },
        { "name": "Zenith Bank", "code": "057" },
        { "name": "Ecobank Nigeria", "code": "050" },
        { "name": "Stanbic IBTC Bank", "code": "221" },
        { "name": "Sterling Bank", "code": "232" },
        { "name": "Union Bank", "code": "032" },
        { "name": "Fidelity Bank", "code": "070" },
        { "name": "Polaris Bank", "code": "076" },
        { "name": "Wema Bank", "code": "035" },
        { "name": "Keystone Bank", "code": "082" },
        { "name": "Heritage Bank", "code": "030" },
        { "name": "Unity Bank", "code": "215" },
        { "name": "Taj Bank Limited", "code": "000026" },
        { "name": "Providus Bank", "code": "101" },
        { "name": "Jaiz Bank", "code": "301" },
        { "name": "Opay (Paycom MFB)", "code": "100004" },
        { "name": "Moniepoint MFB", "code": "090405" },
        { "name": "Kuda MFB", "code": "090267" },
        { "name": "Fcmb Microfinance Bank", "code": "090409" }
      ]

      const normalize = (str: any) => str.trim().replace(/\s+/g, ' ').toLowerCase();

      const getBankCodeByName = (bankName: any) => {
        const normalizedInput = normalize(bankName);
        const bank = banks.find(b => normalize(b.name) === normalizedInput);
        return bank ? bank.code : null;
      };
      
      // Effect for session + profile prefill
      useEffect(() => {
        if (status === "unauthenticated") {
          router.replace("/signin");
        }
      
        if (status === "authenticated" && session?.user) {
          setProfileData(prev => ({
            ...prev,
            displayName: session?.user?.name || '',
            username: session?.user?.email?.split('@')[0] || ''
          }));
        }
      }, [status, session, router]);
      
      // Effect for username availability check
      useEffect(() => {
        if (profileData.username) {
          const delayDebounce = setTimeout(() => {
            checkUsernameAvailability(profileData.username);
          }, 500);
      
          return () => clearTimeout(delayDebounce);
        }
      }, [profileData.username]);
      
      const checkUsernameAvailability = async (usernameToCheck: string) => {
        if (!usernameToCheck || usernameToCheck.length < 3) {
          setIsUsernameAvailable(null);
          return;
        }
      
        setIsCheckingUsername(true);
        try {
          const response = await api.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/check-username`, {
            username: usernameToCheck
          });
          setIsUsernameAvailable(response.data.available);
        } catch (error) {
          console.error('Username check error:', error);
          setIsUsernameAvailable(false);
        } finally {
          setIsCheckingUsername(false);
        }
      };
      
      const verifyBankAccount = async () => {
        if (
          !bankDetails.accountNumber ||
          !bankDetails.bankName ||
          bankDetails.accountNumber.length !== 10
        ) {
          toast.error("Please enter a valid 10-digit account number and select a bank");
          return;
        }
      
        setIsVerifyingAccount(true);
        try {
          const res = await api.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/flutter/verrifyAccount`,
            {
              account_number: bankDetails.accountNumber,
              bank_code: getBankCodeByName(bankDetails.bankName),
            }
          );
      
          if (res.data.status === "success") {
            setBankDetails(prev => ({
              ...prev,
              accountName: res.data.data.account_name,
            }));
            setAccountVerified(true);
            toast.success("Account verified successfully!");
          } else {
            throw new Error(res.data.message || "Verification failed");
          }
        } catch (error) {
          toast.error("Account verification failed");
          setAccountVerified(false);
        } finally {
          setIsVerifyingAccount(false);
        }
      };
      
      const handleProfileChange = (field: any, value: any) => {
        if (field === 'username') {
          const cleanValue = value.toLowerCase().replace(/[^a-z0-9]/g, '');
          setProfileData(prev => ({
            ...prev,
            username: cleanValue
          }));
          setIsUsernameAvailable(null);
        } else {
          setProfileData(prev => ({
            ...prev,
            [field]: value
          }));
        }
      };
      
      const handleBankDetailsChange = (field: any, value: any) => {
        setBankDetails(prev => ({
          ...prev,
          [field]: value
        }));
        if (accountVerified && field !== 'accountName') {
          setAccountVerified(false);
          setBankDetails(prev => ({
            ...prev,
            accountName: ''
          }));
        }
      };
      
      const handleProfileSetupChange = (field: any, value: any) => {
        setProfileSetup(prev => ({
          ...prev,
          [field]: value
        }));
      };
      
      const handleImageUpload = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('Image size should be less than 5MB');
            return;
          }
      
          const reader = new FileReader();
          reader.onload = (e) => {
            setProfileSetup((prev: any) => ({
              ...prev,
              profilePicture: e?.target?.result
            }));
          };
          reader.readAsDataURL(file);
        }
      };
      
      const canProceedStep1 = () => {
        return profileData.displayName.length >= 2 &&
               profileData.username.length >= 3 &&
               isUsernameAvailable === true;
      };
      
      const canProceedStep2 = () => {
        return accountVerified;
      };
      
      const canProceedStep3 = () => {
        const isValid = pin.length === 4 && confirmPin.length === 4 && pin === confirmPin;
        // if (!isValid) {
        //   toast.error("PINs do not match. Please re-enter.");
        // }
        return isValid;
      };
      
      const handleNext = () => {
        if (currentStep === 1 && canProceedStep1()) {
          setCurrentStep(2);
        } else if (currentStep === 2 && canProceedStep2()) {
          setCurrentStep(3);
        } else if (currentStep === 3 && canProceedStep3()) {
          setCurrentStep(4);
        }
      };
      
      const handlePrevious = () => {
        if (currentStep > 1) {
          setCurrentStep(currentStep - 1);
        }
      };
      
      const handleFinish = async () => {
        const galaPrice = parseInt(profileSetup.galaPrice, 10);
        if (isNaN(galaPrice) || galaPrice < 500 || galaPrice > 5000) {
          toast.error('Gala price must be between ₦500 and ₦5,000.');
          return;
        }
      
        setIsLoading(true);
        try {
          await api.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/setup`, {
            email: session?.user?.email,
            displayName: profileData.displayName,
            username: profileData.username,
            bankDetails,
            pin: pin, // Include the new PIN
            galaPrice: parseInt(profileSetup.galaPrice),
            bio: profileSetup.bio,
            profilePicture: profileSetup.profilePicture
          });
      
          toast.success('Setup completed successfully!');
          router.push('/dashboard');
        } catch (error) {
          toast.error('Setup failed. Please try again.');
          console.error('Setup error:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      if (status === "loading") {
        return (
          <Loading/>
        );
      }
      
      const steps = [
        { number: 1, title: 'Profile', icon: User },
        { number: 2, title: 'Payment', icon: CreditCard },
        { number: 3, title: 'Security', icon: Shield },
        { number: 4, title: 'Setup', icon: Settings }
      ];
      

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-yellow-100 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-4xl">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-4 sm:space-x-8 mb-6">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.number}>
                                <div className={`flex flex-col items-center space-y-2 ${currentStep >= step.number ? 'text-yellow-500' : 'text-gray-500'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${currentStep >= step.number ? 'bg-yellow-500 text-black' : 'bg-gray-200 text-gray-500'}`}>
                                        {currentStep > step.number ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                                    </div>
                                    <span className="text-xs sm:text-sm font-medium">{step.title}</span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`h-1 flex-1 max-w-16 ${currentStep > step.number ? 'bg-yellow-500' : 'bg-gray-200'} rounded-full transition-colors duration-300`}></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white border border-gray-200/80 rounded-xl shadow-lg p-6 sm:p-8">
                    {/* Step 1: Display Name & Username */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="bg-yellow-500/10 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                    <User className="w-10 h-10 text-yellow-500" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Your Profile</h2>
                                <p className="text-gray-600">Set up your display name and choose a unique username for your page.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Display Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Display Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.displayName}
                                        onChange={(e) => handleProfileChange('displayName', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                                        placeholder="Your full name"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">This is how supporters will see your name.</p>
                                </div>

                                {/* Username */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username (Handle) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                                        <input
                                            type="text"
                                            value={profileData.username}
                                            onChange={(e) => handleProfileChange('username', e.target.value)}
                                            className="w-full pl-8 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                                            placeholder="yourusername"
                                            minLength={3} maxLength={30} required
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {isCheckingUsername ? (
                                                <div className="w-5 h-5 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
                                            ) : isUsernameAvailable === true ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : isUsernameAvailable === false ? (
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            ) : null}
                                        </div>
                                    </div>
                                    {profileData.username && (
                                        <div className="mt-2 text-sm">
                                            {isCheckingUsername ? (
                                                <p className="text-yellow-600">Checking availability...</p>
                                            ) : isUsernameAvailable === true ? (
                                                <p className="text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" />Username is available!</p>
                                            ) : isUsernameAvailable === false ? (
                                                <p className="text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />Username is already taken.</p>
                                            ) : profileData.username.length < 3 ? (
                                                <p className="text-gray-600">Username must be at least 3 characters.</p>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                                <p className="text-sm text-gray-600 mb-1">
                                    <strong>Page URL:</strong> buymegala.app/<span className="font-semibold text-yellow-600">@{profileData.username || 'username'}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Display Name:</strong> <span className="font-semibold text-yellow-600">{profileData.displayName || 'Your Name'}</span>
                                </p>
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={!canProceedStep1()}
                                className="w-full bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg hover:bg-yellow-400 transition-all duration-300 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Continue to Payment Setup <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Bank Details */}
                    {currentStep === 2 && (
                       <div className="space-y-6">
                            <div className="text-center">
                                <div className="bg-yellow-500/10 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                    <CreditCard className="w-10 h-10 text-yellow-500" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Payment Information</h2>
                                <p className="text-gray-600">Add your bank details to receive payments from supporters.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Bank <span className="text-red-500">*</span></label>
                                    <select
                                        value={bankDetails.bankName}
                                        onChange={(e) => handleBankDetailsChange('bankName', e.target.value)}
                                        className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                                        required
                                    >
                                        <option value="">Choose your bank...</option>
                                        {banks.map((bank) => (<option key={bank.code} value={bank.name}>{bank.name}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={bankDetails.accountNumber}
                                        onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                                        placeholder="0123456789" maxLength={10} required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Enter your 10-digit account number.</p>
                                </div>
                            </div>

                            <button
                                onClick={verifyBankAccount}
                                disabled={!bankDetails.bankName || bankDetails.accountNumber.length !== 10 || isVerifyingAccount}
                                className="w-full bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isVerifyingAccount ? (
                                    <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> Verifying Account...</>
                                ) : ( 'Verify Account Details' )}
                            </button>

                            {accountVerified && (
                                <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="text-green-700 font-medium">Account Verified Successfully</span>
                                    </div>
                                    <div className="space-y-1 text-sm text-green-800">
                                        <p><strong>Account Name:</strong> {bankDetails.accountName}</p>
                                        <p><strong>Bank:</strong> {bankDetails.bankName}</p>
                                        <p><strong>Account Number:</strong> {bankDetails.accountNumber}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button
                                    onClick={handlePrevious}
                                    className="flex-1 order-2 sm:order-1 bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!canProceedStep2()}
                                    className="flex-1 order-1 sm:order-2 bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Continue to Security Setup <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Transaction PIN */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                             <div className="text-center">
                                <div className="bg-yellow-500/10 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                    <Shield className="w-10 h-10 text-yellow-500" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Transaction PIN</h2>
                                <p className="text-gray-600">This 4-digit PIN will be used to authorize your withdrawals.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        4-Digit PIN <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                        className="w-full text-center tracking-[1em] px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                                        placeholder="••••"
                                        maxLength={4}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm PIN <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPin}
                                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                        className="w-full text-center tracking-[1em] px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                                        placeholder="••••"
                                        maxLength={4}
                                        required
                                    />
                                </div>
                            </div>

                            
                            
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button
                                    onClick={handlePrevious}
                                    className="flex-1 order-2 sm:order-1 bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!canProceedStep3()}
                                    className="flex-1 order-1 sm:order-2 bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Continue to Final Setup <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}


                    {/* Step 4: Profile Setup */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                             <div className="text-center">
                                <div className="bg-yellow-500/10 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                                    <Settings className="w-10 h-10 text-yellow-500" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
                                <p className="text-gray-600">Set your default gala price, add a bio, and upload a profile picture.</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Gala Price (₦) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        value={profileSetup.galaPrice}
                                        onChange={(e) => handleProfileSetupChange('galaPrice', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                                        placeholder="500" min="500" step="50" max={5000} required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Minimum ₦500 per gala and Maximum ₦5,000. You can change this later.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio (Optional)</label>
                                    <textarea
                                        value={profileSetup.bio}
                                        onChange={(e) => handleProfileSetupChange('bio', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors resize-none"
                                        placeholder="Tell supporters a bit about yourself..." rows={4} maxLength={500}
                                    />
                                    <p className="text-xs text-gray-500 mt-1 text-right">{profileSetup.bio.length}/500 characters</p>
                                </div>
                            </div>

                            <div className="bg-gray-100 rounded-lg p-6 border border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Profile Summary</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Display Name:</p>
                                        <p className="text-yellow-600 font-medium">{profileData.displayName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Username:</p>
                                        <p className="text-yellow-600 font-medium">@{profileData.username}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Gala Price:</p>
                                        <p className="text-green-600 font-medium">₦{profileSetup.galaPrice}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Bank:</p>
                                        <p className="text-blue-600 font-medium">{bankDetails.bankName}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button
                                    onClick={handlePrevious}
                                    className="flex-1 order-2 sm:order-1 bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    onClick={handleFinish}
                                    disabled={parseInt(profileSetup.galaPrice) < 500 || isLoading}
                                    className="flex-1 order-1 sm:order-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-3 px-4 rounded-lg hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 disabled:bg-gray-200 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> Completing Setup...</>
                                    ) : (
                                        <><Check className="w-4 h-4" /> Complete Setup</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
