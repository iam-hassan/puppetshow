import type { GestureResult, GestureType, Landmark } from '@/types';

const GESTURE_HISTORY_SIZE = 5;
let gestureHistory: GestureType[] = [];

export function classifyGesture(landmarks: Landmark[]): GestureResult {
  if (!landmarks || landmarks.length < 21) {
    return { type: 'none', confidence: 0, position: { x: 0, y: 0 } };
  }

  const fingers = getFingerStates(landmarks);
  const extendedCount = fingers.filter((f) => f).length;

  let gesture: GestureType = 'none';
  let confidence = 0;

  if (extendedCount >= 4) {
    gesture = 'open-palm';
    confidence = 0.9;
  } else if (extendedCount === 0) {
    gesture = 'closed-fist';
    confidence = 0.9;
  } else if (isPinching(landmarks)) {
    gesture = 'pinch';
    confidence = 0.85;
  }

  const position = {
    x: landmarks[9].x,
    y: landmarks[9].y,
  };

  const smoothedGesture = smoothGesture(gesture);

  return {
    type: smoothedGesture,
    confidence,
    position,
  };
}

function getFingerStates(landmarks: Landmark[]): boolean[] {
  const fingerTips = [4, 8, 12, 16, 20];
  const fingerPips = [3, 6, 10, 14, 18];

  return fingerTips.map((tipIdx, i) => {
    if (i === 0) {
      return landmarks[tipIdx].x < landmarks[2].x;
    }
    return landmarks[tipIdx].y < landmarks[fingerPips[i]].y;
  });
}

function isPinching(landmarks: Landmark[]): boolean {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];

  const distance = Math.sqrt(
    Math.pow(thumbTip.x - indexTip.x, 2) +
      Math.pow(thumbTip.y - indexTip.y, 2)
  );

  return distance < 0.05;
}

function smoothGesture(current: GestureType): GestureType {
  gestureHistory.push(current);

  if (gestureHistory.length > GESTURE_HISTORY_SIZE) {
    gestureHistory.shift();
  }

  const counts: Record<string, number> = {};
  gestureHistory.forEach((g) => {
    counts[g] = (counts[g] || 0) + 1;
  });

  let maxCount = 0;
  let dominantGesture: GestureType = 'none';

  Object.entries(counts).forEach(([gesture, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantGesture = gesture as GestureType;
    }
  });

  if (maxCount >= 3) {
    return dominantGesture;
  }

  return current;
}

export function detectSwipe(
  currentPos: { x: number; y: number },
  previousPos: { x: number; y: number } | null
): 'swipe-left' | 'swipe-right' | null {
  if (!previousPos) return null;

  const dx = currentPos.x - previousPos.x;
  const threshold = 0.08;

  if (dx > threshold) return 'swipe-right';
  if (dx < -threshold) return 'swipe-left';

  return null;
}

export function resetGestureHistory(): void {
  gestureHistory = [];
}
