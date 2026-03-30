"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogIn, Lock, User, Phone, Mail, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moonglow-backend.onrender.com/api';

export default function AdminLogin() {
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
      
      if (data.role !== 'ADMIN') {
          throw new Error('Access denied. This portal is for Administrators only.');
      }
      
      localStorage.setItem('moonGlowToken', data.token);
      localStorage.setItem('moonGlowRole', data.role);
      router.push('/dashboard');
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
    <div className="h-screen w-full flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md admin-card border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.1)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
        <div className="flex flex-col items-center mb-8 mt-4">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Operations</h1>
          <p className="text-gray-400 text-sm">Secure Portal Access with OTP</p>
        </div>

        {errorMsg && (
            <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4"/> {errorMsg}
            </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.form 
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOtp}
            >
              <div className="flex bg-black/40 rounded-xl p-1 mb-6 border border-white/10">
                <button type="button" onClick={() => {setMethod('phone'); setInputValue('')}} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${method === 'phone' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Phone Number</button>
                <button type="button" onClick={() => {setMethod('email'); setInputValue('')}} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${method === 'email' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Email Address</button>
              </div>

              <div className="mb-6">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                  {method === 'phone' ? <Phone className="w-4 h-4 text-blue-400"/> : <Mail className="w-4 h-4 text-blue-400"/>} 
                  {method === 'phone' ? 'Authorized Phone' : 'Authorized Email'}
                </label>
                <div className="relative">
                  {method === 'phone' && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">+91</span>}
                  <input 
                    type={method === 'phone' ? 'tel' : 'email'} 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={method === 'phone' ? 'Admin Phone' : 'admin@moonglow.in'}
                    className={`w-full bg-black/30 border border-white/10 rounded-xl py-3 text-white focus:outline-none focus:border-blue-500 transition-colors ${method === 'phone' ? 'pl-14 pr-4' : 'px-4'}`}
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-transform disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Send Secure OTP'}
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
            >
              <div className="text-center mb-6">
                <p className="text-gray-300 mb-1">Enter Admin Access Code</p>
                <p className="text-blue-400 font-bold">{method === 'phone' ? `+91 ${inputValue}` : inputValue}</p>
                <button type="button" onClick={() => setStep('input')} className="text-xs text-gray-500 hover:text-white underline mt-2">Change details</button>
              </div>

              <div className="mb-8 flex justify-center gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <input 
                    key={i}
                    id={`otp-${i}`}
                    type="text" 
                    maxLength={1}
                    value={otpValues[i]}
                    className="w-12 h-12 md:w-14 md:h-14 bg-black/30 border border-white/10 rounded-xl text-center text-xl text-white font-bold focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-colors"
                    required
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                  />
                ))}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-transform shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><ShieldCheck className="w-5 h-5"/> Authorize Login</>}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
