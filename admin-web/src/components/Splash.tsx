"use client"
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

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
                    exit={{ opacity: 0, y: "-100%" }} 
                    transition={{ duration: 0.6, ease: [0.85, 0, 0.15, 1] }} 
                    className="fixed inset-0 z-[9999] bg-admin-dark flex items-center justify-center overflow-hidden"
                >
                    <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-admin-dark to-admin-dark pointer-events-none"></div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center relative z-10"
                    >
                        <div className="relative mb-8">
                            <motion.div 
                              animate={{ rotate: 360 }} 
                              transition={{ duration: 8, repeat: Infinity, ease: "linear" }} 
                              className="absolute -inset-4 border-2 border-dashed border-blue-500/50 rounded-full"
                            />
                            <motion.div 
                              initial={{ scale: 0 }} 
                              animate={{ scale: 1 }} 
                              transition={{ type: "spring", delay: 0.2 }}
                              className="w-24 h-24 bg-blue-600 rounded-2xl flex justify-center items-center shadow-[0_0_50px_rgba(37,99,235,0.8)]"
                            >
                                <ShieldCheck className="w-12 h-12 text-white" />
                            </motion.div>
                        </div>
                        
                        <div className="flex bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                          <h1 className="text-4xl md:text-5xl font-black tracking-widest uppercase">
                              MG CRAFT <span className="text-blue-500">ADMIN</span>
                          </h1>
                        </div>
                        
                        <div className="flex gap-2 mt-8">
                            {[1,2,3].map(i => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0.2 }} 
                                    animate={{ opacity: 1 }} 
                                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2, repeatType: 'reverse' }}
                                    className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)]"
                                />
                            ))}
                        </div>
                        <p className="text-blue-400 mt-4 text-xs font-bold tracking-[0.4em] uppercase">Authenticating Secure Connection</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
