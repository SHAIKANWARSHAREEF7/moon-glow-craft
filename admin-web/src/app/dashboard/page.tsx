"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, ShoppingCart, Package, Truck, 
  ChevronRight, Bell, ArrowRightLeft, Check, 
  AreaChart, ShieldAlert, Menu, User, LogOut, Moon, 
  Users, Trash2, ShieldX, CheckCircle, RefreshCw, X, Sparkles
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

interface Seller {
  id: string;
  name: string;
  email: string;
  status: string;
  address?: string;
  phone?: string;
  createdAt: string;
}

interface Order {
  id: string;
  customerId: string;
  items: { productId: string; title: string; quantity: number; price: number }[];
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
  customer: { name: string; email: string };
}

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  sellerId: string;
}

interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  paymentGateway: string;
  transactionStatus: string;
  gatewayReferenceId?: string;
  createdAt: string;
  customer: { name: string; email: string };
}

interface AdminStats {
  totalRevenue: number;
  transactionSuccessRate: number;
  users: { customer: number; seller: number; admin: number };
  productCount: number;
  orderCount: number;
  totalTransactions: number;
  recentTransactions: Transaction[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'sellers' | 'audit'>('overview');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Data States
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Notifications Feed
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const userToken = localStorage.getItem('moonGlowToken');
    const role = localStorage.getItem('userRole');
    if (!userToken || role !== 'ADMIN') {
      router.push('/');
    } else {
      setToken(userToken);
    }
  }, [router]);

  const loadAdminData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch Stats & Ledger
      const statsRes = await fetch(`${API_URL}/admin/stats`, { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch Sellers
      const sellersRes = await fetch(`${API_URL}/admin/sellers`, { headers });
      if (sellersRes.ok) {
        const sellersData = await sellersRes.json();
        setSellers(sellersData);
      }

      // 3. Fetch Orders
      const ordersRes = await fetch(`${API_URL}/orders`, { headers });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      // 4. Fetch Products
      const productsRes = await fetch(`${API_URL}/products`, { headers });
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      // 5. Fetch Logs
      const logsRes = await fetch(`${API_URL}/admin/logs`, { headers });
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }
    } catch (err) {
      console.error('Failed to load admin panel data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAdminData();

      // Setup WebSocket connection
      const socket = io('http://localhost:5000');
      
      socket.on('connect', () => {
        console.log('Admin connected to socket server');
      });

      socket.on('newOrder', (newOrder: any) => {
        // Append new order and trigger alert
        setOrders(prev => [newOrder, ...prev]);
        setNotifications(prev => [
          { id: Date.now(), title: 'New E-Commerce Order Placed', message: `Total value: ₹${newOrder.totalAmount || 0}`, time: 'Just now' },
          ...prev
        ]);
        setShowNotifications(true);
        loadAdminData(); // Refresh metrics
      });

      socket.on('paymentSuccess', (data: any) => {
        setNotifications(prev => [
          { id: Date.now(), title: 'Secure Payment Verified', message: `Order #${data.orderId.slice(0, 8)} paid successfully.`, time: 'Just now' },
          ...prev
        ]);
        setShowNotifications(true);
        loadAdminData();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('moonGlowToken');
    localStorage.removeItem('userRole');
    router.push('/');
  };

  // Moderation: Suspend / Activate Seller
  const handleToggleSellerStatus = async (sellerId: string, currentStatus: string) => {
    if (!token) return;
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    
    try {
      const res = await fetch(`${API_URL}/admin/sellers/${sellerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        loadAdminData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update seller status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Override Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        loadAdminData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product listing from global catalog
  const handleDeleteProduct = async (productId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this listing permanently from the store catalog?')) return;
    try {
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadAdminData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden text-gray-200 bg-[#07080a] relative font-sans">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#07080a] to-[#07080a] pointer-events-none"></div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0a0c10] border-r border-white/5 flex flex-col z-30 transition-transform duration-300 lg:static lg:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-0 hidden lg:flex'}`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-yellow-500 rounded-lg flex items-center justify-center rotate-6 shadow-md shadow-blue-500/20">
              <LayoutDashboard className="w-4 h-4 text-black" />
            </div>
            <span className="font-black text-base text-white tracking-widest">SUPER ADMIN</span>
          </div>
          <button onClick={() => setShowSidebar(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-3 ${activeTab === 'overview' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <AreaChart className="w-4 h-4" /> Global Overview
          </button>
          <button 
            onClick={() => setActiveTab('sellers')} 
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-3 ${activeTab === 'sellers' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Users className="w-4 h-4" /> Seller Moderation
          </button>
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-3 ${activeTab === 'orders' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <ShoppingCart className="w-4 h-4" /> Orders Manager
          </button>
          <button 
            onClick={() => setActiveTab('products')} 
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-3 ${activeTab === 'products' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Package className="w-4 h-4" /> Global Catalog
          </button>
          <button 
            onClick={() => setActiveTab('audit')} 
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-3 ${activeTab === 'audit' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <ShieldAlert className="w-4 h-4" /> Audit request logs
          </button>
        </div>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-black uppercase tracking-wider text-xs rounded-xl transition-all flex justify-center items-center gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main panel container */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Top Header */}
        <header className="h-20 bg-[#0a0c10]/80 backdrop-blur-md border-b border-white/5 px-6 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowSidebar(true)} className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-black text-white tracking-tight">MOONGLOW COMMAND CENTER</h1>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={loadAdminData} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5">
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Notifications panel */}
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 relative">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-80 bg-[#12141a] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 space-y-3"
                    >
                      <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2">Live system feed</h4>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs space-y-1">
                            <p className="text-white font-bold">{n.title}</p>
                            <p className="text-gray-400">{n.message}</p>
                            <span className="text-[10px] text-gray-500 font-medium block">{n.time}</span>
                          </div>
                        ))}
                        {notifications.length === 0 && <p className="text-gray-500 text-xs text-center py-6">No recent events.</p>}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border ${showProfileMenu ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-white/5 border-white/10 text-gray-400 hover:border-yellow-500/30'}`}
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
                      className="absolute right-0 mt-3 w-56 bg-[#12141a] border border-white/10 rounded-2xl shadow-2xl z-55 py-4 px-1"
                    >
                      <div className="px-4 mb-2 pb-2 border-b border-white/5">
                        <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Admin credentials</p>
                        <p className="text-white text-sm font-bold truncate">Shaik Anwar Shareef</p>
                      </div>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-yellow-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">Summoning global Command Dashboard...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* KPI card grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black block mb-1">Ecosystem Revenue</span>
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-100">
                        ₹{(stats?.totalRevenue || 0).toLocaleString()}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wider">Accumulated payments</p>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black block mb-1">Transaction Success</span>
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
                        {stats?.transactionSuccessRate || 100}%
                      </span>
                      <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wider">Payment validation rate</p>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black block mb-1">Active Sellers</span>
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">
                        {stats?.users.seller || 0}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wider">Registered merchants</p>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black block mb-1">Customer Accounts</span>
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-200">
                        {stats?.users.customer || 0}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wider">Buyer accounts</p>
                    </div>
                  </div>

                  {/* Recent Transactions Ledger */}
                  <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-6">
                    <h3 className="font-bold text-sm text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-yellow-500" /> Transaction Ledger (Live)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-[10px] text-gray-400 uppercase font-black tracking-widest bg-white/5">
                            <th className="py-3 px-4">Transaction ID</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Gateway</th>
                            <th className="py-3 px-4 text-right">Amount</th>
                            <th className="py-3 px-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats?.recentTransactions.map((tx) => (
                            <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-xs">
                              <td className="py-4 px-4 font-mono text-gray-400">{tx.id.substring(0, 12)}...</td>
                              <td className="py-4 px-4 font-bold text-white">{tx.customer?.name || 'Customer'}</td>
                              <td className="py-4 px-4 text-gray-400 font-bold">{tx.paymentGateway}</td>
                              <td className="py-4 px-4 text-right font-black text-yellow-500">₹{tx.amount.toLocaleString()}</td>
                              <td className="py-4 px-4 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded border text-[9px] font-black uppercase ${
                                  tx.transactionStatus === 'SUCCESS' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                  tx.transactionStatus === 'PENDING' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse' :
                                  'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                  {tx.transactionStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {stats?.recentTransactions.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-gray-500">No transactions recorded yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'sellers' && (
                <motion.div key="sellers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Seller Moderation Manager</h2>
                    <p className="text-xs text-gray-500">Moderate seller registrations. Suspend or activate seller accounts to toggle API access.</p>
                  </div>

                  <div className="bg-[#0a0c10] border border-white/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-[10px] text-gray-400 uppercase font-black tracking-widest bg-white/5">
                          <th className="py-4 px-6">Seller Details</th>
                          <th className="py-4 px-6">Email Address</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6 text-center">Registration</th>
                          <th className="py-4 px-6 text-center">Moderate Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sellers.map((s) => (
                          <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-xs">
                            <td className="py-4 px-6">
                              <p className="text-white font-bold">{s.name}</p>
                              {s.address && <p className="text-[10px] text-gray-500 mt-0.5">{s.address}</p>}
                            </td>
                            <td className="py-4 px-6 text-gray-400 font-bold">{s.email}</td>
                            <td className="py-4 px-6">
                              <span className={`inline-block px-2.5 py-0.5 rounded border text-[9px] font-black uppercase ${
                                s.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse'
                              }`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                            <td className="py-4 px-6">
                              <div className="flex justify-center">
                                <button
                                  onClick={() => handleToggleSellerStatus(s.id, s.status)}
                                  className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-wider uppercase border transition-all ${
                                    s.status === 'ACTIVE' 
                                      ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20' 
                                      : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20'
                                  }`}
                                >
                                  {s.status === 'ACTIVE' ? 'Suspend Access' : 'Activate Seller'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {sellers.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-gray-500">No seller partner accounts registered yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Global Orders Manager</h2>
                    <p className="text-xs text-gray-500">View and manage all purchase orders placed across the ecosystem.</p>
                  </div>

                  <div className="space-y-4">
                    {orders.map((o) => (
                      <div key={o.id} className="bg-[#0a0c10] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center text-xs">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-white uppercase text-sm">Order #{o.id.slice(0, 8)}</span>
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase ${
                              o.status === 'DELIVERED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              o.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse'
                            }`}>
                              {o.status}
                            </span>
                            <span className="text-[10px] text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                          </div>

                          <div className="space-y-1">
                            {o.items.map((item, idx) => (
                              <p key={idx} className="text-gray-300">
                                {item.title} <span className="text-yellow-500 font-bold">x{item.quantity}</span> - ₹{item.price * item.quantity}
                              </p>
                            ))}
                          </div>

                          <p className="text-gray-400">
                            Customer: <strong className="text-white">{o.customer?.name}</strong> ({o.customer?.email}) | Destination: <strong className="text-white">{o.shippingAddress}</strong>
                          </p>
                        </div>

                        <div className="w-full md:w-auto shrink-0 md:text-right flex flex-col gap-3">
                          <div>
                            <span className="text-2xl font-black text-yellow-500">₹{o.totalAmount.toLocaleString()}</span>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-0.5">Total Bill</p>
                          </div>

                          {o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'CANCELLED')}
                              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold uppercase tracking-wider text-[10px] rounded-xl transition-all"
                            >
                              Force Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'products' && (
                <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Global Product Catalog</h2>
                    <p className="text-xs text-gray-500">Review all products offered in the store. Admins can moderate/delete any listing.</p>
                  </div>

                  <div className="bg-[#0a0c10] border border-white/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-[10px] text-gray-400 uppercase font-black tracking-widest bg-white/5">
                          <th className="py-4 px-6">Product Details</th>
                          <th className="py-4 px-6">Category</th>
                          <th className="py-4 px-6 text-right">Price</th>
                          <th className="py-4 px-6 text-center">Stock</th>
                          <th className="py-4 px-6 text-center">Catalog Moderation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-xs">
                            <td className="py-4 px-6">
                              <p className="text-white font-bold">{p.title}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 max-w-[250px]">{p.description || 'No description.'}</p>
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-block px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full font-bold text-gray-400 text-[10px]">
                                {p.category}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right font-black text-yellow-500">₹{p.price.toLocaleString()}</td>
                            <td className="py-4 px-6 text-center">
                              <span className={`font-bold ${p.stock === 0 ? 'text-red-500' : 'text-green-400'}`}>
                                {p.stock} units
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex justify-center">
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-all"
                                  title="Delete product permanently"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {products.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-gray-500">No products listed in catalog yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'audit' && (
                <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Audit Request logs</h2>
                    <p className="text-xs text-gray-500">Ecosystem audit log feed capturing live db checks, endpoints, registrations, and payment requests.</p>
                  </div>

                  <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-6 font-mono text-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Live System Logs</span>
                      <span className="text-[10px] text-green-400 font-bold flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" /> Connection Stable</span>
                    </div>

                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                      {logs.map((log, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-white/5 pb-2 last:border-b-0">
                          <span className="text-gray-500 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black shrink-0 ${
                            log.level === 'WARN' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                            log.level === 'ERROR' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>{log.level}</span>
                          <span className="text-gray-400 shrink-0 font-bold uppercase text-[10px]">({log.category})</span>
                          <span className="text-white leading-relaxed">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
