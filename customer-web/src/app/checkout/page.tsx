"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: 'Anwar Artisan',
    email: 'anwar@moonglow.in',
    address: '123 Moonlight Avenue, Mumbai, India',
    upi: 'anwar@razorpay'
  });

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0) * 1.18; // plus tax

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate Razorpay processing delay
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
    <div className="w-full max-w-4xl mx-auto px-4 py-12 pt-32 min-h-screen">
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
            <h1 className="text-5xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>Payment Successful!</h1>
            <p className="text-xl text-gray-300 mb-2">Thank you, {formData.name}.</p>
            <p className="text-gray-400">Your artisan masterpiece is beginning its journey. Redirecting you to your dashboard to track its status live...</p>
          </motion.div>
        ) : (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <h1 className="text-4xl font-bold text-white mb-10 text-center" style={{ fontFamily: 'var(--font-playfair)' }}>Secure Checkout</h1>
            
            <form onSubmit={handlePayment} className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              <div className="space-y-6">
                <div className="glass p-6 rounded-3xl">
                  <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Shipping Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-yellow-400 tracking-wider uppercase font-bold">Full Name</label>
                      <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:outline-none focus:border-yellow-500 transition-colors" required />
                    </div>
                    <div>
                      <label className="text-xs text-yellow-400 tracking-wider uppercase font-bold">Email</label>
                      <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:outline-none focus:border-yellow-500 transition-colors" required />
                    </div>
                    <div>
                      <label className="text-xs text-yellow-400 tracking-wider uppercase font-bold">Full Address</label>
                      <textarea value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:outline-none focus:border-yellow-500 transition-colors min-h-[100px]" required />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-dark p-6 rounded-3xl border border-yellow-500/30">
                  <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center justify-between">
                    Payment <ShieldCheck className="text-green-400 w-5 h-5"/>
                  </h2>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex justify-center items-center text-white font-bold text-xs italic">Razorpay</div>
                    <div>
                      <p className="text-white font-semibold flex items-center gap-2">Paying via UPI / Cards <span className="bg-green-500 text-[10px] px-2 py-0.5 rounded-sm text-black uppercase">Secure</span></p>
                      <p className="text-gray-400 text-sm">Powered by Razorpay India</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 tracking-wider uppercase font-bold">UPI ID (Mock)</label>
                    <input type="text" value={formData.upi} onChange={e=>setFormData({...formData, upi: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:outline-none focus:border-yellow-500 transition-colors" required />
                  </div>

                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-gray-300">Total Amount Payable</span>
                      <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">₹{total.toFixed(2)}</span>
                    </div>
                    <button 
                      disabled={isProcessing}
                      className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-lg rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(251,191,36,0.5)] disabled:opacity-70 disabled:hover:scale-100"
                    >
                      {isProcessing ? <><Loader2 className="animate-spin w-6 h-6"/> Processing Payment...</> : `Pay ₹${total.toFixed(2)} Now`}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1"><ShieldCheck className="w-3 h-3"/> Payments are 100% secure and encrypted.</p>
                  </div>
                </div>
              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
