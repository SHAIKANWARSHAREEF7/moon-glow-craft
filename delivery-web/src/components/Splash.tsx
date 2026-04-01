"use client"
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Truck, Sparkles } from 'lucide-react';

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
                    className="fixed inset-0 z-[9999] bg-[#0A0A0B] flex items-center justify-center overflow-hidden"
                >
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }} 
                      transition={{ duration: 6, repeat: Infinity }} 
                      className="absolute w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[100px]"
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        transition={{ duration: 1.5 }} 
                        className="flex flex-col items-center relative z-10"
                    >
                        <div className="relative mb-8">
                            <motion.div 
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ type: "spring", duration: 1.2 }}
                                className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex justify-center items-center shadow-[0_0_40px_rgba(16,185,129,0.3)] rotate-6 translate-x-3"
                            >
                                <Truck className="w-12 h-12 text-black -rotate-6" />
                            </motion.div>
                            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-emerald-400 animate-pulse" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase text-center" style={{ fontFamily: 'var(--font-playfair)' }}>
                            MG <span className="text-emerald-500">CRAFT</span>
                        </h1>
                        <p className="text-emerald-500/50 mt-4 tracking-[0.4em] text-[10px] font-bold uppercase">
                            Partner Dashboard
                        </p>
                        
                        <div className="flex gap-2 mt-8">
                           {[0, 1, 2].map((i) => (
                             <motion.div 
                               key={i}
                               animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                               transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                               className="w-2 h-2 bg-emerald-500 rounded-full"
                             />
                           ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
