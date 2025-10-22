"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import api from "@/config/api";
import Loading from "./loading";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Auths() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status === "authenticated" && session?.user?.email) {
      api
        .get(`${API}/user/checkSetup/${session.user.email}`)
        .then((res) => {
          const { isSetupComplete } = res.data;
          if (!isSetupComplete) {
            router.replace("/setup");
          }
        })
        .catch((err) => {
          console.error("Auth check failed:", err);
          router.replace("/"); // fallback if error
        });
    }
  }, [status, session, router]);

  

  return null; // nothing to render, it’s just a guard
}
