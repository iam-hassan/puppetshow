import type { GestureResult, GestureType, Landmark } from '@/types';

const GESTURE_HISTORY_SIZE = 6;
let gestureHistory: GestureType[] = [];

let lastY: number | null = null;
let velocityY = 0;

export function classifyGesture(landmarks: Landmark[]): GestureResult {
  if (!landmarks || landmarks.length < 21) {
    return { type: 'none', confidence: 0, position: { x: 0.5, y: 0.5 } };
  }

  const fingers = getFingerStates(landmarks);
  const extendedCount = fingers.filter((f) => f).length;

  let gesture: GestureType = 'none';
  let confidence = 0;

  if (extendedCount === 0) {
    gesture = 'closed-fist';
    confidence = 0.9;
  } else if (extendedCount === 1) {
    gesture = 'one-finger';
    confidence = 0.85;
  } else if (extendedCount === 2) {
    gesture = 'two-fingers';
    confidence = 0.85;
  } else if (extendedCount === 3) {
    gesture = 'three-fingers';
    confidence = 0.85;
  } else if (extendedCount === 4) {
    gesture = 'four-fingers';
    confidence = 0.85;
  } else {
    gesture = 'open-palm';
    confidence = 0.95;
  }

  const position = {
    x: landmarks[9].x,
    y: landmarks[9].y,
  };

  velocityY = lastY !== null ? position.y - lastY : 0;
  lastY = position.y;

  const smoothedGesture = smoothGesture(gesture);

  return {
    type: smoothedGesture,
    confidence,
    position,
  };
}

export function getVelocityY(): number {
  return velocityY;
}

export function resetVelocity(): void {
  lastY = null;
  velocityY = 0;
}

function getFingerStates(landmarks: Landmark[]): boolean[] {
  const fingerTips = [4, 8, 12, 16, 20];
  const fingerMcps = [2, 5, 9, 13, 17];
  const wrist = landmarks[0];

  return fingerTips.map((tipIdx, i) => {
    const tip = landmarks[tipIdx];
    const mcp = landmarks[fingerMcps[i]];

    if (i === 0) {
      const indexMcp = landmarks[5];
      const tipToIndex = distance(tip, indexMcp);
      const handSize = distance(wrist, landmarks[9]);
      return tipToIndex > handSize * 0.45;
    }

    const tipToWrist = distance(tip, wrist);
    const mcpToWrist = distance(mcp, wrist);

    if (i === 3) {
      return tipToWrist > mcpToWrist * 1.5;
    }
    if (i === 4) {
      return tipToWrist > mcpToWrist * 1.3;
    }
    return tipToWrist > mcpToWrist * 1.35;
  });
}

function distance(a: Landmark, b: Landmark): number {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow((a.z || 0) - (b.z || 0), 2)
  );
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

  Object.entries(counts).forEach(([g, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantGesture = g as GestureType;
    }
  });

  if (maxCount >= 4) {
    return dominantGesture;
  }

  return current;
}

export function resetGestureHistory(): void {
  gestureHistory = [];
  resetVelocity();
}
