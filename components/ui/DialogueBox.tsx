'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { useEffect, useState } from 'react';

function getDialogueStyle(emotion: string) {
  switch (emotion) {
    case 'angry':
      return {
        bg: 'bg-red-950/80',
        border: 'border-red-500/30',
        avatar: 'bg-red-600',
        nameColor: 'text-red-300',
        textColor: 'text-red-100/90',
      };
    case 'happy':
      return {
        bg: 'bg-amber-950/80',
        border: 'border-amber-500/30',
        avatar: 'bg-amber-600',
        nameColor: 'text-amber-300',
        textColor: 'text-amber-100/90',
      };
    case 'surprised':
      return {
        bg: 'bg-purple-950/80',
        border: 'border-purple-500/30',
        avatar: 'bg-purple-600',
        nameColor: 'text-purple-300',
        textColor: 'text-purple-100/90',
      };
    case 'sad':
      return {
        bg: 'bg-blue-950/80',
        border: 'border-blue-500/30',
        avatar: 'bg-blue-600',
        nameColor: 'text-blue-300',
        textColor: 'text-blue-100/90',
      };
    default:
      return {
        bg: 'bg-stone-950/80',
        border: 'border-amber-500/20',
        avatar: 'bg-amber-700',
        nameColor: 'text-amber-200',
        textColor: 'text-stone-200/90',
      };
  }
}

export function DialogueBox() {
  const activeDialogue = useStore((s) => s.scene.activeDialogue);
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (activeDialogue) {
      setIsVisible(true);
      setDisplayedText('');

      let index = 0;
      const text = activeDialogue.text;
      const isAngry = activeDialogue.emotion === 'angry';
      const speed = isAngry ? 25 : 35;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, speed);

      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 7000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [activeDialogue]);

  if (!activeDialogue) return null;

  const style = getDialogueStyle(activeDialogue.emotion);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4"
        >
          <div className={`${style.bg} backdrop-blur-sm rounded-xl border ${style.border} p-4 shadow-2xl`}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${style.avatar} flex items-center justify-center text-white font-bold text-xs`}>
                {activeDialogue.characterName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`${style.nameColor} text-xs font-semibold mb-0.5 uppercase tracking-wider`}>
                  {activeDialogue.characterName}
                </p>
                <p className={`${style.textColor} text-sm leading-relaxed italic`}>
                  {displayedText}
                  <span className="animate-pulse ml-0.5">✦</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
