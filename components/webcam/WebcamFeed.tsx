'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { useHandTracking } from '@/hooks/useHandTracking';

export function WebcamFeed() {
  const { showWebcam, isHandTracking, currentGesture } = useStore();
  const { videoRef, isTracking, error, startTracking, stopTracking } =
    useHandTracking();

  useEffect(() => {
    if (showWebcam && !isTracking) {
      startTracking();
    }
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [showWebcam]);

  if (!showWebcam) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="absolute top-4 right-4 z-20"
    >
      <div className="relative rounded-xl overflow-hidden border-2 border-purple-500/50 shadow-lg shadow-purple-500/20 backdrop-blur-sm bg-black/40">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-48 h-36 object-cover"
        />

        <HandOverlay isTracking={isTracking} gesture={currentGesture} />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/80 font-medium">
              {isTracking ? 'Tracking Active' : 'Starting...'}
            </span>
            <div
              className={`w-2 h-2 rounded-full ${
                isTracking ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
              }`}
            />
          </div>
          {currentGesture !== 'none' && (
            <span className="text-xs text-purple-300 capitalize">
              {currentGesture.replace('-', ' ')}
            </span>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg"
        >
          <p className="text-xs text-red-300">{error}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

function HandOverlay({
  isTracking,
  gesture,
}: {
  isTracking: boolean;
  gesture: string;
}) {
  return (
    <AnimatePresence>
      {isTracking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8">
            <motion.div
              animate={{
                scale: gesture === 'pinch' ? 0.5 : 1,
                borderColor:
                  gesture === 'pinch'
                    ? '#a855f7'
                    : gesture === 'closed-fist'
                    ? '#ef4444'
                    : '#22c55e',
              }}
              className="w-full h-full border-2 border-green-400 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
