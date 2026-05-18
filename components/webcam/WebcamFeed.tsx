'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';
import { useHandTracking } from '@/hooks/useHandTracking';

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

export function WebcamFeed({ compact = false }: { compact?: boolean }) {
  const showWebcam = useStore((s) => s.showWebcam);
  const hideCameraFeed = useStore((s) => s.hideCameraFeed);
  const currentGesture = useStore((s) => s.currentGesture);
  const puppetAction = useStore((s) => s.puppet.action);
  const battlePhase = useStore((s) => s.battlePhase);
  const { videoRef, isTracking, error, landmarksRef, startTracking, stopTracking } = useHandTracking();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const isTrackingRef = useRef(isTracking);
  isTrackingRef.current = isTracking;

  const isBattle = battlePhase === 'active' || battlePhase === 'finisher';

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frameCount = 0;

    const draw = () => {
      frameCount++;
      if (!video.videoWidth) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      const bp = useStore.getState().battlePhase;
      const throttle = (bp === 'active' || bp === 'finisher') ? 4 : 6;
      if (frameCount % throttle !== 0) {
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const current = landmarksRef.current;
      if (current && current.landmarks.length === 21) {
        const pts = current.landmarks;
        const w = canvas.width;
        const h = canvas.height;

        HAND_CONNECTIONS.forEach(([i, j]) => {
          if (pts[i] && pts[j]) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x * w, pts[i].y * h);
            ctx.lineTo(pts[j].x * w, pts[j].y * h);
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            ctx.stroke();
          }
        });

        pts.forEach((lm, idx) => {
          const isTip = [4, 8, 12, 16, 20].includes(idx);
          const isWrist = idx === 0;
          ctx.beginPath();
          ctx.arc(lm.x * w, lm.y * h, isTip ? 3.5 : isWrist ? 4 : 2, 0, Math.PI * 2);
          if (isTip) { ctx.fillStyle = '#fbbf24'; ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 6; }
          else if (isWrist) { ctx.fillStyle = '#f59e0b'; ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 8; }
          else { ctx.fillStyle = '#d97706'; ctx.shadowColor = '#d97706'; ctx.shadowBlur = 4; }
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        const px = pts[9].x * w;
        const py = pts[9].y * h;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  useEffect(() => {
    if ((showWebcam || compact) && !isTracking) {
      startTracking();
    }
    return () => {
      if (!showWebcam && !compact && isTrackingRef.current) {
        stopTracking();
      }
    };
  }, [showWebcam, compact]);

  // Determined mode: 'hidden' | 'normal' | 'compact' | 'battle'
  const isHidden = !showWebcam && !compact && !isBattle;
  if (isHidden) return null;

  const feedWidth = compact && !isBattle ? 60 : 180;
  const feedHeight = compact && !isBattle ? 45 : 135;
  const topPos = isBattle ? '0.75rem' : compact ? 'auto' : '0.75rem';
  const bottomPos = compact && !isBattle ? '5rem' : 'auto';
  const zIdx = isBattle ? 35 : 30;
  const borderStyle = isBattle ? 'border-2 border-amber-500/50' : 'border border-amber-500/30';

  const gestureLabel = currentGesture === 'none' ? '—' : currentGesture;

  return (
    <div
      className="pointer-events-auto"
      style={{
        position: 'fixed',
        top: topPos,
        bottom: bottomPos,
        right: '0.5rem',
        zIndex: zIdx,
        width: `${feedWidth}px`,
        height: `${feedHeight}px`,
      }}
    >
      {!hideCameraFeed && isBattle && (
        <div className="absolute -top-6 left-0 text-[10px] text-amber-400 font-semibold tracking-wider">
          SHOW YOUR HAND
        </div>
      )}
      <div className={`rounded-lg overflow-hidden ${hideCameraFeed ? '' : borderStyle} shadow-xl ${hideCameraFeed ? 'bg-black' : 'bg-black/70 backdrop-blur-sm'}`}>
        <div className="relative" style={{ width: `${feedWidth}px`, height: `${feedHeight}px` }}>
          {/* Always rendered — MediaPipe reads from this */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: 'scaleX(-1)' }}
          />
          {/* Black overlay blocks view but video still plays for MediaPipe */}
          {hideCameraFeed && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: '#000', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>Camera Hidden</span>
            </div>
          )}
        </div>
        {!hideCameraFeed && !compact && (
          <div className="px-2.5 py-1.5 flex items-center justify-between bg-black/80">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isTracking ? 'bg-green-400 animate-pulse' : error ? 'bg-red-400' : 'bg-amber-400'}`} />
              <span className="text-[10px] text-white/60 font-medium">{isBattle ? 'BATTLE READY' : isTracking ? 'LIVE' : error ? 'Error' : 'Loading'}</span>
            </div>
            {!isBattle && puppetAction !== 'idle' && (
              <span className="text-[10px] font-bold capitalize px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                {puppetAction}
              </span>
            )}
            <span className={`text-[10px] font-semibold capitalize ${isBattle ? 'text-green-400' : currentGesture === 'none' ? 'text-white/30' : 'text-green-400'}`}>
              {gestureLabel}
            </span>
          </div>
        )}
        {!hideCameraFeed && compact && !isBattle && isTracking && (
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mx-auto mt-0.5" />
        )}
      </div>
      {!hideCameraFeed && (
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-[10px] text-red-300">
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
