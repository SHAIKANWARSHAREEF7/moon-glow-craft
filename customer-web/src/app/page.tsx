"use client"
import Image from "next/image";
import { MoveRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Home() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  
  const categories = [
    { name: 'Chocolates', icon: '🍫', count: '12+ Types' },
    { name: 'Thread Art', icon: '🧵', count: 'Customizable' },
    { name: 'Keychains', icon: '🔑', count: 'Handmade' },
    { name: 'Wall Moon', icon: '🌙', count: 'Premium' },
  ];

  return (
    <div className="w-full flex-col flex items-center relative overflow-hidden bg-[#050505]">
      {/* Search & Promo Header */}
      <div className="w-full h-12 bg-gradient-to-r from-yellow-600 to-yellow-400 flex items-center justify-center overflow-hidden relative">
        <motion.p 
          animate={{ x: [400, -400] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="text-black font-bold text-sm whitespace-nowrap"
        >
          ✨ GET 20% OFF ON YOUR FIRST THREAD ART ORDER! USE CODE: MOONGLOW20 ✨ FREE DELIVERY ON ORDERS ABOVE ₹999! ✨
        </motion.p>
      </div>

      {/* Main Hero Section */}
      <section ref={ref} className="w-full max-w-7xl mx-auto px-6 py-24 min-h-[85vh] flex flex-col items-center justify-center text-center relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10"
        >
          <span className="bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full text-xs font-bold tracking-[0.2em] mb-6 inline-block border border-yellow-500/20">ESTABLISHED 2024</span>
          <h1 className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>
            Elevate Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-600">Soul's Space</span>
          </h1>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto w-full mb-12 relative group">
            <div className="absolute inset-0 bg-yellow-500/20 blur-xl group-hover:bg-yellow-500/30 transition-all rounded-full"></div>
            <div className="relative flex items-center bg-[#1A1A1A] border border-white/10 rounded-full p-2 pl-6 focus-within:border-yellow-500/50 transition-all">
              <input 
                type="text" 
                placeholder="Search for thread art, chocolates, keychains..." 
                className="bg-transparent w-full text-white outline-none placeholder:text-gray-600"
              />
              <button className="bg-yellow-500 text-black px-8 py-3 rounded-full font-bold hover:bg-yellow-400 active:scale-95 transition-all">Search</button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {categories.map((cat, i) => (
              <motion.div 
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.5 }}
                className="glass px-6 py-4 rounded-3xl border border-white/5 hover:border-yellow-500/30 transition-colors cursor-pointer text-left w-44"
              >
                <span className="text-3xl mb-3 block">{cat.icon}</span>
                <p className="text-white font-bold text-sm mb-1">{cat.name}</p>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{cat.count}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Featured Masterpieces */}
      <section className="w-full max-w-7xl mx-auto px-6 py-32">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-yellow-500 font-bold text-xs tracking-widest uppercase mb-2 block">Our Finest Curations</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>Handcrafted Marvels</h2>
          </div>
          <button className="text-yellow-500 font-bold hover:underline underline-offset-8 flex items-center gap-2">View All Gallery <MoveRight/></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promo Banner Section */}
      <section className="w-full max-w-7xl mx-auto px-6 mb-32">
        <div className="w-full h-80 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl shadow-yellow-900/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
          <div className="z-10 text-center md:text-left">
            <h3 className="text-3xl md:text-5xl font-black text-black mb-4">Custom Thread Art</h3>
            <p className="text-yellow-950 font-bold text-lg mb-8 max-w-md">Upload your favorite memories and watch them come to life in gold & silver strings.</p>
            <button className="bg-black text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-black transition-all">Start Custom Order</button>
          </div>
          <div className="mt-8 md:mt-0 z-10">
            <div className="w-48 h-48 bg-black/10 backdrop-blur-sm border border-white/20 rounded-3xl flex flex-col items-center justify-center p-6 text-center transform rotate-6 hover:rotate-0 transition-transform">
              <span className="text-5xl font-black text-white mb-2">₹1999</span>
              <span className="text-black font-bold text-xs uppercase tracking-widest">Base Price</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

