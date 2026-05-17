'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { useEffect, useState } from 'react';

export function DialogueBox() {
  const { scene } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (scene.activeDialogue) {
      setIsVisible(true);
      setDisplayedText('');

      let index = 0;
      const text = scene.activeDialogue.text;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 30);

      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 6000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [scene.activeDialogue]);

  return (
    <AnimatePresence>
      {isVisible && scene.activeDialogue && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4"
        >
          <div className="relative bg-gradient-to-r from-purple-900/90 via-purple-800/90 to-purple-900/90 backdrop-blur-md rounded-2xl border border-purple-500/30 shadow-xl shadow-purple-500/20 p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                {scene.activeDialogue.characterName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-purple-200 text-sm font-semibold mb-1">
                  {scene.activeDialogue.characterName}
                </p>
                <p className="text-white/90 text-base leading-relaxed">
                  {displayedText}
                  <span className="animate-pulse">|</span>
                </p>
              </div>
            </div>

            <div className="absolute -top-1 left-8 w-3 h-3 bg-purple-800/90 rotate-45 border-l border-t border-purple-500/30" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
