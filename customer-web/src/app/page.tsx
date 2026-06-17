"use client"
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, ShoppingBag, ArrowRight, Star, Heart, Clock, ShieldCheck, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import { products as staticProducts } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock?: number;
}

function HomeContent() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const queryParam = searchParams.get('q');

  const [searchQuery, setSearchQuery] = useState('');
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from the backend, fall back to static list on error
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = 'http://localhost:5000/api/products';
        const params = new URLSearchParams();
        if (categoryParam) {
          let mappedCategory = categoryParam.toUpperCase();
          if (mappedCategory === 'CHOCOLATES') mappedCategory = 'CHOCOLATE';
          if (mappedCategory === 'KEYCHAINS') mappedCategory = 'KEYCHAIN';
          if (mappedCategory === 'WALLMOONS') mappedCategory = 'WALLMOON';
          if (mappedCategory === 'THREADART') mappedCategory = 'THREAD_ART';
          params.append('category', mappedCategory);
        }
        if (queryParam) {
          params.append('search', queryParam);
        }

        const res = await fetch(`${url}?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          // Normalize imageUrl if backend returns relative path
          const normalized = data.map((p: any) => ({
            ...p,
            imageUrl: p.imageUrl || '/images/chocolate.png'
          }));
          setProductsList(normalized);
        } else {
          throw new Error('Backend failed');
        }
      } catch (err) {
        console.warn('API error, using static fallback:', err);
        // Fallback filter
        let fallback = staticProducts as Product[];
        if (categoryParam) {
          let mappedCategory = categoryParam.toUpperCase();
          if (mappedCategory === 'CHOCOLATES') mappedCategory = 'CHOCOLATE';
          if (mappedCategory === 'KEYCHAINS') mappedCategory = 'KEYCHAIN';
          if (mappedCategory === 'WALLMOONS') mappedCategory = 'WALLMOON';
          if (mappedCategory === 'THREADART') mappedCategory = 'THREAD_ART';
          fallback = fallback.filter(p => p.category === mappedCategory);
        }
        if (queryParam) {
          fallback = fallback.filter(p => 
            p.title.toLowerCase().includes(queryParam.toLowerCase()) || 
            p.description.toLowerCase().includes(queryParam.toLowerCase())
          );
        }
        setProductsList(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, queryParam]);

  // Live client-side search filtering on loaded products
  const filteredProducts = productsList.filter(p => {
    return p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
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
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/35 via-yellow-950/15 to-[#0a0a0a]" />
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-[450px] h-[450px] bg-yellow-500/10 rounded-full blur-[140px] animate-pulse delay-1000" />
        </motion.div>

        <div className="container mx-auto px-4 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-yellow-500/10 border border-blue-500/20 mb-6 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-spin-slow" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-yellow-300 text-xs font-bold tracking-[0.2em] uppercase">Handcrafted with Love</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>
              Illuminating <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-yellow-400 to-yellow-200 drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">Artistry</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Discover a curated collection of handcrafted artisan goods designed to bring a touch of ethereal beauty and magic into your everyday life.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="#featured" className="px-8 py-4 bg-gradient-to-r from-blue-600 via-yellow-500 to-yellow-600 hover:from-blue-500 hover:to-yellow-500 text-white font-bold rounded-full transition-all hover:scale-105 flex items-center gap-2 shadow-[0_0_25px_rgba(59,130,246,0.4)]">
                Explore Curations <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#featured" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-full border border-blue-500/30 transition-all backdrop-blur-sm shadow-[0_0_15px_rgba(59,130,246,0.1)]">
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
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-yellow-500/20 rounded-2xl blur opacity-25 group-focus-within:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/50 group-focus-within:text-yellow-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search for magic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-light tracking-wide"
              />
            </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="py-24 w-full">
        <div className="flex flex-col items-center mb-16 text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
               {queryParam || categoryParam || searchQuery ? 'Magic Catalog' : 'Masterpieces'}
            </h2>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 100 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-1 bg-gradient-to-r from-blue-500 via-yellow-500 to-yellow-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] mx-auto" 
            />
          </motion.div>
        </div>

        <div className="w-full">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-yellow-500 text-lg">
              <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mr-3"></div>
              Conjuring magical crafts...
            </div>
          ) : queryParam || categoryParam || searchQuery ? (
            /* Search / Filter Results Grid */
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 container mx-auto px-4"
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
                    <p className="text-gray-500 text-lg">No magical items found matching your filter.</p>
                 </div>
              )}
            </motion.div>
          ) : (
            /* Categorized Rows */
            <div className="flex flex-col gap-16 px-4 md:px-8 overflow-hidden">
               {['CHOCOLATE', 'KEYCHAIN', 'WALLMOON', 'THREAD_ART', 'OTHER'].map(cat => {
                  const categoryProducts = productsList.filter(p => p.category === cat);
                  if (categoryProducts.length === 0) return null;
                  
                  const displayTitle = cat === 'WALLMOON' ? 'Enchanting Wall Moons' : 
                                       cat === 'THREAD_ART' ? 'Artisan Thread Art' : 
                                       cat === 'CHOCOLATE' ? 'Premium Chocolates' :
                                       cat === 'KEYCHAIN' ? 'Resin Keychains' : 'Other Artifacts';

                  return (
                     <div key={cat} className="w-full max-w-[100vw]">
                        <div className="flex items-center justify-between mb-6 px-4 md:px-8">
                           <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>
                              {displayTitle}
                           </h3>
                           <Link href={`/?category=${cat.toLowerCase()}s`} className="text-yellow-500 text-sm font-bold uppercase tracking-widest hover:text-yellow-400">See All</Link>
                        </div>
                        <div className="flex overflow-x-auto gap-6 pb-8 px-4 md:px-8 snap-x snap-mandatory hide-scrollbar">
                           {categoryProducts.map(p => (
                              <div key={p.id} className="min-w-[300px] w-[300px] md:min-w-[350px] md:w-[350px] snap-start">
                                 <ProductCard product={p} />
                              </div>
                           ))}
                        </div>
                     </div>
                  );
               })}
            </div>
          )}
        </div>
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

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
