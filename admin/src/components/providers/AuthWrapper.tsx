"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      setIsAuthenticated(false);
      if (pathname !== "/login") {
        router.push("/login");
      }
    } else {
      setIsAuthenticated(true);
      if (pathname === "/login") {
        router.push("/");
      }
    }
  }, [pathname, router]);

  // Prevent hydration mismatch by optionally showing a loader
  if (!mounted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="w-full">{children}</main>;
  }

  // If unauthenticated and not on the login page, show loading until redirect happens
  if (!isAuthenticated && !isLoginPage) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <AppSidebar />
      <main className="w-full">
        <Navbar />
        <div className="px-4">{children}</div>
      </main>
    </>
  );
}
