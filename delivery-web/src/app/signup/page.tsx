"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, User, Mail, Phone, Lock, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = 'https://moonglow-backend.onrender.com/api';

export default function DriverSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleInfo: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'DRIVER' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      
      router.push('/'); // Back to login
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6 flex flex-col justify-center">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-md mx-auto w-full">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl rotate-12 flex justify-center items-center shadow-lg shadow-emerald-500/20">
            <Truck className="w-10 h-10 text-black -rotate-12" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-center mb-2 tracking-tighter">Become a Partner</h1>
        <p className="text-gray-500 text-center mb-10">Register to start your delivery journey</p>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4"/> {error}
        </div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Full Name"
              required
              className="w-full bg-[#141416] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-emerald-500 transition-colors"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="email" 
              placeholder="Email Address"
              required
              className="w-full bg-[#141416] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-emerald-500 transition-colors"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="tel" 
              placeholder="Phone Number"
              required
              className="w-full bg-[#141416] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-emerald-500 transition-colors"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="password" 
              placeholder="Secure Password"
              required
              className="w-full bg-[#141416] border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-emerald-500 transition-colors"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black font-extrabold text-lg rounded-2xl flex justify-center items-center gap-2 transition-all mt-6 shadow-xl shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : <>Create Account <ArrowRight className="w-5 h-5"/></>}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500">
          Already a partner? <button onClick={() => router.push('/')} className="text-emerald-500 font-bold hover:underline">Log in</button>
        </p>
      </motion.div>
    </div>
  );
}
