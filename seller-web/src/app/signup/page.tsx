"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, User, Mail, Phone, Lock, ArrowRight, Loader2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5000/api';

export default function SellerSignup() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Form, 2: OTP, 3: Success
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'SELLER' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      
      setStep(2); // Go to OTP
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      localStorage.setItem('moonGlowToken', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userName', data.name);
      
      setStep(3); // Success state
      setTimeout(() => router.push('/tasks'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6 flex flex-col justify-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-md mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="form" exit={{ opacity: 0, x: -20 }}>
                <div className="flex justify-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 via-yellow-500 to-yellow-600 rounded-3xl rotate-12 flex justify-center items-center shadow-lg shadow-yellow-500/20 animate-pulse">
                      <Store className="w-10 h-10 text-black -rotate-12" />
                  </div>
                </div>

                <h1 className="text-3xl font-extrabold text-center mb-2 tracking-tighter">Become a Seller</h1>
                <p className="text-gray-500 text-center mb-10">Register to open your artisan shop online</p>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4"/> {error}
                </div>}

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input type="text" placeholder="Full Name" required className="w-full bg-[#141416] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-yellow-500 transition-colors" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>

                  <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input type="email" placeholder="Email Address" required className="w-full bg-[#141416] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-yellow-500 transition-colors" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>

                  <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input type="tel" placeholder="Phone Number" required className="w-full bg-[#141416] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-yellow-500 transition-colors" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>

                  <div className="relative">
                      <input type="text" placeholder="Shop Address / Location" required className="w-full bg-[#141416] border border-white/5 rounded-2xl py-4 px-4 focus:outline-none focus:border-yellow-500 transition-colors" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                  </div>

                  <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input type="password" placeholder="Secure Password" required className="w-full bg-[#141416] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-yellow-500 transition-colors" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-500 hover:to-yellow-400 active:scale-95 text-black font-extrabold text-lg rounded-2xl flex justify-center items-center gap-2 transition-all mt-6 shadow-xl disabled:opacity-50">
                      {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : <>Create Account <ArrowRight className="w-5 h-5"/></>}
                  </button>
                </form>

                <p className="text-center mt-8 text-gray-500">
                Already registered? <button onClick={() => router.push('/')} className="text-yellow-500 font-bold hover:underline">Log in</button>
                </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
               <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
                    <ShieldCheck className="w-10 h-10 text-yellow-400" />
                  </div>
                  <h1 className="text-3xl font-extrabold text-center mb-2 tracking-tighter">Verify Email</h1>
                  <p className="text-gray-500 text-center">Enter the code sent to your email:<br/><span className="text-white font-bold">{formData.email}</span></p>
                </div>

                {error && <p className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6">{error}</p>}

                <form onSubmit={handleVerifyOtp} className="space-y-6 text-center">
                  <input type="text" maxLength={4} placeholder="0000" className="w-full bg-[#141416] border border-white/5 rounded-2xl py-6 text-center text-4xl font-black tracking-[0.5em] text-yellow-500 focus:outline-none focus:border-yellow-500/50 transition-all font-mono" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                  <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-yellow-500 text-black font-extrabold rounded-2xl transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Complete <CheckCircle2 className="w-5 h-5" /></>}
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="w-full text-gray-500 text-sm hover:text-white transition-colors uppercase font-bold tracking-widest">Back</button>
                </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                   <CheckCircle2 className="w-14 h-14 text-yellow-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Seller Verified!</h1>
                <p className="text-gray-400">Welcome to Moon Glow Craft Ecosystem. Redirecting to your merchant dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
