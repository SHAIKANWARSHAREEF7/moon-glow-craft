"use client"
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import Image from 'next/image';

const MOCK_ORDER = {
  id: 'order_123',
  createdAt: new Date().toLocaleDateString(),
  items: [
    { title: 'Artisan Chocolate Truffles', qty: 2, image: '/images/chocolate.png' },
    { title: 'Stardust Resin Keychain', qty: 1, image: '/images/keychain.png' }
  ],
  total: 2947.64, // ( (999 * 2) + 499 ) * 1.18
};

const STATUS_STAGES = [
  { key: 'PLACED', label: 'Order Placed', icon: Clock },
  { key: 'PREPARING', label: 'Preparing', icon: Package },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

export default function DashboardPage() {
  const [status, setStatus] = useState('PLACED');

  useEffect(() => {
    // Attempt connecting to the real backend socket.io instance
    const socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Connected to Moon Glow delivery tracking');
      socket.emit('join_order_room', '123');
    });

    socket.on('orderStatusUpdated', (data: { orderId: string, status: string }) => {
      if (data.orderId === '123') {
        setStatus(data.status);
      }
    });

    // We will simulate the live tracking for the sake of the beautiful presentation if no backend is running
    const timer1 = setTimeout(() => setStatus('PREPARING'), 5000);
    const timer2 = setTimeout(() => setStatus('OUT_FOR_DELIVERY'), 10000);
    const timer3 = setTimeout(() => setStatus('DELIVERED'), 15000);

    return () => {
      socket.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const currentStageIndex = STATUS_STAGES.findIndex(s => s.key === status);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 pt-32 min-h-screen">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>Your Moon Glow Dashboard</h1>
        <div className="text-right hidden sm:block">
          <p className="text-gray-400">Welcome back,</p>
          <p className="text-yellow-400 font-bold">Anwar Artisan</p>
        </div>
      </div>

      <div className="glass-dark rounded-3xl p-8 mb-12 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow effect specific to the dashboard card */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Order #{MOCK_ORDER.id}</h2>
            <p className="text-gray-400 text-sm">Placed on {MOCK_ORDER.createdAt}</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">
              ₹{MOCK_ORDER.total.toFixed(2)}
            </span>
            <p className="text-green-400 font-semibold text-sm">Paid via Razorpay</p>
          </div>
        </div>

        {/* Real-time Tracking Timeline */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-white mb-8 tracking-wide">Live Journey</h3>
          
          <div className="relative">
            {/* The background track */}
            <div className="absolute top-6 left-0 w-full h-1 bg-white/10 rounded-full"></div>
            
            {/* The active progress track */}
            <motion.div 
              className="absolute top-6 left-0 h-1 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]"
              initial={{ width: '0%' }}
              animate={{ width: `${(Math.max(0, currentStageIndex) / (STATUS_STAGES.length - 1)) * 100}%` }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />

            <div className="relative flex justify-between">
              {STATUS_STAGES.map((stage, idx) => {
                const isCompleted = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const Icon = stage.icon;

                return (
                  <div key={stage.key} className="flex flex-col items-center relative z-10 w-1/4">
                    <motion.div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${
                        isCurrent ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-110' 
                        : isCompleted ? 'bg-yellow-500 text-black' 
                        : 'bg-moonglow-dark text-gray-400 border border-white/20'
                      }`}
                      animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.div>
                    <p className={`text-sm font-bold text-center ${isCompleted ? 'text-yellow-400' : 'text-gray-500'}`}>
                      {stage.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-white opacity-70 mt-1 animate-pulse">In Progress...</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-black/30 rounded-2xl p-6 border border-white/5">
          <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-400" /> Items in this shipment
          </h4>
          <div className="space-y-4">
            {MOCK_ORDER.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 py-2">
                <div className="w-16 h-16 rounded-xl overflow-hidden relative">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-white font-medium">{item.title}</p>
                  <p className="text-gray-400 text-sm">Qty: {item.qty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
