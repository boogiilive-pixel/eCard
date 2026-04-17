import React from 'react';
import { motion } from 'motion/react';
import { FileText, CheckCircle, AlertTriangle, HelpCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NetworkNodes } from '../components/NetworkNodes';
import { AuroraBackground } from '../components/AuroraBackground';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-void relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
      <NetworkNodes />
      <AuroraBackground />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-aurora-blue transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Буцах
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 md:p-12 rounded-[40px] shadow-2xl backdrop-blur-3xl bg-white/80"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-aurora-violet/10 rounded-2xl">
              <FileText className="w-8 h-8 text-aurora-violet" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-slate-900">Үйлчилгээний нөхцөл</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-aurora-violet" />
                1. Ерөнхий нөхцөл
              </h2>
              <p>
                eCard.mn платформыг ашигласнаар та энэхүү үйлчилгээний нөхцөлийг бүрэн хүлээн зөвшөөрч байна. Хэрэв санал нийлэхгүй бол платформыг ашиглахгүй байхыг хүсье. Бид үйлчилгээний нэрийг "eCard.mn - Дижитал нэрийн хуудас" гэж нэрлэдэг.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-aurora-violet" />
                2. Хэрэглэгчийн үүрэг хариуцлага
              </h2>
              <p>
                Хэрэглэгч нь өөрийн бүртгэлийн мэдээлэл, нууц үгийн аюулгүй байдлыг хангах үүрэгтэй. Дараах үйлдлүүдийг хатуу хориглоно:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Бусдын мэдээллийг зөвшөөрөлгүй ашиглах, хуурамч бүртгэл үүсгэх</li>
                <li>Системийн хэвийн үйл ажиллагаанд саад учруулах, хакерлах оролдлого хийх</li>
                <li>Зүй бус, хууль бус, аюултай агуулга бүхий мэдээлэл байршуулах</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-aurora-violet" />
                3. Оюуны өмч
              </h2>
              <p>
                eCard.mn-д байршуулах бүх загвар, код, лого, текстүүд нь платформын оюуны өмч бөгөөд зөвшөөрөлгүйгээр хуулбарлах, арилжааны зорилгоор ашиглахыг хориглоно. Хэрэглэгчийн оруулсан агуулга (зураг, текст) нь тухайн хэрэглэгчийн өмч байна.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                4. Үйлчилгээг зогсоох, цуцлах
              </h2>
              <p>
                Бид үйлчилгээний нөхцөлийг зөрчсөн хэрэглэгчийн бүртгэлийг урьдчилан мэдэгдэхгүйгээр түр хаах эсвэл бүрмөсөн устгах эрхтэй. Мөн системийн шинэчлэлт, техникийн засвар үйлчилгээ хийх үед үйлчилгээ түр тасалдах боломжтой.
              </p>
            </section>

            <section className="pt-8 border-t border-slate-100">
              <p className="text-sm italic">
                Сүүлчийн шинэчлэл: 2026.04.17
              </p>
              <p className="text-sm mt-2">
                Холбоо барих: <a href="mailto:contact@ecard.mn" className="text-aurora-violet hover:underline">contact@ecard.mn</a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
