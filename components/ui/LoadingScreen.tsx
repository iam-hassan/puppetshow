'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Initializing...');

  const stages = [
    'Initializing theater...',
    'Loading puppet models...',
    'Setting up stage...',
    'Connecting AI director...',
    'Calibrating hand tracking...',
    'Ready!',
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950"
    >
      <div className="text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="relative">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
              <span className="text-4xl">🎭</span>
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-purple-500/30 animate-ping" />
          </div>

          <h1 className="text-3xl font-bold text-white">
            AI Virtual Puppet Theater
          </h1>
          <p className="text-purple-300/80 text-sm">
            Multimodal Interactive Storytelling
          </p>
        </motion.div>

        <div className="w-64 mx-auto space-y-3">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-white/50 text-xs">{stage}</p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center gap-4 text-white/30 text-xs"
        >
          <span>Hand Tracking</span>
          <span>•</span>
          <span>Voice Control</span>
          <span>•</span>
          <span>AI Director</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
