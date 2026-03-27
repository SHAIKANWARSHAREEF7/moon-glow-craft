"use client"
import Link from 'next/link';
import { ShoppingBag, Moon, Map, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { motion } from 'framer-motion';

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const navVariants: any = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, opacity: 1, 
      transition: { type: "spring", stiffness: 100, damping: 20, staggerChildren: 0.1, delayChildren: 0.2 } 
    }
  };

  const itemVariants: any = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" } }
  };

  return (
    <motion.nav 
      initial="hidden" animate="visible" variants={navVariants}
      className="fixed top-0 left-0 w-full z-50 glass-dark"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <motion.div variants={itemVariants}>
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <Moon className="w-8 h-8 text-yellow-400 group-hover:animate-float" />
              <span className="text-2xl font-bold tracking-wider text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
                Moon Glow <span className="text-yellow-400">Craft</span>
              </span>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center gap-8">
            <Link href="/#collection" className="text-gray-300 hover:text-white transition-colors duration-300 hidden md:block relative group">
              Gallery
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            <Link href="/dashboard" className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 flex items-center gap-2 group relative">
              <Map className="w-5 h-5 group-hover:-translate-y-1 transition-transform"/> <span className="hidden md:inline">Track Orders</span>
            </Link>
            
            <Link href="/cart" className="relative text-gray-300 hover:text-yellow-400 transition-colors duration-300 cursor-pointer p-2 hover:scale-110">
              <ShoppingBag className="w-6 h-6" />
              <AnimatePresence>
              {itemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse-glow"
                >
                  {itemCount}
                </motion.span>
              )}
              </AnimatePresence>
            </Link>
            
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}>
              <Link href="/login" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 border border-white/10 hover:border-yellow-500/50 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                <User className="w-5 h-5 text-gray-300" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}

// Added AnimatePresence to mock file context
import { AnimatePresence } from 'framer-motion';
