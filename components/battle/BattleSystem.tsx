'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { soundEngine } from '@/lib/audio/soundEngine';
import { GESTURE_ATTACK_MAP } from '@/types';
import type { GestureType } from '@/types';

const GESTURE_SEQUENCE: GestureType[] = ['one-finger', 'closed-fist', 'two-fingers', 'open-palm', 'one-finger'];
const TIMEOUT_MS = 12000;
const ENCOURAGEMENTS = [
  'Strike now!', 'You can do it!', 'Fight!', 'Defend the kingdom!',
  'Quick!', 'Show your courage!', 'Attack!', 'We believe in you!',
];

export function BattleSystem() {
  const battlePhase = useStore((s) => s.battlePhase);
  const beastHealth = useStore((s) => s.beastHealth);
  const currentGesture = useStore((s) => s.currentGesture);
  const requiredGesture = useStore((s) => s.requiredGesture);
  const battleHitCount = useStore((s) => s.battleHitCount);
  const isPerformanceMode = useStore((s) => s.isPerformanceMode);
  const prevGestureRef = useRef<string>('none');
  const processedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seqIdxRef = useRef(0);

  const getStore = () => useStore.getState();

  const triggerHit = () => {
    const s = getStore();
    const gesture = s.requiredGesture;
    if (!gesture) return;
    const attack = GESTURE_ATTACK_MAP[gesture];
    if (!attack) return;

    s.setPuppetAction(attack.action);
    setTimeout(() => { if (getStore().isPerformanceMode) getStore().setPuppetAction('idle'); }, 800);

    const newHealth = s.beastHealth - attack.damage;
    s.setBeastHealth(newHealth);
    s.setBattleHitCount(s.battleHitCount + 1);

    soundEngine.playSwordClash();
    getStore().setLighting({ intensity: 0.9, color: '#ff4444', mood: 'dramatic' });
    setTimeout(() => {
      if (getStore().isPerformanceMode) {
        getStore().setLighting({ intensity: 0.3, color: '#dc2626', mood: 'dramatic' });
      }
    }, 200);

    if (newHealth <= 0) {
      s.setBattlePhase('finisher');
      s.setBattleMessage('FINAL BLOW!');
      s.setRequiredGesture('open-palm');
      s.setShowGesturePrompt(true);
      processedRef.current = false;
      return;
    }

    seqIdxRef.current++;
    if (seqIdxRef.current >= GESTURE_SEQUENCE.length) {
      seqIdxRef.current = 0;
    }
    const nextGesture = GESTURE_SEQUENCE[seqIdxRef.current];
    s.setRequiredGesture(nextGesture);
    s.setBattleMessage(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
    processedRef.current = false;

    const chars = s.scene.characters;
    const beast = chars.find((c) => c.name === 'Shadow Beast');
    if (beast) {
      s.updateCharacter(beast.id, { emotion: 'surprised' });
      setTimeout(() => {
        const c2 = getStore().scene.characters.find((c) => c.name === 'Shadow Beast');
        if (c2) getStore().updateCharacter(c2.id, { emotion: 'angry', action: 'defend' });
      }, 600);
    }
  };

  const triggerMiss = () => {
    const s = getStore();
    soundEngine.playDramaticImpact();
    s.setLighting({ intensity: 0.1, color: '#ff0000', mood: 'dramatic' });
    setTimeout(() => {
      if (getStore().isPerformanceMode) {
        getStore().setLighting({ intensity: 0.3, color: '#dc2626', mood: 'dramatic' });
      }
    }, 300);

    const chars = s.scene.characters;
    const king = chars.find((c) => c.name === 'King Aldric');
    if (king) {
      s.updateCharacter(king.id, { emotion: 'surprised', action: 'jump' });
      setTimeout(() => {
        const c2 = getStore().scene.characters.find((c) => c.name === 'King Aldric');
        if (c2) getStore().updateCharacter(c2.id, { action: 'idle' });
      }, 800);
    }

    s.setBattleMessage('Defend yourself!');
    processedRef.current = false;
  };

  const startFinisher = () => {
    const s = getStore();
    s.setBattlePhase('finisher');
    s.setRequiredGesture('open-palm');
    s.setBattleMessage('FINAL BLOW! Hold Open Palm High!');
    s.setShowGesturePrompt(true);
    processedRef.current = false;
  };

  const completeFinisher = () => {
    const s = getStore();
    soundEngine.playVictory();
    soundEngine.playApplause();
    s.setLighting({ intensity: 1.0, color: '#fbbf24', mood: 'bright' });
    s.setShowTitle('VICTORY!');
    s.setShowSubtitle('The kingdom is saved!');
    s.setBattlePhase('victory');
    s.setShowGesturePrompt(false);
    s.setRequiredGesture(null);
    s.setPuppetAction('celebrate');
    s.setPuppetEmotion('happy');
    setTimeout(() => {
      if (getStore().isPerformanceMode) {
        getStore().setShowTitle('');
        getStore().setShowSubtitle('');
        getStore().setPuppetAction('idle');
      }
    }, 3000);

    const chars = s.scene.characters;
    const king = chars.find((c) => c.name === 'King Aldric');
    if (king) s.updateCharacter(king.id, { emotion: 'happy', action: 'theaterBow' });
    const lion = chars.find((c) => c.name === 'Leo the Lion');
    if (lion) s.updateCharacter(lion.id, { emotion: 'happy', action: 'idle' });

    const beast = chars.find((c) => c.name === 'Shadow Beast');
    if (beast) {
      s.removeCharacter(beast.id);
      soundEngine.playMagicBurst();
    }

    setTimeout(() => {
      if (getStore().isPerformanceMode) {
        getStore().setBattlePhase('idle');
        getStore().setShowPhase('performing');
        getStore().setIsBattlePaused(false);
      }
    }, 2000);
  };

  // Initialize battle
  useEffect(() => {
    if (battlePhase === 'intro') {
      seqIdxRef.current = 0;
      const s = getStore();
      s.setBeastHealth(5);
      s.setBattleHitCount(0);
      s.setShowTitle('BEAT THE BLACK CREATURE');
      s.setShowSubtitle('Use hand gestures to attack!');
      s.setLighting({ intensity: 0.2, color: '#8b0000', mood: 'dramatic' });
      soundEngine.playDramaticImpact();

      setTimeout(() => {
        if (getStore().isPerformanceMode) {
          getStore().setShowTitle('');
          getStore().setShowSubtitle('');
          getStore().setBattlePhase('active');
          getStore().setRequiredGesture(GESTURE_SEQUENCE[0]);
          getStore().setBattleMessage('Strike now!');
          getStore().setShowGesturePrompt(true);
          processedRef.current = false;
        }
      }, 2500);
    }
  }, [battlePhase]);

  // Gesture matching
  useEffect(() => {
    if (battlePhase !== 'active' && battlePhase !== 'finisher') return;
    if (!requiredGesture) return;
    if (processedRef.current) return;

    const gesture = currentGesture;
    if (gesture === 'none' || gesture === prevGestureRef.current) return;

    if (gesture === requiredGesture) {
      processedRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);

      if (battlePhase === 'finisher') {
        completeFinisher();
      } else {
        triggerHit();
      }
    }
  }, [currentGesture, battlePhase, requiredGesture]);

  // Timer for misses
  useEffect(() => {
    if (battlePhase !== 'active') return;
    if (processedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!processedRef.current) {
        triggerMiss();
      }
    }, TIMEOUT_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [battlePhase, requiredGesture]);

  // Track previous gesture for edge detection
  useEffect(() => {
    prevGestureRef.current = currentGesture;
  }, [currentGesture]);

  // Reset when not in battle
  useEffect(() => {
    if (!isPerformanceMode) {
      getStore().setBattlePhase('idle');
      getStore().setRequiredGesture(null);
      getStore().setShowGesturePrompt(false);
      getStore().setIsBattlePaused(false);
    }
  }, [isPerformanceMode]);

  return null;
}
