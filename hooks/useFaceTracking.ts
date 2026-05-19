'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store';
import { initFaceDetection } from '@/lib/vision/faceTracking';
import type { FaceTrackingResult } from '@/lib/vision/faceTracking';

export function useFaceTracking(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const stopRef = useRef<{ stop: () => void } | null>(null);
  const isStartedRef = useRef(false);
  const initGuardRef = useRef(false);
  const resultRef = useRef<FaceTrackingResult | null>(null);

  const smoothRef = useRef({
    leftOpen: 1, rightOpen: 1,
    gazeX: 0, gazeY: 0,
    mouthOpenness: 0,
    browRaise: 0,
    headTurn: 0, headNod: 0,
  });

  const handleResults = useCallback((result: FaceTrackingResult) => {
    resultRef.current = result;
    const s = smoothRef.current;

    s.leftOpen += (result.openness.left - s.leftOpen) * 0.5;
    s.rightOpen += (result.openness.right - s.rightOpen) * 0.5;
    s.gazeX += (result.gazeX - s.gazeX) * 0.3;
    s.gazeY += (result.gazeY - s.gazeY) * 0.3;
    s.mouthOpenness += (result.mouthOpenness - s.mouthOpenness) * 0.4;
    s.browRaise += (result.browRaise - s.browRaise) * 0.4;
    s.headTurn += (-result.gazeX * 0.6 - s.headTurn) * 0.15;
    s.headNod += (result.gazeY * 0.5 - s.headNod) * 0.15;

    const store = useStore.getState();
    store.setFaceTrackingOpenness(s.leftOpen, s.rightOpen);
    store.setFaceGaze(s.gazeX, s.gazeY);
    store.setFaceEmotion(result.emotion, result.emotionIntensity);
    store.setFaceEyebrowRaise(s.browRaise);
    store.setFaceMouthOpenness(s.mouthOpenness);
    store.setFaceHeadPose(0, result.headTurn, result.headNod);
  }, []);

  const start = useCallback(() => {
    if (isStartedRef.current) return;
    if (!videoRef.current) return;
    isStartedRef.current = true;
    useStore.getState().setIsFaceTracking(true);

    initFaceDetection(
      videoRef.current,
      handleResults,
      () => {
        isStartedRef.current = false;
        useStore.getState().setIsFaceTracking(false);
      }
    ).then((ctrl) => {
      if (ctrl) stopRef.current = ctrl;
    }    ).catch((err) => {
      console.error('[FaceTracking] Init failed:', err);
      isStartedRef.current = false;
      useStore.getState().setIsFaceTracking(false);
    });
  }, [handleResults, videoRef]);

  const stop = useCallback(() => {
    if (stopRef.current) {
      stopRef.current.stop();
      stopRef.current = null;
    }
    isStartedRef.current = false;
    useStore.getState().setIsFaceTracking(false);
  }, []);

  useEffect(() => {
    if (initGuardRef.current) return;
    initGuardRef.current = true;

    return () => {
      if (stopRef.current) {
        stopRef.current.stop();
        stopRef.current = null;
      }
      isStartedRef.current = false;
    };
  }, []);

  return { start, stop, resultRef };
}
