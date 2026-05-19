import { HandLandmarker } from '@mediapipe/tasks-vision';
import { getWasmFileset } from './wasmResolver';
import type { HandLandmarks } from '@/types';
import { useStore } from '@/store';

let handLandmarker: HandLandmarker | null = null;

async function createWithRetry(vision: Awaited<ReturnType<typeof getWasmFileset>>, retries = 3): Promise<HandLandmarker> {
  for (let i = 0; i < retries; i++) {
    try {
      return await HandLandmarker.createFromOptions(vision!, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.7,
        minHandPresenceConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`[HandTracking] Model load attempt ${i + 1} failed, retrying in ${(i + 1) * 1500}ms...`);
      await new Promise((r) => setTimeout(r, (i + 1) * 1500));
    }
  }
  throw new Error('Failed to create HandLandmarker after retries');
}

async function initHandLandmarker(): Promise<void> {
  if (handLandmarker) return;

  const vision = await getWasmFileset();
  if (!vision) throw new Error('WASM runtime not available');

  handLandmarker = await createWithRetry(vision);
}

export async function initHandTracking(
  videoElement: HTMLVideoElement,
  onResults: (results: HandLandmarks) => void,
  onError?: (error: Error) => void
): Promise<{ stop: () => void }> {
  let running = true;
  let frameSkip = 0;
  let skipFrames = 3;

  try {
    await initHandLandmarker();

    if (!handLandmarker) {
      throw new Error('HandLandmarker not initialized');
    }

    const detectFrame = () => {
      if (!running || !handLandmarker || !videoElement) return;

      if (videoElement.readyState < 2) {
        requestAnimationFrame(detectFrame);
        return;
      }

      frameSkip++;
      const battlePhase = useStore.getState().battlePhase;
      skipFrames = (battlePhase === 'active' || battlePhase === 'finisher') ? 2 : 4;
      if (frameSkip <= skipFrames) {
        requestAnimationFrame(detectFrame);
        return;
      }
      frameSkip = 0;

      try {
        const results = handLandmarker.detectForVideo(videoElement, performance.now());

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          const handedness = results.handednesses?.[0]?.[0]?.categoryName || 'Right';

          const formattedLandmarks = landmarks.map((lm) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
          }));

          onResults({
            landmarks: formattedLandmarks,
            handedness,
          });
        } else {
          onResults({ landmarks: [], handedness: '' });
        }
      } catch (err) {
        console.warn('Detection frame error:', err);
      }

      requestAnimationFrame(detectFrame);
    };

    requestAnimationFrame(detectFrame);
  } catch (error) {
    if (onError) onError(error as Error);
    throw error;
  }

  return {
    stop: () => {
      running = false;
    },
  };
}

export function getLandmarkPosition(
  landmarks: { x: number; y: number; z: number }[],
  landmarkIndex: number
): { x: number; y: number; z: number } | null {
  if (!landmarks || landmarks.length <= landmarkIndex) return null;
  return landmarks[landmarkIndex];
}

export function getPalmCenter(
  landmarks: { x: number; y: number; z: number }[]
): { x: number; y: number } | null {
  if (!landmarks || landmarks.length < 9) return null;
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  return {
    x: (wrist.x + middleMcp.x) / 2,
    y: (wrist.y + middleMcp.y) / 2,
  };
}
