"use client";
// Root page — redirect to login or dashboard based on auth status
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "./lib/api";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
