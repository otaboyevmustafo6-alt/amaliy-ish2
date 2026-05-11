import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Mail, Lock, User, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      const newUser = {
        uid: userCredential.user.uid,
        email: email,
        displayName: name,
        createdAt: Date.now(),
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Bu email manzili allaqachon ro'yxatdan o'tgan");
      } else {
        setError("Ro'yxatdan o'tishda xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-natural-bg p-4 font-sans text-natural-text relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-50">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-natural-accent/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-natural-accent/5 blur-[120px] rounded-full"></div>
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Ro'yxatdan o'ting</h1>
          <p className="text-natural-text-muted text-sm font-medium">Yangi hisob yaratish uchun ma'lumotlarni kiriting</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold mb-6 border border-red-100 flex items-center gap-3 italic">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse flex-shrink-0"></div>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-natural-text-muted uppercase tracking-widest mb-2 ml-1">F.I.SH</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-natural-text-muted/40" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-natural-input border-none rounded-2xl focus:ring-2 focus:ring-natural-accent outline-none transition-all placeholder:text-natural-text-muted/30"
                placeholder="Ismingizni kiriting"
                required
              />
            </div>
          </div>

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
            <label className="block text-xs font-bold text-natural-text-muted uppercase tracking-widest mb-2 ml-1">Parol</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-natural-text-muted/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-natural-input border-none rounded-2xl focus:ring-2 focus:ring-natural-accent outline-none transition-all placeholder:text-natural-text-muted/30"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-natural-text text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-natural-text-muted font-medium">
          Hisobingiz bormi?{' '}
          <Link to="/login" className="text-natural-accent font-bold hover:underline">
            Kirish
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
