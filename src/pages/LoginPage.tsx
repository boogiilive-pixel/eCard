import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, Chrome } from 'lucide-react';
import LoadingAnimation from '../components/LoadingAnimation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Имэйл эсвэл нууц үг буруу байна.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err) {
      setError('Google-ээр нэвтрэхэд алдаа гарлаа.');
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-void relative overflow-hidden">
      {/* Aurora Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-aurora-violet/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-aurora-cyan/20 blur-[120px] rounded-full animate-pulse" />

      {/* Left side - Brand Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center">
        <div className="relative z-10 text-center p-12">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-7xl font-serif font-bold aurora-text mb-6"
          >
            eCard.mn
          </motion.h2>
          <p className="text-ivory/60 text-xl max-w-md mx-auto leading-relaxed">
            Таны мэргэжлийн дижитал танилцуулга эндээс эхэлнэ.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md glass-panel p-10 rounded-[32px]"
        >
          <Link to="/" className="inline-block mb-12 text-2xl font-serif font-bold aurora-text lg:hidden">eCard.mn</Link>
          
          <h1 className="text-4xl font-serif font-bold mb-2">Тавтай морил</h1>
          <p className="text-ivory/60 mb-8">Нэвтрэх мэдээллээ оруулна уу.</p>

          {error && <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl mb-6 text-sm">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-ivory/40">Имэйл хаяг</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ivory/30" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-glass border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:border-aurora-violet/50 outline-none transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-widest text-ivory/40">Нууц үг</label>
                <a href="#" className="text-xs text-aurora-cyan hover:underline">Нууц үгээ мартсан?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ivory/30" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-glass border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:border-aurora-violet/50 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-aurora text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shimmer-sweep"
            >
              {loading ? <div className="scale-50"><LoadingAnimation /></div> : <><LogIn className="w-5 h-5" /> Нэвтрэх</>}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0d1530] px-4 text-ivory/30">Эсвэл</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full glass-panel hover:bg-glass-hover text-ivory font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-3"
          >
            <Chrome className="w-5 h-5 text-aurora-cyan" /> Google-ээр нэвтрэх
          </button>

          <p className="mt-10 text-center text-ivory/60">
            Шинэ хэрэглэгч үү? <Link to="/register" className="text-aurora-cyan font-bold hover:underline">Бүртгүүлэх</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
