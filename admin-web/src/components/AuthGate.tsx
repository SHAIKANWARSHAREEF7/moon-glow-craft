"use client"
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Splash from "./Splash";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/' || pathname?.startsWith('/login');

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
        if (pathname !== '/') {
          router.push('/');
        }
      }
      // Splash timing
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    };

    const cleanup = checkAuth();
    return cleanup;
  }, [pathname, router, isLoginPage]);

  return (
    <>
      {loading && <Splash />}
      {!isAuthenticated && !isLoginPage ? (
        <div className="min-h-screen bg-[#0a0a0a]" />
      ) : (
        <main className="flex-grow flex flex-col w-full h-full relative">
          {children}
        </main>
      )}
    </>
  );
}
