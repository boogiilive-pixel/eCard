import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { motion } from 'motion/react';
import { UserPlus, Mail, Lock, Chrome, User } from 'lucide-react';
import LoadingAnimation from '../components/LoadingAnimation';
import { AuroraBackground } from '../components/AuroraBackground';
import { Logo } from '../components/Logo';
import { CategorySelector, SkillsInput } from '../components/ProfileFields';
import { NetworkNodes } from '../components/NetworkNodes';
import { SKILLS_SUGGESTIONS } from '../constants';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    lastname: '',
    firstname: '',
    email: '',
    password: '',
    category: '',
    skills: [] as string[]
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
      category: formData.category,
      skills: formData.skills,
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
    } catch (err: any) {
      console.error('Google Register Error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('Энэ домэйн Firebase-д бүртгэлгүй байна. Firebase Console дээр домэйнээ нэмнэ үү.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Browser-ийн popup хаагдсан байна. Зөвшөөрөөд дахин оролдоно уу.');
      } else {
        setError(`Google-ээр бүртгүүлэхэд алдаа гарлаа: ${err.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-void relative overflow-hidden">
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
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md glass-panel !bg-white/80 p-10 rounded-[32px] shadow-2xl"
        >
          <Link to="/" className="inline-block mb-12 lg:hidden">
            <Logo size="md" />
          </Link>
          
          <h1 className="text-4xl font-serif font-bold mb-2 text-slate-900">Бүртгүүлэх</h1>
          <p className="text-slate-500 mb-8">Мэдээллээ оруулан картаа үүсгэнэ үү.</p>

          {error && <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl mb-6 text-sm">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Овог</label>
                <input 
                  type="text" 
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:border-aurora-blue focus:ring-4 focus:ring-aurora-blue/5 outline-none transition-all"
                  placeholder="Овог"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Нэр</label>
                <input 
                  type="text" 
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:border-aurora-blue focus:ring-4 focus:ring-aurora-blue/5 outline-none transition-all"
                  placeholder="Нэр"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <CategorySelector 
                value={formData.category}
                onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                required
              />
              <SkillsInput 
                skills={formData.skills}
                onChange={(val) => setFormData(prev => ({ ...prev, skills: val }))}
                suggestions={SKILLS_SUGGESTIONS}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Имэйл хаяг</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:border-aurora-blue focus:ring-4 focus:ring-aurora-blue/5 outline-none transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Нууц үг</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:border-aurora-blue focus:ring-4 focus:ring-aurora-blue/5 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-aurora text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 shimmer-sweep shadow-lg shadow-aurora-blue/20"
            >
              {loading ? <div className="scale-50"><LoadingAnimation /></div> : <><UserPlus className="w-5 h-5" /> Бүртгүүлэх</>}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-300">Эсвэл</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <Chrome className="w-5 h-5 text-aurora-blue" /> Google-ээр бүртгүүлэх
          </button>

          <p className="mt-8 text-center text-slate-500">
            Бүртгэлтэй юу? <Link to="/login" className="text-aurora-blue font-bold hover:underline">Нэвтрэх</Link>
          </p>

          <p className="mt-6 text-center text-[10px] text-slate-400 leading-relaxed px-4">
            Бүртгүүлснээр та манай <Link to="/terms" className="underline hover:text-aurora-blue transition-colors">Үйлчилгээний нөхцөл</Link> болон <Link to="/privacy" className="underline hover:text-aurora-blue transition-colors">Нууцлалын бодлого</Link>-ыг зөвшөөрч буйд тооцогдоно.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
