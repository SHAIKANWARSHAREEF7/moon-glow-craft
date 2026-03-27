import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Splash from "@/components/Splash";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Moon Glow Craft | Handcrafted Artisan Goods",
  description: "Experience the magic of handcrafted chocolates, exquisite keychains, and breathtaking wallmoons.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen flex flex-col relative overflow-x-hidden pt-20">
        <Splash />
        {/* Ambient background glow dots */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
          <div className="absolute top-[40%] left-[50%] w-[20%] h-[20%] bg-yellow-500/10 rounded-full blur-[80px] animate-pulse delay-700"></div>
        </div>
        
        <Navbar />
        <main className="flex-grow flex flex-col items-center">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
