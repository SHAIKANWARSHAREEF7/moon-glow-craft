"use client"
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, CheckCircle2, Navigation2, ScanLine, DollarSign, Store, KeyRound, Bike, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moon-glow-craft.onrender.com/api';
import Head from 'next/head';

export default function DeliveryTasks() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);

  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    const token = localStorage.getItem('moonGlowToken');
    if (!token) {
      router.push('/');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/deliveries/my-tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setTasks(data);
    } catch (error) {
      console.error('Fetch tasks error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

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

  const updateStatus = async (deliveryId: string, currentStatus: string) => {
    let nextStatus = '';
    if(currentStatus === 'Assigned' || currentStatus === 'Pending Assignment') nextStatus = 'Picked Up';
    else if(currentStatus === 'Picked Up') nextStatus = 'Arrived';
    else if(currentStatus === 'Arrived') nextStatus = 'Delivered';
    
    if(!nextStatus) return;

    const token = localStorage.getItem('moonGlowToken');
    try {
      const res = await fetch(`${API_URL}/deliveries/${deliveryId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) fetchTasks();
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const earnings = tasks
    .filter(t => t.status === 'Delivered')
    .reduce((acc, t) => acc + (t.order?.totalAmount || 0) * 0.1, 0); // 10% commission

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
            <p className="text-white font-black text-xl">{earnings.toLocaleString()}</p>
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
            {tasks.map((delivery) => (
              <motion.div 
                layout key={delivery.id} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-[#111111] rounded-3xl border border-white/5 overflow-hidden shadow-2xl p-6 space-y-6"
              >
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-black text-white">{delivery.orderId.substring(0, 8)}</h2>
                   <div className="text-right">
                     <span className="text-xl font-black text-green-500">₹{delivery.order?.totalAmount || 0}</span>
                     <p className="text-[10px] text-gray-500 uppercase font-bold">Incentive: ₹{(delivery.order?.totalAmount * 0.1).toFixed(0)}</p>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-green-500 shrink-0"/>
                    <div className="flex flex-col">
                        <p className="text-gray-300 text-sm font-bold">{delivery.order?.customer?.name || 'Customer'}</p>
                        <p className="text-gray-500 text-xs">{delivery.order?.shippingAddress || 'No Address Provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                   {delivery.status !== 'Delivered' ? (
                      <button 
                        onClick={() => updateStatus(delivery.id, delivery.status)} 
                        className="w-full py-5 bg-green-500 text-black font-black rounded-2xl uppercase tracking-widest text-lg shadow-[0_10px_30px_rgba(0,210,106,0.3)]"
                      >
                        {delivery.status === 'Assigned' ? 'Start Delivery' : `Mark as ${delivery.status === 'Picked Up' ? 'Arrived' : 'Delivered'}`}
                      </button>
                   ) : (
                      <div className="w-full py-5 bg-white/5 border border-white/10 text-gray-400 font-black rounded-2xl uppercase tracking-widest text-center flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500"/> Delivered Successfully
                      </div>
                   )}
                </div>
              </motion.div>
            ))}
            {tasks.length === 0 && !isLoading && (
                <div className="text-center py-20">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No active tasks assigned yet.</p>
                </div>
            )}
            {isLoading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-green-500 animate-spin"/>
                </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
