import { useState, useEffect, useRef, useCallback } from 'react';
import { initHandTracking } from '@/lib/mediapipe/handTracking';
import { classifyGesture, getVelocityY, resetGestureHistory } from '@/lib/gestures/gestureRecognition';
import { useStore } from '@/store';
import { soundEngine } from '@/lib/audio/soundEngine';
import type { HandLandmarks, PuppetAction } from '@/types';
import { GESTURE_ATTACK_MAP } from '@/types';

const ACTION_DURATION = 800;

export function useHandTracking() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const landmarksRef = useRef<HandLandmarks | null>(null);
  const stopRef = useRef<{ stop: () => void } | null>(null);
  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownRef = useRef(false);
  const lastGestureType = useRef<string>('none');

  const triggerAction = useCallback((action: PuppetAction) => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    useStore.getState().setPuppetAction(action);

    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    actionTimeoutRef.current = setTimeout(() => {
      useStore.getState().setPuppetAction('idle');
      cooldownRef.current = false;
    }, ACTION_DURATION);
  }, []);

  const lastVelocityCheck = useRef(0);

  const handleResults = useCallback((results: HandLandmarks) => {
    if (!results.landmarks || results.landmarks.length === 0) {
      landmarksRef.current = null;
      return;
    }

    landmarksRef.current = results;

    const bp = useStore.getState().battlePhase;
    const isBattle = bp === 'active' || bp === 'finisher';

    const gesture = classifyGesture(results.landmarks);

    if (gesture.type !== lastGestureType.current) {
      lastGestureType.current = gesture.type;
      useStore.getState().setCurrentGesture(gesture.type);
    }

    // Position tracking (always on for puppet movement)
    const currentPuppet = useStore.getState().puppet;
    const mappedX = (gesture.position.x - 0.5) * 2;
    const mappedY = (1 - gesture.position.y) * 1.5;
    const clampedX = Math.max(-1.8, Math.min(1.8, mappedX));
    const clampedY = Math.max(0, Math.min(1.5, mappedY));
    const lerpFactor = 0.35;
    const newX = currentPuppet.position.x + (clampedX - currentPuppet.position.x) * lerpFactor;
    const newY = currentPuppet.position.y + (clampedY - currentPuppet.position.y) * lerpFactor;
    useStore.getState().updatePuppetPosition({ x: newX, y: newY, z: 3 });

    // Swipe/velocity detection (both modes)
    const velY = getVelocityY();
    const now = Date.now();
    if (now - lastVelocityCheck.current > 400) {
      lastVelocityCheck.current = now;
      if (velY < -0.035) {
        // Hand moving down fast → slam
        triggerAction('slam');
        useStore.getState().setPuppetEmotion('angry');
        return;
      } else if (velY > 0.035) {
        // Hand moving up fast → jump
        triggerAction('jump');
        useStore.getState().setPuppetEmotion('happy');
        return;
      }
    }

    const gt = gesture.type;

    if (isBattle) {
      // Battle mode → attack map
      if (gt === 'one-finger' || gt === 'closed-fist' || gt === 'open-palm' || gt === 'two-fingers') {
        const attack = GESTURE_ATTACK_MAP[gt];
        if (attack) {
          triggerAction(attack.action);
          useStore.getState().setPuppetEmotion('angry');
        }
      }
    } else {
      // Normal mode → original mapping
      if (gt === 'open-palm') {
        triggerAction('bow');
        useStore.getState().setPuppetEmotion('neutral');
      } else if (gt === 'closed-fist') {
        triggerAction('heroicStance');
        useStore.getState().setPuppetEmotion('angry');
      } else if (gt === 'one-finger') {
        triggerAction('wave');
        useStore.getState().setPuppetEmotion('happy');
      } else if (gt === 'two-fingers') {
        triggerAction('salute');
        useStore.getState().setPuppetEmotion('happy');
      } else if (gt === 'three-fingers') {
        triggerAction('celebrate');
        useStore.getState().setPuppetEmotion('happy');
      } else if (gt === 'four-fingers') {
        triggerAction('theaterBow');
        useStore.getState().setPuppetEmotion('neutral');
      }
    }
  }, [triggerAction]);

  const startTracking = useCallback(async () => {
    if (!videoRef.current) return;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, attempt * 2000));
        }

        setError(null);
        setIsTracking(true);
        useStore.getState().setIsHandTracking(true);
        soundEngine.init();
        soundEngine.startAmbient();

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 320, height: 240 },
          audio: false,
        });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const ctrl = await initHandTracking(
          videoRef.current,
          handleResults,
          () => { }
        );
        stopRef.current = ctrl;
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please allow camera access.');
          setIsTracking(false);
          useStore.getState().setIsHandTracking(false);
          return;
        }
        if (attempt === 2) {
          setError('Failed to initialize hand tracking');
          setIsTracking(false);
          useStore.getState().setIsHandTracking(false);
        } else {
          console.warn(`[HandTracking] Start attempt ${attempt + 1} failed, retrying...`);
          setIsTracking(false);
          useStore.getState().setIsHandTracking(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        }
      }
    }
  }, [handleResults]);

  const stopTracking = useCallback(() => {
    if (stopRef.current) {
      stopRef.current.stop();
      stopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    soundEngine.stopAmbient();
    setIsTracking(false);
    useStore.getState().setIsHandTracking(false);
    landmarksRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (stopRef.current) {
        stopRef.current.stop();
      }
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    };
  }, []);

  return {
    videoRef,
    isTracking,
    error,
    landmarksRef,
    startTracking,
    stopTracking,
  };
}
