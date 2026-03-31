import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthGate from "../components/AuthGate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin | Moon Glow",
  description: "Administrative portal for Moon Glow Craft",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased flex min-h-screen relative overflow-x-hidden bg-[#0a0a0a] text-white">
        {/* Subtle admin background gradient */}
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0a0a] to-[#0a0a0a]"></div>
        
        <AuthGate>
          {children}
        </AuthGate>
      </body>
    </html>
  );
}
