"use client"
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { motion } from 'framer-motion';
import { Trash2, ArrowRight, Tag } from 'lucide-react';
import { useState } from 'react';

export default function CartPage() {
  const { items, removeItem, clearCart } = useCartStore();
  const [coupon, setCoupon] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Apply 10% discount if code is mg10
  const applyCoupon = () => {
    if(coupon.toLowerCase().trim() === 'mg10') {
      setDiscountApplied(true);
    } else {
      alert("Invalid Coupon Code");
      setDiscountApplied(false);
    }
  };

  const discountAmount = discountApplied ? (subtotal * 0.10) : 0;
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * 0.18; // 18% GST imitation
  const total = taxableAmount + tax;

  if (items.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center pt-32 pb-20 w-full max-w-7xl mx-auto px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>Your Collection is Empty</h2>
          <p className="text-gray-400 mb-8">Discover our artisan pieces and start curating your hand-made gallery.</p>
          <Link href="/#collection" className="px-8 py-4 bg-yellow-500 text-black font-bold rounded-full hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            Explore Collection
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-4 py-12 pt-32">
      <h1 className="text-4xl font-bold text-white mb-10" style={{ fontFamily: 'var(--font-playfair)' }}>Your Curated Selection</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-4 rounded-2xl flex items-center gap-6 relative group"
            >
              <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                <p className="text-yellow-400 font-semibold text-sm mb-2">{item.category}</p>
                <div className="flex items-center gap-4 text-gray-300">
                  <span>Qty: {item.quantity}</span>
                  <span>×</span>
                  <span className="font-bold">₹{item.price}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white mb-3">₹{item.price * item.quantity}</p>
                <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-400 transition-colors p-2 glass rounded-full">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
          <button onClick={clearCart} className="text-red-400 hover:text-red-300 transition-colors text-sm font-semibold underline mt-6 inline-block">
            Clear entire collection
          </button>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-dark p-8 rounded-3xl h-fit sticky top-28 self-start border border-yellow-500/20 shadow-[0_0_40px_rgba(251,191,36,0.1)]"
        >
          <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>Order Summary</h3>
          
          <div className="mb-6 flex gap-2">
            <input 
              type="text" 
              placeholder="Coupon Code (e.g. mg10)" 
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 text-sm"
              disabled={discountApplied}
            />
            <button 
              onClick={applyCoupon}
              disabled={discountApplied}
              className={`px-4 py-3 rounded-xl font-bold text-sm transition-colors ${discountApplied ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black hover:bg-yellow-400'}`}
            >
              {discountApplied ? 'Applied!' : 'Apply'}
            </button>
          </div>

          <div className="space-y-4 text-gray-300 mb-8">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-white font-semibold flex items-center gap-2">
                {discountApplied && <span className="line-through text-gray-500 text-xs">₹{subtotal.toFixed(2)}</span>}
                ₹{taxableAmount.toFixed(2)}
              </span>
            </div>
            {discountApplied && (
              <div className="flex justify-between text-green-400 text-sm">
                <span className="flex items-center gap-1"><Tag className="w-3 h-3"/> Discount (10%)</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Estimated GST (18%)</span>
              <span className="text-white font-semibold">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-400 font-semibold">Complimentary</span>
            </div>
            <div className="border-t border-white/20 pt-4 mt-4 flex justify-between items-end">
              <span className="text-lg text-white font-bold">Total</span>
              <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>
          <Link href="/checkout" className="w-full py-4 bg-yellow-500 text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors shadow-lg hover:shadow-yellow-500/50">
            Proceed to Checkout <ArrowRight className="w-5 h-5"/>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
