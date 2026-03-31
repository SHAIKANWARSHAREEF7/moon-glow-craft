"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ShieldCheck, Loader2, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moonglow-backend.onrender.com/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      
      setStep(3);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <Link href="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm group">
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/> Back to Login
                </Link>
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                    <ShieldCheck className="w-8 h-8 text-blue-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>Forgot Password?</h1>
                  <p className="text-gray-400">Enter your email and we will send you an OTP to reset your security key.</p>
                </div>

                {error && <p className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6">{error}</p>}

                <form onSubmit={handleSendResetOtp} className="space-y-6">
                  <div className="group">
                    <label className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-black mb-2 block ml-1">Account Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                      <input 
                        type="email" 
                        placeholder="artisan@moonglow.in"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-light"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <button 
                    disabled={loading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Reset OTP <ArrowRight className="w-5 h-5" /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
                    <Lock className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>Reset Key</h1>
                  <p className="text-gray-400">Check your inbox for the code sent to<br/><span className="text-white font-bold">{email}</span></p>
                </div>

                {error && <p className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6">{error}</p>}

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="group">
                    <label className="text-[10px] text-yellow-500 uppercase tracking-[0.2em] font-black mb-2 block ml-1">4-Digit OTP</label>
                    <input 
                      type="text" 
                      maxLength={4}
                      placeholder="0000"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 text-center text-3xl font-black tracking-[0.5em] text-yellow-500 focus:outline-none focus:border-yellow-500/50 transition-all font-mono"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mb-2 block ml-1">New Secure Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-500" />
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500/50 transition-all"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                  </div>
                  <button 
                    disabled={loading}
                    className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Update Password <CheckCircle2 className="w-5 h-5" /></>}
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="w-full text-gray-500 text-sm hover:text-white transition-colors mt-2 font-bold uppercase tracking-widest text-[10px]">
                    Back
                  </button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                   <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
                   <CheckCircle2 className="w-12 h-12 text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Password Reset!</h1>
                <p className="text-gray-400">Your security key has been updated successfully. Redirecting you to the login screen...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
