import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Link } from 'react-router-dom';
import { Zap, Shield, Users, Globe, ArrowRight, QrCode } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Logo } from '../components/Logo';
import { NetworkNodes } from '../components/NetworkNodes';
import { db } from '../lib/firebase';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function LandingPage() {
  const [stats, setStats] = useState({ users: 0, time: 0, price: 0 });
  const footerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end start"]
  });

  const textScale = useTransform(scrollYProgress, [0, 0.4], [0.7, 1]);
  const textY = useTransform(scrollYProgress, [0, 0.4], [100, 0]);
  const textBlur = useTransform(scrollYProgress, [0, 0.3, 0.4], ["blur(30px)", "blur(15px)", "blur(0px)"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.25, 0.45], [0, 0.6, 1]);
  const textTracking = useTransform(scrollYProgress, [0, 0.4], ["-0.05em", "0.02em"]);

  const springScale = useSpring(textScale, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const springY = useSpring(textY, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const q = query(collection(db, 'profiles'), where('is_active', '==', true));
        const snapshot = await getCountFromServer(q);
        const actualUserCount = snapshot.data().count;
        
        const targetStats = {
          users: actualUserCount,
          time: 30, // 30 seconds to register
          price: 0
        };

        // Smooth count up animation
        const duration = 2000; // 2 seconds
        const startTime = Date.now();

        const animate = () => {
          const now = Date.now();
          const progress = Math.min((now - startTime) / duration, 1);
          
          // Easing function: easeOutExpo
          const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

          setStats({
            users: Math.floor(easedProgress * targetStats.users),
            time: Math.floor(easedProgress * targetStats.time),
            price: 0
          });

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen selection:bg-aurora-blue selection:text-white relative">
      <NetworkNodes />
      {/* Hero Section */}
      <section className="relative pt-32 pb-32 overflow-hidden min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              variants={staggerChildren}
              initial="initial"
              animate="animate"
              className="text-left"
            >
              <motion.p variants={fadeUp} className="text-aurora-violet font-bold tracking-[0.2em] text-[11px] uppercase mb-6">
                МОНГОЛЫН АНХНЫ ДИЖИТАЛ ВИЗИТ КАРТ ПЛАТФОРМ
              </motion.p>
              
              <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-serif font-medium leading-[0.95] mb-8">
                Таны мэргэжлийн<br />
                <span className="aurora-text">дижитал карт</span><br />
                нэг хуудсанд
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-lg text-ivory/60 mb-12 max-w-lg leading-relaxed italic font-serif">
                "Your network is Your net worth"
              </motion.p>
              
              <motion.div variants={fadeUp} className="flex flex-wrap gap-6">
                <Link to="/register" className="btn-aurora px-10 py-5 rounded-full font-bold text-lg transition-all shimmer-sweep flex items-center gap-3 group">
                  Картаа үүсгэх — Үнэгүй
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/directory" className="glass-panel px-10 py-5 rounded-full font-bold text-lg transition-all flex items-center gap-2 hover:bg-glass-hover">
                  Лавлах харах →
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
              animate={{ opacity: 1, scale: 1, rotateY: -12, rotateX: 4 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="hidden lg:block relative card-3d"
            >
              {/* Bloom glow behind card */}
              <div className="absolute inset-0 bg-aurora-blue/10 blur-[100px] rounded-full animate-pulse" />
              
              <div className="relative w-[380px] h-[540px] mx-auto glass-panel !bg-white/80 rounded-[32px] p-10 flex flex-col h-full animate-[float_4s_infinite_ease-in-out] shadow-2xl">
                <div className="w-24 h-24 rounded-full bg-white border border-aurora-blue/20 mb-8 flex items-center justify-center text-4xl font-bold text-aurora-blue shadow-lg">
                  Б
                </div>
                <h3 className="text-3xl font-serif font-bold mb-2 text-slate-900">Бат-Эрдэнэ</h3>
                <p className="text-aurora-cyan font-medium mb-10">Ахлах дизайнер @ eCard</p>
                
                <div className="space-y-5 mb-auto">
                  <div className="flex items-center gap-4 text-slate-500">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200"><Globe className="w-5 h-5 text-aurora-blue" /></div>
                    <span className="text-sm font-medium">ecard.mn/bat</span>
                  </div>
                </div>

                <div className="mt-auto pt-10 border-t border-slate-100 flex justify-between items-end">
                  <div className="w-24 h-24 bg-white p-3 rounded-2xl shadow-md border border-slate-100">
                    <QrCode className="w-full h-full text-slate-900" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-aurora-blue mb-1">Powered by</p>
                    <Logo size="sm" className="ml-auto" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-[32px] p-px">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
              <div className="py-12 text-center">
                <p className="text-4xl font-serif font-bold aurora-text mb-2">{stats.users.toLocaleString()}+</p>
                <p className="text-xs uppercase tracking-[0.2em] text-ivory/40">Хэрэглэгч</p>
              </div>
              <div className="py-12 text-center">
                <p className="text-4xl font-serif font-bold aurora-text mb-2">{stats.time}"</p>
                <p className="text-xs uppercase tracking-[0.2em] text-ivory/40">Бүртгэлийн хугацаа</p>
              </div>
              <div className="py-12 text-center">
                <p className="text-4xl font-serif font-bold aurora-text mb-2">{stats.price}₮</p>
                <p className="text-xs uppercase tracking-[0.2em] text-ivory/40">Үнэгүй ашиглалт</p>
              </div>
              <div className="py-12 text-center">
                <p className="text-4xl font-serif font-bold aurora-text mb-2">QR</p>
                <p className="text-xs uppercase tracking-[0.2em] text-ivory/40">Автомат код</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Яагаад eCard гэж?</h2>
            <p className="text-ivory/60 max-w-2xl mx-auto">Бид таны мэргэжлийн үнэ цэнийг дижитал ертөнцөд хамгийн шилдэг хэлбэрээр илэрхийлнэ.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap />, title: "Хурдан бөгөөд хялбар", desc: "30 секундэд өөрийн профайлыг үүсгэж, шууд ашиглаж эхлээрэй." },
              { icon: <Shield />, title: "Найдвартай хамгаалалт", desc: "Таны мэдээлэл бидний хамгаалалтад найдвартай хадгалагдах болно." },
              { icon: <Users />, title: "Мэргэжлийн лавлах", desc: "Бусад мэргэжилтнүүдтэй холбогдож, өөрийн хүрээгээ тэлэх боломж." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 glass-panel rounded-[32px] transition-all group"
              >
                <div className="w-16 h-16 bg-aurora-violet/10 rounded-2xl flex items-center justify-center text-aurora-violet mb-8 group-hover:shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4">{feature.title}</h3>
                <p className="text-ivory/60 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer ref={footerRef} className="py-20 relative z-10 border-t border-slate-100 bg-white/50 backdrop-blur-xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-20">
            <Link to="/">
              <Logo size="lg" />
            </Link>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm text-slate-400 font-bold uppercase tracking-widest">
              <Link to="/directory" className="hover:text-aurora-magenta transition-colors">Лавлах</Link>
              <Link to="/register" className="hover:text-aurora-magenta transition-colors">Бүртгүүлэх</Link>
              <Link to="/login" className="hover:text-aurora-magenta transition-colors">Нэвтрэх</Link>
              <a href="#" className="hover:text-aurora-magenta transition-colors">Холбоо барих</a>
            </div>
          </div>
          
          <div className="relative flex justify-center py-20 group/footer overflow-hidden cursor-pointer">
            <motion.div 
              style={{ 
                scale: springScale,
                y: springY,
                filter: textBlur,
                opacity: textOpacity,
              }}
              className="relative flex items-center justify-center transition-all duration-700 h-[30vw] w-full"
            >
              {/* Normal State: The Dynamic Text */}
              <h2 className="text-[20vw] font-serif font-black leading-none select-none relative bg-clip-text text-transparent bg-gradient-to-b from-aurora-blue via-aurora-blue/60 to-transparent transition-all duration-1000 group-hover/footer:opacity-0 group-hover/footer:scale-110 group-hover/footer:blur-3xl">
                eCARD
              </h2>

              {/* Hover State: The Pure PNG Logo */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/footer:opacity-100 transition-all duration-700 pointer-events-none scale-75 group-hover/footer:scale-100">
                <div className="relative">
                  {/* Magenta Glow for the PNG */}
                  <div className="absolute inset-0 bg-aurora-magenta/40 blur-[100px] rounded-full opacity-0 group-hover/footer:opacity-100 transition-opacity duration-1000" />
                  <img 
                    src="https://lh3.googleusercontent.com/d/1Jm2Xbyd-6Xi1mqhE7foilH7L8S5xe1te" 
                    alt="eCARD Logo" 
                    className="w-[45vw] md:w-[30vw] h-auto object-contain relative z-10 brightness-110 contrast-110 filter drop-shadow-[0_0_50px_rgba(217,70,239,0.5)]"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Enhanced Magenta Base Line */}
              <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-0 group-hover/footer:w-1/2 h-0.5 bg-gradient-to-r from-transparent via-aurora-magenta to-transparent transition-all duration-1000 opacity-60 blur-[1px]" />
            </motion.div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-20 pt-10 border-t border-slate-100/50 gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <p className="text-sm text-slate-400 max-w-sm md:max-w-none">
                © 2026 eCard.mn. <a href="https://cornerstoneai.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-aurora-magenta transition-colors underline underline-offset-4 decoration-aurora-magenta/30">Cornerstone AI</a>-ийн бүтээл.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-8">
                <Link to="/privacy" className="text-xs font-bold text-slate-500 hover:text-aurora-magenta transition-colors flex flex-col items-center md:items-start gap-1">
                  <span>Нууцлалын бодлого</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60">Privacy Policy</span>
                </Link>
                <Link to="/terms" className="text-xs font-bold text-slate-500 hover:text-aurora-magenta transition-colors flex flex-col items-center md:items-start gap-1">
                  <span>Үйлчилгээний нөхцөл</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-60">Terms of Service</span>
                </Link>
              </div>
            </div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-aurora-violet font-bold mt-4 md:mt-0 italic opacity-80 max-w-[200px] md:max-w-none">
              "Your network is Your net worth"
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
