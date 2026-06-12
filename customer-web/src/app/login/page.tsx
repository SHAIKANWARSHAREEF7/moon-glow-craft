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
      <div className="absolute top-0 left-0 w-full h-full bg-[#0a0a0a] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/80 border border-white/10 p-6 md:p-8 rounded-xl w-full max-w-[380px] relative z-10"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-medium text-white mb-1">Sign in</h1>
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

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-white font-bold mb-1 block">
              Email or mobile phone number
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1c] border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:border-yellow-500 focus:shadow-[0_0_0_2px_rgba(234,179,8,0.2)] transition-all font-light"
              required 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="text-sm text-white font-bold block">
                  Password
                </label>
                <Link href="/reset-password" id="forgot-password-link" className="text-sm text-blue-500 hover:text-red-500 hover:underline transition-colors">Forgot Password</Link>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1c] border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:border-yellow-500 focus:shadow-[0_0_0_2px_rgba(234,179,8,0.2)] transition-all"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 bg-[#FFD814] hover:bg-[#F7CA00] text-black text-sm rounded-md transition-colors shadow-sm disabled:opacity-70 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : 'Continue'}
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-400 leading-tight">
          By continuing, you agree to Moon Glow Craft's <span className="text-blue-500 hover:text-red-500 hover:underline cursor-pointer">Conditions of Use</span> and <span className="text-blue-500 hover:text-red-500 hover:underline cursor-pointer">Privacy Notice</span>.
        </div>

        <div className="mt-8 pt-4 relative">
            <div className="absolute inset-0 flex items-center">
               <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
               <span className="bg-black/80 px-2 text-gray-500">New to Moon Glow?</span>
            </div>
        </div>

        <Link href="/signup" id="signup-link-main" className="items-center justify-center text-sm w-full py-2 mt-4 bg-[#1a1a1c] hover:bg-[#2a2a2c] border border-white/20 text-white rounded-md transition-colors flex group">
            Create your Moon Glow account
        </Link>
      </motion.div>
    </div>
  );
}
