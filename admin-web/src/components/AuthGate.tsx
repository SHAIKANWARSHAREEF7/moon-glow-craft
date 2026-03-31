"use client"
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Splash from "./Splash";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/login' || pathname === '/'; // Admin often has root as login or /login

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('moonGlowToken');
      const role = localStorage.getItem('userRole');

      if (token && role === 'ADMIN') {
        setIsAuthenticated(true);
        if (pathname === '/login' || pathname === '/') {
            router.push('/dashboard');
        }
      } else {
        setIsAuthenticated(false);
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
      // Splash timing
      const timer = setTimeout(() => setLoading(false), 3100);
      return () => clearTimeout(timer);
    };

    checkAuth();
  }, [pathname, router, isLoginPage]);

  if (loading) return <Splash />;

  // Enforce login for anything except the login page
  if (!isAuthenticated && !isLoginPage) return <div className="min-h-screen bg-[#0a0a0a]" />;

  return (
    <main className="flex-grow flex flex-col w-full h-full relative">
      {children}
    </main>
  );
}
