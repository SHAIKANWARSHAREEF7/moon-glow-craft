"use client"
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, CheckCircle2, Navigation2, ScanLine, DollarSign, Store, KeyRound, Bike } from 'lucide-react';
import Image from 'next/image';

export default function DeliveryTasks() {
  const [isOnline, setIsOnline] = useState(false);
  const [tasks, setTasks] = useState([
    {
      id: 'ORD-101', customerName: 'Anwar Artisan', phone: '+91 9876543210',
      address: '123 Moonlight Avenue, Mumbai, India',
      status: 'PENDING', amount: '₹4,500', distance: '3.2 km', time: '12 mins'
    }
  ]);

  const updateStatus = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if(t.id === taskId) {
        if(t.status === 'PENDING') return {...t, status: 'ACCEPTED'};
        if(t.status === 'ACCEPTED') return {...t, status: 'REACHED_STORE'};
        if(t.status === 'REACHED_STORE') return {...t, status: 'PICKED_UP'};
        if(t.status === 'PICKED_UP') return {...t, status: 'OUT_FOR_DELIVERY'};
        if(t.status === 'OUT_FOR_DELIVERY') return {...t, status: 'ENTER_OTP'};
        if(t.status === 'ENTER_OTP') return {...t, status: 'DELIVERED'};
      }
      return t;
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-del-dark ios-scroll overflow-hidden">
      
      <motion.header 
        initial={{ y: -50 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="px-5 py-4 bg-del-card/80 backdrop-blur-md border-b border-white/10 flex justify-between items-center sticky top-0 z-50 shadow-2xl"
      >
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer" onClick={() => setIsOnline(!isOnline)}>
            <motion.div animate={{ rotate: isOnline ? 360 : 0 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className={`w-12 h-12 rounded-full flex justify-center items-center shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-colors ${isOnline ? 'bg-gradient-to-tr from-del-primary to-green-300' : 'bg-gray-700'}`}>
              <span className="font-black text-white text-xl">X</span>
            </motion.div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-del-card rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          </div>
          <div onClick={() => setIsOnline(!isOnline)} className="cursor-pointer">
            <h1 className="text-white font-black text-lg leading-tight uppercase tracking-wider">Driver X</h1>
            <p className={`font-bold text-[10px] tracking-[0.2em] ${isOnline ? 'text-del-primary' : 'text-red-500'}`}>{isOnline ? 'ONLINE NOW' : 'OFFLINE'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Earnings today</p>
          <div className="flex items-center justify-end gap-1">
            <DollarSign className="w-4 h-4 text-del-primary"/>
            <motion.p key="earnings" initial={{ scale: 1.5, color: '#00d26a' }} animate={{ scale: 1, color: '#ffffff' }} className="text-white font-black text-xl">1,250</motion.p>
          </div>
        </div>
      </motion.header>

      {/* Map Parallax */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 1 }} className="h-56 relative border-b border-del-border overflow-hidden bg-gray-900 shrink-0">
         <Image src="/images/map-placeholder.jpg" alt="Map View" fill className="object-cover opacity-50 mix-blend-luminosity grayscale" />
         <div className="absolute inset-0 bg-gradient-to-t from-del-dark to-transparent"></div>
         
         {isOnline && (
           <motion.div 
             animate={{ scale: [1, 2.5, 1], opacity: [0.5, 0, 0.5] }} 
             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} 
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-del-primary/30 rounded-full blur-[10px]"
           ></motion.div>
         )}
         
         <motion.div 
           animate={isOnline ? { y: [0, -10, 0] } : {}} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
         >
           <Navigation2 className={`w-10 h-10 fill-current drop-shadow-[0_0_15px_rgba(0,0,0,1)] ${isOnline ? 'text-del-primary' : 'text-gray-500'}`}/>
         </motion.div>
      </motion.div>

      <div className="flex-1 overflow-y-auto p-4 -mt-8 z-10 space-y-6 pb-20">
        {!isOnline ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-center">
             <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
               <span className="w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
             </div>
             <h2 className="text-xl font-bold text-white mb-2">You are Offline</h2>
             <p className="text-gray-400 text-sm">Go online to start receiving orders and earning money.</p>
             <button onClick={() => setIsOnline(true)} className="mt-6 w-full py-4 bg-del-primary text-black font-black rounded-2xl uppercase tracking-widest shadow-[0_0_20px_rgba(0,210,106,0.2)]">Go Online</button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tasks.map((task, idx) => (
              <motion.div 
                layout
                key={task.id}
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: idx * 0.1 }}
                className={`bg-del-card rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl relative ${task.status === 'DELIVERED' ? 'opacity-40 grayscale' : ''}`}
              >
                {/* Visual Blue In-Progress Indicator */}
                {(task.status !== 'PENDING' && task.status !== 'DELIVERED') && (
                  <motion.div 
                    initial={{ height: 0 }} animate={{ height: '100%' }} transition={{ duration: 1, ease: "linear" }}
                    className="absolute top-0 right-0 w-1.5 bg-gradient-to-b from-blue-500 to-cyan-300 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                  ></motion.div>
                )}

                {/* Visual Red Pending Indicator */}
                {task.status === 'PENDING' && (
                  <motion.div 
                    animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute top-0 right-0 w-1.5 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                  ></motion.div>
                )}
                
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-b from-white/[0.05] to-transparent">
                  <motion.div layout="position">
                    <h2 className="text-2xl font-black text-white tracking-tighter shadow-sm">{task.id}</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1"><span className="text-del-primary">{task.distance}</span> • {task.time}</p>
                  </motion.div>
                  <motion.div layout="position" className="text-right">
                    <span className="text-2xl font-black text-white drop-shadow-md">{task.amount}</span>
                    <p className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded font-bold mt-1 tracking-wider uppercase border border-white/5">Collect Cash</p>
                  </motion.div>
                </div>

                <motion.div layout="position" className="p-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex justify-center items-center shrink-0 border border-white/5"><MapPin className="w-5 h-5 text-del-primary"/></div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-1 leading-none">{task.customerName}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed font-medium">{task.address}</p>
                    </div>
                  </div>

                  {task.status !== 'PENDING' && (
                    <div className="flex gap-4">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 bg-white/5 py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-white/5 text-white font-bold text-sm shadow-md">
                        <Phone className="w-4 h-4 text-blue-400 fill-current"/> Call
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 bg-white/5 py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-white/5 text-white font-bold text-sm shadow-md">
                        <Navigation2 className="w-4 h-4 text-del-primary fill-current"/> Route
                      </motion.button>
                    </div>
                  )}
                </motion.div>
                
                <motion.div layout="position" className="p-6 pt-0 mt-2">
                  <AnimatePresence mode="wait">
                    {task.status === 'PENDING' && (
                      <motion.button key="btn-placed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        onClick={() => updateStatus(task.id)}  whileTap={{ scale: 0.95 }}
                        className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black rounded-[1.5rem] flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.4)] text-lg uppercase tracking-wider relative overflow-hidden"
                      >
                        <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></motion.div>
                        <ScanLine className="w-6 h-6"/> Accept Order
                      </motion.button>
                    )}
                    
                    {task.status === 'ACCEPTED' && (
                      <motion.button key="btn-reached" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                        onClick={() => updateStatus(task.id)} whileTap={{ scale: 0.95 }}
                        className="w-full py-5 bg-blue-600 border border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] font-black rounded-[1.5rem] flex justify-center items-center gap-3 text-lg uppercase tracking-wider"
                      >
                        <Store className="w-6 h-6"/> Reached Store
                      </motion.button>
                    )}

                    {task.status === 'REACHED_STORE' && (
                      <motion.button key="btn-picked" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                        onClick={() => updateStatus(task.id)} whileTap={{ scale: 0.95 }}
                        className="w-full py-5 border-2 border-blue-500 text-blue-400 bg-blue-500/10 font-black rounded-[1.5rem] flex justify-center items-center gap-3 text-lg uppercase tracking-wider"
                      >
                        <CheckCircle2 className="w-6 h-6"/> Confirm Pickup
                      </motion.button>
                    )}

                    {task.status === 'PICKED_UP' && (
                      <motion.button key="btn-out" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                        onClick={() => updateStatus(task.id)} whileTap={{ scale: 0.95 }}
                        className="w-full py-5 bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] font-black rounded-[1.5rem] flex justify-center items-center gap-3 text-lg uppercase tracking-wider"
                      >
                        <Bike className="w-6 h-6"/> Out For Delivery
                      </motion.button>
                    )}

                    {task.status === 'OUT_FOR_DELIVERY' && (
                      <motion.button key="btn-otp" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => updateStatus(task.id)} whileTap={{ scale: 0.95 }}
                        className="w-full py-5 bg-yellow-500 text-black font-black rounded-[1.5rem] flex justify-center items-center gap-3 text-xl shadow-[0_10px_40px_rgba(234,179,8,0.4)] uppercase tracking-wider"
                      >
                        <KeyRound className="w-6 h-6"/> Verify OTP to Deliver
                      </motion.button>
                    )}
                    
                    {task.status === 'ENTER_OTP' && (
                      <motion.div key="btn-otp-input" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-4">
                        <div className="flex gap-2 justify-center">
                           {[1,2,3,4].map(i => <input key={i} type="text" maxLength={1} className="w-12 h-14 bg-black/40 border border-white/20 rounded-xl text-center text-xl text-white font-bold focus:border-del-primary focus:outline-none"/> )}
                        </div>
                        <motion.button onClick={() => updateStatus(task.id)} whileTap={{ scale: 0.95 }} className="w-full py-5 bg-del-primary text-black font-black rounded-[1.5rem] flex justify-center items-center gap-3 text-xl shadow-[0_10px_40px_rgba(0,210,106,0.6)] uppercase tracking-wider relative overflow-hidden">
                          <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"></motion.div>
                          <CheckCircle2 className="w-6 h-6"/> Complete Delivery
                        </motion.button>
                      </motion.div>
                    )}

                    {task.status === 'DELIVERED' && (
                      <motion.div key="btn-del" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="w-full py-5 bg-green-500/20 text-green-400 font-black rounded-[1.5rem] flex justify-center items-center gap-2 cursor-not-allowed uppercase tracking-widest border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                      >
                        <CheckCircle2 className="w-6 h-6"/> Delivered Successfully
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
