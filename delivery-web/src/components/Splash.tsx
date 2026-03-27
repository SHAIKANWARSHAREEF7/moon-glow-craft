"use client"
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Truck, Navigation2 } from 'lucide-react';

export default function Splash() {
    const [show, setShow] = useState(true);
    
    useEffect(() => {
        const timer = setTimeout(() => setShow(false), 2400);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {show && (
                <motion.div 
                    key="splash"
                    exit={{ opacity: 0, scale: 0.9 }} 
                    transition={{ duration: 0.5, ease: "anticipate" }} 
                    className="fixed inset-0 z-[9999] bg-del-dark flex flex-col items-center justify-center overflow-hidden"
                >
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: [1, 5, 1], opacity: [0.8, 0, 0.8] }} 
                      transition={{ duration: 2, repeat: Infinity }} 
                      className="absolute w-48 h-48 border border-del-primary rounded-full"
                    />
                    
                    <motion.div 
                        initial={{ x: -200, opacity: 0 }} 
                        animate={{ x: 0, opacity: 1 }} 
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="relative z-10"
                    >
                        <div className="w-24 h-24 bg-del-primary rounded-full flex justify-center items-center shadow-[0_0_40px_rgba(0,210,106,0.6)] mb-6 mx-auto relative overflow-hidden">
                           <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></motion.div>
                           <Truck className="w-12 h-12 text-black" />
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.3 }}
                        className="text-center z-10"
                    >
                        <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-2">
                            MG <span className="text-del-primary">Craft</span>
                        </h1>
                        <div className="bg-white/10 px-4 py-1.5 rounded-full inline-flex items-center gap-2 border border-white/5">
                            <Navigation2 className="w-4 h-4 text-del-primary" />
                            <p className="text-gray-300 text-xs font-bold tracking-[0.2em] uppercase">Delivery Partner</p>
                        </div>
                    </motion.div>

                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
                       <motion.div className="flex gap-1" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.2 } } }}>
                          {[1,2,3,4,5].map(i => (
                             <motion.div key={i} variants={{ hidden: { opacity: 0, height: 4 }, show: { opacity: 1, height: [4, 16, 4], transition: { repeat: Infinity, duration: 1 } } }} className="w-1.5 bg-del-primary rounded-full" />
                          ))}
                       </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
