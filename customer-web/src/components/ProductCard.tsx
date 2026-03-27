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
      whileHover={{ y: -10 }}
      className="glass rounded-2xl overflow-hidden group border border-white/5 transition-all duration-300 hover:border-yellow-500/50 flex flex-col"
    >
      <Link href={`/product/${product.id}`} className="block relative h-64 w-full overflow-hidden bg-black/50">
        <Image 
          src={product.imageUrl} 
          alt={product.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
          <span className="bg-yellow-500 text-black px-6 py-2 rounded-full font-bold shadow-[0_0_15px_rgba(251,191,36,0.5)]">
            View Details
          </span>
        </div>
      </Link>
      <div className="p-6 relative z-10 bg-moonglow-dark/80 backdrop-blur-md flex-1 flex flex-col">
        <p className="text-xs text-yellow-400 font-semibold mb-2 tracking-widest">{product.category}</p>
        <Link href={`/product/${product.id}`}>
          <h3 className="text-xl font-bold mb-2 text-white line-clamp-1 hover:text-yellow-400 transition-colors" style={{ fontFamily: 'var(--font-playfair)' }}>
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
