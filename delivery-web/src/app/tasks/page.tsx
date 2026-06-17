"use client"
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, CheckCircle2, Navigation2, ScanLine, DollarSign, Store, KeyRound, Bike, Loader2, Menu, User, LogOut, Moon, ShoppingCart } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moonglow-backend.onrender.com/api';
import Head from 'next/head';

export default function DeliveryTasks() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem('moonGlowToken');
    localStorage.removeItem('moonGlowRole');
    router.push('/');
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
      
      {/* Mobile Sidebar Drawer Backdrop */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm" 
          onClick={() => setShowSidebar(false)} 
        />
      )}

      {/* Sidebar Navigation */}
      <AnimatePresence>
      {showSidebar && (
        <motion.aside 
          initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="fixed top-0 left-0 h-full w-80 bg-[#111113] border-r border-white/10 flex flex-col z-50 shadow-2xl"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex justify-center items-center text-black font-black">
                <Bike className="w-6 h-6 text-black" />
              </div>
              <span className="font-black text-xl text-white tracking-widest">DRIVER</span>
            </div>
            <button onClick={() => setShowSidebar(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
          </div>

          <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
            {/* Status Switcher */}
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">Duty Status</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">{isOnline ? 'Online & Available' : 'Offline'}</p>
                  <p className="text-xs text-gray-500">Toggle switch to change</p>
                </div>
                <button 
                  onClick={() => setIsOnline(!isOnline)} 
                  className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${isOnline ? 'bg-green-500' : 'bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isOnline ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* Earnings Stats */}
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Earnings Today</p>
              <div className="flex items-center gap-1">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-black text-white">{earnings.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wider">10% COMMISSION RATE</p>
            </div>
            
            <div className="h-[1px] bg-white/5" />

            <button onClick={handleLogout} className="w-full py-4 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-black uppercase tracking-widest text-xs rounded-xl transition-all flex justify-center items-center gap-2">
              <LogOut className="w-4 h-4" /> Go Offline & Log Out
            </button>
          </div>
        </motion.aside>
      )}
      </AnimatePresence>

      {/* Standard Top Header */}
      <header className="h-20 bg-[#111113]/80 backdrop-blur-md border-b border-white/10 z-40 px-4 flex justify-between items-center sticky top-0">
        {/* Left: Hamburger Menu (Three Lines Style) */}
        <div className="flex-grow flex-shrink-0 flex-1 flex items-center justify-start">
          <button 
            onClick={() => setShowSidebar(true)} 
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
            aria-label="Open Menu"
          >
             <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Middle: Centered Brand Name */}
        <div className="flex-grow flex-shrink-0 flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Bike className="w-4 h-4 text-black" />
            </div>
            <span className="text-base font-black text-white tracking-widest hidden sm:block">
              MOON<span className="text-green-400">GLOW</span> <span className="bg-green-500/20 text-green-400 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full border border-green-500/30 ml-1">DELIVERY</span>
            </span>
            <span className="text-sm font-black text-white tracking-widest sm:hidden">
              MG<span className="text-green-400">DRIVER</span>
            </span>
          </div>
        </div>
        
        {/* Right: Cart and Profile stacked vertically (Profile on top of Cart) */}
        <div className="flex-grow-0 flex-shrink-0 flex flex-col items-center justify-center gap-1.5 min-w-[50px] relative z-25">
          {/* Profile (Chinna Profile Icon - Top) */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border ${showProfileMenu ? 'bg-green-500 border-green-500 text-black' : 'bg-white/5 border-white/10 text-gray-400 hover:border-green-500/30'}`}
            >
              <User className="w-3.5 h-3.5" />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-[#14171d] border border-white/10 rounded-2xl shadow-2xl z-55 py-4 px-1 overflow-hidden"
                  >
                    <div className="px-4 mb-2 pb-2 border-b border-white/5">
                      <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Delivery Partner</p>
                      <p className="text-white text-sm font-bold truncate">Driver X</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{isOnline ? 'Active' : 'Offline'}</span>
                      </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                      <LogOut className="w-4 h-4" /> Go Offline & Log Out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Cart Icon (Bottom) */}
          <div className="relative text-gray-400 p-1 rounded-lg hover:bg-white/5" title="Active Deliveries">
            <ShoppingCart className="w-5 h-5" />
            {tasks.filter(t => t.status !== 'Delivered').length > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-black text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-[0_0_10px_rgba(0,210,106,0.5)]">
                {tasks.filter(t => t.status !== 'Delivered').length}
              </span>
            )}
          </div>
        </div>
      </header>

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

      <footer className="py-4 border-t border-white/5 text-center bg-[#0a0a0a]">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Moon Glow Delivery System • <span className="text-emerald-500">Owner: Shaik Anwar Shareef</span>
        </p>
      </footer>
    </div>
  );
}
