import { motion, useScroll, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import { Zap, Shield, Users, Globe, ArrowRight, QrCode } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Logo } from '../components/Logo';
import { NetworkNodes } from '../components/NetworkNodes';

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

  const textScale = useTransform(scrollYProgress, [0, 0.3], [0.8, 1]);
  const textY = useTransform(scrollYProgress, [0, 0.3], [50, 0]);
  const textBlur = useTransform(scrollYProgress, [0, 0.25, 0.3], ["blur(20px)", "blur(10px)", "blur(0px)"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2, 0.3], [0, 0.5, 1]);

  useEffect(() => {
    // Simple count up animation simulation
    const interval = setInterval(() => {
      setStats(prev => ({
        users: Math.min(prev.users + 123, 10000),
        time: Math.min(prev.time + 1, 30),
        price: 0
      }));
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen selection:bg-aurora-violet selection:text-white relative">
      <NetworkNodes />
      {/* Hero Section */}
      <section className="relative pt-48 pb-32 overflow-hidden min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
              
              <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-serif font-medium leading-[1.1] mb-8">
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

      {/* Pricing */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Төлөвлөгөө сонгох</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-10 glass-panel rounded-[32px] flex flex-col">
              <h3 className="text-xl font-bold mb-2">Үнэгүй</h3>
              <p className="text-3xl font-serif font-bold mb-8">0₮ <span className="text-sm font-sans font-normal text-ivory/40">/ насан туршдаа</span></p>
              <ul className="space-y-5 mb-10 text-ivory/60 flex-grow">
                <li className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-aurora-cyan" /> Үндсэн профайл</li>
                <li className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-aurora-cyan" /> QR код</li>
                <li className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-aurora-cyan" /> Лавлахад харагдах</li>
              </ul>
              <Link to="/register" className="w-full py-4 rounded-full glass-panel text-center hover:bg-glass-hover transition-all">Эхлэх</Link>
            </div>

            <div className="p-10 glass-panel rounded-[32px] border-aurora-violet/50 relative flex flex-col scale-105 shadow-[0_0_50px_rgba(124,58,237,0.2)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 btn-aurora px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Хамгийн их сонгосон</div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-3xl font-serif font-bold mb-8 aurora-text">9,900₮ <span className="text-sm font-sans font-normal text-ivory/40">/ сар</span></p>
              <ul className="space-y-5 mb-10 text-ivory/80 flex-grow">
                <li className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-aurora-violet" /> Дэлгэрэнгүй мэдээлэл</li>
                <li className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-aurora-violet" /> Портфолио</li>
                <li className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-aurora-violet" /> Аналитик</li>
                <li className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-aurora-violet" /> Verified тэмдэг</li>
              </ul>
              <Link to="/register" className="w-full py-4 rounded-full btn-aurora text-center font-bold transition-all shimmer-sweep">Сонгох</Link>
            </div>

            <div className="p-10 glass-panel rounded-[32px] flex flex-col">
              <h3 className="text-xl font-bold mb-2">Бизнес</h3>
              <p className="text-3xl font-serif font-bold mb-8">49,900₮ <span className="text-sm font-sans font-normal text-ivory/40">/ сар</span></p>
              <ul className="space-y-5 mb-10 text-ivory/60 flex-grow">
                <li className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-aurora-cyan" /> Байгууллагын хяналт</li>
                <li className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-aurora-cyan" /> Олон ажилтан</li>
                <li className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-aurora-cyan" /> Брэнд загвар</li>
                <li className="flex items-center gap-3"><ArrowRight className="w-4 h-4 text-aurora-cyan" /> API хандалт</li>
              </ul>
              <Link to="/register" className="w-full py-4 rounded-full glass-panel text-center hover:bg-glass-hover transition-all">Холбогдох</Link>
            </div>
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
            <div className="flex gap-10 text-sm text-slate-400 font-bold uppercase tracking-widest">
              <Link to="/directory" className="hover:text-aurora-blue transition-colors">Лавлах</Link>
              <Link to="/register" className="hover:text-aurora-blue transition-colors">Бүртгүүлэх</Link>
              <Link to="/login" className="hover:text-aurora-blue transition-colors">Нэвтрэх</Link>
              <a href="#" className="hover:text-aurora-blue transition-colors">Холбоо барих</a>
            </div>
          </div>
          
          <div className="relative flex justify-center py-20 pointer-events-none group/footer">
            <motion.h2 
              style={{ 
                scale: textScale,
                y: textY,
                filter: textBlur,
                opacity: textOpacity
              }}
              className="text-[20vw] font-serif font-black leading-none select-none tracking-tighter relative cursor-default pointer-events-auto"
            >
              {/* Background Outline Layer */}
              <span className="absolute inset-0 text-transparent stroke-white/10" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>
                eCARD
              </span>
              
              {/* Main Gradient Layer */}
              <span className="relative bg-clip-text text-transparent bg-gradient-to-b from-white via-white/40 to-transparent opacity-80 group-hover/footer:opacity-100 transition-all duration-700 group-hover/footer:tracking-normal tracking-tighter">
                eCARD
              </span>

              {/* Glowing Interactive Layer */}
              <motion.span 
                className="absolute inset-0 flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-aurora-blue via-aurora-violet to-aurora-cyan opacity-0 group-hover/footer:opacity-100 transition-all duration-1000 blur-[2px] group-hover/footer:blur-[0px]"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                style={{ backgroundSize: '200% auto' }}
              >
                eCARD
              </motion.span>

              {/* Ultimate Glow Aura on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-aurora-blue/20 via-aurora-violet/20 to-aurora-cyan/20 blur-[120px] rounded-full opacity-0 group-hover/footer:opacity-100 transition-all duration-1000 scale-150 -z-10" />
            </motion.h2>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-20 pt-10 border-t border-slate-100/50">
            <p className="text-sm text-slate-400">
              © 2026 eCard.mn. <a href="https://cornerstoneai.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-aurora-blue transition-colors underline underline-offset-4 decoration-aurora-blue/30">Cornerstone AI</a>-ийн бүтээл.
            </p>
            <p className="text-[11px] uppercase tracking-[0.4em] text-aurora-violet font-bold mt-4 md:mt-0 italic opacity-80">
              "Your network is Your net worth"
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
