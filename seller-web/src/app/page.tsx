"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Navigation, Phone, Mail, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5000/api';

export default function SellerLogin() {
  const router = useRouter();
  const [method, setMethod] = useState<'phone' | 'email'>('email');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [inputValue, setInputValue] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Clear existing tokens on mount
  useEffect(() => {
    localStorage.removeItem('moonGlowToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
  }, []);
  
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) return;
    
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputValue })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      setStep('otp');
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otpValues.join('');
    if (otpString.length !== 4) {
        setErrorMsg('Please enter a valid 4-digit OTP');
        return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: inputValue, 
            otp: otpString 
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      if (data.role !== 'SELLER') {
          throw new Error('Access denied. Seller Dashboard only.');
      }
      
      localStorage.setItem('moonGlowToken', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userName', data.name);
      router.push('/tasks');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newValues = [...otpValues];
    newValues[index] = value;
    setOtpValues(newValues);
    
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div className="flex flex-col h-screen justify-between p-6 bg-[#0a0a0c] text-white">
      <div className="pt-12 text-center">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 via-yellow-500 to-yellow-600 rounded-[2rem] rotate-12 flex justify-center items-center shadow-[0_0_40px_rgba(251,191,36,0.2)]">
            <Store className="w-10 h-10 text-black -rotate-12" />
          </div>
        </motion.div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-[10px] text-yellow-400 font-bold tracking-widest uppercase">Merchant Portal</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tighter mb-2">Seller Partner</h1>
        <p className="text-gray-400 text-sm mb-4">Log in to manage your inventory and fulfill orders</p>
        
        {errorMsg && (
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs mb-6 font-bold flex items-center justify-center gap-2">
                <Store className="w-4 h-4"/> {errorMsg}
            </motion.div>
        )}
      </div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="bg-white/5 p-6 rounded-3xl border border-white/10 max-w-md w-full mx-auto"
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
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block">
                  Registered Email Address
                </label>
                <input 
                  type="email" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="seller@moonglowcraft.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-yellow-500 transition-colors font-semibold"
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-500 hover:to-yellow-400 active:scale-95 text-black font-extrabold text-lg rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : <><ArrowRight className="w-5 h-5"/> Send OTP</>}
              </button>

              <div className="pt-6 border-t border-white/5 text-center">
                 <p className="text-gray-500 text-[10px] mb-3 uppercase tracking-widest font-black">Register as a seller</p>
                 <button type="button" onClick={() => router.push('/signup')} className="w-full py-4 bg-white/5 hover:bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-black rounded-2xl transition-all flex justify-center items-center gap-2 group">
                    <Store className="w-5 h-5 group-hover:scale-105 transition-transform" /> 
                    <span className="tracking-tighter">BECOME A SELLER / SIGN UP</span>
                 </button>
              </div>
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
                <p className="text-gray-400 text-sm">Enter the 4-digit PIN sent to</p>
                <p className="text-yellow-500 font-bold text-lg mb-2">{inputValue}</p>
                <button type="button" onClick={() => setStep('input')} className="text-xs text-blue-400 font-bold hover:underline">Wrong email?</button>
              </div>

              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <input 
                    key={i}
                    id={`otp-${i}`}
                    type="tel" 
                    maxLength={1}
                    value={otpValues[i]}
                    className="w-14 h-14 bg-black/50 border border-white/10 rounded-xl text-center text-2xl text-white font-bold focus:outline-none focus:border-yellow-500 focus:bg-white/5 transition-colors"
                    required
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                  />
                ))}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-500 hover:to-yellow-400 active:scale-95 text-black font-extrabold text-lg rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-70 disabled:hover:scale-100 shadow-[0_10px_30px_rgba(251,191,36,0.2)]"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : <>Verify & Go Online <ArrowRight className="w-5 h-5"/></>}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <footer className="mt-8 text-center opacity-50">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Moon Glow Craft Ecosystem • <span className="text-yellow-500">Seller Dashboard</span>
        </p>
      </footer>
    </div>
  );
}
