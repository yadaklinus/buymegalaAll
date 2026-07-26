"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/config/api";
import Loading from "./loading";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Auths() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/signin");
      return;
    }

    if (user && !user.emailVerified) {
      router.replace("/verify-email");
      return;
    }

    if (user?.email) {
      api
        .get(`${API}/user/checkSetup/${user.email}`)
        .then((res) => {
          const { isSetupComplete } = res.data;
          if (!isSetupComplete) {
            router.replace("/setup");
          }
        })
        .catch((err) => {
          console.error("Auth check failed:", err);
        });
    }
  }, [loading, user, router]);

  

  return null; // nothing to render, it’s just a guard
}
