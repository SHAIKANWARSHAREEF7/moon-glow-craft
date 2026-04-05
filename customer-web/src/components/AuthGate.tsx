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

  const isProtectedPage = pathname?.includes('/dashboard') || pathname?.includes('/checkout') || pathname?.includes('/track');
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/signup') || pathname?.includes('/reset-password');

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('moonGlowToken');
      if (token) {
        setIsAuthenticated(true);
        // If logged in and on auth page, redirect to dashboard
        if (isAuthPage) {
          router.push('/dashboard');
        }
      } else {
        setIsAuthenticated(false);
        // If not logged in and on a PROTECTED page, redirect to login
        if (isProtectedPage) {
          router.push('/login');
        }
      }
      
      const timer = setTimeout(() => setLoading(false), 1500);

      // Return cleanup directly to checkAuth's caller
      return () => clearTimeout(timer);
    };

    const cleanup = checkAuth();
    return cleanup;
  }, [pathname, router, isAuthPage, isProtectedPage]);

  return (
    <>
      {loading && <Splash />}
      {!isAuthenticated && isProtectedPage ? (
        <div className="min-h-screen bg-black" />
      ) : (
        <>
          {!isAuthPage && <Navbar />}
          <main className={`flex-grow flex flex-col items-center min-h-screen ${!isAuthPage ? 'pt-20' : ''}`}>
            {children}
          </main>
          {!isAuthPage && <Footer />}
        </>
      )}
    </>
  );
}
