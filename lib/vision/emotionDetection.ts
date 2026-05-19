import type { FaceLandmarks68, FaceExpressions } from '@vladmandic/face-api';

export interface EmotionOutput {
  emotion: string;
  intensity: number;
  browRaise: number;
  mouthOpenness: number;
}

const LEFT_BROW = [17, 18, 19, 20, 21] as const;
const RIGHT_BROW = [22, 23, 24, 25, 26] as const;
const LEFT_EYE_INNER = 39;
const RIGHT_EYE_INNER = 42;
const MOUTH_UPPER_CENTER = 62;
const MOUTH_LOWER_CENTER = 66;
const NOSE_BRIDGE = 27;
const CHIN = 8;

let neutralBrowGap = 0;
let neutralMouthGap = 0;
let calibFrames = 0;

export function extractFeatures(
  landmarks: FaceLandmarks68,
  expressions?: FaceExpressions
): EmotionOutput {
  const pts = landmarks.positions;

  const leftBrowY = LEFT_BROW.reduce((s, i) => s + pts[i].y, 0) / LEFT_BROW.length;
  const rightBrowY = RIGHT_BROW.reduce((s, i) => s + pts[i].y, 0) / RIGHT_BROW.length;
  const browY = (leftBrowY + rightBrowY) / 2;

  const leftEyeY = pts[LEFT_EYE_INNER].y;
  const rightEyeY = pts[RIGHT_EYE_INNER].y;
  const eyeMidY = (leftEyeY + rightEyeY) / 2;

  const faceHeight = Math.abs(pts[CHIN].y - pts[NOSE_BRIDGE].y);
  if (faceHeight < 1) return { emotion: 'neutral', intensity: 0, browRaise: 0, mouthOpenness: 0 };

  const rawBrowGap = (eyeMidY - browY) / faceHeight;
  const rawMouthGap = (pts[MOUTH_LOWER_CENTER].y - pts[MOUTH_UPPER_CENTER].y) / faceHeight;

  if (calibFrames < 30) {
    neutralBrowGap += (rawBrowGap - neutralBrowGap) / (calibFrames + 1);
    neutralMouthGap += (rawMouthGap - neutralMouthGap) / (calibFrames + 1);
    calibFrames++;
  }

  const browDelta = rawBrowGap - neutralBrowGap;
  const browRaise = Math.max(0, Math.min(1, browDelta * 30));

  const mouthDelta = rawMouthGap - neutralMouthGap;
  const mouthOpenness = Math.max(0, Math.min(1, mouthDelta * 45));

  let emotion = 'neutral';
  let intensity = 0;

  if (expressions) {
    const sorted = expressions.asSortedArray();
    const top = sorted[0];
    if (top.probability > 0.3 && top.expression !== 'neutral') {
      emotion = top.expression;
      intensity = top.probability;
    }
  }

  return { emotion, intensity, browRaise, mouthOpenness };
}
