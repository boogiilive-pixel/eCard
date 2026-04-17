import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, User, Palette, Share2, BarChart3, Settings, 
  LogOut, ExternalLink, Copy, Check, Camera, Save,
  Sparkles, Heart, Trash2, Search, Nfc, ShoppingCart, ZoomIn, ZoomOut,
  Menu, X
} from 'lucide-react';
import { auth, db, storage } from '../lib/firebase';
import { collection, doc, updateDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingAnimation from '../components/LoadingAnimation';
import { Logo } from '../components/Logo';
import { CategorySelector, SkillsInput } from '../components/ProfileFields';
import { SKILLS_SUGGESTIONS } from '../constants';

export default function DashboardPage() {
  const { profile, user, loading } = useFirebase();
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <LoadingAnimation />
      </div>
    );
  }

  if (!profile) return null;

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`ecard.mn/${profile?.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const menuItems = [
    { icon: <LayoutDashboard />, label: 'Хяналтын самбар', path: '/dashboard' },
    { icon: <User />, label: 'eCard үүсгэх', path: '/dashboard/my-ecard' },
    { icon: <Nfc />, label: 'NFC Tag захиалах', path: '/dashboard/nfc' },
    { icon: <Heart />, label: 'Хадгалсан eCard', path: '/dashboard/saved' },
    { icon: <BarChart3 />, label: 'Лавлах', path: '/dashboard/directory' },
    { icon: <Settings />, label: 'Тохиргоо', path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-void relative z-10">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-panel !bg-white/90 backdrop-blur-2xl z-50 flex items-center justify-between px-6 border-b border-slate-100">
        <Link to="/">
          <Logo size="sm" />
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-50 text-aurora-blue"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 flex flex-col glass-panel !bg-white/95 backdrop-blur-2xl !border-y-0 !border-l-0 !rounded-none transform transition-transform duration-300 lg:translate-x-0 overflow-y-auto shadow-xl",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 hidden lg:block">
          <Link to="/">
            <Logo size="md" />
          </Link>
        </div>
        
        <div className="h-16 lg:hidden shrink-0" /> {/* Spacer for mobile header */}

        <nav className="px-4 py-6 lg:py-2 space-y-2">
          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path!}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                location.pathname === item.path 
                  ? "btn-aurora text-white shadow-md shadow-aurora-blue/20" 
                  : "text-slate-600 hover:text-aurora-blue hover:bg-slate-50"
              )}
            >
              <span className={cn("w-5 h-5 transition-colors", location.pathname === item.path ? "text-white" : "text-slate-300 group-hover:text-aurora-blue")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 px-4 space-y-2 pb-8">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 px-4 mb-2">Минийх</div>
          {profile?.username && (
            <Link 
              to={`/${profile.username}`} 
              target="_blank"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-aurora-blue hover:bg-slate-50 transition-all group"
            >
              <ExternalLink className="w-5 h-5 text-aurora-blue/50 group-hover:text-aurora-blue" />
              Миний eCard
            </Link>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-sm font-medium text-slate-400 hover:text-danger hover:bg-danger/5 transition-all group"
          >
            <LogOut className="w-5 h-5 text-slate-200 group-hover:text-danger" /> Гарах
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-void/60 z-30 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 md:p-10 lg:p-12 max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Overview profile={profile} handleCopy={handleCopy} copied={copied} />} />
            <Route path="my-ecard" element={<MyECard profile={profile} />} />
            <Route path="saved" element={<SavedCards user={user} />} />
            <Route path="directory" element={<DirectoryView />} />
            <Route path="nfc" element={<NfcShop />} />
            <Route path="analytics" element={<Analytics profile={profile} />} />
            <Route path="settings" element={<AccountSettings profile={profile} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function Overview({ profile, handleCopy, copied }: any) {
  const data = [
    { name: 'Да', views: 40 },
    { name: 'Мя', views: 30 },
    { name: 'Лх', views: 60 },
    { name: 'Пү', views: 45 },
    { name: 'Ба', views: 90 },
    { name: 'Бя', views: 25 },
    { name: 'Ня', views: 15 },
  ];

  return (
    <div className="space-y-6 sm:space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl overflow-hidden glass-panel border border-white/10 bg-void/20 shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-aurora-violet">
                {profile?.firstname?.[0]}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-3 tracking-tight break-words">Сайн байна уу, {profile?.firstname}! 👋</h1>
            <div className="flex items-center gap-2 sm:gap-3 glass-panel rounded-2xl px-5 py-3 w-fit max-w-full shadow-sm hover:border-aurora-blue/30 transition-all group">
              <span className="text-xs sm:text-sm text-ivory/50 font-medium font-mono">ecard.mn/{profile?.username}</span>
              <button onClick={handleCopy} className="text-aurora-blue group-hover:text-aurora-violet transition-colors shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <div className="glass-panel px-10 py-5 rounded-[24px] text-center border-aurora-violet/10 bg-white/40">
            <p className="text-[10px] uppercase tracking-widest text-ivory/40 mb-1 font-bold">Төлөвлөгөө</p>
            <p className="font-bold text-aurora-violet text-xl tracking-wider">{profile?.plan || 'FREE'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Нийт үзэлт', value: profile?.view_count || 0 },
          { label: 'QR скан', value: profile?.qr_scan_count || 0 },
          { label: 'Сошиал даралт', value: 12 },
          { label: 'Verified', value: profile?.verified ? 'Тийм' : 'Үгүй' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 sm:p-8 rounded-[32px]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/40 mb-3 sm:mb-4">{stat.label}</p>
            <p className="text-3xl sm:text-4xl font-serif font-bold aurora-text">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel p-10 rounded-[32px]">
        <h3 className="text-xl font-serif font-bold mb-8">Сүүлийн 7 хоногийн үзэлт</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <defs>
                <linearGradient id="auroraGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0d1530', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="views" fill="url(#auroraGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MyECard({ profile }: any) {
  const [formData, setFormData] = useState({ ...profile });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [originalImage, setOriginalImage] = useState<string | null>(profile.avatar_url || null);
  const [isNewImage, setIsNewImage] = useState(false);

  useEffect(() => {
    setFormData({ ...profile });
    setOriginalImage(profile.avatar_url || null);
    setIsNewImage(false);
  }, [profile]);

  const getCroppedImage = async (imageSrc: string, zoomLevel: number): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 600; 
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        const minDim = Math.min(img.width, img.height);
        const cropDim = minDim / zoomLevel;
        
        const sx = (img.width - cropDim) / 2;
        const sy = (img.height - cropDim) / 2;
        
        ctx.drawImage(img, sx, sy, cropDim, cropDim, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => resolve(null);
    });
  };

  const handleChange = (e: any) => {
    setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAIImprove = async () => {
    if (!formData.bio) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Та мэргэжлийн дижитал нэрийн хуудасны танилцуулга бичигч байна. Дараах танилцуулгыг илүү мэргэжлийн, товч бөгөөд утга төгөлдөр болгож засаж өгнө үү. Зөвхөн зассан текстийг буцаана уу: "${formData.bio}"`,
      });
      
      if (response.text) {
        setFormData((prev: any) => ({ ...prev, bio: response.text.trim() }));
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert('AI ашиглахад алдаа гарлаа.');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let finalAvatarUrl = formData.avatar_url;

      if ((isNewImage || zoom !== 1) && originalImage) {
        setUploading(true);
        const croppedBase64 = await getCroppedImage(originalImage, zoom);
        if (croppedBase64) {
          const storageRef = ref(storage, `avatars/${profile.id}`);
          const response = await fetch(croppedBase64);
          const blob = await response.blob();
          await uploadBytes(storageRef, blob);
          finalAvatarUrl = await getDownloadURL(storageRef);
          
          setOriginalImage(finalAvatarUrl);
          setZoom(1);
        }
        setUploading(false);
      }

      await updateDoc(doc(db, 'profiles', profile.id), {
        ...formData,
        avatar_url: finalAvatarUrl,
        updated_at: new Date().toISOString()
      });
      
      setFormData(prev => ({ ...prev, avatar_url: finalAvatarUrl }));
      setIsNewImage(false);
      setLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setLoading(false);
      setUploading(false);
      console.error(err);
      alert('Алдаа гарлаа.');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Зөвхөн зураг оруулна уу.');

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setZoom(1);
      setIsNewImage(true);
    };
    reader.readAsDataURL(file);
  };

  const presets = [
    { name: 'Void', color: '#03050f' },
    { name: 'Aurora', color: '#0d1530' },
    { name: 'Navy', color: '#1a2540' },
    { name: 'Indigo', color: '#1e1b4b' },
    { name: 'Purple', color: '#312e81' },
    { name: 'Teal', color: '#0d9488' },
    { name: 'Forest', color: '#064e3b' },
    { name: 'Crimson', color: '#450a0a' },
  ];

  const gradients = [
    { name: 'Cosmic', color: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' },
    { name: 'Sunset', color: 'linear-gradient(135deg, #4c1d95 0%, #db2777 100%)' },
    { name: 'Ocean', color: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)' },
    { name: 'Emerald', color: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' },
    { name: 'Cyber', color: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%)' },
    { name: 'Midnight', color: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)' },
  ];

  const patterns = [
    { id: 'pattern-none', name: 'None' },
    { id: 'pattern-dots', name: 'Dots' },
    { id: 'pattern-grid', name: 'Grid' },
    { id: 'pattern-waves', name: 'Waves' },
    { id: 'pattern-diagonal', name: 'Lines' },
    { id: 'pattern-circuit', name: 'Tech' },
  ];

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between sticky top-0 z-30 bg-void/80 backdrop-blur-xl py-6 border-b border-white/5">
        <h1 className="text-4xl font-serif font-bold">eCard үүсгэх</h1>
        <div className="flex items-center gap-4">
          {showSuccess && (
            <motion.span 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-aurora-cyan font-bold hidden sm:block"
            >
              Амжилттай хадгалагдлаа!
            </motion.span>
          )}
          <button 
            onClick={handleSave} 
            disabled={loading} 
            className="btn-aurora px-6 py-2.5 rounded-xl font-bold disabled:opacity-50 transition-all shimmer-sweep flex items-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" /> {loading ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-2 space-y-12">
          {/* Profile Section */}
          <section className="glass-panel p-10 rounded-[32px] space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 group">
                  <div className="w-full h-full rounded-2xl border-2 border-aurora-violet/30 overflow-hidden bg-glass flex items-center justify-center">
                    {originalImage ? (
                      <img 
                        src={originalImage} 
                        className="w-full h-full object-cover transition-transform duration-200" 
                        style={{ transform: `scale(${zoom})` }}
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className="text-4xl font-bold text-aurora-violet">{formData.firstname?.[0]}</div>
                    )}
                    {uploading && <div className="absolute inset-0 bg-void/60 flex items-center justify-center rounded-2xl"><div className="w-8 h-8 border-2 border-aurora-cyan border-t-transparent rounded-full animate-spin" /></div>}
                  </div>
                  <label className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 bg-void/40 flex items-center justify-center transition-opacity rounded-2xl">
                    <Camera className="w-8 h-8 text-white" />
                    <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                  </label>
                </div>
                {originalImage && (
                  <div className="w-full max-w-[120px] space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-ivory/40 uppercase tracking-widest">
                      <ZoomOut className="w-3 h-3" />
                      <span>Zoom</span>
                      <ZoomIn className="w-3 h-3" />
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="3" 
                      step="0.01" 
                      value={zoom} 
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-aurora-violet"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 w-full space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-ivory/40">Овог</label>
                    <input name="lastname" value={formData.lastname} onChange={handleChange} className="w-full bg-glass border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-aurora-violet/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-ivory/40">Нэр</label>
                    <input name="firstname" value={formData.firstname} onChange={handleChange} className="w-full bg-glass border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-aurora-violet/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-ivory/40">Албан тушаал</label>
                    <input name="job_title" value={formData.job_title || ''} onChange={handleChange} className="w-full bg-glass border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-aurora-violet/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-ivory/40">Компани</label>
                    <input name="company" value={formData.company || ''} onChange={handleChange} className="w-full bg-glass border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-aurora-violet/50" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CategorySelector 
                    value={formData.category || ''} 
                    onChange={(val) => setFormData((prev: any) => ({ ...prev, category: val }))}
                    required
                  />
                  <SkillsInput 
                    skills={formData.skills || []}
                    onChange={(val) => setFormData((prev: any) => ({ ...prev, skills: val }))}
                    suggestions={SKILLS_SUGGESTIONS}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-widest text-ivory/40">Танилцуулга</label>
                <button onClick={handleAIImprove} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-aurora-cyan hover:text-aurora-violet transition-colors">
                  <Sparkles className="w-3 h-3" /> AI Сайжруулах
                </button>
              </div>
              <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows={3} className="w-full bg-glass border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-aurora-violet/50 resize-none" />
            </div>
          </section>
          
          {/* Contact Section */}
          <section className="glass-panel p-10 rounded-[32px] space-y-8">
            <h3 className="text-lg font-serif font-bold text-aurora-violet">Холбоо барих мэдээлэл</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-ivory/40">Утас</label>
                <input name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="+976 ..." className="w-full bg-glass border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-aurora-violet/50 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-ivory/40">Имэйл</label>
                <input name="email" value={formData.email || ''} onChange={handleChange} placeholder="example@mail.com" className="w-full bg-glass border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-aurora-violet/50 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-ivory/40">Хаяг</label>
                <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Улаанбаатар, ..." className="w-full bg-glass border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-aurora-violet/50 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-ivory/40">Google Maps Link</label>
                <input name="maps_url" value={formData.maps_url || ''} onChange={handleChange} placeholder="https://goo.gl/maps/..." className="w-full bg-glass border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-aurora-violet/50 text-sm" />
              </div>
            </div>
          </section>

          {/* Social Section */}
          <section className="glass-panel p-10 rounded-[32px] space-y-8">
            <h3 className="text-lg font-serif font-bold text-aurora-violet">Сошиал холбоосууд</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['linkedin', 'facebook', 'instagram', 'twitter', 'youtube'].map((key) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-ivory/40 capitalize">{key}</label>
                  <input 
                    name={key} 
                    value={(formData as any)[key] || ''} 
                    onChange={handleChange} 
                    placeholder={`https://${key}.com/...`}
                    className="w-full bg-glass border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-aurora-violet/50 text-sm" 
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Design & Preview */}
        <div className="space-y-12">
          {/* Design Section */}
          <section className="glass-panel p-8 rounded-[32px] space-y-8">
            <h3 className="text-lg font-serif font-bold text-aurora-violet">Загвар & Өнгө</h3>
            
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-ivory/40">Өнгө сонгох</label>
              <div className="flex flex-wrap gap-3">
                {presets.map(p => (
                  <button 
                    key={p.color} 
                    onClick={() => setFormData(prev => ({ ...prev, card_color: p.color }))}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      formData.card_color === p.color ? "border-white scale-125 shadow-lg" : "border-transparent"
                    )}
                    style={{ backgroundColor: p.color }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-ivory/40">Картын өнгө</label>
                <div className="relative w-full h-12 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center text-ivory/40 text-xl cursor-pointer">
                  <input type="color" value={formData.card_color.startsWith('linear') ? '#0d1530' : formData.card_color} onChange={(e) => setFormData(prev => ({ ...prev, card_color: e.target.value }))} className="absolute inset-0 opacity-0 cursor-pointer" />
                  +
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-ivory/40">Бичвэрийн өнгө</label>
                <div className="relative w-full h-12 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center text-ivory/40 text-xl cursor-pointer">
                  <input type="color" value={formData.card_text_color || '#c9a84c'} onChange={(e) => setFormData(prev => ({ ...prev, card_text_color: e.target.value }))} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="w-full h-full" style={{ backgroundColor: formData.card_text_color || '#c9a84c' }} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-ivory/40">Градиент сонгох</label>
              <div className="flex flex-wrap gap-3">
                {gradients.map(g => (
                  <button 
                    key={g.color} 
                    onClick={() => setFormData(prev => ({ ...prev, card_color: g.color }))}
                    className={cn(
                      "w-10 h-6 rounded-md border-2 transition-all",
                      formData.card_color === g.color ? "border-white scale-110 shadow-lg" : "border-transparent"
                    )}
                    style={{ background: g.color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-ivory/40">Хээ сонгох</label>
              <div className="grid grid-cols-3 gap-3">
                {patterns.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setFormData(prev => ({ ...prev, card_pattern: p.id }))}
                    className={cn(
                      "py-2 rounded-lg border transition-all text-[8px] uppercase tracking-widest font-bold",
                      formData.card_pattern === p.id ? "border-aurora-violet bg-aurora-violet/10 text-aurora-violet" : "border-white/5 bg-glass text-ivory/40"
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Minimal Preview */}
          <div className="p-10 rounded-[32px] glass-panel relative overflow-hidden shadow-2xl" style={{ 
            background: formData.card_color.startsWith('linear') ? formData.card_color : undefined, 
            backgroundColor: !formData.card_color.startsWith('linear') ? (formData.card_color || '#0d1530') : undefined,
          }}>
            <div className={cn("absolute inset-0 opacity-20 pointer-events-none", formData.card_pattern)} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-glass border border-white/10 mb-6 overflow-hidden">
                {formData.avatar_url && <img src={formData.avatar_url} className="w-full h-full object-cover" />}
              </div>
              <div className="h-6 w-40 rounded-lg mb-3" style={{ backgroundColor: formData.card_text_color || '#c9a84c' }} />
              <div className="h-4 w-24 opacity-60 rounded-lg" style={{ backgroundColor: formData.card_text_color || '#c9a84c' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SavedCards({ user }: any) {
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const q = query(collection(db, 'saved_cards'), where('user_id', '==', user.uid));
        const snap = await getDocs(q);
        const savedData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fetch profile details for each saved card
        const profiles = await Promise.all(
          savedData.map(async (s: any) => {
            const pSnap = await getDocs(query(
              collection(db, 'profiles'), 
              where('username', '==', s.username),
              where('is_active', '==', true),
              where('profile_public', '==', true)
            ));
            if (!pSnap.empty) {
              return { ...pSnap.docs[0].data(), save_id: s.id };
            }
            return null;
          })
        );
        
        setSavedCards(profiles.filter(p => p !== null));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchSaved();
  }, [user]);

  const removeSaved = async (saveId: string) => {
    try {
      await deleteDoc(doc(db, 'saved_cards', saveId));
      setSavedCards(prev => prev.filter(p => p.save_id !== saveId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="py-20 flex justify-center">
      <LoadingAnimation />
    </div>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-serif font-bold">Хадгалсан eCard</h1>
      
      {savedCards.length === 0 ? (
        <div className="glass-panel p-12 rounded-[32px] text-center">
          <Heart className="w-12 h-12 text-ivory/10 mx-auto mb-4" />
          <p className="text-ivory/40">Танд хадгалсан нэрийн хуудас байхгүй байна.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedCards.map((card: any) => (
            <div key={card.save_id} className="glass-panel p-6 rounded-2xl group relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-aurora-violet/20 flex items-center justify-center text-aurora-violet font-bold">
                  {card.firstname[0]}
                </div>
                <div>
                  <h4 className="font-bold">{card.firstname} {card.lastname}</h4>
                  <p className="text-xs text-ivory/40">{card.job_title} @ {card.business_name || card.company || 'Бие даасан'}</p>
                  <div className="mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-aurora-violet/10 text-aurora-violet text-[8px] font-bold uppercase">{card.field || card.business_industry || 'General'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link 
                  to={`/${card.username}`} 
                  target="_blank"
                  className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-center text-xs font-bold transition-all"
                >
                  Харах
                </Link>
                <button 
                  onClick={() => removeSaved(card.save_id)}
                  className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Analytics({ profile }: any) {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-serif font-bold">Аналитик</h1>
      <div className="glass-panel p-20 rounded-[32px] text-center">
        <BarChart3 className="w-20 h-20 text-aurora-violet/20 mx-auto mb-6" />
        <h3 className="text-2xl font-serif font-bold mb-4">Дэлгэрэнгүй аналитик</h3>
        <p className="text-ivory/40 max-w-md mx-auto leading-relaxed">Энэ хэсэг зөвхөн Pro хэрэглэгчдэд нээлттэй. Та төлөвлөгөөгөө ахиулж илүү дэлгэрэнгүй мэдээлэл аваарай.</p>
        <button className="mt-10 btn-aurora px-10 py-4 rounded-xl font-bold transition-all shimmer-sweep">Pro болох</button>
      </div>
    </div>
  );
}

function DirectoryView() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('Бүгд');

  const fields = ['Бүгд', 'IT', 'Design', 'Marketing', 'Law', 'Health', 'Finance', 'Education', 'Business'];

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const q = query(
          collection(db, 'profiles'), 
          where('show_in_directory', '==', true),
          where('is_active', '==', true)
        );
        const snap = await getDocs(q);
        setProfiles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const filtered = profiles.filter(p => {
    const matchesSearch = (p.firstname + p.lastname + p.company + (p.business_name || '')).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesField = selectedField === 'Бүгд' || p.field === selectedField || p.business_industry === selectedField;
    return matchesSearch && matchesField;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-4xl font-serif font-bold">Лавлах</h1>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30 w-4 h-4" />
          <input 
            placeholder="Хайх..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-glass border border-white/5 rounded-full py-3 pl-12 pr-6 outline-none focus:border-aurora-violet/50" 
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {fields.map(f => (
          <button 
            key={f} 
            onClick={() => setSelectedField(f)}
            className={cn("px-4 py-2 rounded-full text-xs font-medium transition-all", selectedField === f ? "btn-aurora" : "glass-panel text-ivory/40 hover:bg-glass-hover")}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-40 glass-panel rounded-[32px] animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(p => (
            <Link key={p.id} to={`/${p.username}`} className="glass-panel p-6 rounded-[32px] hover:bg-glass-hover transition-all flex items-center gap-6 group">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-glass border border-white/5 flex items-center justify-center">
                {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : <div className="text-2xl font-bold text-aurora-violet">{p.firstname[0]}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate group-hover:text-aurora-violet transition-colors">{p.lastname} {p.firstname}</h3>
                <p className="text-sm text-ivory/40 truncate">{p.job_title} @ {p.business_name || p.company}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-aurora-violet/10 text-aurora-violet text-[10px] font-bold uppercase">{p.field || p.business_industry || 'General'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NfcShop() {
  const products = [
    {
      id: 1,
      name: 'eCard Classic Card',
      description: 'Матт хар өнгөтэй, минималист загвартай NFC карт.',
      price: '45,000₮',
      image: 'https://picsum.photos/seed/nfc1/400/400'
    },
    {
      id: 2,
      name: 'eCard Metal Edition',
      description: 'Дээд зэрэглэлийн металл хийцтэй, лазер сийлбэртэй карт.',
      price: '120,000₮',
      image: 'https://picsum.photos/seed/nfc2/400/400'
    },
    {
      id: 3,
      name: 'eCard Sticker (Mini)',
      description: 'Утасны ард наадаг жижиг хэмжээтэй NFC наалт.',
      price: '25,000₮',
      image: 'https://picsum.photos/seed/nfc3/400/400'
    }
  ];

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-serif font-bold">NFC Tag захиалах</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-[32px] overflow-hidden group hover:border-aurora-violet/50 transition-all"
          >
            <div className="aspect-square overflow-hidden relative">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <button className="w-full btn-aurora py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Сагсанд нэмэх
                </button>
              </div>
            </div>
            <div className="p-6 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-serif font-bold text-lg">{product.name}</h3>
                <span className="text-aurora-cyan font-bold">{product.price}</span>
              </div>
              <p className="text-sm text-ivory/60 leading-relaxed">
                {product.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel p-10 rounded-[32px] bg-gradient-to-br from-aurora-violet/10 to-transparent border-aurora-violet/20">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-2xl bg-aurora-violet/20 flex items-center justify-center">
            <Nfc className="w-10 h-10 text-aurora-violet" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="text-xl font-serif font-bold">NFC гэж юу вэ?</h3>
            <p className="text-ivory/60 text-sm max-w-2xl">
              NFC (Near Field Communication) технологи нь таны дижитал нэрийн хуудсыг бусдын утсанд ганц хүрэлтээр дамжуулах боломжийг олгоно. Ямар нэгэн апп суулгах шаардлагагүй.
            </p>
          </div>
          <button className="btn-aurora px-8 py-3 rounded-xl font-bold whitespace-nowrap">
            Дэлгэрэнгүй үзэх
          </button>
        </div>
      </div>
    </div>
  );
}

function AccountSettings({ profile }: any) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    show_in_directory: profile?.show_in_directory ?? true,
    profile_public: profile?.profile_public ?? true,
  });

  const handleToggle = async (key: string) => {
    const newVal = !(settings as any)[key];
    setSettings(prev => ({ ...prev, [key]: newVal }));
    try {
      await updateDoc(doc(db, 'profiles', profile.id), { [key]: newVal });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-serif font-bold">Тохиргоо</h1>
      
      <div className="glass-panel p-10 rounded-[32px] space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">Лавлахад харагдах</h3>
            <p className="text-sm text-ivory/40">Таны профайл нийтийн лавлахад харагдах эсэх.</p>
          </div>
          <button 
            onClick={() => handleToggle('show_in_directory')}
            className={cn("w-16 h-9 rounded-full transition-all relative", settings.show_in_directory ? "btn-aurora" : "bg-glass border border-white/5")}
          >
            <div className={cn("absolute top-1 w-7 h-7 rounded-full bg-white transition-all shadow-lg", settings.show_in_directory ? "right-1" : "left-1")} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">Профайл нийтийн</h3>
            <p className="text-sm text-ivory/40">Таны профайл холбоосоор хандах боломжтой эсэх.</p>
          </div>
          <button 
            onClick={() => handleToggle('profile_public')}
            className={cn("w-16 h-9 rounded-full transition-all relative", settings.profile_public ? "btn-aurora" : "bg-glass border border-white/5")}
          >
            <div className={cn("absolute top-1 w-7 h-7 rounded-full bg-white transition-all shadow-lg", settings.profile_public ? "right-1" : "left-1")} />
          </button>
        </div>
      </div>
    </div>
  );
}
