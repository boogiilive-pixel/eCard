import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NetworkNodes } from '../components/NetworkNodes';
import { AuroraBackground } from '../components/AuroraBackground';

export default function PrivacyPage() {
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
            <div className="p-3 bg-aurora-blue/10 rounded-2xl">
              <Shield className="w-8 h-8 text-aurora-blue" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-slate-900">Нууцлалын бодлого</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-aurora-blue" />
                1. Мэдээлэл цуглуулах
              </h2>
              <p>
                eCard.mn нь таны нэрийн хуудас үүсгэхэд шаардлагатай мэдээллийг (нэр, имэйл, утасны дугаар, ажлын газар, албан тушаал гэх мэт) цуглуулдаг. Бид Google-ээр дамжуулан нэвтрэх үед таны үндсэн мэдээллийг (нэр, зураг, имэйл) ашигладаг.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-aurora-blue" />
                2. Мэдээллийн ашиглалт
              </h2>
              <p>
                Цуглуулсан мэдээллийг дараах зорилгоор ашиглана:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Таны дижитал нэрийн хуудсыг үүсгэх, харуулах</li>
                <li>Үйлчилгээний чанарыг сайжруулах, алдаа засах</li>
                <li>Хэрэглэгчийн бүртгэл, аюулгүй байдлыг хангах</li>
                <li>Хэрэгцээтэй мэдэгдэл, шинэчлэлийг хүргэх</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-aurora-blue" />
                3. Мэдээллийн аюулгүй байдал
              </h2>
              <p>
                Бид таны мэдээллийг хамгаалахын тулд орчин үеийн шифрлэлтийн технологи (Firebase SSL) болон аюулгүй байдлын стандартуудыг ашигладаг. Таны хувийн мэдээллийг гуравдагч этгээдэд худалдахгүй, зөвшөөрөлгүйгээр хуваалцахгүй.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                4. Cookies (Күүки) ашиглалт
              </h2>
              <p>
                Системийн хэвийн ажиллагааг хангах болон нэвтрэх төлөвийг хадгалах зорилгоор Күүки ашигладаг. Та хөтөч дээрээ күүкиг хаах боломжтой боловч энэ тохиолдолд системийн зарим хэсэг ажиллахгүй байж болно.
              </p>
            </section>

            <section className="pt-8 border-t border-slate-100">
              <p className="text-sm italic">
                Сүүлчийн шинэчлэл: 2026.04.17
              </p>
              <p className="text-sm mt-2">
                Хэрэв танд ямар нэг асуулт байвал <a href="mailto:support@ecard.mn" className="text-aurora-blue hover:underline">support@ecard.mn</a> хаягаар холбогдоно уу.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
