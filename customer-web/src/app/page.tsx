"use client"
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, ShoppingBag, ArrowRight, Star, Heart, Clock, ShieldCheck, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { useState } from 'react';

export default function Home() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredProducts = products.filter(p => {
    return p.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      {/* Artisan Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <motion.div style={{ y: y1, opacity }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 via-transparent to-[#0a0a0a]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-400/10 rounded-full blur-[120px] animate-pulse" />
        </motion.div>

        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-bold tracking-[0.2em] uppercase">Handcrafted with Love</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>
              Moon Glow <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200">Craft</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Discover a world of celestial beauty and handcrafted elegance. From glowing wall art to artisan chocolates, every piece tells a story.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="#featured" className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full transition-all hover:scale-105 flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                Shop Collection <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#featured" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full border border-white/10 transition-all backdrop-blur-sm">
                View Gallery
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
        >
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-yellow-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-[#0a0a0a] sticky top-[80px] z-40 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 flex justify-center">
            <div className="relative w-full md:w-[600px] group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-yellow-200/20 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500/50 group-focus-within:text-yellow-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search for magic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500/50 transition-all font-light tracking-wide"
              />
            </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-24 container mx-auto px-4">
        <div className="flex flex-col items-center mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>Artisan Collection</h2>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 100 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-1 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)] mx-auto" 
            />
          </motion.div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {filteredProducts.map((product) => (
            <motion.div 
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 50, scale: 0.9 },
                show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
          {filteredProducts.length === 0 && (
             <div className="col-span-full py-20 text-center">
                <p className="text-gray-500 text-lg">No magical items found in this section.</p>
             </div>
          )}
        </motion.div>
      </section>

      {/* Artisan Values */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
             <div className="space-y-4">
               <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                 <ShieldCheck className="w-8 h-8 text-yellow-500" />
               </div>
               <h3 className="text-xl font-bold text-white">Ethically Sourced</h3>
               <p className="text-gray-400 text-sm leading-relaxed">We prioritize premium, sustainable materials for every handcrafted piece.</p>
             </div>
             <div className="space-y-4">
               <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Clock className="w-8 h-8 text-blue-400" />
               </div>
               <h3 className="text-xl font-bold text-white">Timed To Perfection</h3>
               <p className="text-gray-400 text-sm leading-relaxed">From resin curing to chocolate tempering, we respect the time art takes.</p>
             </div>
             <div className="space-y-4">
               <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Heart className="w-8 h-8 text-pink-500" />
               </div>
               <h3 className="text-xl font-bold text-white">Made with Passion</h3>
               <p className="text-gray-400 text-sm leading-relaxed">Each Moon Glow product is a piece of our heart delivered to yours.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Decorative Moon Background */}
      <div className="fixed top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/3 w-[800px] h-[800px] border border-white/5 rounded-full blur-sm opacity-20 pointer-events-none" />
    </div>
  );
}
