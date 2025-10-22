"use client"
import {User,HamburgerIcon, Gift, Settings as SettingsIcon, Home, BarChart2, LogIn, UserPlus, LogOut, Landmark, X, Menu } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import api from '@/config/api';


export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [isAuthenticated,setIsAuthenticated] = useState(false)
    const {data,status} = useSession()
    const [username,setUsername] = useState<any>('')

     const router = useRouter()

    useEffect(()=>{
        const main = async ()=>{
            const response = await api.post("/user/nav",{email:data?.user.email})
            setUsername(response?.data.username)
           
        }
        if(status === "authenticated"){
            setIsAuthenticated(true)
            main()
        }
    },[status,data])


    const navLinks = (
        <>
            {/* <button onClick={() => handleNavigate('landing')} className="text-gray-700 hover:bg-white/50 w-full text-left p-3 rounded-md text-base font-medium flex items-center"><Home className="mr-3 h-5 w-5" /> Landing</button> */}
            {isAuthenticated ? (
                <>
                    <Link href={`/@${username}`} onClick={()=>setIsMenuOpen(false)} className="text-gray-700 hover:bg-white/50 w-full text-left p-3 rounded-md text-base font-medium flex items-center"><User className="mr-3 h-5 w-5" /> My Page</Link>
                    <Link href={"/dashboard"} onClick={()=>setIsMenuOpen(false)} className="text-gray-700 hover:bg-white/50 w-full text-left p-3 rounded-md text-base font-medium flex items-center"><BarChart2 className="mr-3 h-5 w-5" /> Dashboard</Link>
                    <Link href={"/checkout"} onClick={()=>setIsMenuOpen(false)} className="text-gray-700 hover:bg-white/50 w-full text-left p-3 rounded-md text-base font-medium flex items-center"><Landmark className="mr-3 h-5 w-5" /> Withdraw</Link>
                    <Link href={"/setting"} onClick={()=>setIsMenuOpen(false)} className="text-gray-700 hover:bg-white/50 w-full text-left p-3 rounded-md text-base font-medium flex items-center"><SettingsIcon className="mr-3 h-5 w-5" /> Settings</Link>
                    <button onClick={()=>signOut()} className="bg-red-500 text-white hover:bg-red-600 w-full text-left mt-2 p-3 rounded-md text-base font-medium flex items-center"><LogOut className="mr-3 h-5 w-5" /> Sign Out</button>
                </>
            ) : (
                <>
                    <Link href={"/signin"} onClick={()=>setIsMenuOpen(false)} className="text-gray-700 hover:bg-white/50 w-full text-left p-3 rounded-md text-base font-medium flex items-center"><LogIn className="mr-3 h-5 w-5" /> Sign In</Link>
                </>
            )}
        </>
    );

    return (
        <nav className="bg-white/30 backdrop-blur-lg shadow-lg w-full sticky top-0 z-50 border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div 
                        className="flex-shrink-0 align-items-center flex items-center cursor-pointer"
                    >
                        <Link className='flex items-align' href={'/'}>
                        <img width={30} src='/gala.png' alt="gala"/>
                        <span className="ml-2 text-2xl font-bold text-gray-800">Buy Me Gala</span>
                        </Link>
                    </div>
                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-2">
                             {isAuthenticated ? (
                                <>
                                    <Link href={`/@${username}`}  className="text-gray-600 hover:bg-white/50 px-3 py-2 rounded-md text-sm font-medium">My Page</Link>
                                    <Link href={"/dashboard"} className="text-gray-600 hover:bg-white/50 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                                    <Link href={"/checkout"} className="text-gray-600 hover:bg-white/50 px-3 py-2 rounded-md text-sm font-medium">Withdraw</Link>
                                    <Link href={"/setting"} className="text-gray-600 hover:bg-white/50 px-3 py-2 rounded-md text-sm font-medium">Settings</Link>
                                    <button onClick={()=>signOut()} className="bg-red-500 text-white hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium">Sign Out</button>
                                </>
                            ) : (
                                <>
                                    <Link href={"/signin"} className="text-white-600 bg-yellow-500 hover:bg-white/50 px-3 py-2 rounded-md text-sm font-medium">Sign In</Link>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Mobile Menu Button */}
                    <div className="-mr-2 flex md:hidden">
                        <button 
                          onClick={() => setIsMenuOpen(!isMenuOpen)} 
                          className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-white/50 focus:outline-none"
                        >
                           {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>
            {/* Mobile Menu Panel */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white/80 backdrop-blur-lg shadow-xl p-4">
                    <div className="flex flex-col space-y-2">
                        {navLinks}
                    </div>
                </div>
            )}
        </nav>
    );
}
