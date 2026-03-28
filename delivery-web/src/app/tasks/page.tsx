"use client"
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, CheckCircle2, Navigation2, ScanLine, DollarSign, Store, KeyRound, Bike } from 'lucide-react';
import Head from 'next/head';

export default function DeliveryTasks() {
  const [isOnline, setIsOnline] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  const [tasks, setTasks] = useState([
    {
      id: 'ORD-101', customerName: 'Anwar Artisan', phone: '+91 9876543210',
      address: 'Skyview Apartment, Block B-402, Hi-Tech City',
      lat: 17.4483, lng: 78.3915, 
      status: 'PENDING', amount: '₹1,500', distance: '3.2 km', time: '12 mins'
    }
  ]);

  useEffect(() => {
    // Load Leaflet from CDN
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      if (mapRef.current && !leafletMap.current) {
        const L = (window as any).L;
        leafletMap.current = L.map(mapRef.current, { zoomControl: false }).setView([17.4483, 78.3915], 13);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(leafletMap.current);

        // Add user marker
        const userIcon = L.divIcon({
          className: 'custom-div-icon',
          html: "<div style='background-color:#00d26a; width:12px; height:12px; border:2px solid white; border-radius:50%; box-shadow: 0 0 10px #00d26a;'></div>",
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });
        L.marker([17.4483, 78.3915], { icon: userIcon }).addTo(leafletMap.current);
      }
    };
    document.body.appendChild(script);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

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
    <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden font-sans">
      
      <motion.header 
        initial={{ y: -50 }} animate={{ y: 0 }} 
        className="px-5 py-4 bg-[#111111] border-b border-white/10 flex justify-between items-center sticky top-0 z-50 shadow-2xl"
      >
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer" onClick={() => setIsOnline(!isOnline)}>
            <div className={`w-12 h-12 rounded-full flex justify-center items-center shadow-lg transition-colors ${isOnline ? 'bg-green-500' : 'bg-gray-700'}`}>
              <Bike className="w-6 h-6 text-white" />
            </div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#111111] rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          </div>
          <div onClick={() => setIsOnline(!isOnline)} className="cursor-pointer">
            <h1 className="text-white font-black text-lg uppercase tracking-wider">Driver X</h1>
            <p className={`font-bold text-[10px] tracking-[0.2em] ${isOnline ? 'text-green-500' : 'text-red-500'}`}>{isOnline ? 'ONLINE NOW' : 'OFFLINE'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Earnings today</p>
          <div className="flex items-center justify-end gap-1">
            <DollarSign className="w-4 h-4 text-green-500"/>
            <p className="text-white font-black text-xl">1,250</p>
          </div>
        </div>
      </motion.header>

      {/* Dark Map */}
      <div className="h-64 relative border-b border-white/5 bg-black">
         <div ref={mapRef} className="w-full h-full opacity-60"></div>
         {!isOnline && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
             <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Offline - Map Paused</p>
           </div>
         )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        {!isOnline ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 p-8 rounded-3xl text-center border border-white/10">
             <h2 className="text-xl font-bold text-white mb-2">You are Offline</h2>
             <p className="text-gray-400 text-sm">Toggle status to start receiving orders.</p>
             <button onClick={() => setIsOnline(true)} className="mt-8 w-full py-4 bg-green-500 text-black font-black rounded-2xl uppercase tracking-widest">Go Online</button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div 
                layout key={task.id} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-[#111111] rounded-3xl border border-white/5 overflow-hidden shadow-2xl p-6 space-y-6"
              >
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-black text-white">{task.id}</h2>
                   <div className="text-right">
                     <span className="text-xl font-black text-green-500">{task.amount}</span>
                     <p className="text-[10px] text-gray-500 uppercase font-bold">{task.distance}</p>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-green-500 shrink-0"/>
                    <p className="text-gray-300 text-sm">{task.address}</p>
                  </div>
                </div>

                <div className="pt-2">
                   {task.status === 'PENDING' && (
                      <button onClick={() => updateStatus(task.id)} className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase tracking-widest text-lg">Accept Order</button>
                   )}
                   {task.status === 'ACCEPTED' && (
                      <button onClick={() => updateStatus(task.id)} className="w-full py-5 bg-green-500 text-white font-black rounded-2xl uppercase tracking-widest text-lg">Reached Store</button>
                   )}
                   {task.status !== 'PENDING' && task.status !== 'DELIVERED' && (
                      <button onClick={() => updateStatus(task.id)} className="w-full py-5 border border-white/20 text-white mt-3 font-black rounded-2xl uppercase tracking-widest">Next Step: {task.status}</button>
                   )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
