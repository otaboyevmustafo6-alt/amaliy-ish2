import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Mail, Lock, Chrome, Loader2, Send } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError("Email yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError("Google orqali kirishda xatolik yuz berdi");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-natural-bg p-4 font-sans text-natural-text relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-natural-accent/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-natural-accent/5 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-natural-border p-10 relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-natural-accent rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-natural-accent/20">
            <Layout className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Xush kelibsiz!</h1>
          <p className="text-natural-text-muted text-sm font-medium">Davom etish uchun hisobingizga kiring</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold mb-6 border border-red-100 flex items-center gap-3 italic">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse flex-shrink-0"></div>
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-natural-text-muted uppercase tracking-widest mb-2 ml-1">Email manzili</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-natural-text-muted/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-natural-input border-none rounded-2xl focus:ring-2 focus:ring-natural-accent outline-none transition-all placeholder:text-natural-text-muted/30"
                placeholder="masalan@email.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between ml-1 mb-2">
              <label className="block text-xs font-bold text-natural-text-muted uppercase tracking-widest">Parol</label>
              <a href="#" className="text-[10px] font-bold text-natural-accent hover:underline uppercase tracking-wide">Unutdingizmi?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-natural-text-muted/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-natural-input border-none rounded-2xl focus:ring-2 focus:ring-natural-accent outline-none transition-all placeholder:text-natural-text-muted/30"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-natural-text text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Kirish"}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-natural-sidebar"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white text-natural-text-muted font-bold uppercase tracking-widest">Yoki</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-4 bg-white hover:bg-natural-sidebar border border-natural-border text-natural-text font-bold rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <Chrome className="w-5 h-5 text-natural-accent" />
          Google orqali kirish
        </button>

        <p className="mt-10 text-center text-sm text-natural-text-muted font-medium">
          Hisobingiz yo'qmi?{' '}
          <Link to="/register" className="text-natural-accent font-bold hover:underline">
            Ro'yxatdan o'ting
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
