import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthGate from "../components/AuthGate";

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
      <body className="antialiased flex flex-col min-h-screen bg-[#0A0A0B] text-white">
        <AuthGate>
          {children}
        </AuthGate>
      </body>
    </html>
  );
}
