import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, User, Palette, Share2, BarChart3, Settings, 
  LogOut, ExternalLink, Copy, Check, Camera, Save,
  Sparkles, Heart, Trash2, Search, Nfc, ShoppingCart, ZoomIn, ZoomOut,
  Menu, X, ArrowRight, ChevronRight, Phone, Mail, ShieldCheck, Building2, MapPin,
  Edit2, AlertCircle
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

  const handleShare = async () => {
    const shareData = {
      title: `${profile?.firstname} ${profile?.lastname} - Digital Business Card`,
      text: `${profile?.job_title} | Digital Business Card`,
      url: `${window.location.origin}/${profile?.username}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopy();
      }
    } catch (err) {
      console.error('Share failed:', err);
      handleCopy();
    }
  };

  const menuItems = [
    { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Хяналтын самбар', path: '/dashboard' },
    { icon: <User className="w-4 h-4" />, label: 'Миний eCard', path: '/dashboard/my-ecard' },
    { icon: <Nfc className="w-4 h-4" />, label: 'NFC захиалах', path: '/dashboard/nfc' },
    { icon: <Heart className="w-4 h-4" />, label: 'Хадгалсан', path: '/dashboard/saved', count: 12 },
    { icon: <Search className="w-4 h-4" />, label: 'Лавлах', path: '/dashboard/directory' },
    { icon: <Settings className="w-4 h-4" />, label: 'Тохиргоо', path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] relative flex flex-col antialiased font-sans">
      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 z-[100] flex items-center justify-between px-6 shadow-sm">
        <Logo size="sm" />
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 text-slate-500 hover:text-aurora-blue transition-colors bg-slate-50 rounded-xl"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex flex-1 relative pt-16 lg:pt-0">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:sticky lg:top-0 inset-y-0 left-0 z-[120] w-72 flex flex-col bg-white border-r border-slate-100 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform lg:translate-x-0 outline-none shadow-2xl lg:shadow-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="px-8 py-10 hidden lg:block">
            <Link to="/">
              <Logo size="md" />
            </Link>
          </div>

          <div className="flex-1 px-4 space-y-1 mt-6 lg:mt-0">
            <div className="px-4 mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Үндсэн</p>
            </div>
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path!}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] transition-all duration-300 group",
                  location.pathname === item.path 
                    ? "bg-aurora-blue text-white shadow-xl shadow-aurora-blue/25 font-bold scale-[1.02]" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "transition-transform duration-300 group-hover:scale-110",
                    location.pathname === item.path ? "text-white" : "text-slate-400 group-hover:text-aurora-blue"
                  )}>
                    {item.icon}
                  </span>
                  {item.label}
                </div>
                {item.count && (
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-full",
                    location.pathname === item.path ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    {item.count}
                  </span>
                )}
              </Link>
            ))}
            
            <div className="pt-8 mt-8 border-t border-slate-50 px-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Бүртгэл</p>
              <div className="space-y-1">
                {profile?.username && (
                  <Link 
                    to={`/${profile.username}`} 
                    target="_blank"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    Миний eCard
                  </Link>
                )}
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] text-slate-500 hover:text-danger-custom hover:bg-danger-custom/5 transition-all w-full text-left font-bold"
                >
                  <LogOut className="w-4 h-4 text-slate-400" /> 
                  Системээс гарах
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Pro Card */}
          <div className="p-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-aurora-blue/20 rounded-full -mr-16 -mt-16 blur-2xl" />
              <p className="relative z-10 text-white font-black text-sm mb-1 tracking-tight">Pro Болох</p>
              <p className="relative z-10 text-slate-400 text-[10px] mb-4 font-medium leading-relaxed">Дэлгэрэнгүй аналитик болон бүх хээг ашиглах.</p>
              <button className="relative z-10 w-full py-2 bg-aurora-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-aurora-indigo transition-colors shadow-lg shadow-aurora-blue/20">Шинэчлэх</button>
            </div>
          </div>
        </aside>

        {/* Backdrop for Mobile */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-slate-900/10 z-[110] backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 w-full min-h-screen relative overflow-x-hidden">
          <div className="p-6 sm:p-10 lg:p-12 max-w-[1400px] mx-auto w-full">
            {profile ? (
              <div className="animate-in fade-in duration-700">
                <Routes>
                  <Route path="/" element={<Overview profile={profile} handleCopy={handleCopy} handleShare={handleShare} copied={copied} />} />
                  <Route path="my-ecard" element={<MyECard profile={profile} />} />
                  <Route path="saved" element={<SavedCards user={user} />} />
                  <Route path="directory" element={<DirectoryView />} />
                  <Route path="nfc" element={<NfcShop />} />
                  <Route path="analytics" element={<Analytics profile={profile} />} />
                  <Route path="settings" element={<AccountSettings profile={profile} />} />
                </Routes>
              </div>
            ) : (
              <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-aurora-blue rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Мэдээлэл ачаалж байна</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Overview({ profile, handleCopy, handleShare, copied }: any) {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [isChecking, setIsChecking] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const validateUsername = (val: string) => {
    const latinRegex = /^[a-z0-9-]+$/;
    if (!val) return 'Нэр хоосон байж болохгүй';
    if (!latinRegex.test(val)) return 'Зөвхөн латин жижиг үсэг, тоо болон зураас ашиглана уу';
    if (val.length < 3) return 'Хамгийн багадаа 3 тэмдэгт';
    return '';
  };

  const handleUsernameSave = async () => {
    const error = validateUsername(newUsername);
    if (error) {
      setUsernameError(error);
      return;
    }

    if (newUsername === profile.username) {
      setIsEditingUsername(false);
      return;
    }

    setIsChecking(true);
    setUsernameError('');

    try {
      // Check for uniqueness
      const q = query(collection(db, 'profiles'), where('username', '==', newUsername));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setUsernameError('Энэ нэр аль хэдийн авсан байна. Өөр нэр сонгоно уу.');
        setIsChecking(false);
        return;
      }

      // Update profile
      const profileRef = doc(db, 'profiles', profile.id);
      await updateDoc(profileRef, {
        username: newUsername,
        updated_at: new Date().toISOString()
      });

      setUpdateSuccess(true);
      setIsEditingUsername(false);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error("Username update error:", err);
      setUsernameError('Алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setIsChecking(false);
    }
  };

  const chartData = [
    { name: 'Да', views: 42, scans: 12 },
    { name: 'Мя', views: 35, scans: 8 },
    { name: 'Лх', views: 65, scans: 15 },
    { name: 'Пү', views: 50, scans: 10 },
    { name: 'Ба', views: 95, scans: 22 },
    { name: 'Бя', views: 30, scans: 5 },
    { name: 'Ня', views: 20, scans: 4 },
  ];

  const stats = [
    { label: 'Нийт үзэлт', value: profile?.view_count || 0, trend: '+12%', icon: <ZoomIn className="w-4 h-4 text-aurora-blue" />, color: 'bg-aurora-blue/10' },
    { label: 'QR скан', value: profile?.qr_scan_count || 0, trend: '+8%', icon: <Search className="w-4 h-4 text-aurora-magenta" />, color: 'bg-aurora-magenta/10' },
    { label: 'Хадгалалт', value: 24, trend: '+5%', icon: <Heart className="w-4 h-4 text-danger-custom" />, color: 'bg-danger-custom/10' },
    { label: 'Хөрвүүлэлт', value: '42%', trend: '+2%', icon: <Sparkles className="w-4 h-4 text-aurora-cyan" />, color: 'bg-aurora-cyan/10' },
  ];

  const recentActivity = [
    { id: 1, type: 'view', user: 'Шинэ зочин', time: '2 минутын өмнө', detail: 'Улаанбаатар хотоос хандсан' },
    { id: 2, type: 'save', user: 'А. Бат-Эрдэнэ', time: '1 цагийн өмнө', detail: 'Нэрийн хуудсыг хадгаллаа' },
    { id: 3, type: 'scan', user: 'Шинэ скан', time: '3 цагийн өмнө', detail: 'NFC картаар дамжуулсан' },
  ];

  return (
    <div className="space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome & Profile Header */}
      <div className="bg-white border border-[#f0f0f0] p-6 sm:p-10 rounded-[32px] shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-aurora-blue/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-aurora-magenta/5 transition-colors duration-1000" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-white border-2 border-slate-100 shadow-xl relative group/avatar">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-200 bg-slate-50 uppercase">
                  {profile?.firstname?.[0]}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                <Link to="/dashboard/my-ecard" className="text-white text-[10px] font-bold uppercase tracking-widest border border-white/30 px-3 py-1.5 rounded-full backdrop-blur-sm">Засах</Link>
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Сайн байна уу, <span className="text-aurora-blue">{profile?.firstname}</span>! 👋
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 shrink-0 relative">
                  {isEditingUsername ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        value={newUsername}
                        onChange={(e) => {
                          setNewUsername(e.target.value.toLowerCase());
                          setUsernameError('');
                        }}
                        className={cn(
                          "bg-white border text-[10px] font-mono px-2 py-0.5 rounded outline-none w-32",
                          usernameError ? "border-danger-custom" : "border-slate-200 focus:border-aurora-blue"
                        )}
                        placeholder="шинэ-нэр"
                        autoFocus
                      />
                      <button 
                        onClick={handleUsernameSave}
                        disabled={isChecking}
                        className="text-success-text hover:text-success-text/80 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          setIsEditingUsername(false);
                          setNewUsername(profile.username);
                          setUsernameError('');
                        }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {usernameError && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-danger-custom p-2 rounded-lg shadow-xl z-50 flex items-center gap-2 min-w-[200px]">
                          <AlertCircle className="w-3 h-3 text-danger-custom" />
                          <p className="text-[9px] text-danger-custom font-bold">{usernameError}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <span className="text-[10px] text-slate-400 font-mono tracking-wider font-bold">
                        ecard.mn/<span className="text-slate-900">{profile?.username}</span>
                      </span>
                      <div className="flex items-center gap-1 border-l border-slate-200 ml-1 pl-1.5">
                        <button onClick={handleCopy} className="text-slate-300 hover:text-aurora-blue transition-colors p-0.5">
                          {copied ? <Check className="w-3 h-3 text-success-text" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <button onClick={() => setIsEditingUsername(true)} className="text-slate-300 hover:text-aurora-blue transition-colors p-0.5">
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                  {updateSuccess && (
                    <motion.span 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-6 left-0 text-[9px] font-black text-success-text uppercase"
                    >
                      Амжилттай шинэчлэгдлээ
                    </motion.span>
                  )}
                </div>
                <div className="px-3 py-1 rounded-full bg-aurora-blue text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-aurora-blue/20">
                  {profile?.plan || 'PRO'} PLAN
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Link to="/dashboard/my-ecard" className="flex-1 lg:flex-none btn-aurora py-3 px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl">
              <Sparkles className="w-4 h-4" /> eCard засах
            </Link>
            <button 
              onClick={handleShare}
              className="flex-1 lg:flex-none py-3 px-6 rounded-2xl bg-white border border-[#f0f0f0] text-[#111] font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Хуваалцах
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-[#f0f0f0] p-6 rounded-[24px] shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", stat.color)}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-black text-success-text bg-success-bg px-2 py-0.5 rounded-full">{stat.trend}</span>
            </div>
            <p className="text-[11px] uppercase font-bold text-slate-400 tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
        {/* Analytics Chart */}
        <div className="bg-white border border-[#f0f0f0] p-8 rounded-[32px] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Долоо хоногийн үзүүлэлт</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-aurora-blue" />
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">ҮЗЭЛТ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-aurora-magenta" />
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">СКАН</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '16px', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }}
                  labelStyle={{ fontWeight: 800, fontSize: '10px', color: '#111', marginBottom: '4px', textTransform: 'uppercase' }}
                />
                <Bar dataKey="views" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="scans" fill="#d946ef" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-[#f0f0f0] p-8 rounded-[32px] shadow-sm flex flex-col">
          <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Сүүлийн үйлдэл</h3>
          <div className="space-y-6 flex-1">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-4 group cursor-pointer border-b border-slate-50 pb-6 last:border-0 last:pb-0">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  activity.type === 'view' ? 'bg-blue-50 text-blue-500' :
                  activity.type === 'save' ? 'bg-pink-50 text-pink-500' : 'bg-cyan-50 text-cyan-500'
                )}>
                  {activity.type === 'view' ? <ZoomIn className="w-4 h-4" /> :
                   activity.type === 'save' ? <Heart className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-[13px] font-bold text-slate-900 truncate">{activity.user}</p>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider whitespace-nowrap">{activity.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">{activity.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 text-[11px] font-bold text-aurora-blue uppercase tracking-widest hover:text-aurora-magenta transition-colors">Бүгдийг харах →</button>
        </div>
      </div>

      {/* Upgrade Banner */}
      <div className="bg-slate-900 p-8 rounded-[32px] relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-aurora-blue/20 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-aurora-magenta/20 transition-all duration-1000" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aurora-blue/20 border border-aurora-blue/30 text-aurora-blue text-[10px] font-bold uppercase tracking-widest mb-2">
              Шинэ боломж
            </div>
            <h4 className="text-xl font-black text-white tracking-tight">Өөрийн NFC картаа захиалж амжсан уу?</h4>
            <p className="text-slate-400 text-sm font-medium">Ганц хүрэлтээр мэдээллээ хуваалцаж, бусдад мартагдашгүй сэтгэгдэл төрүүл.</p>
          </div>
          <Link to="/dashboard/nfc" className="w-full md:w-auto px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 hover:scale-105 transition-all shadow-xl shimmer-sweep">Одоо захиалах</Link>
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
                   className="space-y-6"
                >
                  {/* Avatar Upload Redesign */}
                  <div className="flex items-start gap-8 px-2">
                    <div className="w-32 h-32 rounded-2xl bg-[#6366f1] flex items-center justify-center text-white text-4xl font-bold relative overflow-hidden shadow-sm">
                      {previewUrl ? (
                         <img 
                           src={previewUrl} 
                           className="w-full h-full object-cover"
                           referrerPolicy="no-referrer" 
                         />
                      ) : (
                        formData.firstname?.[0] || 'Б'
                      )}
                      {loading && selectedFile && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                           <div className="w-8 h-8 border-2 border-[#6366f1]/20 border-t-[#6366f1] rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-6">
                      <div className="flex items-center gap-3 text-[14px] font-semibold">
                        <label className="text-[#6366f1] hover:text-[#4f46e5] cursor-pointer transition-colors">
                          Зураг солих
                          <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                        </label>
                        <span className="text-[#bbb]">·</span>
                        <button 
                          onClick={() => {
                            setPreviewUrl(null);
                            setSelectedFile(null);
                            setFormData((prev: any) => ({ ...prev, avatar_url: '' }));
                          }}
                          className="text-[#888] hover:text-[#555] transition-colors"
                        >
                          Устгах
                        </button>
                      </div>
                      <p className="text-[12px] text-[#bbb] mt-2 font-medium">JPG, PNG · хамгийн ихдээ 2MB</p>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-2">
                      <label className="text-[14px] font-semibold text-[#888]">Овог</label>
                      <input 
                        name="lastname" 
                        value={formData.lastname} 
                        onChange={handleChange} 
                        placeholder="Жишээ: Лхагвасүрэн"
                        className="w-full bg-white border border-[#f0f0f0] rounded-xl py-3 px-4 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 text-[15px] transition-all placeholder:text-[#bbb] font-medium" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[14px] font-semibold text-[#888]">Нэр</label>
                      <input 
                        name="firstname" 
                        value={formData.firstname} 
                        onChange={handleChange} 
                        placeholder="Жишээ: Болор-Эрдэнэ"
                        className="w-full bg-white border border-[#6366f1]/20 ring-1 ring-[#6366f1]/5 rounded-xl py-3 px-4 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 text-[15px] transition-all placeholder:text-[#bbb] font-medium" 
                      />
                    </div>
                  </div>

                  {/* Work Info Section */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-2">
                        <label className="text-[14px] font-semibold text-[#888]">Албан тушаал</label>
                        <input 
                          name="job_title" 
                          value={formData.job_title || ''} 
                          onChange={handleChange} 
                          placeholder="Жишээ: Захирал"
                          className="w-full bg-[#fafafa]/50 border border-[#f0f0f0] rounded-xl py-3 px-4 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 text-[15px] transition-all placeholder:text-[#bbb] font-medium" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[14px] font-semibold text-[#888]">Компани</label>
                        <input 
                          name="company" 
                          value={formData.company || ''} 
                          onChange={handleChange} 
                          placeholder="Жишээ: Cornerstone AI"
                          className="w-full bg-[#fafafa]/50 border border-[#f0f0f0] rounded-xl py-3 px-4 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 text-[15px] transition-all placeholder:text-[#bbb] font-medium" 
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <CategorySelector 
                        value={formData.category || ''} 
                        onChange={(val) => setFormData((prev: any) => ({ ...prev, category: val }))}
                        required
                      />
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#f0f0f0]/60 pb-2">
                      <h3 className="text-[14px] font-bold text-[#111]">Ур чадвар / Үйлчилгээ</h3>
                    </div>
                    <SkillsInput 
                      skills={formData.skills || []}
                      onChange={(val) => setFormData((prev: any) => ({ ...prev, skills: val }))}
                      suggestions={SKILLS_SUGGESTIONS}
                    />
                  </div>

                  {/* Bio Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#f0f0f0]/60 pb-2">
                      <h3 className="text-[14px] font-bold text-[#111]">Танилцуулга</h3>
                      <button 
                        onClick={handleAIImprove} 
                        className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#6366f1] hover:bg-[#4f46e5] transition-colors py-1.5 px-3 rounded-lg shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> AI Сайжруулах
                      </button>
                    </div>
                    <textarea 
                      name="bio" 
                      value={formData.bio || ''} 
                      onChange={handleChange} 
                      rows={4} 
                      placeholder="Өөрийн тухай товчхон..."
                      className="w-full bg-white border border-[#f0f0f0] rounded-2xl py-4 px-5 outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/10 resize-none text-[15px] transition-all placeholder:text-[#bbb] font-medium leading-relaxed" 
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
          <div className="space-y-4 pt-1">
            <div className="relative group overflow-visible">
              <div 
                className={cn(
                  "relative w-full min-h-[260px] h-auto rounded-[32px] p-8 overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.25)] transition-all duration-500 flex flex-col justify-between hover:translate-y-[-4px] z-0",
                  formData.card_pattern || 'pattern-none'
                )}
                style={{ 
                  backgroundColor: !formData.card_color?.startsWith('linear') ? (formData.card_color || '#0d1530') : 'transparent',
                  backgroundImage: formData.card_color?.startsWith('linear') ? formData.card_color : 'none'
                }}
              >
                {/* Pattern Overlay with enhanced visibility */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-[1]" />
                
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
                      <div className="flex items-center justify-end gap-1.5 mb-1 flex-wrap">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] sm:text-[12px] font-normal opacity-70 uppercase tracking-widest" style={{ color: formData.card_text_color }}>
                            {formData.lastname || ''}
                          </span>
                          <h4 className="text-[11px] sm:text-[14px] font-bold uppercase tracking-wider -mt-0.5" style={{ color: formData.card_text_color }}>
                            {formData.firstname || 'Нэр'}
                          </h4>
                        </div>
                        {profile.verified && <ShieldCheck className="w-4 h-4 text-aurora-cyan shrink-0" />}
                      </div>
                      <p className="text-[11px] font-medium opacity-80 uppercase tracking-wider truncate mt-1" style={{ color: formData.card_text_color }}>
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
