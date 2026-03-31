"use client"
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product, useCartStore } from '@/store/cartStore';
import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore(state => state.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop Link navigation
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <motion.div 
      whileHover={{ y: -15, scale: 1.02 }}
      className="glass rounded-3xl overflow-hidden group border border-white/5 transition-all duration-500 hover:border-yellow-500/30 hover:shadow-[0_20px_50px_rgba(234,179,8,0.1)] flex flex-col relative"
    >
      <Link href={`/product/${product.id}`} className="block relative h-72 w-full overflow-hidden bg-black/50">
        <Image 
          src={product.imageUrl} 
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-8">
          <span className="bg-yellow-500 text-black px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(251,191,36,0.3)] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            Discover More
          </span>
        </div>
      </Link>
      <div className="p-8 relative z-10 bg-gradient-to-b from-[#111]/80 to-[#0a0a0a]/90 backdrop-blur-xl flex-1 flex flex-col">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-2xl font-bold mb-3 text-white line-clamp-1 group-hover:text-yellow-400 transition-colors tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
            {product.title}
          </h3>
        </Link>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
          <span className="text-xl font-bold text-white">₹{product.price}</span>
          <button 
            onClick={handleAdd}
            className={`p-3 rounded-full flex items-center justify-center transition-all ${added ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black hover:bg-yellow-400 hover:scale-110'}`}
          >
            {added ? <span className="text-xs font-bold px-2">Added!</span> : <ShoppingBag className="w-5 h-5"/>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
