"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, ShoppingCart, User, MapPin, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:5000/api';

const STATUS_STAGES = [
  { key: 'PENDING', label: 'Order Placed', icon: Clock },
  { key: 'PROCESSING', label: 'Processing', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Artisan');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('moonGlowToken');
    const storedName = localStorage.getItem('userName');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (storedName) {
      setUserName(storedName);
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/my-orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setOrders(data);
          if (data.length > 0 && !selectedOrderId) {
            setSelectedOrderId(data[0].id); // Default to select most recent order
          }
        }
      } catch (error) {
        console.error('Fetch orders error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
    // Poll every 10s for real-time tracking
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [router, selectedOrderId]);

  const activeOrder = orders.find(o => o.id === selectedOrderId) || orders[0];
  const status = activeOrder?.status || 'PENDING';
  const currentStageIndex = STATUS_STAGES.findIndex(s => s.key === status);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 pt-32 min-h-screen text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
            Your Moon Glow Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">Track orders, view invoices, and customize your profile.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-yellow-500 flex items-center justify-center font-bold text-black text-lg shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            {userName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Logged In As</p>
            <p className="text-yellow-500 font-extrabold text-sm">{userName}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-yellow-500">
          <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          Conjuring your dashboard...
        </div>
      ) : orders.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left/Middle Column: Selected Order Details & Live Tracking */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {activeOrder && (
                <motion.div 
                  key={activeOrder.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="glass-dark rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden bg-black/40"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-[80px] pointer-events-none"></div>

                  {/* Order header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-white/10">
                    <div>
                      <span className="text-xs text-yellow-500 font-bold uppercase tracking-widest block mb-1">Selected Order</span>
                      <h2 className="text-2xl font-black text-white">Order #{activeOrder.id.substring(0, 8)}</h2>
                      <p className="text-gray-500 text-xs mt-1">Placed on {new Date(activeOrder.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                        ₹{activeOrder.totalAmount.toLocaleString()}
                      </span>
                      <p className="text-green-400 font-semibold text-xs mt-1">✓ Verified Payment</p>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="mb-10">
                    <h3 className="text-sm text-gray-400 uppercase font-black tracking-widest mb-6">Live tracking journey</h3>
                    
                    <div className="relative pt-2 pb-6">
                      {/* The background track */}
                      <div className="absolute top-[26px] left-[12.5%] w-[75%] h-1 bg-white/10 rounded-full"></div>
                      
                      {/* The active progress track */}
                      <motion.div 
                        className="absolute top-[26px] left-[12.5%] h-1 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(Math.max(0, currentStageIndex) / (STATUS_STAGES.length - 1)) * 75}%` }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                      />

                      <div className="relative flex justify-between">
                        {STATUS_STAGES.map((stage, idx) => {
                          const isCompleted = idx <= currentStageIndex;
                          const isCurrent = idx === currentStageIndex;
                          const Icon = stage.icon;

                          return (
                            <div key={stage.key} className="flex flex-col items-center w-1/4">
                              <motion.div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${
                                  isCurrent ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-110' 
                                  : isCompleted ? 'bg-yellow-500 text-black' 
                                  : 'bg-black/40 text-gray-500 border border-white/10'
                                }`}
                                animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                                transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                              >
                                <Icon className="w-5 h-5" />
                              </motion.div>
                              <span className={`text-[10px] font-bold text-center uppercase tracking-wider ${isCompleted ? 'text-yellow-500' : 'text-gray-500'}`}>
                                {stage.label}
                              </span>
                            </li>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Items Display */}
                  <div className="bg-black/30 rounded-2xl p-6 border border-white/5 space-y-4">
                    <h4 className="text-white font-bold text-sm border-b border-white/5 pb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-yellow-500" /> Items in this shipment
                    </h4>
                    <div className="space-y-4 divide-y divide-white/5">
                      {activeOrder.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between gap-4 pt-3 first:pt-0">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-black overflow-hidden relative border border-white/10 flex-shrink-0">
                              <img src={item.imageUrl || '/images/chocolate.png'} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm">{item.title}</p>
                              <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-extrabold text-yellow-500 text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping address details */}
                  <div className="mt-6 flex items-start gap-3 bg-white/5 rounded-2xl p-4 border border-white/5 text-xs text-gray-400">
                    <MapPin className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-bold uppercase tracking-wider text-[10px] mb-1">Shipping Destination</p>
                      <p className="leading-relaxed">{activeOrder.shippingAddress}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Order History List */}
          <div className="space-y-6">
            <div className="glass-dark rounded-3xl p-6 border border-white/10 bg-black/40">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-yellow-500" /> Order History ({orders.length})
              </h3>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {orders.map((order) => {
                  const isSelected = order.id === selectedOrderId;
                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        isSelected 
                          ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(251,191,36,0.05)]' 
                          : 'border-white/5 hover:border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-xs text-white">#{order.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                          order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="text-sm font-extrabold text-yellow-500">₹{order.totalAmount.toLocaleString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile summary card */}
            <div className="glass-dark rounded-3xl p-6 border border-white/10 bg-black/40 text-xs">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                <User className="w-4 h-4 text-yellow-500" /> Buyer Profile
              </h3>
              <div className="space-y-2">
                <p className="text-gray-400"><strong className="text-white">Name:</strong> {userName}</p>
                <p className="text-gray-400"><strong className="text-white">Secure Key:</strong> Verified Login (OTP)</p>
                <p className="text-gray-500 mt-4 leading-relaxed">Your account data is secure. To edit details, checkout shipping forms will update address records automatically.</p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-24 glass-dark rounded-[2rem] border border-white/10 max-w-lg mx-auto bg-black/40">
          <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-6 opacity-30" />
          <p className="text-gray-400 text-lg mb-6">No purchase records found in your account.</p>
          <button 
            onClick={() => router.push('/')} 
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-yellow-500 text-black font-extrabold rounded-xl hover:scale-105 transition-all shadow-lg"
          >
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
}
