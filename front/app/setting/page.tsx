"use client"
import { formatCurrency } from "@/components/format-currency";
import axios from "axios";
import { User, DollarSign, Settings, Save } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Switch } from "@heroui/switch";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import auths from "@/components/protect";
import api from "@/config/api";
import Auths from "@/components/protect";
import Loading from "@/components/loading";

export default function SettingsPage() {
    // All hook calls must be at the top level
    
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [galaPrice, setGalaPrice] = useState<any>(500);
    const [activate, setActivate] = useState(false);
    const [toggleActive, setToggleActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
  
    const { data: session, status } = useSession();
    const router = useRouter();
  
    useEffect(() => {
      if (status === "loading") return;
  
      if (status === "unauthenticated") {
        router.replace("/");
        return;
      }
  
      if (status === "authenticated") {
        setEmail(session?.user?.email || "");
        main();
      }
    }, [status, session, router]);
  
    async function main() {
      try {
        setIsLoading(true);
        const res = await api.post(`/user/setting`, { email: session?.user?.email });
        setActivate(res.data.pageStatus);
        setGalaPrice(!res.data.galaPrice || res.data.galaPrice === 0 ? 500 : res.data.galaPrice);
        setDisplayName(res.data.name);
        setUsername(res.data.username);
      } catch (error) {
        toast.error("Failed to load settings");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  
    if (status === "loading" || isLoading) {
      return (
       <Loading/>
      );
    }
  

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);

        if (galaPrice < 500 || galaPrice > 5000) {
            toast.error("Price cannot be less than ₦500 and grater than ₦5,000");
            setIsSaving(false);
            return;
        }

        try {
            
            const res = await api.post(`/user/changePrice`, { email, newPrice: galaPrice });
            if (res.status === 200) {
                toast.success("Settings saved successfully!");
            }
        } catch (error) {
            toast.error("Failed to save settings");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };


    const handleToggle = async (newValue: any) => {
        if (galaPrice <= 0) {
            toast.error("Please set a gala price first");
            return;
        }
        setActivate(newValue);
        setToggleActive(true);

        try {
            const response = await api.post(`/user/activate`, {
                email,
                active: newValue,
            });
            console.log('Response:', response.data);
            toast.success(`Page ${newValue ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error('API Error:', error);
            toast.error("Failed to update page status");
            setActivate(!newValue); // Revert on error
        } finally {
            setToggleActive(false);
        }
    };
    

    return (
       <>
      <Auths/>
        <div className="max-w-4xl mx-auto min-h-screen">
            {/* ... (rest of your component JSX) ... */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gray-200 p-3 rounded-lg border border-gray-300">
                        <Settings className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">Settings</h1>
                        <p className="text-gray-600">Manage your account and page preferences</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Preview Card - Changed background, border, and text colors */}
                <div className="lg:col-span-1">
                    <div className="bg-white backdrop-blur-sm border border-gray-200 rounded-xl p-6 sticky top-6 shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Preview</h3>
                        <div className="text-center">
                            {/* Maintained the gradient for visual branding */}
                            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-gray-900">
                                    {displayName?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-800">{displayName}</h4>
                            <p className="text-gray-500">@{username}</p>
                            {/* Changed price background and text colors */}
                            <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300">
                                <p className="text-sm text-gray-600">Price per gala</p>
                                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(galaPrice || 500)}</p>
                            </div>
                            {/* Updated status badge colors */}
                            <div className="mt-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    activate
                                        ? "bg-green-100 text-green-700 border border-green-300"
                                        : "bg-red-100 text-red-700 border border-red-300"
                                }`}>
                                    {activate ? "Page Active" : "Page Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Form - Changed background, border, and text colors */}
                <div className="lg:col-span-2">
                    <div className="bg-white backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-md">
                        {/* Page Status Toggle - Changed background, border, and text colors */}
                        
                        {/* <div className="mb-8 p-6 bg-gray-100 rounded-lg border border-gray-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">Page Status</h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {activate ? "Your page is live and accepting donations" : "Your page is disabled"}
                                    </p>
                                </div>
                                <Switch
                                    isDisabled={toggleActive}
                                    isSelected={activate}
                                    onValueChange={handleToggle}
                                    color="success"
                                    size="lg"
                                />
                            </div>
                        </div> */}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Display Name - Changed label, input, and icon colors */}
                            <div>
                                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Display Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        id="displayName"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-500"
                                        disabled
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Display name is synced with your Google account</p>
                            </div>

                            {/* Username - Changed label, input, and icon colors */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">@</span>
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-500 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-500"
                                        disabled
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Username cannot be changed after registration</p>
                            </div>

                            {/* Gala Price - Changed label, input, and icon colors */}
                            <div>
                                <label htmlFor="galaPrice" className="block text-sm font-medium text-gray-700 mb-2">
                                    Price per Gala
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="number"
                                        id="galaPrice"
                                        value={galaPrice}
                                        onChange={(e) => setGalaPrice(e.target.value)}
                                        min="500"
                                        step="50"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                                        placeholder="Enter price in Naira"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Minimum price is ₦500 per gala</p>
                            </div>

                            {/* Save Button - Maintained brand colors but adjusted text color */}
                            <div className="pt-6">
                                <button
                                    disabled={isSaving}
                                    type="submit"
                                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <>
                                            {/* Adjusted spinner colors for contrast */}
                                            <div className="h-5 w-5 rounded-full border-2 border-gray-900/30 border-t-gray-900 animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-5 w-5" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
       </>
    );
}