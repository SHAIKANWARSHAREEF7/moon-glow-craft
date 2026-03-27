import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Splash from "../components/Splash";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Delivery | Moon Glow",
  description: "Driver portal for Moon Glow Craft deliveries",
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased flex flex-col min-h-screen">
        <Splash />
        <main className="flex-grow flex flex-col w-full h-full relative">
          {children}
        </main>
      </body>
    </html>
  );
}
