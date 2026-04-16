import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { motion } from 'motion/react';
import { UserPlus, Mail, Lock, Chrome, User } from 'lucide-react';
import LoadingAnimation from '../components/LoadingAnimation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    lastname: '',
    firstname: '',
    email: '',
    password: '',
    field: 'IT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const createProfile = async (userId: string, email: string, firstname: string, lastname: string) => {
    const username = (firstname + lastname).toLowerCase().replace(/\s/g, '') + Math.floor(Math.random() * 1000);
    const profileData = {
      lastname,
      firstname,
      username,
      email,
      field: formData.field,
      card_color: '#0f1729',
      card_text_color: '#c9a84c',
      role: 'user',
      plan: 'free',
      verified: false,
      is_active: true,
      show_in_directory: true,
      profile_public: true,
      view_count: 0,
      qr_scan_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await setDoc(doc(db, 'profiles', userId), profileData);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await createProfile(userCredential.user.uid, formData.email, formData.firstname, formData.lastname);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Бүртгүүлэхэд алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const docSnap = await getDoc(doc(db, 'profiles', result.user.uid));
      if (!docSnap.exists()) {
        const names = result.user.displayName?.split(' ') || ['', ''];
        await createProfile(result.user.uid, result.user.email!, names[1] || names[0], names[0]);
      }
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
            Өөрийн мэргэжлийн дижитал картыг 30 секундэд үүсгээрэй.
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
          
          <h1 className="text-4xl font-serif font-bold mb-2">Бүртгүүлэх</h1>
          <p className="text-ivory/60 mb-8">Мэдээллээ оруулан картаа үүсгэнэ үү.</p>

          {error && <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl mb-6 text-sm">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-ivory/40">Овог</label>
                <input 
                  type="text" 
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="w-full bg-glass border border-white/5 rounded-xl py-3 px-4 focus:border-aurora-violet/50 outline-none transition-all"
                  placeholder="Овог"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-ivory/40">Нэр</label>
                <input 
                  type="text" 
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="w-full bg-glass border border-white/5 rounded-xl py-3 px-4 focus:border-aurora-violet/50 outline-none transition-all"
                  placeholder="Нэр"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ivory/40">Мэргэжлийн чиглэл</label>
              <select 
                name="field"
                value={formData.field}
                onChange={handleChange}
                className="w-full bg-glass border border-white/5 rounded-xl py-3 px-4 focus:border-aurora-violet/50 outline-none transition-all appearance-none text-ivory"
              >
                <option value="IT" className="bg-void text-ivory">IT / Технологи</option>
                <option value="Design" className="bg-void text-ivory">Дизайн</option>
                <option value="Marketing" className="bg-void text-ivory">Маркетинг</option>
                <option value="Finance" className="bg-void text-ivory">Санхүү</option>
                <option value="Business" className="bg-void text-ivory">Бизнес</option>
                <option value="Education" className="bg-void text-ivory">Боловсрол</option>
                <option value="Health" className="bg-void text-ivory">Эрүүл мэнд</option>
                <option value="Law" className="bg-void text-ivory">Хууль</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ivory/40">Имэйл хаяг</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ivory/30" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-glass border border-white/5 rounded-xl py-3 pl-12 pr-4 focus:border-aurora-violet/50 outline-none transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-ivory/40">Нууц үг</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ivory/30" />
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-glass border border-white/5 rounded-xl py-3 pl-12 pr-4 focus:border-aurora-violet/50 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-aurora text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 shimmer-sweep"
            >
              {loading ? <div className="scale-50"><LoadingAnimation /></div> : <><UserPlus className="w-5 h-5" /> Бүртгүүлэх</>}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0d1530] px-4 text-ivory/30">Эсвэл</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full glass-panel hover:bg-glass-hover text-ivory font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-3"
          >
            <Chrome className="w-5 h-5 text-aurora-cyan" /> Google-ээр бүртгүүлэх
          </button>

          <p className="mt-8 text-center text-ivory/60">
            Бүртгэлтэй юу? <Link to="/login" className="text-aurora-cyan font-bold hover:underline">Нэвтрэх</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
