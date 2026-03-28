"use client"
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, CheckCircle2, Navigation2, ChevronRight, MessageSquare, AlertTriangle, Bike, User, DollarSign } from 'lucide-react';

export default function DeliveryTasks() {
  const [isOnline, setIsOnline] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const [driverPos, setDriverPos] = useState<[number, number]>([17.3850, 78.4867]); 

  const [tasks, setTasks] = useState([
    {
      id: 'ORD-5432', 
      customerName: 'Anwar Shareef', 
      phone: '+91 9123456789',
      address: 'Skyview Apartment, Block B-402, Hi-Tech City',
      storeName: 'Moon Glow Artisan Shop',
      storeAddress: 'Artisan Plaza, Ground Floor, Banjara Hills',
      status: 'PENDING', 
      amount: '₹1,500', 
      distance: '4.5 km', 
      time: '18 mins',
      lat: 17.4483, 
      lng: 78.3915
    }
  ]);

  // Live GPS Tracking
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setDriverPos([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
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
        leafletMap.current = L.map(mapRef.current, { zoomControl: false }).setView(driverPos, 14);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(leafletMap.current);

        const bikeIcon = L.divIcon({
          className: 'bike-icon',
          html: "<div style='background-color:#FC8019; width:30px; height:30px; border:2px solid white; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 10px rgba(252,128,25,0.4); text-align:center;'><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='M5.5 17.5L2 14l3.5-3.5'/><path d='M9 17.5L12.5 14 9 10.5'/><circle cx='18.5' cy='17.5' r='3.5'/><path d='M15 17.5L14.5 9.5 22 17.5'/></svg></div>",
          iconSize: [30, 30]
        });
        
        leafletMap.current.driverMarker = L.marker(driverPos, { icon: bikeIcon }).addTo(leafletMap.current);
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

  useEffect(() => {
    if (leafletMap.current && leafletMap.current.driverMarker) {
      leafletMap.current.driverMarker.setLatLng(driverPos);
      if (isOnline) leafletMap.current.panTo(driverPos);
    }
  }, [driverPos, isOnline]);

  const updateStatus = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if(t.id === taskId) {
        if(t.status === 'PENDING') return {...t, status: 'ACCEPTED'};
        if(t.status === 'ACCEPTED') return {...t, status: 'PICKED_UP'};
        if(t.status === 'PICKED_UP') return {...t, status: 'OUT_FOR_DELIVERY'};
        if(t.status === 'OUT_FOR_DELIVERY') return {...t, status: 'DELIVERED'};
      }
      return t;
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-[#F0F2F5] text-[#1D2A3F]">
      <header className="px-5 py-4 bg-white shadow-sm flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isOnline ? 'bg-[#FC8019]' : 'bg-gray-200'}`}>
            <Bike className={`w-6 h-6 ${isOnline ? 'text-white' : 'text-gray-400'}`} />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tight">Swiggy Fleet</h1>
            <div className="flex items-center gap-1.5" onClick={() => setIsOnline(!isOnline)}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#60B246] animate-pulse' : 'bg-red-500'}`}></span>
              <p className="text-[11px] font-bold text-gray-500 cursor-pointer">{isOnline ? 'ACTIVE NOW' : 'GO ONLINE'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
             <p className="text-[10px] font-bold text-gray-400 uppercase">Today's Earnings</p>
             <p className="text-lg font-black text-[#1D2A3F]">₹1,245.50</p>
          </div>
        </div>
      </header>

      <div className="h-[35vh] relative z-10">
         <div ref={mapRef} className="w-full h-full"></div>
         {!isOnline && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
             <p className="text-white font-bold uppercase tracking-widest text-xs">Offline - Map Paused</p>
           </div>
         )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 -mt-6 z-20 space-y-4 pb-24">
        {!isOnline ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl text-center shadow-xl">
             <h2 className="text-xl font-black mb-2">You are Offline</h2>
             <p className="text-gray-500 text-sm mb-8">Go online to start receiving orders.</p>
             <button onClick={() => setIsOnline(true)} className="w-full py-4 bg-[#60B246] text-white font-black rounded-xl">GO ONLINE</button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <motion.div 
                layout key={task.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                   <span className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Order: {task.id}</span>
                   <span className="text-lg font-black text-[#FC8019]">{task.amount}</span>
                </div>
                <div className="p-5 space-y-5">
                   <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-[#FC8019]"></div>
                        <div className="w-0.5 h-full bg-gray-100 my-1"></div>
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      </div>
                      <div className="space-y-4 flex-1">
                        <div>
                          <p className="text-[10px] font-extrabold text-[#FC8019]">PICKUP</p>
                          <p className="text-sm font-black">{task.storeName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold text-blue-500">DELIVER</p>
                          <p className="text-sm font-black">{task.customerName}</p>
                          <p className="text-xs text-gray-500">{task.address}</p>
                        </div>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-gray-50 rounded-xl flex items-center justify-center gap-2 text-xs font-black">
                        <Phone className="w-4 h-4 text-[#60B246]" /> CALL
                      </button>
                      <button className="flex-1 py-3 bg-gray-50 rounded-xl flex items-center justify-center gap-2 text-xs font-black">
                        <AlertTriangle className="w-4 h-4 text-red-500" /> HELP
                      </button>
                   </div>
                   <motion.button 
                    whileTap={{ scale: 0.98 }} onClick={() => updateStatus(task.id)}
                    className="w-full py-4 bg-[#FC8019] text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-lg"
                   >
                     <span className="uppercase tracking-widest text-sm">
                       {task.status === 'PENDING' && 'ACCEPT ORDER'}
                       {task.status === 'ACCEPTED' && 'PICKED UP'}
                       {task.status === 'PICKED_UP' && 'DELIVERED'}
                       {task.status === 'DELIVERED' && 'COMPLETED'}
                     </span>
                     <ChevronRight className="w-5 h-5" />
                   </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-8 py-3 flex justify-between items-center z-50">
        <div className="flex flex-col items-center gap-1">
          <Bike className="w-6 h-6 text-[#FC8019]" />
          <span className="text-[10px] font-bold text-[#FC8019]">Tasks</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-40">
          <MessageSquare className="w-6 h-6" />
          <span className="text-[10px] font-bold">Support</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-40">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold">Account</span>
        </div>
      </nav>
    </div>
  );
}
