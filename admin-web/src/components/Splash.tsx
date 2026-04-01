"use client"
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Moon, Sparkles } from 'lucide-react';

export default function Splash() {
    const [show, setShow] = useState(true);
    
    useEffect(() => {
        const timer = setTimeout(() => setShow(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence mode="wait">
            {show && (
                <motion.div 
                    key="splash"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }} 
                    transition={{ duration: 0.8, ease: "easeInOut" }} 
                    className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center overflow-hidden"
                >
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} 
                      transition={{ duration: 5, repeat: Infinity }} 
                      className="absolute w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]"
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        transition={{ duration: 1.5 }} 
                        className="flex flex-col items-center relative z-10"
                    >
                        <div className="relative mb-8">
                            <motion.div 
                                initial={{ rotate: -180, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                transition={{ duration: 1.2 }}
                                className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-[2rem] flex justify-center items-center shadow-[0_0_40px_rgba(234,179,8,0.3)]"
                            >
                                <Moon className="w-12 h-12 text-black" />
                            </motion.div>
                            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-pulse" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase text-center" style={{ fontFamily: 'var(--font-playfair)' }}>
                            MG <span className="text-yellow-500">CRAFT</span>
                        </h1>
                        <p className="text-yellow-500/50 mt-4 tracking-[0.4em] text-[10px] font-bold uppercase">
                            Admin Control Portal
                        </p>
                        
                        <div className="w-48 h-[1px] bg-white/10 mt-8 relative overflow-hidden">
                           <motion.div 
                             initial={{ x: "-100%" }}
                             animate={{ x: "100%" }}
                             transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                             className="absolute inset-0 bg-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                           />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
