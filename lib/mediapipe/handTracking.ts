import type { HandLandmarks } from '@/types';

declare global {
  interface Window {
    Hands: new (config: { locateFile: (file: string) => string }) => HandsInstance;
    Camera: new (
      videoElement: HTMLVideoElement,
      config: { onFrame: () => Promise<void>; width: number; height: number }
    ) => CameraInstance;
  }
}

interface HandsInstance {
  setOptions(options: {
    maxNumHands: number;
    modelComplexity: number;
    minDetectionConfidence: number;
    minTrackingConfidence: number;
  }): void;
  onResults(callback: (results: MediaPipeResults) => void): void;
  send(data: { image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement }): Promise<void>;
  close(): void;
}

interface CameraInstance {
  start(): Promise<void>;
  stop(): void;
}

interface MediaPipeResults {
  multiHandLandmarks: number[][][] | null;
  multiHandedness: { label: string; score: number }[] | null;
}

let handsInstance: HandsInstance | null = null;
let cameraInstance: CameraInstance | null = null;
let scriptsLoaded = false;

async function loadMediaPipeScripts(): Promise<void> {
  if (scriptsLoaded) return;

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  };

  await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
  await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
  scriptsLoaded = true;
}

export async function initHandTracking(
  videoElement: HTMLVideoElement,
  onResults: (results: HandLandmarks) => void,
  onError?: (error: Error) => void
): Promise<{ stop: () => void }> {
  try {
    await loadMediaPipeScripts();

    if (handsInstance) {
      handsInstance.close();
    }

    handsInstance = new window.Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    handsInstance.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    handsInstance.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const handedness = results.multiHandedness?.[0]?.label || 'Right';

        const formattedLandmarks = landmarks.map((lm) => ({
          x: lm[0],
          y: lm[1],
          z: lm[2],
        }));

        onResults({
          landmarks: formattedLandmarks,
          handedness,
        });
      }
    });

    cameraInstance = new window.Camera(videoElement, {
      onFrame: async () => {
        if (handsInstance) {
          await handsInstance.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480,
    });

    await cameraInstance.start();
  } catch (error) {
    if (onError) {
      onError(error as Error);
    }
  }

  return {
    stop: () => {
      if (cameraInstance) {
        cameraInstance.stop();
        cameraInstance = null;
      }
      if (handsInstance) {
        handsInstance.close();
        handsInstance = null;
      }
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
