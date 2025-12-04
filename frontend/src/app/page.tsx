"use client";

import { useEffect } from "react";
import { navigateTo } from "@/lib/config";

export default function HomePage() {
  useEffect(() => {
    // Check if user is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      navigateTo("/wardrobe");
    } else {
      navigateTo("/login");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
    </div>
  );
}
