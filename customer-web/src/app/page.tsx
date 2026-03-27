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
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="w-full flex-col flex items-center relative overflow-hidden">
      {/* Hero Section with Parallax */}
      <section ref={ref} className="w-full max-w-7xl mx-auto px-4 py-20 min-h-[90vh] flex flex-col justify-center items-center text-center relative z-10">
        
        {/* Animated Background Orbs for Hero */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" 
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" 
        />

        <motion.div 
          style={{ y: yBg, opacity: opacityText }}
          className="z-10"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="text-5xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 mb-6 drop-shadow-2xl" 
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Illuminating Artistry
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            Discover a curated collection of handcrafted artisan goods designed to bring a touch of ethereal beauty and magic into your everyday life.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.9, type: "spring" }}
            className="flex justify-center"
          >
            <a href="#collection" className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-black bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full overflow-hidden transition-all hover:scale-110 shadow-[0_0_40px_rgba(251,191,36,0.6)]">
              <span className="absolute w-0 h-0 transition-all duration-700 ease-out bg-white rounded-full group-hover:w-64 group-hover:h-64 opacity-20"></span>
              <span className="relative flex items-center gap-3">Explore Curations <MoveRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-300"/></span>
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Product Gallery Section */}
      <section id="collection" className="w-full max-w-7xl mx-auto px-4 py-32 z-20 bg-moonglow-darker/80 backdrop-blur-lg rounded-t-[4rem] border-t border-white/5 relative">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 px-4">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>Masterpieces</h2>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: 100 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-1 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]" 
            />
          </motion.div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4"
        >
          {products.map((product) => (
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
        </motion.div>
      </section>
    </div>
  );
}
