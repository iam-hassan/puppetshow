import * as faceapi from '@vladmandic/face-api';
import { loadFaceApiModels } from './faceApiModels';
import { computeEAR, computeEyeOpenness } from './blinkDetection';
import { extractFeatures } from './emotionDetection';
import { computeGaze } from './eyeTracking';

export interface FaceApiResult {
  faceDetected: boolean;
  openness: { left: number; right: number };
  earRaw: { left: number; right: number };
  gazeX: number;
  gazeY: number;
  emotion: string;
  emotionIntensity: number;
  browRaise: number;
  mouthOpenness: number;
  headTurn: number;
  headNod: number;
  landmarks: { x: number; y: number; z: number }[];
}

const neutralTurn = { value: 0, frames: 0 };
const neutralNod = { value: 0, frames: 0 };

function computeHeadPose(landmarks: faceapi.FaceLandmarks68): { headTurn: number; headNod: number } {
  const pts = landmarks.positions;
  const noseTip = pts[30];
  const noseBridge = pts[27];
  const jawLeft = pts[0];
  const jawRight = pts[16];
  const chin = pts[8];

  const faceWidth = Math.abs(jawRight.x - jawLeft.x);
  const faceHeight = Math.abs(chin.y - noseBridge.y);
  if (faceWidth < 1 || faceHeight < 1) return { headTurn: 0, headNod: 0 };

  const rawTurn = (noseTip.x - noseBridge.x) / faceWidth;
  const rawNod = (noseTip.y - noseBridge.y) / faceHeight;

  if (neutralTurn.frames < 60) {
    neutralTurn.value += (rawTurn - neutralTurn.value) / (neutralTurn.frames + 1);
    neutralNod.value += (rawNod - neutralNod.value) / (neutralNod.frames + 1);
    neutralTurn.frames++;
    neutralNod.frames++;
  }

  const turnOffset = rawTurn - neutralTurn.value;
  const nodOffset = rawNod - neutralNod.value;

  const headTurn = Math.max(-1, Math.min(1, -(turnOffset) * 15));
  const headNod = Math.max(-1, Math.min(1, nodOffset * 12));

  return { headTurn, headNod };
}

export async function startFaceApiDetection(
  videoElement: HTMLVideoElement,
  onResults: (result: FaceApiResult) => void,
  onError?: (error: Error) => void
): Promise<{ stop: () => void }> {
  let running = true;
  let animFrameId = 0;
  let frameSkip = 0;
  const skipFrames = 3;
  let lastVideoTime = -1;

  try {
    await loadFaceApiModels();

    if (videoElement.readyState < 2) {
      await new Promise<void>((resolve) => {
        const onLoad = () => { videoElement.removeEventListener('loadedmetadata', onLoad); resolve(); };
        videoElement.addEventListener('loadedmetadata', onLoad);
      });
    }

    const detectFrame = async () => {
      if (!running || !videoElement) return;

      const ct = videoElement.currentTime;
      if (ct === lastVideoTime || videoElement.readyState < 2) {
        animFrameId = requestAnimationFrame(detectFrame);
        return;
      }
      lastVideoTime = ct;

      frameSkip++;
      if (frameSkip <= skipFrames) {
        animFrameId = requestAnimationFrame(detectFrame);
        return;
      }
      frameSkip = 0;

      try {
        const detection = await faceapi
          .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
          .withFaceLandmarks()
          .withFaceExpressions();

        if (detection) {
          const { landmarks: lm, expressions } = detection;
          const ear = computeEAR(lm);
          const leftOpen = computeEyeOpenness(ear.left);
          const rightOpen = computeEyeOpenness(ear.right);
          const gaze = computeGaze(lm);
          const features = extractFeatures(lm, expressions);
          const formatted = lm.positions.map(p => ({ x: p.x, y: p.y, z: 0 }));
          const pose = computeHeadPose(lm);

          onResults({
            faceDetected: true,
            openness: { left: leftOpen, right: rightOpen },
            earRaw: { left: ear.left, right: ear.right },
            gazeX: gaze.gazeX,
            gazeY: gaze.gazeY,
            emotion: features.emotion,
            emotionIntensity: features.intensity,
            browRaise: features.browRaise,
            mouthOpenness: features.mouthOpenness,
            headTurn: pose.headTurn,
            headNod: pose.headNod,
            landmarks: formatted,
          });
        } else {
          onResults({
            faceDetected: false,
            openness: { left: 1, right: 1 },
            earRaw: { left: 0, right: 0 },
            gazeX: 0, gazeY: 0,
            emotion: 'neutral',
            emotionIntensity: 0,
            browRaise: 0,
            mouthOpenness: 0,
            headTurn: 0, headNod: 0,
            landmarks: [],
          });
        }
      } catch (err) {
        console.warn('[FaceApi] Detection error:', err);
      }

      animFrameId = requestAnimationFrame(detectFrame);
    };

    animFrameId = requestAnimationFrame(detectFrame);
  } catch (error) {
    if (onError) onError(error as Error);
    console.error('[FaceApi] Init error:', error);
  }

  return {
    stop: () => {
      running = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
    },
  };
}
