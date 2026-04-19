import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { Search, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import LoadingAnimation from './LoadingAnimation';
import { CATEGORIES } from '../constants';

const fields = ['Бүгд', ...CATEGORIES];

export default function DirectoryView({ showTitle = true }: { showTitle?: boolean }) {
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
      (p.firstname || '') + 
      (p.lastname || '') + 
      (p.job_title || '') + 
      (p.company || '') + 
      (p.category || '') + 
      skillsString
    ).toLowerCase().includes(searchLower);
    
    const matchesField = selectedField === 'Бүгд' || p.category === selectedField || p.field === selectedField;
    return matchesSearch && matchesField;
  });

  return (
    <div className="w-full">
      {showTitle && (
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
      )}

      {/* Search & Filter */}
      <div className="mb-16 space-y-8">
        <div className="relative max-w-3xl mx-auto group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-aurora-blue transition-colors" />
          <input
            type="text"
            placeholder="Нэр, мэргэжил, компани хайх..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-6 py-6 bg-white/70 backdrop-blur-md border border-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-aurora-blue/20 transition-all text-lg shadow-sm"
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
                  ? "bg-slate-900 text-white shadow-xl" 
                  : "bg-white border border-slate-100 text-slate-500 hover:text-aurora-magenta hover:border-aurora-magenta/20"
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
          <div className="w-10 h-10 border-4 border-aurora-blue/20 border-t-aurora-blue rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProfiles.map(profile => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="bg-white border border-slate-100 rounded-2xl transition-all duration-300 group hover:shadow-md hover:border-slate-200"
            >
              <Link to={`/${profile.username}`} className="block p-4">
                <div className="flex items-center gap-4">
                  {/* Left: Avatar/Initial */}
                  <div 
                    className="w-16 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm"
                    style={{ backgroundColor: profile.card_color || '#F1F5F9' }}
                  >
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Avatar" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-xl font-bold text-white uppercase">
                        {profile.firstname[0]}
                      </div>
                    )}
                  </div>
                  
                  {/* Right: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="text-[14px] font-bold text-slate-900 truncate tracking-tight">
                        {profile.lastname_display === 'initial' 
                          ? `${profile.lastname?.[0]}. ${profile.firstname}`
                          : `${profile.lastname} ${profile.firstname}`
                        }
                      </h3>
                      {profile.verified && <ShieldCheck className="w-3.5 h-3.5 text-aurora-blue" />}
                    </div>
                    
                    <div className="flex items-center gap-1.5 mb-2">
                      <p className="text-[11px] font-bold text-slate-800 truncate leading-none">
                        {profile.job_title || 'Мэргэжилтэн'}
                      </p>
                      {profile.company && (
                        <>
                          <div className="w-[1px] h-3 bg-slate-200" />
                          <p className="text-[11px] font-medium text-slate-400 truncate leading-none">
                            {profile.company}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-[4px] bg-indigo-50 text-indigo-500 text-[9px] font-bold uppercase tracking-tight">
                        {profile.category || 'Бусад'}
                      </span>
                      <span className="text-[9px] font-medium text-slate-300 truncate">
                        @{profile.username}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredProfiles.length === 0 && (
        <div className="text-center py-32 bg-white/50 border border-dashed border-slate-200 rounded-[32px]">
          <p className="text-slate-400 text-lg font-medium">Хайлт илэрцгүй байна.</p>
        </div>
      )}
    </div>
  );
}
