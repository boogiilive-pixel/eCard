import { Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, User, LogOut, LayoutDashboard, ShieldCheck, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

export default function Navbar() {
  const { user, profile, isAdmin, isCompanyAdmin } = useFirebase();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b",
      isScrolled 
        ? "bg-aurora-blue/95 backdrop-blur-xl border-white/10 shadow-lg py-3" 
        : "bg-white/80 backdrop-blur-xl border-slate-100 py-5"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-10 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <Logo size="md" className={cn("transition-all", isScrolled && "brightness-0 invert")} />
          </Link>

          {/* Desktop Nav */}
          <div className={cn(
            "hidden md:flex items-center space-x-8 uppercase tracking-widest text-[10px] font-black",
            isScrolled ? "text-white/80" : "text-slate-600"
          )}>
            <Link to="/directory" className={cn("hover:text-aurora-magenta transition-colors", isScrolled && "hover:text-white")}>Лавлах</Link>
            {user ? (
              <div className="flex items-center space-x-6">
                {isAdmin && (
                  <Link to="/admin" className={cn("hover:text-aurora-magenta transition-colors flex items-center gap-2", isScrolled && "hover:text-white")}>
                    <ShieldCheck className="w-3.5 h-3.5" /> Админ
                  </Link>
                )}
                {isCompanyAdmin && (
                  <Link to="/company" className={cn("hover:text-aurora-magenta transition-colors flex items-center gap-2", isScrolled && "hover:text-white")}>
                    <Building2 className="w-3.5 h-3.5" /> Байгууллага
                  </Link>
                )}
                <Link to="/dashboard" className={cn("hover:text-aurora-magenta transition-colors flex items-center gap-2", isScrolled && "hover:text-white")}>
                  <LayoutDashboard className="w-3.5 h-3.5" /> Самбар
                </Link>
                <button 
                  onClick={handleLogout}
                  className={cn("hover:text-aurora-magenta transition-colors flex items-center gap-2", isScrolled && "hover:text-white")}
                >
                  <LogOut className="w-3.5 h-3.5" /> Гарах
                </button>
                <Link to={`/${profile?.username || ''}`} className={cn(
                  "w-9 h-9 rounded-full border overflow-hidden transition-all bg-slate-50",
                  isScrolled ? "border-white/20 hover:border-white" : "border-slate-200 hover:border-aurora-magenta"
                )}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-aurora-blue font-bold">
                      {profile?.firstname?.[0] || user.email?.[0].toUpperCase()}
                    </div>
                  )}
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className={cn("hover:text-aurora-magenta transition-colors", isScrolled && "hover:text-white")}>Нэвтрэх</Link>
                <Link to="/register" className={cn(
                  "px-6 py-2.5 rounded-full text-[10px] font-black transition-all shadow-lg",
                  isScrolled 
                    ? "bg-white text-aurora-blue hover:bg-aurora-magenta hover:text-white" 
                    : "btn-aurora text-white shadow-aurora-blue/20"
                )}>
                  Бүртгүүлэх
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className={cn("p-2 transition-colors", isScrolled ? "text-white" : "text-aurora-blue")}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link to="/directory" onClick={() => setIsOpen(false)} className="block text-slate-600 hover:text-aurora-magenta py-2 uppercase tracking-widest text-[10px] font-black transition-colors">Лавлах</Link>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-slate-600 hover:text-aurora-magenta py-2 uppercase tracking-widest text-[10px] font-black transition-colors">Хяналтын самбар</Link>
                  {isCompanyAdmin && <Link to="/company" onClick={() => setIsOpen(false)} className="block text-slate-600 hover:text-aurora-magenta py-2 uppercase tracking-widest text-[10px] font-black transition-colors">Байгууллагын самбар</Link>}
                  {isAdmin && <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-slate-600 hover:text-aurora-magenta py-2 uppercase tracking-widest text-[10px] font-black transition-colors">Админ самбар</Link>}
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block text-slate-600 hover:text-aurora-magenta py-2 w-full text-left uppercase tracking-widest text-[10px] font-black transition-colors">Гарах</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block text-slate-600 hover:text-aurora-magenta py-2 uppercase tracking-widest text-[10px] font-black transition-colors">Нэвтрэх</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block btn-aurora text-white px-6 py-4 rounded-xl text-center font-black text-[10px] tracking-widest transition-all shadow-lg shadow-aurora-blue/20">Бүртгүүлэх</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
