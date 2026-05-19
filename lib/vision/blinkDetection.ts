import type { Point, FaceLandmarks68 } from '@vladmandic/face-api';

const LEFT_EYE = [36, 37, 38, 39, 40, 41] as const;
const RIGHT_EYE = [42, 43, 44, 45, 46, 47] as const;

function euclidean(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function computeEAR(landmarks: FaceLandmarks68): { left: number; right: number } {
  const pts = landmarks.positions;

  const leftEye = LEFT_EYE.map(i => pts[i]);
  const rightEye = RIGHT_EYE.map(i => pts[i]);

  const leftVertical = (euclidean(leftEye[1], leftEye[5]) + euclidean(leftEye[2], leftEye[4])) / 2;
  const leftHorizontal = euclidean(leftEye[0], leftEye[3]);
  const leftEAR = leftHorizontal > 0.001 ? leftVertical / leftHorizontal : 0;

  const rightVertical = (euclidean(rightEye[1], rightEye[5]) + euclidean(rightEye[2], rightEye[4])) / 2;
  const rightHorizontal = euclidean(rightEye[0], rightEye[3]);
  const rightEAR = rightHorizontal > 0.001 ? rightVertical / rightHorizontal : 0;

  return { left: leftEAR, right: rightEAR };
}

export function computeEyeOpenness(ear: number): number {
  return Math.max(0, Math.min(1, (ear - 0.005) * 20));
}
