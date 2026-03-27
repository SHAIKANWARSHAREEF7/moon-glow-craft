"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Navigation, Phone, Mail, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DeliveryLogin() {
  const router = useRouter();
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/tasks');
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen justify-between p-6 bg-del-dark">
      <div className="pt-12 text-center">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-del-primary rounded-[2rem] rotate-12 flex justify-center items-center shadow-[0_0_40px_rgba(0,210,106,0.3)]">
            <Truck className="w-12 h-12 text-black -rotate-12" />
          </div>
        </motion.div>
        <h1 className="text-3xl font-bold tracking-tighter mb-2">Driver Partner</h1>
        <p className="text-gray-400">Log in to start your deliveries</p>
      </div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="bg-del-card p-6 rounded-3xl border border-del-border"
      >
        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.form 
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOtp}
              className="space-y-6"
            >
              <div className="flex bg-del-dark rounded-xl p-1 border border-del-border">
                <button type="button" onClick={() => {setMethod('phone'); setInputValue('')}} className={`flex-1 py-3 px-2 text-sm font-bold rounded-lg transition-colors ${method === 'phone' ? 'bg-del-card text-white' : 'text-gray-500'}`}>Phone</button>
                <button type="button" onClick={() => {setMethod('email'); setInputValue('')}} className={`flex-1 py-3 px-2 text-sm font-bold rounded-lg transition-colors ${method === 'email' ? 'bg-del-card text-white' : 'text-gray-500'}`}>Email</button>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2 block">
                  {method === 'phone' ? 'Registered Mobile Number' : 'Registered Email ID'}
                </label>
                <div className="relative">
                  {method === 'phone' && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">+91</span>}
                  <input 
                    type={method === 'phone' ? 'tel' : 'email'} 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={method === 'phone' ? '98765 43210' : 'driver@moonglow.in'}
                    className={`w-full bg-del-dark border border-del-border rounded-xl py-4 text-white focus:outline-none focus:border-del-primary transition-colors font-semibold ${method === 'phone' ? 'pl-14 pr-4' : 'px-4'}`}
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 mt-2 bg-del-primary hover:bg-del-secondary active:scale-95 text-black font-extrabold text-lg rounded-xl flex justify-center items-center gap-2 transition-transform disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : <><Navigation className="w-5 h-5"/> Send OTP</>}
              </button>
            </motion.form>
          )}

          {step === 'otp' && (
            <motion.form 
              key="otp"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyOtp}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-gray-400">Enter the 4-digit PIN sent to</p>
                <p className="text-white font-bold text-lg mb-2">{method === 'phone' ? `+91 ${inputValue}` : inputValue}</p>
                <button type="button" onClick={() => setStep('input')} className="text-sm text-del-primary font-bold">Wrong number?</button>
              </div>

              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <input 
                    key={i}
                    type="tel" 
                    maxLength={1}
                    className="w-14 h-14 bg-del-dark border border-del-border rounded-xl text-center text-2xl text-white font-bold focus:outline-none focus:border-del-primary focus:bg-white/5 transition-colors"
                    required
                    onChange={(e) => {
                      if(e.target.value) {
                        const next = e.target.nextElementSibling as HTMLInputElement;
                        if(next) next.focus();
                      }
                    }}
                  />
                ))}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 mt-4 bg-del-primary hover:bg-del-secondary active:scale-95 text-black font-extrabold text-lg rounded-xl flex justify-center items-center gap-2 transition-transform disabled:opacity-70 disabled:hover:scale-100 shadow-[0_10px_30px_rgba(0,210,106,0.3)]"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : <>Verify & Go Online <ArrowRight className="w-5 h-5"/></>}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
