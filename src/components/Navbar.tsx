import { Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, User, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

export default function Navbar() {
  const { user, profile, isAdmin } = useFirebase();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <Logo size="md" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 uppercase tracking-widest text-xs">
            <Link to="/directory" className="text-slate-600 hover:text-aurora-blue transition-colors font-bold">Лавлах</Link>
            {user ? (
              <div className="flex items-center space-x-6">
                {isAdmin && (
                  <Link to="/admin" className="text-slate-600 hover:text-aurora-blue transition-colors font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Админ
                  </Link>
                )}
                <Link to="/dashboard" className="text-slate-600 hover:text-aurora-blue transition-colors font-bold flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Самбар
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-danger transition-colors font-bold flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Гарах
                </button>
                <Link to={`/${profile?.username || ''}`} className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden hover:border-aurora-blue transition-all bg-slate-50">
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
                <Link to="/login" className="text-slate-600 hover:text-aurora-blue transition-colors font-bold">Нэвтрэх</Link>
                <Link to="/register" className="btn-aurora px-6 py-2.5 rounded text-xs font-bold transition-all shimmer-sweep shadow-lg shadow-aurora-blue/20">
                  Бүртгүүлэх
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-aurora-cyan p-2">
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
              <Link to="/directory" onClick={() => setIsOpen(false)} className="block text-slate-600 hover:text-aurora-blue py-2 uppercase tracking-widest text-xs font-bold transition-colors">Лавлах</Link>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-slate-600 hover:text-aurora-blue py-2 uppercase tracking-widest text-xs font-bold transition-colors">Хяналтын самбар</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-slate-600 hover:text-aurora-blue py-2 uppercase tracking-widest text-xs font-bold transition-colors">Админ самбар</Link>}
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block text-slate-600 hover:text-danger py-2 w-full text-left uppercase tracking-widest text-xs font-bold transition-colors">Гарах</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block text-slate-600 hover:text-aurora-blue py-2 uppercase tracking-widest text-xs font-bold transition-colors">Нэвтрэх</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block btn-aurora text-white px-6 py-4 rounded-xl text-center font-bold text-sm shimmer-sweep shadow-lg shadow-aurora-blue/20">Бүртгүүлэх</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
