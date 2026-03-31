"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, ShieldCheck, Sparkles, Loader2, AlertCircle, Lock, UserPlus } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://moonglow-backend.onrender.com/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setIsUnverified(false);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 403 && data.unverified) {
          setIsUnverified(true);
          throw new Error('Please verify your account. We have sent an OTP to your email.');
        }
        throw new Error(data.error || 'Login failed');
      }
      
      localStorage.setItem('moonGlowToken', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userName', data.name);
      
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-grow flex items-center justify-center pt-24 pb-12 px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-dark border border-yellow-500/20 p-10 rounded-[2.5rem] w-full max-w-md shadow-[0_0_50px_rgba(251,191,36,0.1)] relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex justify-center items-center mx-auto mb-6 shadow-lg shadow-yellow-500/30 rotate-3">
            <Sparkles className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>Sign In</h1>
          <p className="text-gray-400 text-sm">Welcome back to Moon Glow Craft</p>
        </div>

        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div 
              initial={{opacity:0, y:-10}} 
              animate={{opacity:1, y:0}} 
              exit={{opacity:0, scale:0.95}}
              className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 ${isUnverified ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5"/> 
              <div>
                <p className="font-bold text-xs uppercase tracking-widest mb-1">{isUnverified ? 'Verification Required' : 'Login Error'}</p>
                <p className="text-sm">{errorMsg}</p>
                {isUnverified && (
                    <button onClick={() => router.push('/signup?email=' + email)} className="mt-2 text-white font-bold underline text-xs">Go to Verify Screen</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="group">
            <label className="text-[10px] text-yellow-500/70 uppercase tracking-[0.2em] font-black mb-2 block ml-1 transition-colors group-focus-within:text-yellow-400">
              Email Identity
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="artisan@moonglow.in"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500/50 transition-all font-light"
                required 
              />
            </div>
          </div>

          <div className="group">
            <div className="flex justify-between items-center mb-2 px-1">
                <label className="text-[10px] text-yellow-500/70 uppercase tracking-[0.2em] font-black transition-colors group-focus-within:text-yellow-400">
                Security Key
                </label>
                <Link href="/reset-password" id="forgot-password-link" className="text-[10px] text-gray-500 hover:text-yellow-500 font-bold uppercase tracking-widest transition-colors">Forgot Password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500/50 transition-all"
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:scale-[1.03] active:scale-95 text-black font-black text-lg rounded-2xl flex justify-center items-center gap-3 transition-all shadow-[0_15px_30px_rgba(234,179,8,0.2)] disabled:opacity-70 disabled:hover:scale-100 mt-8"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : <>Enter Dashboard <ArrowRight className="w-5 h-5"/></>}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-xs mb-4 uppercase tracking-[0.2em] font-black">Authentication Options</p>
            <Link href="/signup" id="signup-link-main" className="w-full py-4 bg-white/5 hover:bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-black rounded-2xl transition-all flex justify-center items-center gap-2 group shadow-[0_0_20px_rgba(234,179,8,0.05)] hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                <span className="tracking-tighter">CREATE NEW ACCOUNT</span>
            </Link>
        </div>
      </motion.div>
    </div>
  );
}
