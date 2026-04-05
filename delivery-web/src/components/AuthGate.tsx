"use client"
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Splash from "./Splash";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === '/' || pathname?.startsWith('/signup'); // Delivery root is often login

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('moonGlowToken');
      const role = localStorage.getItem('userRole');

      if (token && (role === 'DRIVER' || role === 'ADMIN')) {
        setIsAuthenticated(true);
        if (pathname === '/') {
            router.push('/tasks');
        }
      } else {
        setIsAuthenticated(false);
        if (pathname !== '/' && pathname !== '/signup') {
          router.push('/');
        }
      }
      
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    };

    const cleanup = checkAuth();
    return cleanup;
  }, [pathname, router, isAuthPage]);

  return (
    <>
      {loading && <Splash />}
      {!isAuthenticated && !isAuthPage ? (
        <div className="min-h-screen bg-[#0A0A0B]" />
      ) : (
        <main className="flex-grow flex flex-col w-full h-full relative">
          {children}
        </main>
      )}
    </>
  );
}
