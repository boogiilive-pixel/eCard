import { useEffect, useState } from 'react';
import { collection, query, getDocs, limit, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { 
  Users, ShieldCheck, TrendingUp, CreditCard, Search, 
  MoreVertical, Edit2, Trash2, CheckCircle, XCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pro: 0, new: 0, views: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'profiles'), orderBy('created_at', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);
        const userData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        setUsers(userData);

        const total = userData.length;
        const pro = userData.filter(u => u.plan === 'pro').length;
        const views = userData.reduce((acc, curr) => acc + (curr.view_count || 0), 0);
        
        setStats({ total, pro, new: 5, views });
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

  return (
    <div className="space-y-12 relative z-10">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-serif font-bold">Админ самбар</h1>
        <Link to="/" className="text-aurora-cyan hover:underline">Сайт руу буцах</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Нийт хэрэглэгч', value: stats.total, icon: <Users /> },
          { label: 'Шинэ (7 хоног)', value: stats.new, icon: <TrendingUp /> },
          { label: 'Нийт үзэлт', value: stats.views.toLocaleString(), icon: <ShieldCheck /> },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-8 rounded-[32px]">
            <div className="flex items-center justify-between mb-4">
              <div className="text-aurora-violet/40">{stat.icon}</div>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-ivory/40 mb-1">{stat.label}</p>
            <p className="text-3xl font-serif font-bold aurora-text">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="glass-panel rounded-[32px] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-serif font-bold">Хэрэглэгчид</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory/30" />
            <input 
              type="text" 
              placeholder="Хайх..." 
              className="w-full bg-glass border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-aurora-violet/50" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-ivory/40 border-b border-white/5">
                <th className="px-8 py-6 font-medium">Хэрэглэгч</th>
                <th className="px-8 py-6 font-medium">Мэргэжил</th>
                <th className="px-8 py-6 font-medium">Төлөвлөгөө</th>
                <th className="px-8 py-6 font-medium">Verified</th>
                <th className="px-8 py-6 font-medium">Үзэлт</th>
                <th className="px-8 py-6 font-medium text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-glass-hover transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-glass overflow-hidden border border-white/10">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-aurora-violet font-bold">
                            {user.firstname?.[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{user.lastname} {user.firstname}</p>
                        <p className="text-xs text-ivory/40">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-ivory/60">{user.job_title || '-'}</td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[10px] uppercase font-bold px-2 py-1 rounded-md",
                      user.plan === 'pro' ? "bg-aurora-violet/20 text-aurora-violet" : "bg-white/5 text-ivory/40"
                    )}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button onClick={() => toggleVerified(user.id, user.verified)}>
                      {user.verified ? <CheckCircle className="w-5 h-5 text-aurora-cyan" /> : <XCircle className="w-5 h-5 text-ivory/20" />}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-sm font-mono text-aurora-cyan">{user.view_count || 0}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/${user.username}`} target="_blank" className="p-2 hover:text-aurora-violet transition-colors"><Edit2 className="w-4 h-4" /></Link>
                      <button onClick={() => deleteUser(user.id)} className="p-2 hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
