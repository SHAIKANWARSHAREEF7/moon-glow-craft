"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, ShieldCheck, Sparkles, Loader2, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moon-glow-craft.onrender.com/api';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [email, setEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      setStep('otp');
    } catch (err: any) {
      setErrorMsg(err.message);
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
        body: JSON.stringify({ email, otp: otpString })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
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
    if (value.length > 1) value = value[value.length - 1]; // allow only 1 char
    const newValues = [...otpValues];
    newValues[index] = value;
    setOtpValues(newValues);
    
    // Auto focus next
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div className="w-full flex-grow flex items-center justify-center pt-24 pb-12 px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-dark border border-yellow-500/20 p-8 rounded-3xl w-full max-w-md shadow-[0_0_50px_rgba(251,191,36,0.1)] relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex justify-center items-center mx-auto mb-4 shadow-lg shadow-yellow-500/30">
            <Sparkles className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>Welcome Back</h1>
          <p className="text-gray-400 text-sm">Sign in securely with your Email.</p>
        </div>

        {errorMsg && (
            <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4"/> {errorMsg}
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
              <div className="mb-6">
                <label className="text-xs text-yellow-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4"/> Email Address
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    required 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:scale-[1.02] text-black font-bold rounded-xl flex justify-center items-center gap-2 transition-transform shadow-[0_0_15px_rgba(251,191,36,0.4)] disabled:opacity-70 disabled:hover:scale-100"
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
                <p className="text-gray-300 mb-1">Enter the 4-digit code sent to</p>
                <p className="text-yellow-400 font-bold">{email}</p>
                <button type="button" onClick={() => setStep('input')} className="text-xs text-gray-500 hover:text-white underline mt-2">Change Email</button>
              </div>

              <div className="mb-8 flex justify-center gap-3">
                {[0, 1, 2, 3].map((index) => (
                  <input 
                    key={index}
                    id={`otp-${index}`}
                    type="text" 
                    maxLength={1}
                    value={otpValues[index]}
                    className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-2xl text-white font-bold focus:outline-none focus:border-yellow-500 focus:bg-white/10 transition-colors"
                    required
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                  />
                ))}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:scale-[1.02] text-black font-bold rounded-xl flex justify-center items-center gap-2 transition-transform shadow-[0_0_15px_rgba(251,191,36,0.4)] disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><ShieldCheck className="w-5 h-5"/> Verify & Continue</>}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
