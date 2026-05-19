import { FilesetResolver } from '@mediapipe/tasks-vision';

let wasmFileset: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>> | null = null;
let initPromise: Promise<void> | null = null;

async function fetchWithRetry(url: string, retries = 3): Promise<typeof wasmFileset> {
  for (let i = 0; i < retries; i++) {
    try {
      return await FilesetResolver.forVisionTasks(url);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`[WasmResolver] Attempt ${i + 1} failed, retrying in ${(i + 1) * 1000}ms...`);
      await new Promise((r) => setTimeout(r, (i + 1) * 1000));
    }
  }
  return null;
}

export async function getWasmFileset(): Promise<typeof wasmFileset> {
  if (wasmFileset) return wasmFileset;
  if (initPromise) {
    await initPromise;
    return wasmFileset;
  }

  initPromise = (async () => {
    wasmFileset = await fetchWithRetry(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm',
      3
    );
  })();

  await initPromise;
  return wasmFileset;
}
