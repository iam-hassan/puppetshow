import type { FaceLandmarks68 } from '@vladmandic/face-api';

export interface EyeTrackingOutput {
  gazeX: number;
  gazeY: number;
}

const LEFT_EYE_INNER = 39;
const LEFT_EYE_OUTER = 36;
const LEFT_EYE_TOP = 37;
const LEFT_EYE_BOTTOM = 41;
const RIGHT_EYE_INNER = 42;
const RIGHT_EYE_OUTER = 45;
const RIGHT_EYE_TOP = 43;
const RIGHT_EYE_BOTTOM = 46;

export function computeGaze(landmarks: FaceLandmarks68): EyeTrackingOutput {
  const pts = landmarks.positions;

  const leftOuter = pts[LEFT_EYE_OUTER];
  const leftInner = pts[LEFT_EYE_INNER];
  const leftTop = pts[LEFT_EYE_TOP];
  const leftBottom = pts[LEFT_EYE_BOTTOM];
  const rightOuter = pts[RIGHT_EYE_OUTER];
  const rightInner = pts[RIGHT_EYE_INNER];
  const rightTop = pts[RIGHT_EYE_TOP];
  const rightBottom = pts[RIGHT_EYE_BOTTOM];

  const leftEyeCenterX = (leftInner.x + leftOuter.x) / 2;
  const leftEyeCenterY = (leftTop.y + leftBottom.y) / 2;
  const rightEyeCenterX = (rightInner.x + rightOuter.x) / 2;
  const rightEyeCenterY = (rightTop.y + rightBottom.y) / 2;

  const leftPupilX = (pts[37].x + pts[38].x + pts[40].x + pts[41].x) / 4;
  const leftPupilY = (pts[37].y + pts[38].y + pts[40].y + pts[41].y) / 4;
  const rightPupilX = (pts[43].x + pts[44].x + pts[46].x + pts[47].x) / 4;
  const rightPupilY = (pts[43].y + pts[44].y + pts[46].y + pts[47].y) / 4;

  const leftGazeX = leftPupilX - leftEyeCenterX;
  const leftGazeY = leftPupilY - leftEyeCenterY;
  const rightGazeX = rightPupilX - rightEyeCenterX;
  const rightGazeY = rightPupilY - rightEyeCenterY;

  const leftEyeWidth = Math.abs(leftInner.x - leftOuter.x);
  const rightEyeWidth = Math.abs(rightInner.x - rightOuter.x);
  const leftEyeHeight = Math.abs(leftTop.y - leftBottom.y);
  const rightEyeHeight = Math.abs(rightTop.y - rightBottom.y);

  const gazeX = ((leftGazeX / Math.max(leftEyeWidth, 1)) + (rightGazeX / Math.max(rightEyeWidth, 1))) * 20;
  const gazeY = ((leftGazeY / Math.max(leftEyeHeight, 1)) + (rightGazeY / Math.max(rightEyeHeight, 1))) * 20;

  return {
    gazeX: Math.max(-1, Math.min(1, gazeX)),
    gazeY: Math.max(-1, Math.min(1, gazeY)),
  };
}
