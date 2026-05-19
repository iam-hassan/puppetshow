import { FilesetResolver } from '@mediapipe/tasks-vision';

let wasmFileset: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>> | null = null;
let initPromise: Promise<void> | null = null;

export async function getWasmFileset(): Promise<typeof wasmFileset> {
  if (wasmFileset) return wasmFileset;
  if (initPromise) {
    await initPromise;
    return wasmFileset;
  }

  initPromise = (async () => {
    wasmFileset = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
    );
  })();

  await initPromise;
  return wasmFileset;
}
