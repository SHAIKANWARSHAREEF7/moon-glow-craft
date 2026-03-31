"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, User, Mail, Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moonglow-backend.onrender.com/api';

export default function AdminSignup() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Form, 2: OTP, 3: Success
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
        body: JSON.stringify({ ...formData, role: 'ADMIN' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Admin Registration failed');
      
      setStep(2);
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
      
      setStep(3);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 flex flex-col justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-md mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="form" exit={{ opacity: 0, x: -20 }} className="admin-card border border-blue-500/20 p-10 rounded-[2.5rem] bg-[#141416]/80 backdrop-blur-xl">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex justify-center items-center border border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.1)]">
                        <ShieldCheck className="w-8 h-8 text-blue-400" />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-center mb-2 tracking-tighter" style={{ fontFamily: 'var(--font-playfair)' }}>Admin Access</h1>
                <p className="text-gray-500 text-center text-sm mb-10">Create a secure administrative identity</p>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-xs flex items-center gap-2 font-bold tracking-wide">
                    <AlertCircle className="w-4 h-4"/> {error}
                </div>}

                <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] text-blue-400 uppercase font-black tracking-widest ml-1">Identity Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="text" placeholder="Full Administrator Name" required className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-colors text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-blue-400 uppercase font-black tracking-widest ml-1">Official Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="email" placeholder="admin@moonglow.in" required className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-colors text-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-blue-400 uppercase font-black tracking-widest ml-1">Access Key</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="password" placeholder="••••••••" required className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-colors text-sm" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-sm rounded-2xl flex justify-center items-center gap-2 transition-all mt-6 shadow-xl shadow-blue-600/20 disabled:opacity-50">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <>GENERATE ADMIN PROFILE <ArrowRight className="w-4 h-4"/></>}
                    </button>
                </form>

                <p className="text-center mt-8 text-gray-500 text-xs">
                    Already authorized? <button onClick={() => router.push('/')} className="text-blue-400 font-bold hover:underline uppercase tracking-tighter">Enter Portal</button>
                </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="admin-card border border-blue-500/20 p-10 rounded-[2.5rem] bg-[#141416]/80 backdrop-blur-xl">
               <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                    <ShieldCheck className="w-8 h-8 text-blue-400" />
                  </div>
                  <h1 className="text-2xl font-black text-center mb-2 tracking-tighter">Security Verification</h1>
                  <p className="text-gray-500 text-center text-xs">Verification code has been dispatched to<br/><span className="text-white font-bold">{formData.email}</span></p>
                </div>

                {error && <p className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold mb-6 text-center">{error}</p>}

                <form onSubmit={handleVerifyOtp} className="space-y-6 text-center">
                  <input type="text" maxLength={4} placeholder="0000" className="w-full bg-black/40 border border-white/5 rounded-2xl py-6 text-center text-4xl font-black tracking-[0.5em] text-blue-400 focus:outline-none focus:border-blue-500/50 transition-all font-mono" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                  <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-2xl transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>AUTHORIZE ACCESS <CheckCircle2 className="w-4 h-4" /></>}
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="w-full text-gray-500 text-[10px] hover:text-white transition-colors uppercase font-black tracking-[0.3em] mt-4">Reset Form</button>
                </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 px-6 bg-[#141416]/80 backdrop-blur-xl rounded-[2.5rem] border border-blue-500/20">
                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(37,99,235,0.2)]">
                   <CheckCircle2 className="w-10 h-10 text-blue-400" />
                </div>
                <h1 className="text-3xl font-black text-white mb-4 tracking-tighter">Authorization Complete</h1>
                <p className="text-gray-500 text-sm">Welcome, Administrator. Accessing central operations dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
