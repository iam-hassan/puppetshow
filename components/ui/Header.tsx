'use client';

import { motion } from 'framer-motion';

export function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
      className="fixed top-4 left-1/2 -translate-x-1/2 pointer-events-none"
      style={{ zIndex: 30 }}
    >
      <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200/90 via-amber-300 to-amber-400/90 drop-shadow-[0_0_15px_rgba(251,191,36,0.25)]">
        ✦ Puppet Theater ✦
      </h1>
    </motion.div>
  );
}
