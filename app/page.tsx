'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StageCanvas } from '@/components/scene/StageCanvas';
import { WebcamFeed } from '@/components/webcam/WebcamFeed';
import { DialogueBox } from '@/components/ui/DialogueBox';
import { ControlPanel } from '@/components/ui/ControlPanel';
import { BattleUI } from '@/components/battle/BattleUI';
import { Header } from '@/components/ui/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useStore } from '@/store';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const isPerformanceMode = useStore((s) => s.isPerformanceMode);
  const showTitle = useStore((s) => s.showTitle);
  const showSubtitle = useStore((s) => s.showSubtitle);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a0a1a]">
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && (
        <>
          {/* 3D Canvas */}
          <div className="fixed inset-0" style={{ zIndex: 0 }}>
            <StageCanvas />
          </div>

          {/* Show Title Overlay (during intro/ending) */}
          <AnimatePresence>
            {showTitle && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="fixed inset-0 flex items-center justify-center pointer-events-none"
                style={{ zIndex: 15 }}
              >
                <div className="text-center">
                  <motion.h2
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="text-4xl md:text-6xl font-bold text-amber-100 tracking-widest"
                    style={{ textShadow: '0 0 60px rgba(251,191,36,0.6), 0 0 120px rgba(251,191,36,0.3)' }}
                  >
                    {showTitle}
                  </motion.h2>
                  {showSubtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="text-lg text-amber-300/60 mt-4 tracking-wider italic"
                    >
                      {showSubtitle}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* UI Layer — always keep ControlPanel/DialogueBox/WebcamFeed mounted so show timers and hand tracking survive mode toggle */}
          <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 10 }}>
            {!isPerformanceMode && <Header />}
            <WebcamFeed compact={isPerformanceMode} />
            <ControlPanel />
            <DialogueBox />
            <BattleUI />
          </div>

          {/* Bottom tip bar */}
          {!isPerformanceMode && (
            <div className="fixed bottom-3 left-1/2 -translate-x-1/2 pointer-events-auto" style={{ zIndex: 20 }}>
              <div className="bg-black/50 backdrop-blur-sm rounded-full border border-amber-500/20 px-5 py-1.5">
                <p className="text-amber-100/50 text-[10px] text-center font-medium tracking-wide">
                  Show your hand to perform • Describe a scene to transform the stage
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
