"use client"
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Splash from "./Splash";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === '/' || pathname === '/signup'; // Delivery root is often login

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
      
      const timer = setTimeout(() => setLoading(false), 3100);
      return () => clearTimeout(timer);
    };

    checkAuth();
  }, [pathname, router, isAuthPage]);

  if (loading) return <Splash />;

  if (!isAuthenticated && !isAuthPage) return <div className="min-h-screen bg-[#0A0A0B]" />;

  return (
    <main className="flex-grow flex flex-col w-full h-full relative">
      {children}
    </main>
  );
}
