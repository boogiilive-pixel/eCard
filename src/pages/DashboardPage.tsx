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
import { collection, doc, updateDoc, getDocs, query, where, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingAnimation from '../components/LoadingAnimation';
import { Logo } from '../components/Logo';
import { CategorySelector, SkillsInput } from '../components/ProfileFields';
import { SKILLS_SUGGESTIONS, CATEGORIES } from '../constants';

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
        <div className="flex flex-col items-center gap-4">
          <LoadingAnimation />
          <p className="text-sm text-slate-500 animate-pulse">Мэдээлэл ачаалж байна...</p>
        </div>
      </div>
    );
  }

  // Handle missing profile - redirect to register or show setup
  if (!profile && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void p-6 text-center">
        <div className="max-w-md glass-panel p-10 rounded-[32px] space-y-6">
          <Logo size="md" className="mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-slate-900">Профайл бүртгэгдээгүй байна</h2>
          <p className="text-slate-500 text-sm">Таны бүртгэл үүссэн боловч нэрийн хуудсын мэдээлэл алга байна. Шинэ төсөл рүү шилжсэнтэй холбоотой байж магадгүй.</p>
          <div className="flex flex-col gap-3 pt-4">
            <Link to="/register" className="btn-aurora py-4 rounded-xl font-bold">Одоо үүсгэх</Link>
            <button onClick={() => auth.signOut()} className="text-slate-400 text-xs hover:text-slate-900 transition-colors uppercase tracking-widest font-bold">Гарах</button>
          </div>
        </div>
      </div>
    );
  }

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
    { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Хяналтын самбар', path: '/dashboard' },
    { icon: <User className="w-4 h-4" />, label: 'eCard үүсгэх', path: '/dashboard/my-ecard' },
    { icon: <Nfc className="w-4 h-4" />, label: 'NFC Tag захиалах', path: '/dashboard/nfc' },
    { icon: <Heart className="w-4 h-4" />, label: 'Хадгалсан eCard', path: '/dashboard/saved' },
    { icon: <BarChart3 className="w-4 h-4" />, label: 'Лавлах', path: '/dashboard/directory' },
    { icon: <Settings className="w-4 h-4" />, label: 'Тохиргоо', path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-white relative flex flex-col antialiased">
      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-slate-100 z-[100] flex items-center justify-between px-5">
        <Logo size="sm" />
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex flex-1 relative pt-14 lg:pt-0">
        {/* Sidebar - Minimal Desktop / Drawer Mobile */}
        <aside className={cn(
          "fixed lg:sticky lg:top-0 inset-y-0 left-0 z-[120] w-72 flex flex-col bg-white border-r border-slate-100 transition-transform duration-300 transform lg:translate-x-0 outline-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="p-6 hidden lg:block">
            <Link to="/">
              <Logo size="sm" />
            </Link>
          </div>

          <nav className="flex-1 px-3 py-6 lg:py-2 space-y-0.5 mt-10 lg:mt-0">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path!}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all",
                  location.pathname === item.path 
                    ? "bg-slate-50 text-slate-900 font-semibold" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <footer className="p-4 border-t border-slate-50">
            <div className="space-y-0.5">
              {profile?.username && (
                <Link 
                  to={`/${profile.username}`} 
                  target="_blank"
                  className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Миний хуудас
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 w-full text-xs font-medium text-slate-400 hover:text-danger transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" /> Гарах
              </button>
            </div>
          </footer>
        </aside>

        {/* Backdrop for Mobile */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-slate-900/10 z-[110] backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 w-full min-h-screen bg-slate-100/40 relative overflow-x-hidden">
          <div className="p-5 sm:p-10 lg:p-14 max-w-5xl mx-auto w-full">
            {profile ? (
              <div className="animate-in fade-in duration-500">
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
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <LoadingAnimation />
                <p className="text-xs text-slate-400 tracking-wider">Мэдээлэл ачаалж байна</p>
              </div>
            )}
          </div>
        </main>
      </div>
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
    <div className="space-y-8 w-full">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 items-start">
        <div className="flex items-center gap-4 sm:gap-6 w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-300">
                {profile?.firstname?.[0]}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Сайн байна уу, {profile?.firstname}! 👋</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400 font-mono truncate max-w-[150px] sm:max-w-none">ecard.mn/{profile?.username}</span>
              <button onClick={handleCopy} className="text-slate-400 hover:text-slate-900 transition-colors p-1">
                {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
        <div className="shrink-0 w-full lg:w-auto">
          <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm text-center flex lg:flex-col items-center lg:items-center justify-between lg:justify-center gap-2 lg:min-w-[140px]">
            <p className="text-[10px] uppercase font-bold text-slate-300 tracking-widest">Төлөвлөгөө</p>
            <p className="font-bold text-slate-900 text-sm tracking-widest">{profile?.plan || 'FREE'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Нийт үзэлт', value: profile?.view_count || 0 },
          { label: 'QR скан', value: profile?.qr_scan_count || 0 },
          { label: 'Сошиал', value: 12 },
          { label: 'Verified', value: profile?.verified ? 'Тийм' : 'Үгүй' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm">
            <p className="text-[10px] uppercase font-bold text-slate-300 tracking-widest mb-2">{stat.label}</p>
            <p className="text-xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Долоо хоногийн үзүүлэлт</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="views" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={32} />
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
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setFormData({ ...profile });
    setOriginalImage(profile.avatar_url || null);
    setIsNewImage(false);
  }, [profile]);

  const getCroppedImage = async (imageSrc: string, zoomLevel: number): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 500; // Efficient size for profile cards
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);

        // Quality optimization: use image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const minDim = Math.min(img.width, img.height);
        const cropDim = minDim / zoomLevel;
        
        const sx = (img.width - cropDim) / 2;
        const sy = (img.height - cropDim) / 2;
        
        ctx.drawImage(img, sx, sy, cropDim, cropDim, 0, 0, size, size);
        
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.85); // 0.85 quality is perfect balance
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
        contents: [{ 
          role: 'user', 
          parts: [{ 
            text: `Та мэргэжлийн дижитал нэрийн хуудасны танилцуулга бичигч байна. Дараах танилцуулгыг илүү мэргэжлийн, товч бөгөөд утга төгөлдөр болгож засаж өгнө үү. Зөвхөн зассан текстийг буцаана уу: "${formData.bio}"` 
          }] 
        }],
      });
      
      const improvedText = response.text;
      if (improvedText) {
        setFormData((prev: any) => ({ ...prev, bio: improvedText.trim() }));
      } else {
        console.warn("AI returned empty response");
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("AI Improvement Error:", err);
      alert('AI ашиглахад алдаа гарлаа. Таны API key тохируулагдсан эсэхийг шалгана уу.');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let finalAvatarUrl = formData.avatar_url;

      if ((isNewImage || zoom !== 1) && originalImage) {
        setUploading(true);
        const imageBlob = await getCroppedImage(originalImage, zoom);
        if (imageBlob) {
          const storageRef = ref(storage, `avatars/${profile.id}`);
          // Direct upload of blob is much faster
          await uploadBytes(storageRef, imageBlob);
          finalAvatarUrl = await getDownloadURL(storageRef);
          
          setOriginalImage(finalAvatarUrl);
          setZoom(1);
        }
        setUploading(false);
      }

      // Use setDoc with merge: true for more robustness
      await setDoc(doc(db, 'profiles', profile.id), {
        ...formData,
        avatar_url: finalAvatarUrl,
        updated_at: new Date().toISOString()
      }, { merge: true });
      
      setFormData((prev: any) => ({ ...prev, avatar_url: finalAvatarUrl }));
      setIsNewImage(false);
      setLoading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setLoading(false);
      setUploading(false);
      console.error("Save Error:", err);
      alert('Мэдээлэл хадгалахад алдаа гарлаа: ' + (err.message || 'Тодорхойгүй алдаа'));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Зөвхөн зураг оруулна уу.');

    setIsProcessing(true);
    // Pre-resize image on client side before processing
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawImg = new Image();
      rawImg.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800; // Efficient size for preview
        let width = rawImg.width;
        let height = rawImg.height;

        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(rawImg, 0, 0, width, height);
        
        setOriginalImage(canvas.toDataURL('image/jpeg', 0.8));
        setZoom(1);
        setIsNewImage(true);
        setIsProcessing(false);
      };
      rawImg.onerror = () => {
        setIsProcessing(false);
        alert('Зураг уншихад алдаа гарлаа.');
      };
      rawImg.src = event.target?.result as string;
    };
    reader.onerror = () => setIsProcessing(false);
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
    <div className="space-y-8 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 pt-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-12">
          {/* Profile Section */}
          <section className="glass-panel !bg-white/90 p-6 sm:p-10 rounded-[32px] space-y-8 shadow-sm border-slate-200/60">
            <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10">
              <div className="flex flex-col items-center gap-4 mt-2">
                <div className="relative w-32 h-32 group">
                  <div className="w-full h-full rounded-2xl border-2 border-aurora-violet/30 overflow-hidden bg-glass flex items-center justify-center">
                    {originalImage ? (
                      <img 
                        src={originalImage} 
                        className={cn("w-full h-full object-cover transition-transform duration-200", isProcessing && "opacity-50")} 
                        style={{ transform: `scale(${zoom})` }}
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className="text-4xl font-bold text-aurora-violet">{formData.firstname?.[0]}</div>
                    )}
                    {(uploading || isProcessing) && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl gap-2">
                        <div className="w-8 h-8 border-2 border-aurora-blue border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-bold text-aurora-blue uppercase tracking-tighter">
                          {isProcessing ? 'Бэлдэж байна' : 'Ачаалж байна'}
                        </span>
                      </div>
                    )}
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
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Овог</label>
                    <input name="lastname" value={formData.lastname} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-slate-900/20 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Нэр</label>
                    <input name="firstname" value={formData.firstname} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-slate-900/20 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Албан тушаал</label>
                    <input name="job_title" value={formData.job_title || ''} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-slate-900/20 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Компани</label>
                    <input name="company" value={formData.company || ''} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-slate-900/20 text-sm" />
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
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Танилцуулга</label>
                <button onClick={handleAIImprove} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors font-bold">
                  <Sparkles className="w-3 h-3" /> AI Сайжруулах
                </button>
              </div>
              <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-slate-900/20 resize-none text-sm" />
            </div>
          </section>
          
          {/* Contact Section */}
          <section className="bg-white/90 border border-slate-200/60 p-6 sm:p-8 rounded-[32px] space-y-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Холбоо барих мэдээлэл</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Утас</label>
                <input name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="+976 ..." className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-slate-900/20 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Имэйл</label>
                <input name="email" value={formData.email || ''} onChange={handleChange} placeholder="example@mail.com" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-slate-900/20 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Хаяг</label>
                <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Улаанбаатар, ..." className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-slate-900/20 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Google Maps Link</label>
                <input name="maps_url" value={formData.maps_url || ''} onChange={handleChange} placeholder="https://goo.gl/maps/..." className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-slate-900/20 text-sm" />
              </div>
            </div>
          </section>

          {/* Social Section */}
          <section className="bg-white/90 border border-slate-200/60 p-6 sm:p-8 rounded-[32px] space-y-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Сошиал холбоосууд</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {['linkedin', 'facebook', 'instagram', 'twitter', 'youtube'].map((key) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold capitalize">{key}</label>
                  <input 
                    name={key} 
                    value={(formData as any)[key] || ''} 
                    onChange={handleChange} 
                    placeholder={`https://${key}.com/...`}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-slate-900/20 text-sm" 
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Design & Preview */}
        <div className="space-y-12">
          {/* Design Section */}
          <section className="bg-white/90 border border-slate-200/60 p-8 rounded-[32px] space-y-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Загвар & Өнгө</h3>
            
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Өнгө сонгох</label>
              <div className="flex flex-wrap gap-3">
                {presets.map(p => (
                  <button 
                    key={p.color} 
                    onClick={() => setFormData(prev => ({ ...prev, card_color: p.color }))}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      formData.card_color === p.color ? "border-slate-900 scale-125 shadow-lg" : "border-transparent"
                    )}
                    style={{ backgroundColor: p.color }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Картын өнгө</label>
                <div className="relative w-full h-12 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center text-slate-300 text-xl cursor-pointer bg-slate-50">
                  <input type="color" value={formData.card_color.startsWith('linear') ? '#0f172a' : formData.card_color} onChange={(e) => setFormData(prev => ({ ...prev, card_color: e.target.value }))} className="absolute inset-0 opacity-0 cursor-pointer" />
                  +
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Бичвэрийн өнгө</label>
                <div className="relative w-full h-12 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center text-slate-300 text-xl cursor-pointer">
                  <input type="color" value={formData.card_text_color || '#c9a84c'} onChange={(e) => setFormData(prev => ({ ...prev, card_text_color: e.target.value }))} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="w-full h-full" style={{ backgroundColor: formData.card_text_color || '#c9a84c' }} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Градиент сонгох</label>
              <div className="flex flex-wrap gap-3">
                {gradients.map(g => (
                  <button 
                    key={g.color} 
                    onClick={() => setFormData(prev => ({ ...prev, card_color: g.color }))}
                    className={cn(
                      "w-10 h-6 rounded-md border-2 transition-all",
                      formData.card_color === g.color ? "border-slate-900 scale-110 shadow-lg" : "border-transparent"
                    )}
                    style={{ background: g.color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Хээ сонгох</label>
              <div className="grid grid-cols-3 gap-3">
                {patterns.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setFormData(prev => ({ ...prev, card_pattern: p.id }))}
                    className={cn(
                      "py-2 rounded-lg border transition-all text-[8px] uppercase tracking-widest font-bold",
                      formData.card_pattern === p.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-400"
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Minimal Preview */}
          <div className="p-10 rounded-2xl bg-white border border-slate-100 relative overflow-hidden shadow-xl" style={{ 
            background: formData.card_color.startsWith('linear') ? formData.card_color : undefined, 
            backgroundColor: !formData.card_color.startsWith('linear') ? (formData.card_color || '#0d1530') : undefined,
          }}>
            <div className={cn("absolute inset-0 opacity-20 pointer-events-none", formData.card_pattern)} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 mb-6 overflow-hidden">
                {formData.avatar_url && <img src={formData.avatar_url} className="w-full h-full object-cover" />}
              </div>
              <div className="h-6 w-40 rounded-lg mb-3" style={{ backgroundColor: formData.card_text_color || '#c9a84c' }} />
              <div className="h-4 w-24 opacity-60 rounded-lg" style={{ backgroundColor: formData.card_text_color || '#c9a84c' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="fixed bottom-0 left-0 lg:left-72 right-0 z-[100] bg-white/80 backdrop-blur-md border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
        <div className="hidden sm:block">
          {showSuccess && (
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-aurora-cyan font-bold"
            >
              Мэдээлэл амжилттай хадгалагдлаа!
            </motion.span>
          )}
        </div>
        <button 
          onClick={handleSave} 
          disabled={loading} 
          className="flex-1 sm:flex-none btn-aurora px-12 py-3.5 rounded-xl font-bold disabled:opacity-50 transition-all shimmer-sweep flex items-center justify-center gap-2 shadow-xl shadow-aurora-blue/20"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {uploading ? 'Зураг ачаалж байна...' : 'Хадгалж байна...'}
            </div>
          ) : (
            <><Save className="w-4 h-4" /> Хадгалах</>
          )}
        </button>
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
      <h1 className="text-3xl font-bold text-slate-900 px-1">Хадгалсан eCard</h1>
      
      {savedCards.length === 0 ? (
        <div className="bg-white border border-slate-100 p-12 rounded-2xl text-center">
          <Heart className="w-10 h-10 text-slate-100 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Танд хадгалсан нэрийн хуудас байхгүй байна.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedCards.map((card: any) => (
            <div key={card.save_id} className="bg-white border border-slate-100 p-6 rounded-2xl group transition-all hover:border-slate-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 font-bold">
                  {(card.firstname || 'U')[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{card.firstname || 'Тодорхойгүй'} {card.lastname || ''}</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">{card.job_title || 'Мэргэжилгүй'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link 
                  to={`/${card.username}`} 
                  target="_blank"
                  className="flex-1 py-2.5 rounded-lg bg-slate-900 text-white text-center text-xs font-bold transition-all"
                >
                  Харах
                </Link>
                <button 
                  onClick={() => removeSaved(card.save_id)}
                  className="p-2.5 rounded-lg bg-slate-50 text-slate-400 hover:text-danger hover:bg-danger/5 transition-all"
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
      <h1 className="text-3xl font-bold text-slate-900">Аналитик</h1>
      <div className="bg-white border border-slate-100 p-12 sm:p-20 rounded-2xl text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Дэлгэрэнгүй аналитик</h3>
        <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">Энэ хэсэг зөвхөн Pro хэрэглэгчдэд нээлттэй. Та төлөвлөгөөгөө ахиулж илүү дэлгэрэнгүй мэдээлэл аваарай.</p>
        <button className="mt-10 bg-slate-900 text-white px-10 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">Pro болох</button>
      </div>
    </div>
  );
}

function DirectoryView() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('Бүгд');

  const fields = ['Бүгд', ...CATEGORIES];

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'profiles'), 
          where('show_in_directory', '==', true),
          where('is_active', '==', true)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`Fetched ${data.length} profiles for directory`);
        setProfiles(data);
      } catch (err: any) {
        console.error("Directory Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const filtered = profiles.filter(p => {
    const matchesSearch = (
      (p.firstname || '') + 
      (p.lastname || '') + 
      (p.company || '') + 
      (p.job_title || '')
    ).toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check both 'field' (legacy) and 'category' (current)
    const matchesField = selectedField === 'Бүгд' || 
                         p.category === selectedField || 
                         p.field === selectedField;
                         
    return matchesSearch && matchesField;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-3xl font-bold text-slate-900">Лавлах</h1>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-3.5 h-3.5" />
          <input 
            placeholder="Хайх..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-xl py-3 pl-11 pr-6 outline-none focus:border-slate-900/20 text-sm transition-all focus:shadow-md" 
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {fields.map(f => (
          <button 
            key={f} 
            onClick={() => setSelectedField(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-semibold transition-all uppercase tracking-widest", 
              selectedField === f ? "bg-slate-900 text-white" : "bg-white border border-slate-50 text-slate-400 hover:border-slate-200"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-40 bg-white border border-slate-50 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filtered.map(p => (
            <Link key={p.id} to={`/${p.username}`} className="bg-white border border-slate-100 p-6 rounded-2xl hover:border-slate-300 transition-all flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : <div className="text-xl font-bold text-slate-200">{p.firstname[0]}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate transition-colors">{p.lastname} {p.firstname}</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest truncate">{p.job_title}</p>
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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">NFC Tag захиалах</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-2xl overflow-hidden group hover:border-slate-300 transition-all shadow-sm"
          >
            <div className="aspect-square overflow-hidden relative bg-slate-50">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-900/5 transition-opacity" />
              <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl">
                  <ShoppingCart className="w-3 h-3" /> Сагсанд нэмэх
                </button>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-start gap-4">
                <h3 className="font-bold text-slate-900 text-base leading-tight">{product.name}</h3>
                <span className="text-slate-900 font-bold text-sm whitespace-nowrap">{product.price}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-50 border border-slate-100 p-8 sm:p-10 rounded-2xl flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Nfc className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 space-y-1.5 text-center md:text-left">
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider">NFC гэж юу вэ?</h3>
          <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
            NFC (Near Field Communication) технологи нь таны дижитал нэрийн хуудсыг бусдын утсанд ганц хүрэлтээр дамжуулах боломжийг олгоно. Ямар нэгэн апп суулгах шаардлагагүй.
          </p>
        </div>
        <button className="bg-white border border-slate-900 text-slate-900 px-8 py-3 rounded-xl font-bold text-xs hover:bg-slate-900 hover:text-white transition-all whitespace-nowrap">
          Дэлгэрэнгүй үзэх
        </button>
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
      <h1 className="text-3xl font-bold text-slate-900">Тохиргоо</h1>
      
      <div className="bg-white border border-slate-100 p-8 sm:p-10 rounded-2xl space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Лавлахад харагдах</h3>
            <p className="text-xs text-slate-400">Таны профайл нийтийн лавлахад харагдах эсэх.</p>
          </div>
          <button 
            onClick={() => handleToggle('show_in_directory')}
            className={cn("w-12 h-6 rounded-full transition-all relative flex items-center px-1", settings.show_in_directory ? "bg-slate-900" : "bg-slate-100")}
          >
            <div className={cn("w-4 h-4 rounded-full bg-white transition-all shadow-sm", settings.show_in_directory ? "ml-auto" : "ml-0")} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Профайл нийтийн</h3>
            <p className="text-xs text-slate-400">Таны профайл холбоосоор хандах боломжтой эсэх.</p>
          </div>
          <button 
            onClick={() => handleToggle('profile_public')}
            className={cn("w-12 h-6 rounded-full transition-all relative flex items-center px-1", settings.profile_public ? "bg-slate-900" : "bg-slate-100")}
          >
            <div className={cn("w-4 h-4 rounded-full bg-white transition-all shadow-sm", settings.profile_public ? "ml-auto" : "ml-0")} />
          </button>
        </div>
      </div>
    </div>
  );
}
