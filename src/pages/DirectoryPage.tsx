import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { Search, Filter, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import LoadingAnimation from '../components/LoadingAnimation';
import { CATEGORIES } from '../constants';

const fields = ['Бүгд', ...CATEGORIES];

export default function DirectoryPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('Бүгд');

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        let q = query(
          collection(db, 'profiles'), 
          where('is_active', '==', true), 
          where('show_in_directory', '==', true),
          limit(50)
        );
        
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        setProfiles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const skillsString = (p.skills || []).join(' ').toLowerCase();
    const matchesSearch = (
      p.firstname + 
      p.lastname + 
      (p.job_title || '') + 
      (p.company || '') + 
      (p.category || '') + 
      skillsString
    ).toLowerCase().includes(searchLower);
    
    const matchesField = selectedField === 'Бүгд' || p.category === selectedField || p.field === selectedField;
    return matchesSearch && matchesField;
  });

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-serif font-bold mb-6"
          >
            Мэргэжилтнүүдийн <span className="aurora-text">лавлах</span>
          </motion.h1>
          <p className="text-slate-500 max-w-2xl mx-auto">Шилдэг мэргэжилтнүүдтэй холбогдож, танилцаарай.</p>
        </div>

        {/* Search & Filter */}
        <div className="mb-16 space-y-8">
          <div className="relative max-w-3xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Нэр, мэргэжил, компани хайх..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-6 glass-panel rounded-full focus:outline-none focus:ring-2 focus:ring-aurora-blue/20 transition-all text-lg shadow-sm"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {fields.map(field => (
              <button
                key={field}
                onClick={() => setSelectedField(field)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-medium transition-all",
                  selectedField === field 
                    ? "btn-aurora text-white" 
                    : "glass-panel text-slate-500 hover:text-aurora-blue"
                )}
              >
                {field}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingAnimation />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProfiles.map(profile => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="glass-panel rounded-[32px] transition-all group"
              >
                <Link to={`/${profile.username}`} className="block p-8">
                  <div className="flex items-start gap-5 mb-8">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-white border border-slate-100 group-hover:border-aurora-blue transition-all shadow-sm">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e: any) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.nextSibling;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={cn(
                        "w-full h-full items-center justify-center text-2xl font-bold text-aurora-blue bg-slate-50",
                        profile.avatar_url ? "hidden" : "flex"
                      )}>
                        {profile.firstname[0]}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-serif font-bold group-hover:aurora-text transition-all uppercase text-slate-900">
                          {profile.lastname_display === 'initial' 
                            ? `${profile.lastname?.[0]}. ${profile.firstname}`
                            : `${profile.lastname} ${profile.firstname}`
                          }
                        </h3>
                        {profile.verified && <ShieldCheck className="w-5 h-5 text-aurora-blue" />}
                      </div>
                      <p className="text-aurora-blue font-medium text-sm">{profile.job_title}</p>
                      <p className="text-slate-400 text-[10px] mb-2">{profile.company}</p>
                      
                      {profile.category && (
                        <span className="inline-block px-2 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-bold rounded border border-slate-100 mb-2">
                          {profile.category}
                        </span>
                      )}
                      
                      {profile.skills && profile.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {profile.skills.slice(0, 3).map((skill, i) => (
                            <span key={i} className="text-[8px] text-aurora-blue/60 bg-aurora-blue/5 px-1.5 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                          {profile.skills.length > 3 && <span className="text-[8px] text-slate-300">+{profile.skills.length - 3}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400">ecard.mn/{profile.username}</span>
                    <span className="text-aurora-cyan text-xs font-bold group-hover:translate-x-1 transition-transform">Харах →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredProfiles.length === 0 && (
          <div className="text-center py-32 glass-panel rounded-[32px]">
            <p className="text-ivory/40 text-lg">Хайлт илэрцгүй байна.</p>
          </div>
        )}
      </div>
    </div>
  );
}
