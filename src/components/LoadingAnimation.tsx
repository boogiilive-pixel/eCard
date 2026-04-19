import { motion } from 'motion/react';

export default function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="relative w-24 h-24">
        {/* Main outer ring */}
        <motion.div
          className="absolute inset-0 border-t-2 border-l-2 border-aurora-blue/40 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner reverse ring */}
        <motion.div
          className="absolute inset-4 border-b-2 border-r-2 border-aurora-cyan/30 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center glowing orb */}
        <motion.div
          className="absolute inset-[38%] bg-gradient-to-tr from-aurora-blue to-aurora-cyan rounded-full shadow-[0_0_20px_rgba(30,144,255,0.4)]"
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Decorative pulsing ghost rings */}
        <motion.div
          className="absolute inset-0 border border-aurora-violet/10 rounded-full"
          animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <motion.div 
          className="flex gap-1"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-slate-400"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </motion.div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
          Ачаалж байна
        </span>
      </div>
    </div>
  );
}
