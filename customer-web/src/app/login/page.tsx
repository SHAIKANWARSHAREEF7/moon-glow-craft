"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [inputValue, setInputValue] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 1500);
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
          <p className="text-gray-400 text-sm">Sign in to access your curated collection.</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.form 
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOtp}
            >
              <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/10">
                <button type="button" onClick={() => {setMethod('phone'); setInputValue('')}} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${method === 'phone' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}>Phone</button>
                <button type="button" onClick={() => {setMethod('email'); setInputValue('')}} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${method === 'email' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}>Email</button>
              </div>

              <div className="mb-6">
                <label className="text-xs text-yellow-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                  {method === 'phone' ? <Phone className="w-4 h-4"/> : <Mail className="w-4 h-4"/>} 
                  {method === 'phone' ? 'Phone Number' : 'Email Address'}
                </label>
                <div className="relative">
                  {method === 'phone' && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">+91</span>}
                  <input 
                    type={method === 'phone' ? 'tel' : 'email'} 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={method === 'phone' ? '98765 43210' : 'name@example.com'}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors ${method === 'phone' ? 'pl-14 pr-4' : 'px-4'}`}
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
                <p className="text-yellow-400 font-bold">{method === 'phone' ? `+91 ${inputValue}` : inputValue}</p>
                <button type="button" onClick={() => setStep('input')} className="text-xs text-gray-500 hover:text-white underline mt-2">Change {method}</button>
              </div>

              <div className="mb-8 flex justify-center gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <input 
                    key={i}
                    type="text" 
                    maxLength={1}
                    className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-2xl text-white font-bold focus:outline-none focus:border-yellow-500 focus:bg-white/10 transition-colors"
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
