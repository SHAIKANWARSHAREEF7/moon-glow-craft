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
  const [selectedSize, setSelectedSize] = useState('30cm');
  const [selectedStyle, setSelectedStyle] = useState('Heart Style');

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
        {/* Abstract background glow behind image */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative h-[60vh] w-full rounded-3xl overflow-hidden glass border-white/10 group lg:col-span-5"
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
          className="flex flex-col justify-center lg:col-span-4"
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

          <div className="flex gap-6 mb-8 text-sm text-gray-400">
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-yellow-400" /> Premium Quality
            </div>
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl">
              <Leaf className="w-5 h-5 text-green-400" /> Eco-friendly
            </div>
          </div>

          {/* Customization Options */}
          {product.category === 'THREAD_ART' && (
            <div className="mb-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div>
                <label className="block text-sm font-bold text-yellow-400 uppercase tracking-widest mb-4">Select Board Size</label>
                <div className="flex gap-4">
                  {['30cm', '40cm', '50cm'].map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex-1 py-3 rounded-xl border transition-all ${selectedSize === size ? 'bg-yellow-500 text-black border-yellow-500 font-bold' : 'border-white/10 text-gray-400 hover:border-yellow-500/50'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-yellow-400 uppercase tracking-widest mb-4">Upload Your Photo</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-400 group-hover:text-yellow-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Click to upload or drag and drop</p>
                  </div>
                  <input type="file" className="hidden" />
                </label>
              </div>
            </div>
          )}

          {product.title.includes('Kunafa') && (
            <div className="mb-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div>
                <label className="block text-sm font-bold text-yellow-400 uppercase tracking-widest mb-4">Choose Chocolate Style</label>
                <div className="flex gap-4">
                  {['Heart Style', 'Rectangle Shape'].map(style => (
                    <button 
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`flex-1 py-3 rounded-xl border transition-all ${selectedStyle === style ? 'bg-yellow-500 text-black border-yellow-500 font-bold' : 'border-white/10 text-gray-400 hover:border-yellow-500/50'}`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </motion.div>

        {/* Amazon-Style Buy Box */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="lg:col-span-3"
        >
          <div className="glass-dark border border-white/10 rounded-2xl p-6 sticky top-28 flex flex-col shadow-2xl">
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 mb-2">
              ₹{product.price}
            </span>
            <p className="text-gray-400 text-sm mb-4">Tax included. Delivery calculated at checkout.</p>
            <p className="text-green-400 font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5"/> In Stock & Ready to ship
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-lg ${
                  isAdded ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isAdded ? 'Added!' : <><ShoppingBag className="w-4 h-4"/> Add to Cart</>}
              </button>
              
              <button 
                onClick={(e) => { e.preventDefault(); handleAddToCart(); window.location.href='/checkout'; }}
                className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl flex items-center justify-center font-black uppercase tracking-tighter text-sm transition-transform hover:scale-[1.02] shadow-[0_0_20px_rgba(251,191,36,0.3)]"
              >
                Buy Now
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-white/10 text-center">
              Secure transactions by MoonGlow Payment Shield.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Related Products Carousel */}
      <div className="mt-24 w-full">
         <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>Customers who viewed this item also viewed</h2>
         <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar">
            {products.filter(p => p.category === product.category && p.id !== product.id).map(related => (
               <div key={related.id} className="min-w-[280px] w-[280px] snap-center glass-dark rounded-2xl p-4 border border-white/5 hover:border-yellow-500/30 transition-colors group cursor-pointer" onClick={() => router.push(`/product/${related.id}`)}>
                  <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4 bg-black/50">
                     <Image src={related.imageUrl} alt={related.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white truncate">{related.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                     <span className="text-yellow-500 font-bold">₹{related.price}</span>
                     <span className="text-xs text-gray-400 flex items-center"><Star className="w-3 h-3 text-yellow-500 mr-1"/> 5.0</span>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
