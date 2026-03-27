"use client"
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { products } from '@/data/products';
import { useCartStore } from '@/store/cartStore';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Star, ShieldCheck, Leaf } from 'lucide-react';
import { useState } from 'react';


export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const product = products.find(p => p.id === id);
  const addItem = useCartStore(state => state.addItem);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return (
      <div className="h-screen flex items-center justify-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">Product Not Found</h1>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5"/> Back to Gallery
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 relative">
        {/* Abstract background glow behind image */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative h-[60vh] w-full rounded-3xl overflow-hidden glass border-white/10 group"
        >
          <Image 
            src={product.imageUrl} 
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-1000"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col justify-center"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-yellow-500/30">
              {product.category}
            </span>
            <span className="flex text-yellow-500"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
            {product.title}
          </h1>

          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            {product.description}
            <br/><br/>
            Crafted with passion, this piece tells a story of exquisite artistry. The meticulous attention to detail and premium materials ensure that you own not just a product, but a piece of our master artisan's heart.
          </p>

          <div className="flex gap-6 mb-10 text-sm text-gray-400">
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-yellow-400" /> Premium Quality
            </div>
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl">
              <Leaf className="w-5 h-5 text-green-400" /> Eco-friendly
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
            <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">
              ₹{product.price}
            </span>
            <span className="text-gray-400">Tax included</span>
          </div>

          <button 
            onClick={handleAddToCart}
            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold transition-all duration-300 shadow-xl ${
              isAdded 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-yellow-500 text-black hover:bg-yellow-400 hover:scale-[1.02] shadow-[0_0_20px_rgba(251,191,36,0.3)]'
            }`}
          >
            {isAdded ? (
              'Added to Cart!'
            ) : (
              <>
                <ShoppingBag className="w-6 h-6" /> Add to Collection
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
