import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = '/models';

let loaded = false;
let loading = false;

export async function loadFaceApiModels(): Promise<void> {
  if (loaded) return;
  if (loading) {
    return new Promise((resolve) => {
      const check = () => { if (loaded) resolve(); else requestAnimationFrame(check); };
      requestAnimationFrame(check);
    });
  }
  loading = true;
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    loaded = true;
  } finally {
    loading = false;
  }
}

export function areModelsLoaded(): boolean {
  return loaded;
}
