"use client"
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bike, MapPin, Phone, MessageSquare, ChevronLeft, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TrackOrder() {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const [driverPos, setDriverPos] = useState<[number, number]>([17.4483, 78.3915]); // Simulated start
  const customerPos: [number, number] = [17.3850, 78.4867];

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
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(leafletMap.current);

        const driverIcon = L.divIcon({
          className: 'driver-icon',
          html: "<div style='background-color:#FC8019; width:30px; height:30px; border:3px solid white; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 15px rgba(252,128,25,0.4);'><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='M5.5 17.5L2 14l3.5-3.5'/><path d='M9 17.5L12.5 14 9 10.5'/><circle cx='18.5' cy='17.5' r='3.5'/><path d='M15 17.5L14.5 9.5 22 17.5'/></svg></div>",
          iconSize: [30, 30]
        });

        const customerIcon = L.divIcon({
            className: 'customer-icon',
            html: "<div style='background-color:#1D2A3F; width:20px; height:20px; border:2px solid white; border-radius:50%; box-shadow: 0 0 10px rgba(0,0,0,0.5);'></div>",
            iconSize: [20, 20]
        });

        leafletMap.current.driverMarker = L.marker(driverPos, { icon: driverIcon }).addTo(leafletMap.current);
        L.marker(customerPos, { icon: customerIcon }).addTo(leafletMap.current);
        
        // Fit bounds
        const bounds = L.latLngBounds([driverPos, customerPos]);
        leafletMap.current.fitBounds(bounds, { padding: [50, 50] });
      }
    };
    document.body.appendChild(script);

    // Simulate driver movement every 3 seconds
    const interval = setInterval(() => {
        setDriverPos(prev => [prev[0] - 0.001, prev[1] + 0.001]);
    }, 3000);

    return () => {
        clearInterval(interval);
        if (leafletMap.current) leafletMap.current.remove();
    };
  }, []);

  useEffect(() => {
    if (leafletMap.current && leafletMap.current.driverMarker) {
      leafletMap.current.driverMarker.setLatLng(driverPos);
    }
  }, [driverPos]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex items-center gap-4">
        <button onClick={() => router.back()} className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <div className="bg-white px-6 py-2 rounded-full shadow-lg border border-gray-100">
           <p className="text-xs font-black text-[#FC8019] uppercase tracking-widest">Arriving in 8 mins</p>
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} className="flex-1 w-full bg-gray-100"></div>

      {/* Bottom Card */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-8 relative z-50 border-t border-gray-50"
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8"></div>
        
        <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#F0F2F5] rounded-2xl overflow-hidden border border-gray-100">
                   <img src="https://ui-avatars.com/api/?name=Anwar+S&background=FC8019&color=fff" alt="Driver" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-[#1D2A3F]">Anwar Shareef</h3>
                   <div className="flex items-center gap-1 text-gray-400 text-sm font-bold">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" /> 4.9 • Super Partner
                   </div>
                </div>
            </div>
            <div className="flex gap-3">
                <button className="w-12 h-12 bg-[#F0F2F5] rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 bg-[#60B246] rounded-full flex items-center justify-center text-white shadow-lg shadow-green-200">
                    <Phone className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="bg-[#F0F2F5] p-5 rounded-2xl flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100">
                <Bike className="w-5 h-5 text-[#FC8019]" />
            </div>
            <div className="flex-1">
                <p className="text-xs font-bold text-gray-500 uppercase">Current Status</p>
                <p className="text-sm font-black text-[#1D2A3F]">On the way to your location</p>
            </div>
        </div>

        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Safety verified partner • masked number</p>
      </motion.div>
    </div>
  );
}
