"use client"
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Navigation, Phone, Mail, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moonglow-backend.onrender.com/api';

export default function DeliveryLogin() {
  const router = useRouter();
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [inputValue, setInputValue] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) return;
    
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: method === 'email' ? inputValue : undefined, phone: method === 'phone' ? inputValue : undefined })
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
            email: method === 'email' ? inputValue : undefined, 
            phone: method === 'phone' ? inputValue : undefined,
            otp: otpString 
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      if (data.role !== 'DRIVER') {
          throw new Error('Access denied. Driver dashboard only.');
      }
      
      localStorage.setItem('moonGlowToken', data.token);
      localStorage.setItem('moonGlowRole', data.role);
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
    <div className="flex flex-col h-screen justify-between p-6 bg-del-dark">
      <div className="pt-12 text-center">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-del-primary rounded-[2rem] rotate-12 flex justify-center items-center shadow-[0_0_40px_rgba(0,210,106,0.3)]">
            <Truck className="w-12 h-12 text-black -rotate-12" />
          </div>
        </motion.div>
        <h1 className="text-3xl font-bold tracking-tighter mb-2">Driver Partner</h1>
        <p className="text-gray-400 mb-4">Log in to start your deliveries</p>
        
        {errorMsg && (
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs mb-6 font-bold flex items-center justify-center gap-2">
                <Truck className="w-4 h-4"/> {errorMsg}
            </motion.div>
        )}
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

              <div className="pt-6 border-t border-del-border text-center">
                 <p className="text-gray-500 text-[10px] mb-3 uppercase tracking-widest font-black">Join our specialized team</p>
                 <button type="button" onClick={() => router.push('/signup')} className="w-full py-4 bg-white/5 hover:bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-black rounded-2xl transition-all flex justify-center items-center gap-2 group">
                    <Truck className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> 
                    <span className="tracking-tighter">BECOME A PARTNER / SIGN UP</span>
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
                <p className="text-gray-400">Enter the 4-digit PIN sent to</p>
                <p className="text-white font-bold text-lg mb-2">{method === 'phone' ? `+91 ${inputValue}` : inputValue}</p>
                <button type="button" onClick={() => setStep('input')} className="text-sm text-del-primary font-bold">Wrong number?</button>
              </div>

              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <input 
                    key={i}
                    id={`otp-${i}`}
                    type="tel" 
                    maxLength={1}
                    value={otpValues[i]}
                    className="w-14 h-14 bg-del-dark border border-del-border rounded-xl text-center text-2xl text-white font-bold focus:outline-none focus:border-del-primary focus:bg-white/5 transition-colors"
                    required
                    onChange={(e) => handleOtpChange(i, e.target.value)}
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
