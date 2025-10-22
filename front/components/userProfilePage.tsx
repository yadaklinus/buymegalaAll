"use client"
import { Gift } from "lucide-react";
import React, { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import  {formatCurrency}  from "@/components/format-currency";
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
    const path = usePathname()
    const [galas, setGalas] = useState<any>(1);
    const [message, setMessage] = useState('');
    const [supporterName, setSupporterName] = useState('');
    const username = path.split("@")[1]
    const rate = exchangeRate()
    const [user,setUser] = useState<any>({})
    const router = useRouter()

    const amountValue = (parseInt(user?.galaPrice || 0) * (galas || 0))
    const tx_ref = `BMG-${user.id}-${Date.now()}`

    const config = {
        public_key: `${process.env.NEXT_PUBLIC_FLUTTER_KEY}`,
        tx_ref,
        amount: amountValue,
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
          email: 'user@gmail.com',
           phone_number: '070********',
          name: 'john doe',
        },
        customizations: {
          title: 'Buy Me Gala',
          description: `Buying a Gala For @${username}`,
          logo: 'http://localhost:3000/gala.png',
        },
      };
    
      const handleFlutterPayment = useFlutterwave(config as any);
   


    const {data,loading,error} = postRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/page`,{username}) as any
    console.log(data?.goLive)
    
    useEffect(() => {
       
      if (data) {
        
          setUser(data);
      }
  }, [data]);

    if(loading){
      return <Loading/>
    }
    if(error){
      return "Error"
    }
    if(!data?.goLive){
      return notFound()
    }

    console.log(user == null)
   

    if(path[1] !== "@"){
        return notFound()
    }

     

   

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string

    const handlePayment = async () => {
      const verifyRes = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/payment`,
        {
          // Flutterwave returns this
          tx_ref: tx_ref,
          supporterName,
          message,
          amountValue,
        }
      );
        handleFlutterPayment({
          callback: async (response) => {
            console.log("Flutterwave response:", response);
      
            // send response.tx_ref or response.transaction_id to backend for verification
            try {
      
              if (response.status === "completed") {
                console.log("Payment verified ✅");
                router.push("/thankyou")
              } else {
                console.log("Payment failed ❌");
              }
            } catch (err) {
              console.error("Verification error:", err);
            }
      
            closePaymentModal();
          },
          onClose: () => {
            console.log("Payment modal closed ❌");
            router.refresh()
          },
        });


      };
      
  
    return (
        <>
        <Head>
            <title>{username} - Buy Me Gala</title>
            <meta property="og:title" content={`${username} - Buy Me Gala`} />
            <meta name="description" content={`Support ${username} on Buy Me Gala`} />
        </Head>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-800">Buy <span className="text-yellow-500">{username}</span> a gala</h1>
                    <form className="mt-8 space-y-6">
                        <div className="bg-gray-100 rounded-lg p-4">
                           <div className="flex flex-wrap items-center gap-4">
                                <Gift className="h-10 w-10 text-yellow-500 flex-shrink-0" />
                                <span className="text-2xl font-bold text-gray-800 flex-shrink-0">x</span>
                                <div className="flex items-center space-x-2 flex-wrap">
                                    {[1, 2, 5, 10].map(num => (
                                        <button key={num} type="button" onClick={() => setGalas(num)} className={`h-12 w-12 rounded-full font-bold text-lg transition-all flex-shrink-0 ${galas === num ? 'bg-yellow-500 text-white scale-110' : 'bg-white hover:bg-yellow-100'}`}>
                                            {num}
                                        </button>
                                    ))}
                                </div>
                                <input 
                                    type="number"
                                    value={galas}
                                    onChange={(e) => setGalas(e.target.value ? parseInt(e.target.value, 10) : '')}
                                    className="h-12 w-24 text-center font-bold text-lg border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                                    min="1"
                                    placeholder="Custom"
                                />
                           </div>
                        </div>
                        <input type="text" placeholder="Your name (optional)" value={supporterName} onChange={(e) => setSupporterName(e.target.value)} className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition" />
                        <textarea placeholder="Say something nice... (optional)" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"></textarea>
                        <Button onClick={handlePayment} className="w-full bg-yellow-500 text-gray-900 font-bold py-4 rounded-lg text-xl hover:bg-yellow-600 transition disabled:bg-gray-400">{formatCurrency(amountValue)}</Button> 
                    </form>
                </div>
            </div>
            <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <img
                    src={user.profilePicture}
                    alt={user.displayName}
                    className="w-24 h-24 rounded-full mx-auto ring-4 ring-yellow-400"
                    />
                    <h2 className="mt-4 text-2xl font-bold text-gray-800">
                    {user.displayName}
                    </h2>
                    <p className="text-gray-500">@{user.username}</p>

                    {/* 🔽 Description Section */}
                    <div className="mt-4">
                        <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-xl shadow-sm">
                            <p className="text-gray-800 text-sm leading-relaxed">
                            {user.bio}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}