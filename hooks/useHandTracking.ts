import { useState, useEffect, useRef, useCallback } from 'react';
import { initHandTracking } from '@/lib/mediapipe/handTracking';
import { classifyGesture, detectSwipe } from '@/lib/gestures/gestureRecognition';
import { useStore } from '@/store';
import type { HandLandmarks, GestureResult } from '@/types';

export function useHandTracking() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gestureResult, setGestureResult] = useState<GestureResult>({
    type: 'none',
    confidence: 0,
    position: { x: 0, y: 0 },
  });

  const previousPosition = useRef<{ x: number; y: number } | null>(null);
  const stopRef = useRef<{ stop: () => void } | null>(null);

  const {
    updatePuppetPosition,
    setPuppetEmotion,
    setPuppetGrabbing,
    setCurrentGesture,
    setIsHandTracking,
    puppet,
  } = useStore();

  const handleResults = useCallback(
    (results: HandLandmarks) => {
      const gesture = classifyGesture(results.landmarks);
      setGestureResult(gesture);
      setCurrentGesture(gesture.type);

      const mappedX = (gesture.position.x - 0.5) * 5;
      const mappedY = Math.max(0, (1 - gesture.position.y) * 3);

      const clampedX = Math.max(-3, Math.min(3, mappedX));
      const clampedY = Math.max(0, Math.min(3, mappedY));

      const lerpFactor = 0.12;
      const newX =
        puppet.position.x + (clampedX - puppet.position.x) * lerpFactor;
      const newY =
        puppet.position.y + (clampedY - puppet.position.y) * lerpFactor;

      updatePuppetPosition({ x: newX, y: newY, z: 0 });

      const swipe = detectSwipe(gesture.position, previousPosition.current);
      previousPosition.current = gesture.position;

      if (swipe === 'swipe-left') {
        setPuppetEmotion('sad');
      } else if (swipe === 'swipe-right') {
        setPuppetEmotion('happy');
      }

      if (gesture.type === 'pinch') {
        setPuppetGrabbing(true);
      } else if (gesture.type === 'open-palm') {
        setPuppetGrabbing(false);
        setPuppetEmotion('neutral');
      } else if (gesture.type === 'closed-fist') {
        setPuppetEmotion('angry');
      }
    },
    [
      puppet.position,
      updatePuppetPosition,
      setPuppetEmotion,
      setPuppetGrabbing,
      setCurrentGesture,
    ]
  );

  const startTracking = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      setError(null);
      setIsTracking(true);
      setIsHandTracking(true);

      stopRef.current = await initHandTracking(
        videoRef.current,
        handleResults,
        (err) => {
          setError(err.message);
          setIsTracking(false);
          setIsHandTracking(false);
        }
      );
    } catch (err) {
      setError('Failed to initialize hand tracking');
      setIsTracking(false);
      setIsHandTracking(false);
    }
  }, [handleResults, setIsHandTracking]);

  const stopTracking = useCallback(() => {
    if (stopRef.current) {
      stopRef.current.stop();
      stopRef.current = null;
    }
    setIsTracking(false);
    setIsHandTracking(false);
    previousPosition.current = null;
  }, [setIsHandTracking]);

  useEffect(() => {
    return () => {
      if (stopRef.current) {
        stopRef.current.stop();
      }
    };
  }, []);

  return {
    videoRef,
    isTracking,
    error,
    gestureResult,
    startTracking,
    stopTracking,
  };
}
