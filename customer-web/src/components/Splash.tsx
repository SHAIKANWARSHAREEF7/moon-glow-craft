"use client"
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Moon } from 'lucide-react';

export default function Splash() {
    const [show, setShow] = useState(true);
    
    useEffect(() => {
        const timer = setTimeout(() => setShow(false), 2200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div 
                    key="splash"
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }} 
                    transition={{ duration: 0.8, ease: "easeInOut" }} 
                    className="fixed inset-0 z-[9999] bg-moonglow-darker flex items-center justify-center overflow-hidden"
                >
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.1, 0.5] }} 
                      transition={{ duration: 3, repeat: Infinity }} 
                      className="absolute w-96 h-96 bg-yellow-500/20 rounded-full blur-[100px]"
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0, y: 20 }} 
                        animate={{ scale: 1, opacity: 1, y: 0 }} 
                        transition={{ type: "spring", duration: 1.5, bounce: 0.5 }} 
                        className="flex flex-col items-center relative z-10"
                    >
                        <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                            <Moon className="w-24 h-24 text-yellow-500 mb-6 drop-shadow-[0_0_40px_rgba(251,191,36,0.8)] fill-yellow-500/20" />
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase flex items-center gap-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                            MG <span className="text-yellow-500 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">Craft</span>
                        </h1>
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: 150 }} 
                          transition={{ delay: 0.5, duration: 1, ease: "circOut" }} 
                          className="h-1 bg-yellow-500 mt-6 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)]"
                        />
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-yellow-500/60 mt-4 tracking-[0.3em] text-xs font-bold uppercase">
                            Artisan Elegance
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
