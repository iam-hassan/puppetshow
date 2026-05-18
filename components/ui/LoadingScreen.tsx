'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Opening curtains...');

  const stages = [
    'Opening curtains...',
    'Warming up the puppets...',
    'Setting the stage...',
    'AI director ready...',
    'Stage lights calibrated...',
    'Showtime!',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }

        const newProgress = prev + Math.random() * 15 + 5;
        const stageIndex = Math.min(
          Math.floor(newProgress / 20),
          stages.length - 1
        );
        setStage(stages[stageIndex]);

        return Math.min(newProgress, 100);
      });
    }, 300);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-stone-950 via-red-950/30 to-stone-950"
    >
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <div className="relative">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-red-700 flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <span className="text-3xl">🎭</span>
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-amber-500/20 animate-ping" />
          </div>

          <h1 className="text-2xl font-bold text-amber-100 tracking-wider">
            Puppet Theater
          </h1>
          <p className="text-amber-300/50 text-xs tracking-widest uppercase">
            Interactive AI Performance
          </p>
        </motion.div>

        <div className="w-48 mx-auto space-y-2">
          <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-white/30 text-[10px]">{stage}</p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center gap-3 text-white/20 text-[10px] tracking-wider"
        >
          <span>Hand Tracking</span>
          <span>•</span>
          <span>Theater Performance</span>
          <span>•</span>
          <span>AI Director</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
