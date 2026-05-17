'use client';

import { motion } from 'framer-motion';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="absolute top-0 left-0 right-0 z-30 pointer-events-none"
    >
      <div className="flex items-center justify-center py-4">
        <div className="bg-black/40 backdrop-blur-md rounded-full border border-purple-500/30 px-6 py-2 shadow-lg shadow-purple-500/10">
          <h1 className="text-white font-bold text-lg tracking-wide">
            <span className="text-purple-400">AI</span> Virtual Puppet Theater
          </h1>
        </div>
      </div>
    </motion.header>
  );
}
