import { Link } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, User, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user, profile, isAdmin } = useFirebase();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-void/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-serif font-bold aurora-text">eCard.mn</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 uppercase tracking-widest text-xs">
            <Link to="/directory" className="text-ivory/70 hover:text-aurora-cyan transition-colors font-medium">Лавлах</Link>
            {user ? (
              <div className="flex items-center space-x-6">
                {isAdmin && (
                  <Link to="/admin" className="text-ivory/70 hover:text-aurora-violet transition-colors font-medium flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Админ
                  </Link>
                )}
                <Link to="/dashboard" className="text-ivory/70 hover:text-aurora-violet transition-colors font-medium flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Самбар
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-ivory/70 hover:text-danger transition-colors font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Гарах
                </button>
                <Link to={`/${profile?.username || ''}`} className="w-10 h-10 rounded-full border border-glass-border overflow-hidden hover:border-aurora-violet transition-all">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-glass flex items-center justify-center text-aurora-violet font-bold">
                      {profile?.firstname?.[0] || user.email?.[0].toUpperCase()}
                    </div>
                  )}
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-ivory/70 hover:text-aurora-cyan transition-colors font-medium">Нэвтрэх</Link>
                <Link to="/register" className="btn-aurora px-6 py-2.5 rounded text-xs font-bold transition-all shimmer-sweep">
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
            className="md:hidden bg-void/95 backdrop-blur-2xl border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link to="/directory" onClick={() => setIsOpen(false)} className="block text-ivory/70 hover:text-aurora-cyan py-2 uppercase tracking-widest text-xs font-medium transition-colors">Лавлах</Link>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-ivory/70 hover:text-aurora-violet py-2 uppercase tracking-widest text-xs font-medium transition-colors">Хяналтын самбар</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-ivory/70 hover:text-aurora-violet py-2 uppercase tracking-widest text-xs font-medium transition-colors">Админ самбар</Link>}
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block text-ivory/70 hover:text-danger py-2 w-full text-left uppercase tracking-widest text-xs font-medium transition-colors">Гарах</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block text-ivory/70 hover:text-aurora-cyan py-2 uppercase tracking-widest text-xs font-medium transition-colors">Нэвтрэх</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block btn-aurora text-white px-6 py-4 rounded-xl text-center font-bold text-sm shimmer-sweep">Бүртгүүлэх</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
