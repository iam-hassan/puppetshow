'use client';

import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { motion } from 'framer-motion';

export function VoiceInput() {
  const { isListening, startListening, stopListening, transcript, error } =
    useVoiceRecognition();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={isListening ? stopListening : startListening}
      className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
        isListening
          ? 'bg-red-500/30 border-2 border-red-400 shadow-lg shadow-red-500/30'
          : 'bg-purple-500/30 border-2 border-purple-400 shadow-lg shadow-purple-500/30 hover:bg-purple-500/40'
      }`}
    >
      {isListening && (
        <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
      )}

      <svg
        className={`w-6 h-6 ${isListening ? 'text-red-300' : 'text-purple-300'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    </motion.button>
  );
}
