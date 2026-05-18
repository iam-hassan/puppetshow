'use client';

import { useStore } from '@/store';
import { useEffect, useState, useRef } from 'react';
import { GESTURE_ATTACK_MAP } from '@/types';
import type { GestureType } from '@/types';

const GESTURE_ICONS: Record<string, string> = {
  'one-finger': '☝️',
  'closed-fist': '✊',
  'open-palm': '✋',
  'two-fingers': '✌️',
};

const GESTURE_NAMES: Record<string, string> = {
  'one-finger': 'One Finger',
  'closed-fist': 'Closed Fist',
  'open-palm': 'Open Palm',
  'two-fingers': 'Two Fingers',
};

export function BattleUI() {
  const battlePhase = useStore((s) => s.battlePhase);
  const requiredGesture = useStore((s) => s.requiredGesture);
  const beastHealth = useStore((s) => s.beastHealth);
  const battleMessage = useStore((s) => s.battleMessage);
  const showGesturePrompt = useStore((s) => s.showGesturePrompt);
  const isPerformanceMode = useStore((s) => s.isPerformanceMode);
  const [timeLeft, setTimeLeft] = useState(100);
  const [flash, setFlash] = useState(false);
  const [hitEffect, setHitEffect] = useState(false);
  const lastHealthRef = useRef(beastHealth);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer countdown
  useEffect(() => {
    if (battlePhase !== 'active' || !showGesturePrompt) {
      setTimeLeft(100);
      return;
    }
    setTimeLeft(100);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / 3500) * 100);
      setTimeLeft(remaining);
      if (remaining <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
      }
    }, 50);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [battlePhase, requiredGesture, showGesturePrompt]);

  // Hit effect on health change
  useEffect(() => {
    if (beastHealth < lastHealthRef.current) {
      setHitEffect(true);
      setFlash(true);
      setTimeout(() => setHitEffect(false), 400);
      setTimeout(() => setFlash(false), 150);
    }
    lastHealthRef.current = beastHealth;
  }, [beastHealth]);

  if (!isPerformanceMode || battlePhase === 'idle') return null;

  const maxHealth = 5;
  const hearts = [];
  for (let i = 0; i < maxHealth; i++) {
    hearts.push(
      <span key={i} className={`text-lg transition-all duration-300 ${i < beastHealth ? 'opacity-100 scale-100' : 'opacity-20 scale-75'}`}>
        {i < beastHealth ? '❤️' : '🖤'}
      </span>
    );
  }

  const attackLabel = requiredGesture ? GESTURE_ATTACK_MAP[requiredGesture]?.label || 'Attack' : '';

  return (
    <>
      {/* Red flash overlay */}
      {flash && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 40, backgroundColor: 'rgba(255,0,0,0.2)', transition: 'background-color 0.1s' }} />
      )}

      {/* Gesture Prompt */}
      {showGesturePrompt && requiredGesture && (
        <div className="fixed inset-x-0 top-1/3 flex flex-col items-center pointer-events-none" style={{ zIndex: 35 }}>
          <div className={`bg-black/70 backdrop-blur-md rounded-2xl border-2 px-10 py-6 flex flex-col items-center gap-3 transition-all duration-300 ${hitEffect ? 'border-green-400 scale-110' : 'border-amber-500/60'}`}>
            <div className="text-6xl animate-bounce">{GESTURE_ICONS[requiredGesture] || '✊'}</div>
            <div className="text-amber-100 text-xl font-bold tracking-wider uppercase">
              {GESTURE_NAMES[requiredGesture] || requiredGesture}
            </div>
            <div className="text-amber-300/80 text-sm font-medium">
              ➜ {attackLabel}
            </div>
          </div>

          {/* Message */}
          {battleMessage && (
            <div className="mt-4 text-amber-100 text-lg font-semibold tracking-wide text-center drop-shadow-lg">
              {battleMessage}
            </div>
          )}

          {/* Timer bar */}
          <div className="mt-5 w-64 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-[50ms]"
              style={{
                width: `${timeLeft}%`,
                backgroundColor: timeLeft > 50 ? '#fbbf24' : timeLeft > 25 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
        </div>
      )}

      {/* Health bar (bottom of screen) */}
      {battlePhase === 'active' && (
        <div className="fixed bottom-24 inset-x-0 flex flex-col items-center pointer-events-none" style={{ zIndex: 35 }}>
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-5 py-2 border border-red-500/30">
            <span className="text-xs text-red-300 font-semibold uppercase tracking-wider mr-1">Beast</span>
            {hearts}
          </div>
        </div>
      )}

      {/* Finisher glow */}
      {battlePhase === 'finisher' && (
        <div className="fixed inset-0 pointer-events-none" style={{
          zIndex: 30,
          background: 'radial-gradient(circle at center, rgba(251,191,36,0.15) 0%, transparent 70%)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      )}
    </>
  );
}
