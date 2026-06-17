"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, DollarSign, Package, ShoppingBag, CheckCircle, Clock, 
  Menu, User, LogOut, Moon, Plus, Trash2, Edit2, Loader2, 
  ChevronRight, Phone, MapPin, X, ArrowRight, Eye, RefreshCw 
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
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
  customer: { name: string; email: string; phone?: string };
}

export default function MerchantDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState('Seller');
  
  // UI State
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [isLoading, setIsLoading] = useState(true);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Product Form Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: 'CHOCOLATE',
    imageUrl: ''
  });

  // Verify authentication on mount
  useEffect(() => {
    const userToken = localStorage.getItem('moonGlowToken');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    
    if (!userToken || role !== 'SELLER') {
      router.push('/');
    } else {
      setToken(userToken);
      setUserName(name || 'Merchant');
    }
  }, [router]);

  // Load Inventory & Orders
  const loadDashboardData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // Fetch Products
      const prodRes = await fetch(`${API_URL}/products/seller`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

      // Fetch Orders
      const ordRes = await fetch(`${API_URL}/orders/seller`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData);
      }
    } catch (err) {
      console.error('Failed to load merchant data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('moonGlowToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    router.push('/');
  };

  // CRUD Product Actions
  const openAddProductModal = () => {
    setModalMode('add');
    setSelectedProduct(null);
    setProductForm({
      title: '',
      description: '',
      price: '',
      stock: '',
      category: 'CHOCOLATE',
      imageUrl: ''
    });
    setFormError('');
    setShowProductModal(true);
  };

  const openEditProductModal = (product: Product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setProductForm({
      title: product.title,
      description: product.description || '',
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      imageUrl: product.imageUrl || ''
    });
    setFormError('');
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setFormLoading(true);
    setFormError('');

    try {
      const payload = {
        title: productForm.title,
        description: productForm.description,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        category: productForm.category,
        imageUrl: productForm.imageUrl || undefined
      };

      let res;
      if (modalMode === 'add') {
        res = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/products/${selectedProduct?.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      setShowProductModal(false);
      loadDashboardData();
    } catch (err: any) {
      setFormError(err.message || 'Error saving product details');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this product from your catalog?')) return;

    try {
      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadDashboardData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Order Fulfillment Status Update
  const handleUpdateOrderStatus = async (orderId: string, currentStatus: string) => {
    if (!token) return;
    let nextStatus = '';
    
    if (currentStatus === 'PROCESSING') nextStatus = 'SHIPPED';
    else if (currentStatus === 'SHIPPED') nextStatus = 'DELIVERED';
    
    if (!nextStatus) return;

    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        loadDashboardData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // KPI calculations
  const totalEarnings = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, order) => {
      // Sum the values of items in this order
      const itemsSum = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      return sum + itemsSum;
    }, 0);

  const pendingOrdersCount = orders.filter(o => ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.status)).length;
  const completedOrdersCount = orders.filter(o => o.status === 'DELIVERED').length;

  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans flex flex-col justify-between">
      
      {/* Sidebar Navigation */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black/85 z-40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-80 bg-[#101014] border-r border-white/10 flex flex-col z-50 shadow-2xl p-6"
            >
              <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-yellow-500 rounded-lg flex items-center justify-center rotate-6">
                    <Store className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-lg font-black tracking-widest text-white">MERCHANT</span>
                </div>
                <button onClick={() => setShowSidebar(false)} className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-xl">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 flex-1">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Identity</p>
                  <p className="text-white font-bold truncate">{userName}</p>
                  <p className="text-xs text-yellow-500/80 mt-1 uppercase font-bold tracking-wider">Authorized Seller Partner</p>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={() => { setActiveTab('inventory'); setShowSidebar(false); }}
                    className={`w-full py-4 px-4 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'inventory' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Package className="w-4 h-4" /> Manage Inventory
                  </button>
                  <button 
                    onClick={() => { setActiveTab('orders'); setShowSidebar(false); }}
                    className={`w-full py-4 px-4 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'orders' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <ShoppingBag className="w-4 h-4" /> Fulfill Orders
                    {pendingOrdersCount > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center ml-auto">
                        {pendingOrdersCount}
                      </span>
                    )}
                  </button>
                </div>

                <div className="h-[1px] bg-white/5 my-6" />

                <button 
                  onClick={handleLogout}
                  className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-black uppercase tracking-wider text-xs rounded-xl transition-all flex justify-center items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out & Go Offline
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <header className="h-20 bg-[#111115]/80 backdrop-blur-md border-b border-white/10 z-40 px-6 flex justify-between items-center sticky top-0">
        
        {/* Left: Hamburger menu */}
        <div className="flex-1 flex justify-start">
          <button 
            onClick={() => setShowSidebar(true)} 
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
            aria-label="Open Sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Middle: Brand Centered */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-yellow-500 rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Store className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-black text-white tracking-widest hidden sm:block">
              MOON<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">GLOW</span> <span className="bg-yellow-500/10 text-yellow-500 text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full border border-yellow-500/20 ml-1">SELLER</span>
            </span>
            <span className="text-sm font-black text-white tracking-widest sm:hidden">
              MG<span className="text-yellow-500">MERCHANT</span>
            </span>
          </div>
        </div>

        {/* Right: Refresh button and Profile stacked */}
        <div className="flex-grow-0 flex-shrink-0 flex items-center gap-4 relative z-20">
          <button 
            onClick={loadDashboardData}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

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
                    className="absolute right-0 mt-2 w-56 bg-[#121216] border border-white/10 rounded-2xl shadow-2xl z-55 py-4 px-1 overflow-hidden animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-4 mb-2 pb-2 border-b border-white/5">
                      <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Merchant Account</p>
                      <p className="text-white text-sm font-bold truncate">{userName}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main dashboard body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        
        {/* KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-panel bg-white/5 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block mb-1">Total Earnings</span>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-100">₹{totalEarnings.toLocaleString()}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Accumulated Order Value</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel bg-white/5 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block mb-1">Catalog Size</span>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">{products.length}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active products listed</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel bg-white/5 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block mb-1">Pending Orders</span>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">{pendingOrdersCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Needs merchant shipment</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel bg-white/5 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs text-gray-400 uppercase font-bold tracking-widest block mb-1">Fulfillments</span>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-200">{completedOrdersCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Successfully delivered orders</p>
          </motion.div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 gap-6">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`pb-4 text-base font-bold transition-all relative ${activeTab === 'inventory' ? 'text-yellow-500' : 'text-gray-500 hover:text-white'}`}
          >
            Inventory Catalog
            {activeTab === 'inventory' && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />}
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`pb-4 text-base font-bold transition-all relative flex items-center gap-2 ${activeTab === 'orders' ? 'text-yellow-500' : 'text-gray-500 hover:text-white'}`}
          >
            Fulfillment Orders
            {pendingOrdersCount > 0 && (
              <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-black border border-yellow-500/20 rounded-full px-2 py-0.5">
                {pendingOrdersCount} New
              </span>
            )}
            {activeTab === 'orders' && <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500" />}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-yellow-500/75">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="text-sm font-semibold tracking-wide uppercase">Summoning merchant records...</p>
            </div>
          ) : activeTab === 'inventory' ? (
            /* Inventory Section */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              {/* Header and Add button */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Active Product Listings</h2>
                  <p className="text-xs text-gray-500">Create, edit, or delete items offered in the Customer Shop.</p>
                </div>
                <button 
                  onClick={openAddProductModal}
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-500 hover:to-yellow-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-all"
                >
                  <Plus className="w-4 h-4" /> Add New Craft
                </button>
              </div>

              {/* Products Catalog Table */}
              <div className="overflow-x-auto bg-white/5 border border-white/5 rounded-3xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] text-gray-400 uppercase font-black tracking-widest bg-white/5">
                      <th className="py-4 px-6">Product Details</th>
                      <th className="py-4 px-6 text-center">Category</th>
                      <th className="py-4 px-6 text-right">Price</th>
                      <th className="py-4 px-6 text-center">Stock Available</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-black overflow-hidden flex-shrink-0 border border-white/10">
                              <img src={p.imageUrl || '/images/chocolate.png'} alt={p.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-white font-bold">{p.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-1 max-w-[300px] mt-0.5">{p.description || 'No description provided.'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6 text-center">
                          <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 tracking-wider">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right font-black text-yellow-500">₹{p.price.toLocaleString()}</td>
                        <td className="py-5 px-6 text-center">
                          <span className={`font-bold ${p.stock === 0 ? 'text-red-500' : p.stock < 5 ? 'text-orange-400' : 'text-green-400'}`}>
                            {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex justify-center items-center gap-3">
                            <button 
                              onClick={() => openEditProductModal(p)}
                              className="p-2 bg-white/5 hover:bg-yellow-500/10 border border-white/10 hover:border-yellow-500/30 text-yellow-500 rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-red-400 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p className="text-sm font-bold uppercase tracking-widest">Your catalog is empty.</p>
                          <p className="text-xs text-gray-600 mt-1">Click Add New Craft to list your first item.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            /* Orders Fulfillment Section */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Active Fulfillment Tasks</h2>
                <p className="text-xs text-gray-500">Fulfill purchase orders placed by customers containing your items.</p>
              </div>

              <div className="space-y-4">
                {orders.map((o) => (
                  <motion.div 
                    layout key={o.id}
                    className="bg-[#101014] rounded-3xl border border-white/5 overflow-hidden shadow-2xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
                  >
                    <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-lg font-black text-white uppercase tracking-tight">Order #{o.id.slice(0, 8)}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                          o.status === 'DELIVERED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          o.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          o.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        }`}>
                          {o.status}
                        </span>
                        <span className="text-xs text-gray-500 font-bold">{new Date(o.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Items Details */}
                      <div className="space-y-2">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Ordered Items</p>
                        <ul className="space-y-1 text-sm">
                          {o.items.map((item, idx) => (
                            <li key={idx} className="text-gray-300 font-medium">
                              {item.title} <span className="text-yellow-500">x{item.quantity}</span> - ₹{item.price * item.quantity}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Delivery destination details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="flex items-start gap-2.5 text-xs text-gray-400">
                          <User className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white font-bold">{o.customer.name}</p>
                            {o.customer.phone && <p className="text-[10px] mt-0.5">{o.customer.phone}</p>}
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 text-xs text-gray-400">
                          <MapPin className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">{o.shippingAddress}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="w-full md:w-auto shrink-0 md:text-right flex flex-col gap-3">
                      <div>
                        <span className="text-2xl font-black text-yellow-500">₹{o.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-0.5">Order Value</p>
                      </div>

                      {['PROCESSING', 'SHIPPED'].includes(o.status) ? (
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, o.status)}
                          className="w-full md:w-56 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          <span>Mark as {o.status === 'PROCESSING' ? 'Shipped' : 'Delivered'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : o.status === 'DELIVERED' ? (
                        <div className="py-3 px-6 bg-green-500/10 border border-green-500/20 text-green-400 font-bold uppercase tracking-wider text-xs rounded-xl text-center flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Completed & Fulfiiled
                        </div>
                      ) : (
                        <div className="py-3 px-6 bg-white/5 border border-white/5 text-gray-500 font-bold uppercase tracking-wider text-xs rounded-xl text-center">
                          Fulfillment Idle
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-20 text-gray-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest">No orders listed yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* PRODUCT FORM MODAL */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowProductModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#111216] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 overflow-hidden z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {modalMode === 'add' ? 'Add New Product Listing' : 'Edit Product Details'}
                </h3>
                <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs mb-4 font-bold">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Product Title</label>
                  <input 
                    type="text" required
                    value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})}
                    placeholder="e.g. Handmade Velvet Wall Moon"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Description</label>
                  <textarea 
                    rows={3}
                    value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})}
                    placeholder="Describe the artisan detail, materials used, etc..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Price (₹ INR)</label>
                    <input 
                      type="number" required min={1}
                      value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})}
                      placeholder="999"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Inventory Stock</label>
                    <input 
                      type="number" required min={0}
                      value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})}
                      placeholder="10"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Category</label>
                    <select
                      value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                    >
                      <option value="CHOCOLATE">CHOCOLATE</option>
                      <option value="KEYCHAIN">KEYCHAIN</option>
                      <option value="WALLMOON">WALLMOON</option>
                      <option value="THREAD_ART">THREAD_ART</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1.5 block">Image URL (Optional)</label>
                    <input 
                      type="text"
                      value={productForm.imageUrl} onChange={e => setProductForm({...productForm, imageUrl: e.target.value})}
                      placeholder="/images/chocolate.png"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" onClick={() => setShowProductModal(false)}
                    className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold text-xs rounded-xl border border-white/5 transition-all text-center"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={formLoading}
                    className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-500 hover:to-yellow-400 text-black font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Craft'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-6 border-t border-white/5 text-center bg-[#070709] mt-12">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Moon Glow Craft Ecosystem • <span className="text-yellow-500">Merchant Hub</span>
        </p>
      </footer>
    </div>
  );
}
