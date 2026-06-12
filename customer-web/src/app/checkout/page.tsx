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
  const [activeStep, setActiveStep] = useState(1);

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
            
            <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
              
              <div className="lg:col-span-2 space-y-4">
                
                {/* Step 1: Delivery Address */}
                <div className={`glass p-6 md:p-8 rounded-[2rem] border transition-all duration-300 ${activeStep === 1 ? 'border-yellow-500 shadow-[0_0_30px_rgba(251,191,36,0.1)]' : 'border-white/5 opacity-60 hover:opacity-100'}`}>
                   <h2 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center justify-between cursor-pointer" onClick={() => activeStep > 1 && setActiveStep(1)}>
                      <span>1 <span className="text-yellow-500 font-bold ml-2">Delivery Address</span></span>
                      {activeStep > 1 && <span className="text-sm text-yellow-500 font-normal hover:underline">Change</span>}
                   </h2>
                   
                   {activeStep === 1 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 animate-in fade-in slide-in-from-top-4">
                        <div className="md:col-span-2">
                            <label className="text-[10px] text-yellow-500/80 tracking-[0.2em] uppercase font-black mb-2 block">Region / Country</label>
                            <div className="flex flex-wrap gap-4">
                                {['India', 'Kuwait', 'Worldwide'].map(c => (
                                    <button 
                                        key={c} type="button" onClick={() => setFormData({...formData, country: c})}
                                        className={`px-6 py-2 rounded-xl text-xs font-bold border transition-all ${formData.country === c ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase font-black mb-2 block">Full Name</label>
                          <input type="text" placeholder="Anwar Shareef" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-yellow-500/50" required />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase font-black mb-2 block">Email Address</label>
                          <input type="email" placeholder="anwar@moonglow.in" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-yellow-500/50" required />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase font-black mb-2 block">Phone Number</label>
                          <input type="tel" placeholder={formData.country === 'Kuwait' ? '+965' : '+91'} value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-yellow-500/50" required />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-[10px] text-gray-500 tracking-[0.2em] uppercase font-black mb-2 block">Street Address</label>
                          <input type="text" placeholder="Flat 402, Moon Glow Plaza" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-yellow-500/50" required />
                        </div>

                        {formData.country === 'Kuwait' ? (
                            <>
                                <div><input type="text" placeholder="Area" value={formData.area} onChange={e=>setFormData({...formData, area: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white" required /></div>
                                <div><input type="text" placeholder="Block / Street" value={formData.block} onChange={e=>setFormData({...formData, block: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white" required /></div>
                            </>
                        ) : (
                            <>
                                <div><input type="text" placeholder="City" value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white" required /></div>
                                <div><input type="text" placeholder="Pincode" value={formData.pincode} onChange={e=>setFormData({...formData, pincode: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white" required /></div>
                            </>
                        )}

                        <div className="md:col-span-2 mb-2">
                           <button type="button" onClick={() => setActiveStep(2)} className="bg-[#FFD814] hover:bg-[#F7CA00] text-black px-6 py-3 rounded-xl font-bold transition-all shadow-md text-sm mt-2">
                              Use this address
                           </button>
                        </div>
                      </div>
                   ) : (
                      <div className="ml-8 text-sm text-gray-400 leading-relaxed font-medium">
                         <p className="text-white">{formData.name}</p>
                         <p>{formData.address}</p>
                         <p>{formData.city || formData.area}, {formData.pincode || formData.block}</p>
                         <p>{formData.country}</p>
                      </div>
                   )}
                </div>

                {/* Step 2: Payment Method */}
                <div className={`glass p-6 md:p-8 rounded-[2rem] border transition-all duration-300 ${activeStep === 2 ? 'border-yellow-500 shadow-[0_0_30px_rgba(251,191,36,0.1)]' : 'border-white/5 opacity-60 hover:opacity-100'}`}>
                   <h2 className={`text-xl md:text-2xl font-bold mb-2 flex items-center justify-between cursor-pointer ${activeStep < 2 ? 'text-gray-500' : 'text-white'}`} onClick={() => activeStep > 2 && setActiveStep(2)}>
                      <span>2 <span className={`font-bold ml-2 ${activeStep < 2 ? 'text-gray-500' : 'text-yellow-500'}`}>Payment Method</span></span>
                      {activeStep > 2 && <span className="text-sm text-yellow-500 font-normal hover:underline">Change</span>}
                   </h2>
                   
                   {activeStep === 2 && (
                      <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-4">
                         <div className="p-4 border border-yellow-500/50 bg-yellow-500/10 rounded-xl flex items-start gap-4">
                            <input type="radio" checked readOnly className="mt-1 accent-yellow-500 w-4 h-4"/>
                            <div>
                               <p className="text-white font-bold text-sm">Secure Payment Gateway</p>
                               <p className="text-xs text-gray-400 mt-1">Pay via Credit Card, Debit Card, Net Banking, or UPI through our secure encrypted partner.</p>
                            </div>
                         </div>
                         <div className="pt-2">
                             <button type="button" onClick={() => setActiveStep(3)} className="bg-[#FFD814] hover:bg-[#F7CA00] text-black px-6 py-3 rounded-xl font-bold transition-all shadow-md text-sm">
                                Use this payment method
                             </button>
                         </div>
                      </div>
                   )}
                   {activeStep > 2 && (
                      <p className="ml-8 text-sm text-gray-400 font-medium">Secure Payment Gateway ({formData.country === 'India' ? 'Razorpay' : 'Cards/KNET'})</p>
                   )}
                </div>

                {/* Step 3: Review */}
                <div className={`glass p-6 md:p-8 rounded-[2rem] border transition-all duration-300 ${activeStep === 3 ? 'border-yellow-500 shadow-[0_0_30px_rgba(251,191,36,0.1)]' : 'border-white/5 opacity-60'}`}>
                   <h2 className={`text-xl md:text-2xl font-bold mb-2 flex items-center ${activeStep < 3 ? 'text-gray-500' : 'text-white'}`}>
                      3 <span className={`font-bold ml-2 ${activeStep < 3 ? 'text-gray-500' : 'text-yellow-500'}`}>Review items and delivery</span>
                   </h2>
                   
                   {activeStep === 3 && (
                      <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4">
                         <div className="border border-white/10 rounded-xl p-6 bg-black/20">
                            <h3 className="text-green-400 font-bold mb-6 flex items-center gap-2"><ShieldCheck className="w-5 h-5"/> Guaranteed Delivery By Tomorrow</h3>
                            <div className="space-y-6">
                               {items.map(item => (
                                  <div key={item.id} className="flex gap-6 items-start">
                                     <div className="w-20 h-20 bg-black/50 rounded-lg overflow-hidden flex-shrink-0 relative border border-white/5">
                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover"/>
                                     </div>
                                     <div>
                                        <p className="text-white text-base font-bold mb-1">{item.title}</p>
                                        <p className="text-yellow-500 text-sm font-bold mb-1">₹{item.price}</p>
                                        <p className="text-gray-400 text-xs shrink-0">Quantity: {item.quantity}</p>
                                     </div>
                                  </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/10 sticky top-32">
                  <button 
                    type="submit"
                    disabled={activeStep !== 3 || isProcessing}
                    className="w-full py-4 mb-6 bg-[#FFD814] hover:bg-[#F7CA00] text-black font-black text-sm md:text-base rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:bg-gray-600 disabled:text-gray-400"
                  >
                    {isProcessing ? <><Loader2 className="animate-spin w-5 h-5"/> Processing...</> : `Place Your Order`}
                  </button>
                  
                  <p className="text-center text-xs text-gray-400 mb-6 font-medium px-4 leading-relaxed">
                    By placing your order, you agree to our privacy notice and conditions of use.
                  </p>

                  <h3 className="font-bold text-white mb-4 border-b border-white/10 pb-2">Order Summary</h3>

                  <div className="space-y-2 mb-6">
                     <div className="flex justify-between text-gray-300 text-sm">
                        <span>Items:</span>
                        <span>₹{total.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-gray-300 text-sm">
                        <span>Delivery:</span>
                        <span>₹0</span>
                     </div>
                     <div className="flex justify-between text-gray-300 text-sm">
                        <span>Tax:</span>
                        <span>₹{tax.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-white font-bold text-lg md:text-xl pt-4 border-t border-white/10 mt-2">
                        <span className="text-red-400">Order Total:</span>
                        <span className="text-red-400">₹{grandTotal.toLocaleString()}</span>
                     </div>
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
