'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { StageCanvas } from '@/components/scene/StageCanvas';
import { WebcamFeed } from '@/components/webcam/WebcamFeed';
import { DialogueBox } from '@/components/ui/DialogueBox';
import { ControlPanel } from '@/components/ui/ControlPanel';
import { Header } from '@/components/ui/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-gray-950">
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && (
        <>
          <StageCanvas />

          <Header />

          <ControlPanel />

          <WebcamFeed />

          <DialogueBox />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-black/40 backdrop-blur-md rounded-full border border-purple-500/20 px-4 py-2">
              <p className="text-white/40 text-xs text-center">
                Use hand gestures to control puppets • Voice commands to control the scene
              </p>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
