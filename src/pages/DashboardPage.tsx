import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, User, Palette, Share2, BarChart3, Settings, 
  LogOut, ExternalLink, Copy, Check, Camera, Save,
  Sparkles, Heart, Trash2, Search, Nfc, ShoppingCart, ZoomIn, ZoomOut,
  Menu, X, ArrowRight, ChevronRight, Phone, Mail, ShieldCheck, Building2, MapPin
} from 'lucide-react';
import { auth, db, storage } from '../lib/firebase';
import { collection, doc, updateDoc, getDocs, query, where, deleteDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QRCodeCanvas } from 'qrcode.react';
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingAnimation />
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
            
            <div className="pt-2 mt-2 border-t border-slate-50">
              {profile?.username && (
                <Link 
                  to={`/${profile.username}`} 
                  target="_blank"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50/50 transition-all font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Миний eCard
                </Link>
              )}
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-500 hover:text-danger hover:bg-danger/5 transition-all w-full text-left font-medium"
              >
                <LogOut className="w-4 h-4" /> 
                Гарах
              </button>
            </div>
          </nav>
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatar_url || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { id: 'basic', label: 'Үндсэн мэдээлэл', icon: <User className="w-4 h-4" /> },
    { id: 'contact', label: 'Холбоо барих', icon: <Phone className="w-4 h-4" /> },
  ];

  useEffect(() => {
    if (!loading) {
      const { id, ...rest } = profile;
      setFormData({ ...rest });
      setPreviewUrl(profile.avatar_url || null);
    }
  }, [profile, loading]);

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
        contents: `Та мэргэжлийн дижитал нэрийн хуудасны танилцуулга бичигч байна. Дараах танилцуулгыг илүү мэргэжлийн, товч бөгөөд утга төгөлдөр болгож засаж өгнө үү. Зөвхөн зассан текстийг буцаана уу: "${formData.bio}"`
      });
      
      const improvedText = response.text;
      if (improvedText) {
        setFormData((prev: any) => ({ ...prev, bio: improvedText.trim() }));
      }
    } catch (err) {
      console.error("AI Improvement Error:", err);
      alert('AI текст засахад алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // We can handle larger files now because we will compress them
    if (file.size > 20 * 1024 * 1024) {
      alert('Зураг хэтэрхий том байна. 20MB-аас бага зураг сонгоно уу.');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert('Зөвхөн зураг сонгоно уу.');
      return;
    }

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(file));
    setSelectedFile(file);
  };

  // Removed old compressor in favor of Base64 strategy

  // THE NUCLEAR OPTION: Direct Base64 storage in Firestore (Bypasses Storage entirely)
  const compressToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const SIZE = 500; // Optimal for digital cards
          canvas.width = SIZE;
          canvas.height = SIZE;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) return reject(new Error('Canvas ctx null'));

          // Square crop center
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          
          // Draw high-quality but small
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, SIZE, SIZE);
          
          // 60% quality is perfect balance (~40KB-60KB)
          const base64 = canvas.toDataURL('image/jpeg', 0.6);
          resolve(base64);
        };
        img.onerror = () => reject(new Error('Зургийг уншихад алдаа гарлаа.'));
      };
      reader.onerror = () => reject(new Error('Файлыг уншихад алдаа гарлаа.'));
    });
  };

  const handleSave = async () => {
    if (loading) return;
    
    setLoading(true);
    setUploadProgress(10); 
    
    const safetyTimer = setTimeout(() => {
      setLoading(false);
      setUploadProgress(0);
      alert('Интернет холболт удаан байна. Дахин оролдоно уу.');
    }, 60000);

    try {
      let finalAvatarUrl = formData.avatar_url;

      if (selectedFile) {
        setUploadProgress(40);
        // Instant local transformation to string
        finalAvatarUrl = await compressToBase64(selectedFile);
        setUploadProgress(80);
      }

      // Step 2: Direct Firestore update (This will definitely work if text works)
      const profileRef = doc(db, 'profiles', profile.id);
      const sanitizedData = { ...formData };
      if ('id' in sanitizedData) delete (sanitizedData as any).id;
      
      await setDoc(profileRef, {
        ...sanitizedData,
        avatar_url: finalAvatarUrl,
        updated_at: new Date().toISOString()
      }, { merge: true });
      
      setUploadProgress(100);
      setPreviewUrl(finalAvatarUrl);
      setSelectedFile(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

    } catch (err: any) {
      console.error("SAVE ERROR:", err);
      alert(`Мэдээлэл хадгалахад алдаа гарлаа: ${err.message || 'Сүлжээгээ шалгана уу'}`);
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen font-inter">
      {/* SaaS Header Bar */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-4 z-[110] bg-white border border-[#f0f0f0] p-4 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[12px] text-[#888] font-medium mb-0.5">
              <span>Дижитал нэрийн хуудас</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#111]">Засварлагч</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-[14px] font-semibold text-[#111]">Миний eCard</h1>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success-bg border border-[#e0f0e0]">
                <div className="w-1.5 h-1.5 rounded-full bg-success-text animate-pulse" />
                <span className="text-[10px] font-bold text-success-text uppercase tracking-wider">Хадгалагдсан</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-[#888] font-medium px-2 border-r border-[#f0f0f0] mr-1">
            <Sparkles className="w-3.5 h-3.5 text-[#6366f1]" /> AI Сайжруулалт
          </div>
          <button 
            onClick={() => window.open(`/${formData.username}`, '_blank')}
            className="flex-1 sm:flex-none py-2 px-4 rounded-lg bg-white border border-[#f0f0f0] text-[#555] font-semibold text-[13px] hover:bg-[#fafafa] hover:border-[#ddd] transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Харах
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading} 
            className="flex-1 sm:flex-none py-2 px-6 rounded-lg bg-[#6366f1] text-white font-semibold text-[13px] hover:bg-[#4f46e5] transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_-4px_rgba(99,102,241,0.4)] disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                <span>Хадгалах</span>
              </div>
            )}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
        {/* Main Editor Form */}
        <div className="space-y-6">
          <div className="bg-white border border-[#f0f0f0] rounded-2xl overflow-hidden editor-container shadow-sm">
            {/* Minimal Underline Tab Navigation */}
            <div className="flex border-b border-[#f0f0f0] bg-[#fafafa]/20 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 md:flex-none px-5 py-4 text-[13px] font-semibold transition-all relative outline-none group whitespace-nowrap",
                    activeTab === tab.id 
                      ? "text-[#111]" 
                      : "text-[#888] hover:text-[#111]"
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className={cn(
                      "transition-colors", 
                      activeTab === tab.id ? "text-[#6366f1]" : "text-[#bbb] group-hover:text-[#888]"
                    )}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </div>
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#6366f1] rounded-t-full"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-8">
              {/* Identity Content */}
              {activeTab === 'basic' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col md:flex-row gap-10">
                    <div className="flex-shrink-0">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-2xl border border-[#f0f0f0] overflow-hidden bg-[#fafafa] flex items-center justify-center shadow-inner relative">
                          {previewUrl ? (
                            <img 
                              src={previewUrl} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              referrerPolicy="no-referrer" 
                            />
                          ) : (
                            <div className="text-4xl font-bold text-[#bbb]">{formData.firstname?.[0]}</div>
                          )}
                          
                          {loading && selectedFile && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                               <div className="w-8 h-8 border-2 border-[#6366f1]/20 border-t-[#6366f1] rounded-full animate-spin" />
                            </div>
                          )}

                          <label className="absolute inset-0 cursor-pointer opacity-0 group-hover:opacity-100 bg-black/40 flex flex-col items-center justify-center transition-all duration-200 z-10">
                            <Camera className="w-6 h-6 text-white mb-1.5" />
                            <span className="text-[10px] text-white font-bold uppercase tracking-widest">Зураг солих</span>
                            <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                          </label>
                        </div>
                        {selectedFile && (
                          <div className="mt-2 text-center text-[10px] text-[#6366f1] font-bold uppercase tracking-wider">
                            Шинэ зураг
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-semibold text-[#555]">Нэр</label>
                          <input 
                            name="firstname" 
                            value={formData.firstname} 
                            onChange={handleChange} 
                            placeholder="Жишээ: Дорж"
                            className="w-full bg-[#fafafa] border border-[#f0f0f0] rounded-xl py-2.5 px-4 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 text-[14px] transition-all placeholder:text-[#bbb]" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-semibold text-[#555]">Овог</label>
                          <input 
                            name="lastname" 
                            value={formData.lastname} 
                            onChange={handleChange} 
                            placeholder="Жишээ: Бат"
                            className="w-full bg-[#fafafa] border border-[#f0f0f0] rounded-xl py-2.5 px-4 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 text-[14px] transition-all placeholder:text-[#bbb]" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-semibold text-[#555]">Албан тушаал</label>
                          <input 
                            name="job_title" 
                            value={formData.job_title || ''} 
                            onChange={handleChange} 
                            placeholder="Жишээ: Ерөнхий захирал"
                            className="w-full bg-[#fafafa] border border-[#f0f0f0] rounded-xl py-2.5 px-4 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 text-[14px] transition-all placeholder:text-[#bbb]" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-semibold text-[#555]">Компани</label>
                          <input 
                            name="company" 
                            value={formData.company || ''} 
                            onChange={handleChange} 
                            placeholder="Жишээ: Тесла Моторс"
                            className="w-full bg-[#fafafa] border border-[#f0f0f0] rounded-xl py-2.5 px-4 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 text-[14px] transition-all placeholder:text-[#bbb]" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
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

                  <div className="space-y-1.5 pt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[13px] font-semibold text-[#555]">Био / Танилцуулга</label>
                      <button 
                        onClick={handleAIImprove} 
                        className="flex items-center gap-1.5 text-[11px] font-bold text-[#6366f1] hover:text-[#4f46e5] transition-colors py-1 px-2 bg-[#6366f1]/5 rounded-lg border border-[#6366f1]/10"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> ✦ AI Сайжруулах
                      </button>
                    </div>
                    <textarea 
                      name="bio" 
                      value={formData.bio || ''} 
                      onChange={handleChange} 
                      rows={4} 
                      placeholder="Өөрийн тухай товчхон..."
                      className="w-full bg-[#fafafa] border border-[#f0f0f0] rounded-2xl py-3 px-4 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 resize-none text-[14px] transition-all placeholder:text-[#bbb]" 
                    />
                  </div>
                </motion.div>
              )}
              
              {/* Contact & Social Content */}
              {activeTab === 'contact' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-[#555]">Гар утас</label>
                      <input 
                        name="phone" 
                        value={formData.phone || ''} 
                        onChange={handleChange} 
                        placeholder="+976 0000 0000" 
                        className="w-full bg-[#fafafa] border border-[#f0f0f0] rounded-xl py-2.5 px-4 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 text-[14px] transition-all placeholder:text-[#bbb]" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-[#555]">И-мэйл хаяг</label>
                      <input 
                        name="email" 
                        value={formData.email || ''} 
                        onChange={handleChange} 
                        placeholder="example@ecard.mn" 
                        className="w-full bg-[#fafafa] border border-[#f0f0f0] rounded-xl py-2.5 px-4 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 text-[14px] transition-all placeholder:text-[#bbb]" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-[#555]">Хаяг / Байршил</label>
                      <input 
                        name="address" 
                        value={formData.address || ''} 
                        onChange={handleChange} 
                        placeholder="Улаанбаатар хот, Сүхбаатар дүүрэг..." 
                        className="w-full bg-[#fafafa] border border-[#f0f0f0] rounded-xl py-2.5 px-4 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 text-[14px] transition-all placeholder:text-[#bbb]" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-[#555]">Google Maps Холбоос</label>
                      <input 
                        name="maps_url" 
                        value={formData.maps_url || ''} 
                        onChange={handleChange} 
                        placeholder="https://maps.google.com/..." 
                        className="w-full bg-[#fafafa] border border-[#f0f0f0] rounded-xl py-2.5 px-4 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 text-[14px] transition-all placeholder:text-[#bbb]" 
                      />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-[#f0f0f0]">
                    <div className="flex items-center gap-2 mb-6">
                      <Share2 className="w-4 h-4 text-[#6366f1]" />
                      <h4 className="text-[13px] font-bold text-[#111] uppercase tracking-wider">Олон нийтийн сүлжээ</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {['linkedin', 'facebook', 'instagram', 'twitter', 'youtube'].map((key) => (
                        <div key={key} className="space-y-1.5">
                          <label className="text-[13px] font-semibold text-[#555] capitalize">{key}</label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bbb] group-focus-within:text-[#6366f1] transition-colors">
                              <Share2 className="w-4 h-4" />
                            </div>
                            <input 
                              name={key} 
                              value={(formData as any)[key] || ''} 
                              onChange={handleChange} 
                              placeholder={`https://${key}.com/your-profile`}
                              className="w-full bg-[#fafafa] border border-[#f0f0f0] rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 text-[14px] transition-all placeholder:text-[#bbb]" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: High Fidelity Preview & Design Controls */}
        <aside className="sticky top-24 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[13px] font-semibold text-[#111] flex items-center gap-2">
                Урьдчилан харах
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-wider">
                  Live
                </div>
              </h3>
            </div>
            
            <div className="relative group overflow-visible">
              <div 
                className={cn(
                  "relative w-full min-h-[260px] h-auto rounded-[32px] p-8 overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] transition-all duration-500 flex flex-col justify-between hover:translate-y-[-4px]",
                  formData.card_pattern || 'pattern-none'
                )}
                style={{ 
                  background: formData.card_color?.startsWith('linear') ? formData.card_color : undefined,
                  backgroundColor: !formData.card_color?.startsWith('linear') ? (formData.card_color || '#0d1530') : undefined 
                }}
              >
                {/* Pattern Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start gap-5">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/10 border border-white/10 shadow-xl backdrop-blur-md shrink-0 flex items-center justify-center">
                      {previewUrl ? (
                         <img src={previewUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-3xl font-bold opacity-30" style={{ color: formData.card_text_color }}>
                          {formData.firstname?.[0] || 'E'}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-1 min-w-0">
                      <div className="flex items-center justify-end gap-1.5 mb-0.5 flex-wrap">
                        <h4 className="text-[18px] font-bold tracking-tight leading-none break-words" style={{ color: formData.card_text_color }}>
                          {formData.lastname || ''} {formData.firstname || 'Нэр'}
                        </h4>
                        {profile.verified && <ShieldCheck className="w-4 h-4 text-aurora-cyan shrink-0" />}
                      </div>
                      <p className="text-[11px] font-medium opacity-80 uppercase tracking-wider truncate" style={{ color: formData.card_text_color }}>
                        {formData.job_title || 'Албан тушаал'}
                      </p>
                      {formData.company && (
                        <p className="text-[10px] mt-1 flex items-center justify-end gap-1 font-medium opacity-70" style={{ color: formData.card_text_color }}>
                          <Building2 className="w-3 h-3" /> {formData.company}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-end gap-4 mt-8">
                    <div className="space-y-1.5 flex-1">
                      {formData.phone && (
                        <div className="flex items-center gap-2 text-[10px] opacity-90" style={{ color: formData.card_text_color }}>
                          <Phone className="w-3.5 h-3.5 text-aurora-cyan shrink-0" /> {formData.phone}
                        </div>
                      )}
                      {formData.email && (
                        <div className="flex items-center gap-2 text-[10px] opacity-90" style={{ color: formData.card_text_color }}>
                          <Mail className="w-3.5 h-3.5 text-aurora-cyan shrink-0" /> <span className="truncate">{formData.email}</span>
                        </div>
                      )}
                      {formData.address && (
                        <div className="flex items-center gap-2 text-[10px] opacity-90" style={{ color: formData.card_text_color }}>
                          <MapPin className="w-3.5 h-3.5 text-aurora-cyan shrink-0" /> <span className="truncate">{formData.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 p-1.5 bg-white rounded-xl shadow-xl flex items-center justify-center">
                      <QRCodeCanvas value={`https://ecard.mn/${formData.username}`} size={60} level="M" />
                    </div>
                  </div>
                </div>

                {/* Decorative glow */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
              </div>
            </div>
          </div>

          {/* Design & Color Section relocated below Preview */}
          <div className="bg-white border border-[#f0f0f0] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#f0f0f0] bg-[#fafafa]/50 flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#6366f1]" />
              <h3 className="text-[13px] font-bold text-[#111] uppercase tracking-wider">Загвар & Өнгө</h3>
            </div>
            
            <div className="p-6 space-y-8">
              <div className="space-y-3">
                <label className="text-[12px] font-semibold text-[#888] uppercase tracking-widest">Үндсэн өнгөнүүд</label>
                <div className="flex flex-wrap gap-2.5">
                  {presets.map(p => (
                    <button 
                      key={p.color} 
                      onClick={() => setFormData((prev: any) => ({ ...prev, card_color: p.color }))}
                      title={p.name}
                      className={cn(
                        "w-6 h-6 rounded-full border transition-all duration-200 hover:scale-110",
                        formData.card_color === p.color ? "ring-2 ring-[#6366f1] ring-offset-2 border-transparent scale-110" : "border-[#f0f0f0]"
                      )}
                      style={{ backgroundColor: p.color }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[12px] font-semibold text-[#888] uppercase tracking-widest">Фон</label>
                  <div className="relative group">
                    <input 
                      type="color" 
                      value={formData.card_color.startsWith('linear') ? '#0f172a' : (formData.card_color || '#0d1530')} 
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, card_color: e.target.value }))} 
                      className="absolute inset-0 w-full h-10 opacity-0 cursor-pointer z-10" 
                    />
                    <div className="w-full h-10 rounded-xl border border-[#f0f0f0] flex items-center justify-between px-3 bg-[#fafafa] group-hover:bg-white transition-colors">
                      <div className="w-4 h-4 rounded-sm border border-black/5" style={{ backgroundColor: formData.card_color.startsWith('linear') ? '#0f172a' : (formData.card_color || '#0d1530') }} />
                      <span className="text-[10px] font-mono font-bold text-[#555]">{formData.card_color.startsWith('linear') ? '#LIN' : (formData.card_color || '#0D1530').toUpperCase().substring(0, 7)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-semibold text-[#888] uppercase tracking-widest">Текст</label>
                  <div className="relative group">
                    <input 
                      type="color" 
                      value={formData.card_text_color || '#c9a84c'} 
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, card_text_color: e.target.value }))} 
                      className="absolute inset-0 w-full h-10 opacity-0 cursor-pointer z-10" 
                    />
                    <div className="w-full h-10 rounded-xl border border-[#f0f0f0] flex items-center justify-between px-3 bg-[#fafafa] group-hover:bg-white transition-colors">
                      <div className="w-4 h-4 rounded-sm border border-black/5" style={{ backgroundColor: formData.card_text_color || '#c9a84c' }} />
                      <span className="text-[10px] font-mono font-bold text-[#555]">{(formData.card_text_color || '#C9A84C').toUpperCase().substring(0, 7)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[12px] font-semibold text-[#888] uppercase tracking-widest">Градиент</label>
                <div className="grid grid-cols-3 gap-2">
                  {gradients.map(g => (
                    <button 
                      key={g.color} 
                      onClick={() => setFormData((prev: any) => ({ ...prev, card_color: g.color }))}
                      className={cn(
                        "h-8 rounded-lg border transition-all duration-200",
                        formData.card_color === g.color ? "ring-2 ring-[#6366f1] ring-offset-2 border-transparent" : "border-[#f0f0f0]"
                      )}
                      style={{ background: g.color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[12px] font-semibold text-[#888] uppercase tracking-widest">Хээ</label>
                <div className="grid grid-cols-3 gap-2">
                  {patterns.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setFormData((prev: any) => ({ ...prev, card_pattern: p.id }))}
                      className={cn(
                        "py-2 rounded-xl border text-[10px] font-bold transition-all",
                        formData.card_pattern === p.id 
                          ? "bg-[#111] border-[#111] text-white" 
                          : "bg-[#fafafa] border-[#f0f0f0] text-[#555] hover:border-[#ddd]"
                      )}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
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
      <div className="w-8 h-8 border-2 border-[#6366f1]/20 border-t-[#6366f1] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-inter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[#111]">Хадгалсан eCard</h1>
          <p className="text-[13px] text-[#888] mt-1">Таны хадгалсан нэрийн хуудсууд.</p>
        </div>
      </div>
      
      {savedCards.length === 0 ? (
        <div className="bg-white border border-[#f0f0f0] p-16 rounded-xl text-center">
          <Heart className="w-12 h-12 text-[#f0f0f0] mx-auto mb-4" />
          <p className="text-[#bbb] text-[14px] font-medium">Танд хадгалсан нэрийн хуудас байхгүй байна.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedCards.map((card: any) => (
            <div key={card.save_id} className="bg-white border border-[#f0f0f0] p-6 rounded-xl group transition-all duration-300 hover:border-[#ddd] hover:shadow-xl hover:shadow-black/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-[#fafafa] border border-[#f0f0f0] flex items-center justify-center text-[#111] font-bold overflow-hidden">
                  {card.avatar_url ? <img src={card.avatar_url} className="w-full h-full object-cover" /> : (card.firstname || 'U')[0]}
                </div>
                <div>
                  <h4 className="font-semibold text-[#111] text-[14px]">{card.firstname || 'Тодорхойгүй'} {card.lastname || ''}</h4>
                  <p className="text-[11px] text-[#888] font-medium truncate max-w-[150px]">{card.job_title || 'Мэргэжилгүй'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link 
                  to={`/${card.username}`} 
                  target="_blank"
                  className="flex-1 py-2 rounded-lg bg-[#111] text-white text-center text-[12px] font-semibold transition-all hover:bg-black"
                >
                  Профайл харах
                </Link>
                <button 
                  onClick={() => removeSaved(card.save_id)}
                  className="p-2 rounded-lg bg-[#fafafa] border border-[#f0f0f0] text-[#888] hover:text-red-500 hover:border-red-500/20 hover:bg-red-50 transition-all"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-inter">
      <div>
        <h1 className="text-[18px] font-semibold text-[#111]">Аналитик</h1>
        <p className="text-[13px] text-[#888] mt-1">Таны нэрийн хуудасны хандалтын мэдээлэл.</p>
      </div>

      <div className="bg-white border border-[#f0f0f0] p-16 rounded-xl text-center editor-container">
        <div className="w-14 h-14 bg-[#fafafa] border border-[#f0f0f0] rounded-xl flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-6 h-6 text-[#bbb]" />
        </div>
        <h3 className="text-[16px] font-semibold text-[#111] mb-2">Дэлгэрэнгүй аналитик</h3>
        <p className="text-[#888] text-[13px] max-w-sm mx-auto leading-relaxed">
          Энэ хэсэг одоогоор туршилтын шатанд байна. Pro хэрэглэгчид удахгүй хандалтын нарийвчилсан статистик авах боломжтой болно.
        </p>
        <button className="mt-8 bg-[#6366f1] text-white px-8 py-2.5 rounded-lg font-semibold text-[13px] hover:bg-[#4f46e5] transition-all shadow-[0_4px_12px_-4px_rgba(99,102,241,0.4)]">
          Pro болох
        </button>
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
    
    const matchesField = selectedField === 'Бүгд' || 
                         p.category === selectedField || 
                         p.field === selectedField;
                         
    return matchesSearch && matchesField;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-inter">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[18px] font-semibold text-[#111]">Лавлах</h1>
          <p className="text-[13px] text-[#888] mt-1">Олон нийтэд нээлттэй нэрийн хуудсууд.</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bbb] w-4 h-4 group-focus-within:text-[#6366f1]" />
          <input 
            placeholder="Хүн эсвэл компани хайх..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#f0f0f0] rounded-lg py-2.5 pl-11 pr-4 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 text-[13px] transition-all placeholder:text-[#bbb]" 
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 py-2">
        {fields.map(f => (
          <button 
            key={f} 
            onClick={() => setSelectedField(f)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all", 
              selectedField === f ? "bg-[#111] text-white shadow-xl" : "bg-white border border-[#f0f0f0] text-[#555] hover:border-[#ddd]"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
           <div className="w-8 h-8 border-2 border-[#6366f1]/20 border-t-[#6366f1] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <Link key={p.id} to={`/${p.username}`} className="bg-white border border-[#f0f0f0] p-5 rounded-xl transition-all duration-300 hover:border-[#ddd] hover:shadow-xl hover:shadow-black/5 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#fafafa] border border-[#f0f0f0] flex items-center justify-center shrink-0">
                {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : <div className="text-xl font-bold text-[#bbb]">{p.firstname[0]}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#111] text-[14px] truncate">{p.lastname} {p.firstname}</h3>
                <p className="text-[11px] text-[#888] font-medium truncate">{p.job_title || 'Мэргэжилгүй'}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#bbb] group-hover:text-[#6366f1] transition-colors" />
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-inter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[#111]">NFC Tag захиалах</h1>
          <p className="text-[13px] text-[#888] mt-1">Карт болон наалт захиалж илүү хялбараар мэдээллээ хуваалцаарай.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div 
            key={product.id}
            className="bg-white border border-[#f0f0f0] rounded-xl overflow-hidden group hover:border-[#ddd] hover:shadow-xl hover:shadow-black/5 transition-all duration-300"
          >
            <div className="aspect-square overflow-hidden relative bg-[#fafafa]">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[12px] font-bold text-[#111] shadow-sm">
                {product.price}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <button className="w-full bg-[#111] text-white py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 shadow-xl">
                  <ShoppingCart className="w-4 h-4" /> Сагсанд нэмэх
                </button>
              </div>
            </div>
            <div className="p-6 space-y-2">
              <h3 className="text-[15px] font-semibold text-[#111] truncate">{product.name}</h3>
              <p className="text-[12px] text-[#888] leading-relaxed line-clamp-2">{product.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#fafafa] border border-[#f0f0f0] p-8 rounded-xl flex flex-col md:flex-row items-center gap-8 editor-container">
        <div className="w-14 h-14 rounded-xl bg-[#6366f1] flex items-center justify-center shrink-0 shadow-[0_4px_12px_-4px_rgba(99,102,241,0.4)]">
          <Nfc className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 space-y-1 text-center md:text-left">
          <h3 className="text-[16px] font-semibold text-[#111]">NFC гэж юу вэ?</h3>
          <p className="text-[#888] text-[13px] max-w-2xl leading-relaxed">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-inter">
      <div>
        <h1 className="text-[18px] font-semibold text-[#111]">Тохиргоо</h1>
        <p className="text-[13px] text-[#888] mt-1">Таны бүртгэлийн болон харагдах байдлын тохиргоо.</p>
      </div>
      
      <div className="bg-white border border-[#f0f0f0] rounded-xl overflow-hidden editor-container p-8 space-y-8">
        <div className="flex items-center justify-between p-4 bg-[#fafafa] rounded-xl border border-[#f0f0f0]">
          <div>
            <h3 className="text-[14px] font-semibold text-[#111] mb-1">Нийтийн лавлахад харагдах</h3>
            <p className="text-[12px] text-[#888]">Таны профайл Директор хэсэгт бусад хэрэглэгчдэд харагдах болно.</p>
          </div>
          <button 
            onClick={() => handleToggle('show_in_directory')}
            className={cn(
              "w-11 h-6 rounded-full transition-all relative flex items-center px-1", 
              settings.show_in_directory ? "bg-[#6366f1]" : "bg-[#f0f0f0]"
            )}
          >
            <div className={cn("w-4 h-4 rounded-full bg-white transition-all shadow-sm", settings.show_in_directory ? "translate-x-5" : "translate-x-0")} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#fafafa] rounded-xl border border-[#f0f0f0]">
          <div>
            <h3 className="text-[14px] font-semibold text-[#111] mb-1">Профайл нээлттэй байх</h3>
            <p className="text-[12px] text-[#888]">Таны нэрийн хуудсыг холбоосоор шууд харах боломжтой байна.</p>
          </div>
          <button 
            onClick={() => handleToggle('profile_public')}
            className={cn(
              "w-11 h-6 rounded-full transition-all relative flex items-center px-1", 
              settings.profile_public ? "bg-[#6366f1]" : "bg-[#f0f0f0]"
            )}
          >
            <div className={cn("w-4 h-4 rounded-full bg-white transition-all shadow-sm", settings.profile_public ? "translate-x-5" : "translate-x-0")} />
          </button>
        </div>

        <div className="pt-8 border-t border-[#f0f0f0]">
           <div className="bg-red-50/50 border border-red-100 p-6 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-semibold text-red-600 mb-1">Бүртгэл устгах</h3>
                <p className="text-[12px] text-red-500/70">Таны мэдээлэл бүрмөсөн устахыг анхаарна уу.</p>
              </div>
              <button disabled className="px-6 py-2 rounded-lg bg-red-100 text-red-600 text-[12px] font-bold opacity-50 cursor-not-allowed">
                Устгах
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
