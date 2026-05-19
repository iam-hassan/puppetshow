import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = '/models';

let loaded = false;
let loading = false;

async function loadWithRetry(net: { loadFromUri: (url: string) => Promise<void> }, url: string, retries = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await net.loadFromUri(url);
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`[FaceApiModels] Load attempt ${i + 1} failed, retrying in ${(i + 1) * 1000}ms...`);
      await new Promise((r) => setTimeout(r, (i + 1) * 1000));
    }
  }
}

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
      loadWithRetry(faceapi.nets.tinyFaceDetector, MODEL_URL),
      loadWithRetry(faceapi.nets.faceLandmark68Net, MODEL_URL),
      loadWithRetry(faceapi.nets.faceExpressionNet, MODEL_URL),
    ]);
    loaded = true;
  } finally {
    loading = false;
  }
}

export function areModelsLoaded(): boolean {
  return loaded;
}
