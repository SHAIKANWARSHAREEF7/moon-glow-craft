import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Splash from "../components/Splash";

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
      <body className="antialiased flex min-h-screen relative overflow-x-hidden">
        <Splash />
        {/* Subtle admin background gradient */}
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-admin-dark to-admin-dark"></div>
        <main className="flex-grow flex flex-col w-full h-full">
          {children}
        </main>
      </body>
    </html>
  );
}
