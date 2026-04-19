import { useEffect, useState } from 'react';
import { collection, query, getDocs, limit, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, ShieldCheck, TrendingUp, Search, 
  Edit2, Trash2, CheckCircle, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, new: 0, views: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'profiles'), orderBy('created_at', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);
        const userData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        setUsers(userData);

        const total = userData.length;
        const views = userData.reduce((acc, curr) => acc + (curr.view_count || 0), 0);
        
        setStats({ total, new: total > 5 ? 5 : total, views });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleVerified = async (userId: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'profiles', userId), { verified: !current });
      setUsers(users.map(u => u.id === userId ? { ...u, verified: !current } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?')) return;
    try {
      await deleteDoc(doc(db, 'profiles', userId));
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-8 h-8 border-2 border-slate-100 border-t-aurora-blue rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ачаалж байна...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-10 py-10 px-6 antialiased font-sans"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Админ удирдлага</h1>
          <p className="text-sm text-slate-500 mt-1">Системийн хэрэглэгчид болон статистик мэдээлэл.</p>
        </div>
        <Link 
          to="/" 
          className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-aurora-blue transition-colors flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-xl"
        >
          Сайт руу буцах <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Нийт хэрэглэгч', value: stats.total, icon: <Users className="w-4 h-4" /> },
          { label: 'Шинэ (7 хоног)', value: stats.new, icon: <TrendingUp className="w-4 h-4" /> },
          { label: 'Нийт үзэлт', value: stats.views.toLocaleString(), icon: <ShieldCheck className="w-4 h-4" /> },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-400">{stat.icon}</div>
              <span className="text-[10px] font-bold text-success-text bg-success-bg px-2 py-0.5 rounded-full">+0%</span>
            </div>
            <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* User Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Хэрэглэгчийн жагсаалт</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Хайх..." 
              className="w-full bg-white border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-aurora-blue/50 focus:ring-4 focus:ring-aurora-blue/5 transition-all shadow-sm" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-50">
                <th className="px-8 py-5">Хэрэглэгч</th>
                <th className="px-8 py-5">Мэргэжил</th>
                <th className="px-8 py-5">Статус</th>
                <th className="px-8 py-5">Үзэлт</th>
                <th className="px-8 py-5 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {users.map((user, idx) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={user.id} 
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 shrink-0 shadow-sm">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200 font-black text-sm uppercase">
                              {user.firstname?.[0]}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-900 truncate">{user.lastname} {user.firstname}</p>
                          <p className="text-xs text-slate-400">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-medium text-slate-500">{user.job_title || '-'}</span>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => toggleVerified(user.id, user.verified)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shadow-sm border",
                          user.verified 
                            ? "bg-success-bg text-success-text border-success-text/10" 
                            : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                        )}
                      >
                        {user.verified ? <CheckCircle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                        {user.verified ? 'Батлагдсан' : 'Батлах'}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-mono font-bold text-slate-600">{user.view_count || 0}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/${user.username}`} 
                          target="_blank" 
                          className="p-2 text-slate-400 hover:text-aurora-blue transition-colors rounded-lg bg-white border border-slate-100 shadow-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => deleteUser(user.id)} 
                          className="p-2 text-slate-400 hover:text-danger-custom transition-colors rounded-lg bg-white border border-slate-100 shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <Users className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Хэрэглэгч олдсонгүй</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
