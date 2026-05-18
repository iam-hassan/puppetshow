'use client';

import { motion } from 'framer-motion';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="pointer-events-auto"
      style={{
        position: 'fixed',
        top: '0.75rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 25,
      }}
    >
      <div className="bg-black/60 backdrop-blur-sm rounded-lg border border-amber-500/20 px-5 py-1.5">
        <h1 className="text-amber-100/80 font-semibold text-sm tracking-widest uppercase whitespace-nowrap">
          <span className="text-amber-400">✦</span> Puppet Theater <span className="text-amber-400">✦</span>
        </h1>
      </div>
    </motion.header>
  );
}
