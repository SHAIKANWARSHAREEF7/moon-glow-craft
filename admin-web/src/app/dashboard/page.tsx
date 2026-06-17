"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, ShoppingCart, Package, Truck, 
  ChevronRight, Bell, ArrowRightLeft, Check, 
  AreaChart, ShieldAlert, Menu, User, LogOut, Moon 
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moonglow-backend.onrender.com/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // RED = Pending, BLUE = In Progress, GREEN = Completed
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('moonGlowToken');
      if (!token) {
        router.push('/');
        return;
      }

      setIsLoading(true);
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch Orders
        const ordersRes = await fetch(`${API_URL}/orders`, { headers });
        const ordersData = await ordersRes.json();
        if (ordersRes.ok) setOrders(ordersData);

        // Fetch Products
        const productsRes = await fetch(`${API_URL}/products`, { headers });
        const productsData = await productsRes.json();
        if (productsRes.ok) setProducts(productsData);

        // Fetch Drivers
        const driversRes = await fetch(`${API_URL}/auth/drivers`, { headers });
        const driversData = await driversRes.json();
        if (driversRes.ok) setDrivers(driversData);

      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Socket.io connection for real-time alerts
    const socket = io(API_URL.replace('/api', ''));
    
    socket.on('connect', () => {
        console.log('Connected to socket server');
    });

    socket.on('newOrder', (newOrder: any) => {
        console.log('New order received:', newOrder);
        setOrders(prev => [newOrder, ...prev]);
        setNotifications(prev => [
            { id: Date.now(), title: 'New Order Received', message: `Order from ${newOrder.customer?.name || 'Customer'}`, time: 'Just now' },
            ...prev
        ]);
        setShowNotifications(true);
        // Optional: Play sound
        try { new Audio('/notification.mp3').play(); } catch(e) {}
    });

    return () => {
        socket.disconnect();
    };
  }, []);

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    const token = localStorage.getItem('moonGlowToken');
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ driverId })
      });
      
      if (res.ok) {
        // Refresh orders locally
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, status: 'PREPARING', delivery: { ...o.delivery, driverId, status: 'Assigned' } } : o
        ));
      }
    } catch (error) {
      console.error('Assign driver error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('moonGlowToken');
    localStorage.removeItem('moonGlowRole');
    router.push('/');
  };

  const totalRevenue = orders
    .filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED')
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants: any = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120 } }
  };

  const stats = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, trending: 'Live Sync', icon: AreaChart, color: 'text-green-400', gradient: 'from-green-500/20 to-green-500/5', tab: 'overview' },
    { label: 'Pending Orders', value: orders.filter(o => o.status === 'PENDING' || o.delivery?.status === 'Pending Assignment').length.toString(), trending: 'Needs Action', icon: ShoppingCart, color: 'text-red-400', gradient: 'from-red-500/20 to-red-500/5', tab: 'orders' },
    { label: 'Active Deliveries', value: orders.filter(o => o.status === 'PREPARING' || o.status === 'OUT_FOR_DELIVERY').length.toString(), trending: 'En Route', icon: Truck, color: 'text-blue-400', gradient: 'from-blue-500/20 to-blue-500/5', tab: 'drivers' },
    { label: 'Total Products', value: products.length.toString(), trending: 'Inventory', icon: Package, color: 'text-green-400', gradient: 'from-green-500/20 to-green-500/5', tab: 'products' }
  ];

  const getStatusColor = (status: string) => {
    if(status === 'PENDING' || status === 'Pending Assignment') return 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse';
    if(status === 'IN_PROGRESS' || status === 'PREPARING' || status === 'OUT_FOR_DELIVERY' || status === 'Assigned') return 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
    if(status === 'COMPLETED' || status === 'DELIVERED') return 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)]';
    return '';
  };

  return (
    <div className="flex h-screen overflow-hidden text-gray-200 bg-admin-dark relative">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-admin-dark to-admin-dark pointer-events-none"></div>

      {/* Mobile Sidebar Backdrop */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setShowSidebar(false)} 
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`w-64 border-r border-white/5 bg-black/80 backdrop-blur-xl flex flex-col z-55 shrink-0 transition-all duration-300 fixed md:static h-full ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ rotate: -180, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", duration: 1 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex justify-center items-center font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.6)]"
            >MB</motion.div>
            <span className="font-black text-xl text-white tracking-widest">ADMIN</span>
          </div>
          <button onClick={() => setShowSidebar(false)} className="text-gray-400 hover:text-white md:hidden p-1 rounded-lg hover:bg-white/5">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2 relative overflow-y-auto">
          {['overview', 'orders', 'products', 'drivers'].map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setShowSidebar(false); }} className="w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3 relative overflow-hidden group">
              {activeTab === tab && (
                <motion.div layoutId="activeTabPill" className="absolute inset-0 bg-blue-600/20 border border-blue-400/30 rounded-2xl z-0 shadow-[inset_0_0_15px_rgba(59,130,246,0.2)]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
              <span className={`relative z-10 flex items-center gap-3 w-full capitalize ${activeTab === tab ? 'text-white font-bold' : 'text-gray-400 group-hover:text-white transition-colors'}`}>
                <div className={`${activeTab === tab ? 'scale-110 text-blue-400' : ''} transition-transform`}>
                  {tab === 'overview' && <LayoutDashboard className="w-6 h-6 md:w-5 md:h-5"/>}
                  {tab === 'orders' && <ShoppingCart className="w-6 h-6 md:w-5 md:h-5"/>}
                  {tab === 'products' && <Package className="w-6 h-6 md:w-5 md:h-5"/>}
                  {tab === 'drivers' && <Truck className="w-6 h-6 md:w-5 md:h-5"/>}
                </div>
                <span className="tracking-wide">{tab}</span>
                {activeTab === tab && <ChevronRight className="w-4 h-4 ml-auto text-blue-400" />}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-12 relative z-10 ios-scroll pt-28">
        {/* Standard Top Header */}
        <header className="fixed top-0 left-0 right-0 h-20 bg-admin-dark/80 backdrop-blur-md border-b border-white/5 z-40 px-4 md:px-8 flex justify-between items-center">
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
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Moon className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black text-white tracking-widest hidden sm:block">
                MOON<span className="text-blue-400">GLOW</span> <span className="bg-blue-500/20 text-blue-400 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full border border-blue-500/30 ml-1">ADMIN</span>
              </span>
              <span className="text-base font-black text-white tracking-widest sm:hidden">
                MG<span className="text-blue-400">ADMIN</span>
              </span>
            </div>
          </div>
          
          {/* Right: Cart and Profile stacked vertically (Profile on top of Cart) */}
          <div className="flex-grow-0 flex-shrink-0 flex flex-col items-center justify-center gap-1.5 min-w-[60px] relative z-25">
            {/* Profile (Chinna Profile Icon - Top) */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border ${showProfileMenu ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-blue-500/30'}`}
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
                      className="absolute right-0 mt-2 w-56 bg-[#14171d] border border-white/10 rounded-2xl shadow-2xl z-50 py-4 px-1 overflow-hidden"
                    >
                      <div className="px-4 mb-2 pb-2 border-b border-white/5">
                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Administrator</p>
                        <p className="text-white text-sm font-bold truncate">shaikanwar7204</p>
                      </div>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                        <LogOut className="w-4 h-4" /> Log Out Operations
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Cart & Notifications Row (Bottom) */}
            <div className="flex items-center gap-2">
              {/* Cart Icon (Goes to Orders) */}
              <button 
                onClick={() => setActiveTab('orders')} 
                className="relative text-gray-400 hover:text-blue-400 transition-colors p-1 rounded-lg hover:bg-white/5"
                title="View Orders"
              >
                <ShoppingCart className="w-5 h-5" />
                {orders.filter(o => o.status === 'PENDING' || o.delivery?.status === 'Pending Assignment').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                    {orders.filter(o => o.status === 'PENDING' || o.delivery?.status === 'Pending Assignment').length}
                  </span>
                )}
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`text-gray-400 hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-white/5 relative ${showNotifications ? 'bg-white/5 text-blue-400' : ''}`}
                  title="Notifications"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                  )}
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-[#14171d] border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
                      >
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2 border-b border-white/5 pb-2 text-xs uppercase tracking-widest text-gray-400"><Bell className="w-4 h-4"/> Live Alerts</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {notifications.length === 0 ? (
                              <p className="text-gray-500 text-xs text-center py-4">No new alerts</p>
                          ) : (
                              notifications.map(n => (
                                  <div 
                                      key={n.id} 
                                      onClick={() => { setActiveTab('orders'); setShowNotifications(false); }} 
                                      className="p-3 bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-xl cursor-pointer transition-colors"
                                  >
                                      <p className="text-xs text-white font-bold">{n.title}</p>
                                      <p className="text-[11px] text-blue-400 mt-1">{n.message}</p>
                                      <p className="text-[9px] text-gray-500 mt-1 text-right">{n.time}</p>
                                  </div>
                              ))
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0, y: -20 }}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i} variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setActiveTab(stat.tab)}
                  className={`relative overflow-hidden cursor-pointer rounded-3xl border border-white/5 bg-gradient-to-br ${stat.gradient} backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all group`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                    <stat.icon className="w-24 h-24 text-white -rotate-12 translate-x-4 -translate-y-4" />
                  </div>
                  <div className="p-6 relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-black/40 flex justify-center items-center mb-6 shadow-inner ${stat.color}`}>
                      <stat.icon className="w-6 h-6"/>
                    </div>
                    <p className="text-sm text-gray-300 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                    <div className="flex items-end gap-3 mt-2">
                       <h3 className="text-4xl font-black text-white drop-shadow-md tracking-tighter">{stat.value}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={itemVariants} className="admin-card !p-0 border border-white/5 bg-black/40 shadow-2xl overflow-hidden rounded-3xl">
              <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
                  <ArrowRightLeft className="w-5 h-5 text-blue-400"/> Live Control Tracking
                </h3>
              </div>
              <div className="overflow-x-auto p-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                      <th className="pb-4 pt-2">Order ID</th>
                      <th className="pb-4 pt-2">Customer</th>
                      <th className="pb-4 pt-2">Status Flag</th>
                      <th className="pb-4 pt-2 text-right">Action Connect</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                    {orders.map((o) => (
                      <motion.tr 
                        key={o.id} layout initial={{ opacity: 0, x: -20, backgroundColor: 'rgba(0,0,0,0)' }} animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(255,255,255,0.02)' }} 
                        className="border-b border-white/5 group transition-colors"
                      >
                        <td className="py-6 font-black text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors flex items-center gap-3">
                           {(o.status === 'PENDING' || o.delivery?.status === 'Pending Assignment') && <motion.div animate={{x:[0,5,0]}} transition={{repeat:Infinity}} className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red]"></motion.div>}
                           {(o.status === 'PREPARING' || o.status === 'OUT_FOR_DELIVERY') && <motion.div animate={{x:[0,10,0]}} transition={{repeat:Infinity, duration:2}} className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_blue]"></motion.div>}
                           {(o.status === 'COMPLETED' || o.status === 'DELIVERED') && <Check className="w-4 h-4 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"/>}
                           {o.id.substring(0, 8)}
                        </td>
                        <td className="py-6 text-gray-300 font-bold">{o.customer?.name || 'Artisan Client'}</td>
                        <td className="py-6">
                          <span className={`text-[10px] px-3 py-1.5 rounded uppercase font-black tracking-widest border ${getStatusColor(o.delivery?.status || o.status)}`}>
                            {o.delivery?.status || o.status}
                          </span>
                        </td>
                        <td className="py-6 text-right relative">
                          {!o.delivery?.driverId ? (
                            <div className="flex justify-end gap-2">
                              <select 
                                onChange={(e) => handleAssignDriver(o.id, e.target.value)}
                                className="bg-black/50 border border-white/10 rounded-xl text-xs text-white p-2 outline-none focus:border-blue-500"
                              >
                                <option value="">Assign Driver</option>
                                {drivers.map(d => (
                                  <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-black/40 border text-xs font-black uppercase tracking-widest rounded-xl ${(o.status === 'COMPLETED' || o.status === 'DELIVERED') ? 'border-green-500/20 text-green-400' : 'border-blue-500/20 text-blue-400'}`}>
                              <Truck className="w-4 h-4"/> {drivers.find(d => d.id === o.delivery.driverId)?.name || 'Driver'} Active
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Similar mappings for Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="admin-card min-h-[500px]">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Global Order Net</h3>
             </div>
             <table className="w-full text-left mt-6">
                 <thead>
                   <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-widest font-bold">
                     <th className="py-4">Order ID</th>
                     <th className="py-4">Status Map</th>
                     <th className="py-4 text-right">Deployment Vector</th>
                   </tr>
                 </thead>
                 <tbody>
                   {orders.map((o) => (
                     <motion.tr key={o.id} initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                       <td className="py-5 font-black text-white text-lg">{o.id}</td>
                       <td className="py-5 font-bold text-blue-400 text-sm tracking-wide">
                         <span className={`text-[10px] px-3 py-1.5 rounded uppercase font-black tracking-widest border ${getStatusColor(o.status)}`}>{o.status}</span>
                       </td>
                       <td className="py-5 text-right">
                          {o.driver === 'Unassigned' ? (
                             <button onClick={() => setActiveTab('overview')} className="px-5 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs uppercase tracking-widest font-black rounded-lg transition-colors border border-red-500/30">Action Required</button>
                          ) : (
                            <span className="text-blue-400 font-bold text-[10px] uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded">{o.driver} Tracking Live</span>
                          )}
                       </td>
                     </motion.tr>
                   ))}
                 </tbody>
             </table>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div key="products" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="admin-card min-h-[500px]">
             <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <h3 className="text-xl font-black tracking-widest uppercase text-white">Stock Directory</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Artisan Chocolate', price: '₹999', stock: 120, status: 'Healthy' },
                  { name: 'Thread Art', price: '₹2,499', stock: 2, status: 'Critical' },
                  { name: 'Glow Wallmoon', price: '₹4,500', stock: 14, status: 'Healthy' }
                ].map((p,i) => (
                  <motion.div key={i} whileHover={{scale:1.02, y:-5}} className="p-6 bg-gradient-to-br from-white/5 to-transparent rounded-3xl border border-white/5 flex justify-between items-start hover:shadow-2xl transition-all">
                    <div>
                      <h4 className="font-black text-white text-xl mb-1">{p.name}</h4>
                      <p className="text-gray-400 font-bold text-sm mb-4">{p.price}</p>
                      <span className={`text-[10px] uppercase font-black px-3 py-1.5 rounded border ${p.status === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
                        {p.status}: {p.stock} units
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
          </motion.div>
        )}

        {activeTab === 'drivers' && (
          <motion.div key="drivers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="admin-card min-h-[500px]">
             <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest border-b border-white/5 pb-4">Live Dispatch Fleet</h3>
             <div className="space-y-4 mt-6">
                {[
                  { name: 'Ramesh K', v: 'MH-01-1234', stat: 'Available' },
                  { name: 'Driver X', v: 'Bike', stat: 'On Delivery' },
                  { name: 'Driver Z', v: 'EV Scooter', stat: 'On Delivery' }
                ].map((d,i) => (
                  <motion.div key={i} whileHover={{x:10}} className="flex justify-between items-center p-5 bg-gradient-to-r from-white/5 to-transparent border border-white/5 rounded-[2rem] hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex justify-center items-center shadow-inner ${d.stat === 'Available' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        <Truck className="w-7 h-7"/>
                      </div>
                      <div>
                        <h4 className="font-black text-white text-lg tracking-wide">{d.name}</h4>
                        <p className="text-sm font-bold text-gray-400 tracking-wider uppercase">{d.v}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className={`font-black text-sm uppercase tracking-widest flex items-center gap-2 ${d.stat === 'Available' ? 'text-green-400' : 'text-blue-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${d.stat === 'Available' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]'}`}></span>
                        {d.stat}
                      </p>
                    </div>
                  </motion.div>
                ))}
             </div>
          </motion.div>
        )}
        </AnimatePresence>

        <footer className="mt-12 py-6 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm italic tracking-widest uppercase font-black opacity-50">
                Authorized Access Only • Moon Glow Craft System • <span className="text-blue-400">Owner: Shaik Anwar Shareef</span>
            </p>
        </footer>
      </main>
    </div>
  );
}
