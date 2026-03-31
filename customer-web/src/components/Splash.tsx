"use client"
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Moon, Sparkles } from 'lucide-react';

export default function Splash() {
    const [show, setShow] = useState(true);
    
    useEffect(() => {
        const timer = setTimeout(() => setShow(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence mode="wait">
            {show && (
                <motion.div 
                    key="splash"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }} 
                    transition={{ duration: 1, ease: "easeInOut" }} 
                    className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center overflow-hidden"
                >
                    {/* Background Ethereal Glow */}
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.2, 1], 
                        opacity: [0.3, 0.6, 0.3],
                        rotate: [0, 90, 180, 270, 360]
                      }} 
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }} 
                      className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-yellow-500/20 via-purple-500/10 to-blue-500/20 rounded-full blur-[120px]"
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        transition={{ type: "spring", duration: 2, bounce: 0.4 }} 
                        className="flex flex-col items-center relative z-10"
                    >
                        <div className="relative mb-8">
                            <motion.div 
                                animate={{ rotate: 360 }} 
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute -inset-4 border border-yellow-500/20 rounded-full border-dashed"
                            />
                            <motion.div 
                                initial={{ rotate: -180, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="w-28 h-28 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-[2.5rem] flex justify-center items-center shadow-[0_0_50px_rgba(234,179,8,0.4)] relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Moon className="w-14 h-14 text-black drop-shadow-lg" />
                            </motion.div>
                            
                            <motion.div 
                                animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                className="absolute -top-2 -right-2"
                            >
                                <Sparkles className="w-6 h-6 text-yellow-300" />
                            </motion.div>
                        </div>

                        <div className="overflow-hidden flex flex-col items-center">
                            <motion.h1 
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="text-5xl md:text-7xl font-black text-white tracking-widest uppercase text-center"
                                style={{ fontFamily: 'var(--font-playfair)' }}
                            >
                                MG <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">CRAFT</span>
                            </motion.h1>
                            
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: 100 }} 
                              transition={{ delay: 1, duration: 1.2, ease: "circOut" }} 
                              className="h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent mt-6 opacity-80 shadow-[0_0_15px_rgba(251,191,36,0.8)]"
                            />
                            
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ delay: 1.5, duration: 0.8 }} 
                                className="text-gray-500 mt-6 tracking-[0.5em] text-[10px] font-black uppercase indent-[0.5em]"
                            >
                                Artisan Moon Glow & Fine Art
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* Progress Loader at the bottom */}
                    <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 3, ease: "linear" }}
                        className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500 origin-left shadow-[0_0_20px_rgba(234,179,8,0.8)]"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
