import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, Chrome } from 'lucide-react';
import LoadingAnimation from '../components/LoadingAnimation';
import { AuroraBackground } from '../components/AuroraBackground';
import { Logo } from '../components/Logo';
import { NetworkNodes } from '../components/NetworkNodes';

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
    } catch (err: any) {
      console.error('Google Login Error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('Энэ домэйн Firebase-д бүртгэлгүй байна. Firebase Console дээр домэйнээ нэмнэ үү.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Browser-ийн popup хаагдсан байна. Зөвшөөрөөд дахин оролдоно уу.');
      } else {
        setError(`Google-ээр нэвтрэхэд алдаа гарлаа: ${err.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-void relative">
      <NetworkNodes />
      <AuroraBackground />

      {/* Left side - Brand Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center">
        <div className="relative z-10 text-center p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-6"
          >
            <Logo size="xl" />
          </motion.div>
          <p className="text-slate-500 text-xl max-w-md mx-auto leading-relaxed italic font-serif">
            "Your network is Your net worth"
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-start sm:items-center justify-center p-6 sm:p-8 relative z-10 overflow-y-auto py-12 sm:py-8">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md glass-panel !bg-white/80 p-10 rounded-[32px] shadow-2xl"
        >
          <Link to="/" className="inline-block mb-12 lg:hidden">
            <Logo size="md" />
          </Link>
          
          <h1 className="text-4xl font-serif font-bold mb-2 text-slate-900">Тавтай морил</h1>
          <p className="text-slate-500 mb-8">Нэвтрэх мэдээллээ оруулна уу.</p>

          {error && <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl mb-6 text-sm">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-400 font-bold">Имэйл хаяг</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:border-aurora-blue focus:ring-4 focus:ring-aurora-blue/5 outline-none transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-bold">Нууц үг</label>
                <a href="#" className="text-xs text-aurora-blue hover:underline">Нууц үгээ мартсан?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:border-aurora-blue focus:ring-4 focus:ring-aurora-blue/5 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-aurora text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shimmer-sweep shadow-lg shadow-aurora-blue/20"
            >
              {loading ? <div className="scale-50"><LoadingAnimation /></div> : <><LogIn className="w-5 h-5" /> Нэвтрэх</>}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-300">Эсвэл</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <Chrome className="w-5 h-5 text-aurora-blue" /> Google-ээр нэвтрэх
          </button>

          <p className="mt-10 text-center text-slate-500">
            Шинэ хэрэглэгч үү? <Link to="/register" className="text-aurora-blue font-bold hover:underline">Бүртгүүлэх</Link>
          </p>

          <p className="mt-8 text-center text-[10px] text-slate-400 leading-relaxed px-4">
            Нэвтэрснээр та манай <Link to="/terms" className="underline hover:text-aurora-blue transition-colors">Үйлчилгээний нөхцөл</Link> болон <Link to="/privacy" className="underline hover:text-aurora-blue transition-colors">Нууцлалын бодлого</Link>-ыг зөвшөөрч буйд тооцогдоно.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
