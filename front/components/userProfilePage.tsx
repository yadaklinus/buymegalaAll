"use client"
import { Gift } from "lucide-react";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/components/format-currency";
import exchangeRate from "@/config/exchangeRatre";
import axios from "axios";
import toast from "react-hot-toast";
import { getRequest } from "@/hook/getRequest";
import postRequest from "@/hook/postRequest";
import { Button } from "@heroui/button";
import Loading from "@/components/loading";
import Head from "next/head";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

export default function UserProfilePage() {
    const path = usePathname();
    const router = useRouter();
    
    const [galas, setGalas] = useState<any>(1);
    const [message, setMessage] = useState('');
    const [supporterName, setSupporterName] = useState('');
    const [user, setUser] = useState<any>({});
    const [processing, setProcessing] = useState(false);
    
    const username = path.split("@")[1];
    const rate = exchangeRate();

    const { data, loading, error } = postRequest(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/page`,
        { username }
    ) as any;

    useEffect(() => {
        if (data) {
            setUser(data);
        }
    }, [data]);

    // Show loading state
    if (loading) {
        return <Loading />;
    }

    // Handle errors
    if (error) {
        return <div className="text-center p-8 text-red-500">Error loading profile</div>;
    }

    // Check if page is live
    if (!data?.goLive) {
        return notFound();
    }

    // Validate URL format
    if (path[1] !== "@") {
        return notFound();
    }

    const amountValue = (parseInt(user?.galaPrice || 0) * (galas || 0));
    
    // Generate unique transaction reference
    const generateTxRef = () => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `BMG-${user.id}-${timestamp}-${random}`;
    };

    const handlePayment = async () => {
        // Validation
        if (!galas || galas < 1) {
            toast.error("Please enter a valid number of galas");
            return;
        }

        if (amountValue < 100) {
            toast.error("Minimum amount is ₦100");
            return;
        }

        setProcessing(true);

        try {
            // Generate unique transaction reference
            const tx_ref = generateTxRef();

            console.log("📝 Creating support record...", {
                tx_ref,
                amountValue,
                supporterName: supporterName || "Anonymous"
            });

            // Create support record BEFORE initiating payment
            const supportResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/support`,
                {
                    tx_ref: tx_ref,
                    tx_id: tx_ref,
                    supporterName: supporterName || "Anonymous",
                    message: message || "",
                    amountValue: amountValue,
                }
            );

            if (supportResponse.status !== 201 && supportResponse.status !== 200) {
                throw new Error("Failed to create support record");
            }

            console.log("✅ Support record created:", supportResponse.data);

            // Configure Flutterwave payment
            const config = {
                public_key: `${process.env.NEXT_PUBLIC_FLUTTER_KEY}`,
                tx_ref: tx_ref,
                amount: amountValue,
                currency: 'NGN',
                payment_options: 'card,mobilemoney,ussd,banktransfer',
                customer: {
                    email: 'support@buyemegala.com',
                    phone_number: '08000000000',
                    name: supporterName || 'Anonymous Supporter',
                },
                customizations: {
                    title: 'Buy Me Gala',
                    description: `Buying ${galas} Gala(s) for @${username}`,
                    logo: 'https://buyemegala.com/gala.png',
                },
            };

            // Initialize payment with useFlutterwave hook
            const handleFlutterPayment = useFlutterwave(config as any);

            // Open payment modal
            handleFlutterPayment({
                callback: async (response) => {
                    console.log("💳 Payment response:", response);

                    try {
                        // Check payment status
                        if (response.status === "successful" || response.status === "completed") {
                            // Show verifying toast
                            const verifyToastId = toast.loading("Verifying payment...");

                            // Verify payment on backend
                            try {
                                const verifyResponse = await axios.post(
                                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/flutter/verify-payment`,
                                    {
                                        transaction_id: response.transaction_id,
                                        tx_ref: response.tx_ref,
                                    },
                                    { timeout: 15000 } // 15 second timeout
                                );

                                console.log("✅ Verification response:", verifyResponse.data);

                                // Dismiss verifying toast
                                toast.dismiss(verifyToastId);

                                if (verifyResponse.data.status === "success" || verifyResponse.data.status === "pending") {
                                    toast.success("Payment verified successfully! 🎉", {
                                        duration: 3000,
                                    });
                                    
                                    // Redirect to thank you page
                                    setTimeout(() => {
                                        router.push(`/thankyou?ref=${response.tx_ref}&amount=${amountValue}&name=${supporterName || 'Anonymous'}`);
                                    }, 1500);
                                } else {
                                    toast.error("Payment verification failed. Please contact support if money was deducted.");
                                    console.error("❌ Verification failed:", verifyResponse.data);
                                }
                            } catch (verifyError: any) {
                                // Dismiss verifying toast
                                toast.dismiss(verifyToastId);
                                
                                console.warn("⚠️ Frontend verification error:", verifyError);
                                
                                // Show a more helpful message
                                toast.success(
                                    "Payment submitted! It may take a few moments to process. Check your email for confirmation.",
                                    { duration: 5000 }
                                );
                                
                                // Still redirect - webhook will handle verification
                                setTimeout(() => {
                                    router.push(`/thankyou?ref=${response.tx_ref}&pending=true`);
                                }, 2000);
                            }

                        } else {
                            toast.error("Payment was not successful. Please try again.");
                            console.log("❌ Payment failed:", response.status);
                        }
                    } catch (err) {
                        console.error("❌ Error processing payment callback:", err);
                        toast.error("An error occurred. If payment was successful, it will be processed shortly.");
                    }

                    closePaymentModal();
                    setProcessing(false);
                },
                onClose: () => {
                    console.log("🚪 Payment modal closed");
                    toast.error("Payment cancelled");
                    setProcessing(false);
                },
            });

        } catch (error: any) {
            console.error("❌ Payment error:", error);
            toast.error(error.response?.data?.error || "Failed to initiate payment. Please try again.");
            setProcessing(false);
        }
    };

    return (
        <>
            <Head>
                <title>{username} - Buy Me Gala</title>
                <meta property="og:title" content={`${username} - Buy Me Gala`} />
                <meta name="description" content={`Support ${username} on Buy Me Gala`} />
                <meta property="og:image" content={user.profilePicture} />
            </Head>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
                <div className="md:col-span-2">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h1 className="text-3xl font-bold text-gray-800">
                            Buy <span className="text-yellow-500">{username}</span> a gala
                        </h1>
                        
                        <form 
                            className="mt-8 space-y-6"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handlePayment();
                            }}
                        >
                            <div className="bg-gray-100 rounded-lg p-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <Gift className="h-10 w-10 text-yellow-500 flex-shrink-0" />
                                    <span className="text-2xl font-bold text-gray-800 flex-shrink-0">x</span>
                                    <div className="flex items-center space-x-2 flex-wrap">
                                        {[1, 2, 5, 10].map(num => (
                                            <button 
                                                key={num}
                                                type="button"
                                                onClick={() => setGalas(num)}
                                                disabled={processing}
                                                className={`h-12 w-12 rounded-full font-bold text-lg transition-all flex-shrink-0 
                                                    ${galas === num 
                                                        ? 'bg-yellow-500 text-white scale-110' 
                                                        : 'bg-white hover:bg-yellow-100'
                                                    }
                                                    ${processing ? 'opacity-50 cursor-not-allowed' : ''}
                                                `}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                    <input 
                                        type="number"
                                        value={galas}
                                        onChange={(e) => setGalas(e.target.value ? parseInt(e.target.value, 10) : '')}
                                        disabled={processing}
                                        className="h-12 w-24 text-center font-bold text-lg border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50"
                                        min="1"
                                        max="100"
                                        placeholder="Custom"
                                    />
                                </div>
                            </div>

                            <input 
                                type="text"
                                placeholder="Your name (optional)"
                                value={supporterName}
                                onChange={(e) => setSupporterName(e.target.value)}
                                disabled={processing}
                                maxLength={50}
                                className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition disabled:opacity-50"
                            />

                            <textarea 
                                placeholder="Say something nice... (optional)"
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={processing}
                                maxLength={500}
                                className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition disabled:opacity-50"
                            />

                            <Button 
                                type="button"
                                onClick={handlePayment}
                                disabled={processing || !galas || galas < 1}
                                className="w-full bg-yellow-500 text-gray-900 font-bold py-4 rounded-lg text-xl hover:bg-yellow-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {processing ? "Processing..." : `Support with ${formatCurrency(amountValue)}`}
                            </Button>

                            <p className="text-center text-sm text-gray-500 mt-2">
                                Secure payment powered by Flutterwave
                            </p>
                        </form>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <img
                            src={user.profilePicture || '/default-avatar.png'}
                            alt={user.displayName}
                            className="w-24 h-24 rounded-full mx-auto ring-4 ring-yellow-400 object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-avatar.png';
                            }}
                        />
                        <h2 className="mt-4 text-2xl font-bold text-gray-800">
                            {user.displayName}
                        </h2>
                        <p className="text-gray-500">@{user.username}</p>

                        <div className="mt-4">
                            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-xl shadow-sm">
                                <p className="text-gray-800 text-sm leading-relaxed">
                                    {user.bio || `Support ${user.displayName} by buying them a gala!`}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-gray-600">
                            <p className="font-semibold">₦{user.galaPrice} per gala</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}