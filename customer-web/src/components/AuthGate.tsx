"use client"
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Splash from "./Splash";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/reset-password';

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('moonGlowToken');
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        if (!isAuthPage) {
          router.push('/login');
        }
      }
      // Keep splash for 3s
      const timer = setTimeout(() => setLoading(false), 3100);
      return () => clearTimeout(timer);
    };

    checkAuth();
  }, [pathname, router, isAuthPage]);

  if (loading) return <Splash />;

  // If not authenticated and not on an auth page, shield the content while redirecting
  if (!isAuthenticated && !isAuthPage) return <div className="min-h-screen bg-black" />;

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main className={`flex-grow flex flex-col items-center min-h-screen ${!isAuthPage ? 'pt-20' : ''}`}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}
