"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Loader2, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moonglow-backend.onrender.com/api';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
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
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      
      setStep(2); // Move to OTP step
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

      // Success! Login directly
      localStorage.setItem('moonGlowToken', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userName', data.name);
      
      setStep(3); // Success state
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-200/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
                    <Sparkles className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>Create Account</h1>
                  <p className="text-gray-400">Join the Moon Glow artisan community</p>
                </div>

                {error && <p className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6">{error}</p>}

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500/50 transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500/50 transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
                    <input 
                      type="password" 
                      placeholder="Secure Password"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500/50 transition-all"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  <button 
                    disabled={loading}
                    className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign Up <ArrowRight className="w-5 h-5" /></>}
                  </button>
                </form>

                <p className="text-center mt-8 text-gray-400">
                  Already have an account? <Link href="/login" className="text-yellow-500 font-bold hover:underline">Log in</Link>
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                    <ShieldCheck className="w-8 h-8 text-blue-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>Verify Account</h1>
                  <p className="text-gray-400">Enter the 4-digit code sent to<br/><span className="text-white font-bold">{formData.email}</span></p>
                </div>

                {error && <p className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm mb-6">{error}</p>}

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <input 
                    type="text" 
                    maxLength={4}
                    placeholder="0000"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 text-center text-4xl font-black tracking-[0.5em] text-blue-400 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <button 
                    disabled={loading}
                    className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Complete <CheckCircle2 className="w-5 h-5" /></>}
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="w-full text-gray-500 text-sm hover:text-white transition-colors">
                    Back to Signup
                  </button>
                </form>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                   <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
                   <CheckCircle2 className="w-12 h-12 text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">Welcome, {formData.name}!</h1>
                <p className="text-gray-400">Your account is verified. Redirecting you to your celestial dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
