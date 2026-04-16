import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, increment, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { useFirebase } from '../contexts/FirebaseContext';
import { motion } from 'motion/react';
import { 
  Phone, Mail, Globe, Share2, Download, Linkedin, Facebook, Instagram, 
  Twitter, Youtube, ShieldCheck, Building2, Check, Heart, MapPin, UserPlus 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import LoadingAnimation from '../components/LoadingAnimation';
import { Logo } from '../components/Logo';

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { user, profile: contextProfile, loading: authLoading } = useFirebase();

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. Check if the profile we're looking for is the currently logged-in user's profile
      if (contextProfile && contextProfile.username === username) {
        setProfile(contextProfile);
        setLoading(false);
        return;
      }

      try {
        // 2. Otherwise, fetch from Firestore with public filters
        // These filters are required by security rules for public access
        const q = query(
          collection(db, 'profiles'), 
          where('username', '==', username),
          where('is_active', '==', true),
          where('profile_public', '==', true)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0];
          const data = { id: docData.id, ...docData.data() } as UserProfile;
          setProfile(data);
          
          // Check if already saved
          if (user) {
            const savedQ = query(
              collection(db, 'saved_cards'), 
              where('user_id', '==', user.uid),
              where('username', '==', username)
            );
            const savedSnap = await getDocs(savedQ);
            setIsSaved(!savedSnap.empty);
          }

          // Analytics updates
          try {
            await updateDoc(doc(db, 'profiles', docData.id), {
              view_count: increment(1)
            });
          } catch (e) { /* Silent fail */ }

          try {
            await addDoc(collection(db, 'profile_views'), {
              profile_id: docData.id,
              viewed_at: new Date().toISOString(),
              source: 'direct'
            });
          } catch (e) { /* Silent fail */ }
        } else {
          // If not found with public filters, it might be private or non-existent
          setError('Профайл олдсонгүй эсвэл хаагдсан байна.');
        }
      } catch (err: any) {
        console.error("Profile fetch error:", err);
        // If it's a permission error, it's likely private
        if (err.code === 'permission-denied') {
          setError('Энэ профайл хаагдсан байна.');
        } else {
          setError('Алдаа гарлаа. Та дахин оролдоно уу.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (username && !authLoading) {
      fetchProfile();
    }
  }, [username, contextProfile, authLoading]);

  const handleSaveCard = async () => {
    if (!user) {
      alert('Нэвтэрч байж хадгалах боломжтой.');
      return;
    }
    if (!profile) return;

    setSaveLoading(true);
    try {
      if (isSaved) {
        const q = query(
          collection(db, 'saved_cards'), 
          where('user_id', '==', user.uid),
          where('username', '==', profile.username)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          await deleteDoc(doc(db, 'saved_cards', snap.docs[0].id));
          setIsSaved(false);
        }
      } else {
        await addDoc(collection(db, 'saved_cards'), {
          user_id: user.uid,
          username: profile.username,
          saved_at: new Date().toISOString()
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: profile?.card_color || '#0f1729',
        scale: 3, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      const link = document.createElement('a');
      link.download = `${profile?.username}-ecard.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download error:', err);
      alert('Зураг татахад алдаа гарлаа.');
    }
  };

  const handleSaveToContacts = () => {
    if (!profile) return;
    
    const vcardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.firstname} ${profile.lastname}`,
      `N:${profile.lastname};${profile.firstname};;;`,
      `ORG:${profile.company || ''}`,
      `TITLE:${profile.job_title || ''}`,
      `TEL;TYPE=CELL:${profile.phone || ''}`,
      `EMAIL;TYPE=INTERNET:${profile.email || ''}`,
      `URL:${window.location.href}`,
      `ADR;TYPE=WORK:;;${profile.address || ''};;;;`,
    ];

    if (profile.facebook) vcardLines.push(`X-SOCIALPROFILE;TYPE=facebook:${profile.facebook}`);
    if (profile.linkedin) vcardLines.push(`X-SOCIALPROFILE;TYPE=linkedin:${profile.linkedin}`);
    if (profile.instagram) vcardLines.push(`X-SOCIALPROFILE;TYPE=instagram:${profile.instagram}`);
    
    if (profile.business_phone) vcardLines.push(`TEL;TYPE=WORK:${profile.business_phone}`);
    if (profile.business_email) vcardLines.push(`EMAIL;TYPE=WORK:${profile.business_email}`);
    if (profile.business_website) vcardLines.push(`URL;TYPE=WORK:${profile.business_website}`);

    vcardLines.push('NOTE:Digital Business Card from eCard.mn');
    vcardLines.push('END:VCARD');

    const vcard = vcardLines.join('\n');
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${profile.firstname}_${profile.lastname}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowSaveFeedback(true);
    setTimeout(() => setShowSaveFeedback(false), 3000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Холбоос хуулагдлаа!');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-void">
      <LoadingAnimation />
    </div>
  );
  if (error || !profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-serif font-bold mb-4">Уучлаарай</h1>
      <p className="text-ivory/60 mb-8">{error || 'Энэ профайл олдсонгүй эсвэл хаагдсан байна.'}</p>
      <Link to="/" className="text-aurora-violet hover:underline">Нүүр хуудас руу буцах</Link>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto space-y-8"
      >
        {/* Card View */}
        <div 
          ref={cardRef}
          className="relative w-full aspect-[1.6/1] rounded-[32px] p-8 shadow-2xl overflow-hidden group transition-all duration-500 hover:scale-[1.02]"
          style={{ 
            background: profile.card_color?.startsWith('linear') ? profile.card_color : undefined,
            backgroundColor: !profile.card_color?.startsWith('linear') ? (profile.card_color || '#0d1530') : undefined 
          }}
        >
          {/* Pattern Overlay */}
          <div className={cn("absolute inset-0 opacity-30 pointer-events-none", profile.card_pattern || 'pattern-none')} />
          
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          
          <div className="relative h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-20 h-20 rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-xl bg-void/20">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.firstname} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e: any) => {
                      console.error('Profile image load error');
                      e.target.style.display = 'none';
                      const fallback = e.target.nextSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={cn(
                  "w-full h-full items-center justify-center text-3xl font-bold text-aurora-violet",
                  profile.avatar_url ? "hidden" : "flex"
                )}>
                  {profile.firstname?.[0] || profile.username?.[0]?.toUpperCase()}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <h2 className="text-2xl font-serif font-bold tracking-tight uppercase" style={{ color: profile.card_text_color }}>
                    {profile.lastname_display === 'initial' 
                      ? `${profile.lastname?.[0]}. ${profile.firstname}`
                      : `${profile.lastname} ${profile.firstname}`
                    }
                  </h2>
                  {profile.verified && <ShieldCheck className="w-4 h-4 text-aurora-cyan" />}
                </div>
                <p className="text-sm font-medium" style={{ color: profile.card_text_color, opacity: 0.8 }}>{profile.job_title}</p>
                {profile.company && (
                  <p className="text-xs mt-1 flex items-center justify-end gap-1" style={{ color: profile.card_text_color, opacity: 0.6 }}>
                    <Building2 className="w-3 h-3" /> {profile.company}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="space-y-1.5">
                {profile.phone && (
                  <a href={`tel:${profile.phone}`} className="flex items-center gap-2 text-[10px] hover:opacity-100 transition-opacity" style={{ color: profile.card_text_color, opacity: 0.8 }}>
                    <Phone className="w-3 h-3 text-aurora-cyan" /> {profile.phone}
                  </a>
                )}
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-[10px] hover:opacity-100 transition-opacity" style={{ color: profile.card_text_color, opacity: 0.8 }}>
                    <Mail className="w-3 h-3 text-aurora-cyan" /> {profile.email}
                  </a>
                )}
                {profile.facebook && (
                  <a href={profile.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] hover:opacity-100 transition-opacity" style={{ color: profile.card_text_color, opacity: 0.8 }}>
                    <Facebook className="w-3 h-3 text-aurora-cyan" /> Facebook
                  </a>
                )}
                {profile.address && (
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: profile.card_text_color, opacity: 0.8 }}>
                    <MapPin className="w-3 h-3 text-aurora-cyan" /> {profile.address}
                    {profile.maps_url && (
                      <a href={profile.maps_url} target="_blank" rel="noreferrer" className="text-aurora-cyan hover:underline ml-1">
                        (Газрын зураг)
                      </a>
                    )}
                  </div>
                )}
                {/* Personal Social Links in Card */}
                <div className="flex gap-2 pt-1">
                  {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition-colors" style={{ color: profile.card_text_color, opacity: 0.4 }}><Linkedin className="w-3 h-3" /></a>}
                  {profile.instagram && <a href={profile.instagram} target="_blank" rel="noreferrer" className="hover:text-white transition-colors" style={{ color: profile.card_text_color, opacity: 0.4 }}><Instagram className="w-3 h-3" /></a>}
                  {profile.twitter && <a href={profile.twitter} target="_blank" rel="noreferrer" className="hover:text-white transition-colors" style={{ color: profile.card_text_color, opacity: 0.4 }}><Twitter className="w-3 h-3" /></a>}
                  {profile.youtube && <a href={profile.youtube} target="_blank" rel="noreferrer" className="hover:text-white transition-colors" style={{ color: profile.card_text_color, opacity: 0.4 }}><Youtube className="w-3 h-3" /></a>}
                </div>
              </div>
              <div className="w-16 h-16 bg-white rounded-xl p-1.5 shadow-lg">
                <QRCodeSVG value={window.location.href} size={150} className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <button 
                onClick={handleSaveToContacts}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl btn-aurora text-white text-sm font-bold transition-all shadow-lg shimmer-sweep"
              >
                <UserPlus className="w-4 h-4" /> Хадгалах
              </button>
              {showSaveFeedback && (
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-aurora-cyan font-bold whitespace-nowrap"
                >
                  Амжилттай хадгалагдлаа!
                </motion.span>
              )}
            </div>
            <button 
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-3 rounded-xl glass-panel text-ivory text-sm font-bold hover:bg-glass-hover transition-all"
            >
              <Download className="w-4 h-4" /> Татах
            </button>
          </div>
          <button 
            onClick={handleSaveCard}
            disabled={saveLoading}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
              isSaved 
                ? "bg-white/10 text-aurora-violet border border-aurora-violet/30" 
                : "glass-panel text-ivory hover:bg-glass-hover"
            )}
          >
            {isSaved ? <Heart className="w-4 h-4 fill-current" /> : <Heart className="w-4 h-4" />}
            {isSaved ? 'Хадгалсан' : 'Дуртай болгох'}
          </button>
        </div>

        {/* Detailed Info */}
        <div className="glass-panel rounded-[32px] p-10 space-y-10">
          {profile.bio && (
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-aurora-violet mb-4">Танилцуулга</h3>
              <p className="text-ivory/60 leading-relaxed text-sm">{profile.bio}</p>
            </div>
          )}

          <div className="pt-10 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-aurora-violet/20 flex items-center justify-center text-aurora-violet font-serif font-bold">e</div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-aurora-violet">ecard.mn/{profile.username}</p>
                <Logo size="sm" />
              </div>
            </div>
            <button 
              onClick={handleShare}
              className="p-3 rounded-xl bg-glass hover:bg-glass-hover text-aurora-cyan transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="text-slate-300 hover:text-aurora-blue transition-colors text-xs tracking-widest uppercase font-bold">Өөрийн картыг үүсгэх үү? eCard.mn</Link>
        </div>
      </motion.div>
    </div>
  );
}
