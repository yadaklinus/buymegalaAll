"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/config/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: string;
  image?: string;
  goLive?: boolean;
  galaPrice?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/me");
      if (res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.status === 200 && res.data.user) {
        setUser(res.data.user);
        toast.success("Signed in successfully!");
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed");
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      if (res.status === 201 && res.data.user) {
        setUser(res.data.user);
        toast.success("Account created successfully!");
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Registration failed");
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      toast.success("Logged out successfully");
      router.replace("/signin");
    } catch (error) {
      setUser(null);
      router.replace("/signin");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
