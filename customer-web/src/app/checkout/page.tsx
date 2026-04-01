"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, CheckCircle2, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'India',
    address: '',
    area: '', // For Kuwait
    block: '', // For Kuwait
    city: '',
    pincode: '',
    upi: ''
  });

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = total * 0.18;
  const grandTotal = total + tax;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      // Clear cart & Redirect User after success
      setTimeout(() => {
        clearCart();
        router.push('/dashboard');
      }, 3000);
    }, 2500);
  };

  if (items.length === 0 && !paymentSuccess) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 pt-32 min-h-screen">
      <AnimatePresence>
        {paymentSuccess ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center text-center mt-20"
          >
            <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping"></div>
              <CheckCircle2 className="w-20 h-20 text-green-400 z-10" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>Order Placed Success!</h1>
            <p className="text-xl text-gray-300 mb-2">Thank you, {formData.name}.</p>
            <p className="text-gray-400">Your artisan masterpiece is beginning its journey. Redirecting you to your dashboard to track its status live...</p>
          </motion.div>
        ) : (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-16 text-center tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>
                Celestial <span className="text-yellow-500">Checkout</span>
            </h1>
            
            <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              <div className="lg:col-span-2 space-y-8">
                <div className="glass p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck className="w-32 h-32 text-yellow-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">Artisan Shipping Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="text-[10px] text-yellow-500/80 tracking-[0.2em] uppercase font-black mb-2 block">Select Region / Country</label>
                        <div className="flex gap-4">
                            {['India', 'Kuwait', 'Worldwide'].map(c => (
                                <button 
                                    key={c}
                                    type="button"
                                    onClick={() => setFormData({...formData, country: c})}
                                    className={`px-6 py-3 rounded-2xl text-xs font-bold border transition-all ${formData.country === c ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase font-black mb-2 block">Full Name</label>
                      <input type="text" placeholder="Anwar Shareef" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-yellow-500/50 transition-all" required />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase font-black mb-2 block">Email Address</label>
                      <input type="email" placeholder="anwar@moonglow.in" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-yellow-500/50 transition-all" required />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase font-black mb-2 block">Phone Number</label>
                      <input type="tel" placeholder={formData.country === 'Kuwait' ? '+965' : '+91'} value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-yellow-500/50 transition-all" required />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase font-black mb-2 block">Street Address / House No</label>
                      <input type="text" placeholder="Flat 402, Moon Glow Plaza" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-yellow-500/50 transition-all" required />
                    </div>

                    {formData.country === 'Kuwait' ? (
                        <>
                            <div>
                                <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase font-black mb-2 block">Area</label>
                                <input type="text" placeholder="Salmiya" value={formData.area} onChange={e=>setFormData({...formData, area: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-yellow-500/50 transition-all" required />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase font-black mb-2 block">Block</label>
                                <input type="text" placeholder="Block 10" value={formData.block} onChange={e=>setFormData({...formData, block: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-yellow-500/50 transition-all" required />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase font-black mb-2 block">City / Town</label>
                                <input type="text" placeholder="Mumbai" value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-yellow-500/50 transition-all" required />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase font-black mb-2 block">Pin / Zip Code</label>
                                <input type="text" placeholder="400001" value={formData.pincode} onChange={e=>setFormData({...formData, pincode: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-yellow-500/50 transition-all" required />
                            </div>
                        </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-dark p-8 rounded-[2.5rem] border border-yellow-500/20 shadow-[0_0_50px_rgba(0,0,0,0.3)] sticky top-32">
                  <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4 flex items-center justify-between">
                    Summary <ShieldCheck className="text-yellow-500 w-6 h-6"/>
                  </h2>

                  <div className="space-y-4 mb-8">
                     <div className="flex justify-between text-gray-400 text-sm">
                        <span>Subtotal</span>
                        <span>₹{total.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-gray-400 text-sm">
                        <span>Shipping & Tax</span>
                        <span>₹{tax.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-white font-bold text-xl pt-4 border-t border-white/10">
                        <span>Grand Total</span>
                        <span className="text-yellow-500">₹{grandTotal.toLocaleString()}</span>
                     </div>
                  </div>

                  <div className="p-5 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 mb-8">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-xl flex justify-center items-center text-black font-bold">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-bold">Secure Gateway</p>
                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">{formData.country === 'India' ? 'Razorpay India' : 'KNET / Cards Kuwait'}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        You will be redirected to a secure payment portal to complete your order safely using UPI, KNET or Credit Cards.
                    </p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black text-lg rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.03] transition-all shadow-[0_15px_30px_rgba(234,179,8,0.3)] disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {isProcessing ? <><Loader2 className="animate-spin w-6 h-6"/> Securing...</> : `Confirm Payment`}
                  </button>
                  <p className="text-center text-[10px] text-gray-500 mt-6 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <Lock className="w-3 h-3 text-green-500" /> Fully Encrypted Artisan Checkout
                  </p>
                </div>
              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
