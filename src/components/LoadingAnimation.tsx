import { motion } from 'motion/react';

export default function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <motion.div
          className="absolute inset-0 border-4 border-aurora-violet/20 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.div
          className="absolute inset-0 border-4 border-t-aurora-violet border-r-transparent border-b-transparent border-l-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 border-4 border-t-aurora-cyan border-r-transparent border-b-transparent border-l-transparent rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <motion.p
        className="text-aurora-violet font-serif font-bold tracking-widest uppercase text-xs"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Уншиж байна...
      </motion.p>
    </div>
  );
}
