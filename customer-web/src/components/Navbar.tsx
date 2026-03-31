"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Moon, Map, User, LogIn, LogOut, UserPlus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  // Check login status on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('moonGlowToken') : null;
    const name = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;
    if (token) {
      setIsLoggedIn(true);
      setUserName(name || 'Artisan');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('moonGlowToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  };

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
      className="fixed top-0 left-0 w-full z-50 glass-dark border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <motion.div variants={itemVariants}>
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                <Moon className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-black text-white tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>
                MOON<span className="text-yellow-400">GLOW</span>
              </span>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center gap-8">
            <Link href="/#featured" className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors duration-300 hidden md:block">
              Collection
            </Link>
            
            <Link href="/track" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 flex items-center gap-2 group text-xs font-bold uppercase tracking-widest">
              <Map className="w-4 h-4 group-hover:-translate-y-1 transition-transform"/> <span className="hidden md:inline">Track</span>
            </Link>
            
            <Link href="/cart" className="relative text-gray-400 hover:text-yellow-400 transition-colors duration-300 p-2">
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
              {itemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                >
                  {itemCount}
                </motion.span>
              )}
              </AnimatePresence>
            </Link>
            
            <div className="relative">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${showProfileMenu ? 'bg-yellow-500 border-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'bg-white/5 border-white/10 text-gray-400 hover:border-yellow-500/50'}`}
                >
                    <User className="w-5 h-5" />
                </motion.button>

                <AnimatePresence>
                    {showProfileMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-4 w-64 bg-[#141416] border border-white/10 rounded-[2rem] shadow-2xl z-20 py-6 px-2 overflow-hidden"
                            >
                                <div className="px-6 mb-4">
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Account Identity</p>
                                    <p className="text-white font-bold truncate">{isLoggedIn ? userName : 'Guest User'}</p>
                                </div>
                                <div className="h-[1px] bg-white/5 mb-4 mx-4" />
                                
                                <div className="space-y-1">
                                    {isLoggedIn ? (
                                        <>
                                            <Link href="/dashboard" onClick={()=>setShowProfileMenu(false)} className="flex items-center gap-3 px-6 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                                <User className="w-4 h-4 text-yellow-500" /> My Profile
                                            </Link>
                                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                                                <LogOut className="w-4 h-4" /> Log Out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link href="/login" onClick={()=>setShowProfileMenu(false)} className="flex items-center gap-3 px-6 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-bold">
                                                <LogIn className="w-4 h-4 text-yellow-500" /> Log In
                                            </Link>
                                            <Link href="/signup" onClick={()=>setShowProfileMenu(false)} className="flex items-center gap-3 px-6 py-3 text-sm text-yellow-500 hover:bg-yellow-500/10 rounded-xl transition-all font-black uppercase tracking-tighter">
                                                <UserPlus className="w-4 h-4 text-yellow-500" /> Create New Account
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
