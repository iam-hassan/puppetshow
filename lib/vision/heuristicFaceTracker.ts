const CW = 160;
const CH = 120;

export interface HeuristicFaceResult {
  openness: { left: number; right: number };
  gazeX: number;
  gazeY: number;
  mouthOpenness: number;
  faceDetected: boolean;
  landmarks: { x: number; y: number; z: number }[];
}

export const FACE_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [6, 7], [7, 8], [8, 9], [9, 10], [10, 11],
  [2, 8], [3, 9],
  [0, 6], [5, 11],
  [12, 13], [13, 14],
  [15, 16], [16, 17], [17, 18], [18, 15],
  [19, 20], [19, 21],
  [20, 0], [21, 5],
  [20, 22], [21, 22],
  [22, 23],
];

function estimateLandmarks(
  le: { x: number; y: number },
  re: { x: number; y: number },
  fb: { x: number; y: number; w: number; h: number }
): { x: number; y: number; z: number }[] {
  const ed = re.x - le.x;
  const eyeY = (le.y + re.y) / 2;
  const cx = (le.x + re.x) / 2;
  return [
    { x: le.x - ed * 0.25, y: le.y, z: 0 },
    { x: le.x, y: le.y, z: 0 },
    { x: le.x + ed * 0.15, y: le.y, z: 0 },
    { x: re.x - ed * 0.15, y: re.y, z: 0 },
    { x: re.x, y: re.y, z: 0 },
    { x: re.x + ed * 0.25, y: re.y, z: 0 },
    { x: le.x - ed * 0.3, y: eyeY - ed * 0.5, z: 0 },
    { x: le.x, y: eyeY - ed * 0.55, z: 0 },
    { x: le.x + ed * 0.2, y: eyeY - ed * 0.5, z: 0 },
    { x: re.x - ed * 0.2, y: eyeY - ed * 0.5, z: 0 },
    { x: re.x, y: eyeY - ed * 0.55, z: 0 },
    { x: re.x + ed * 0.3, y: eyeY - ed * 0.5, z: 0 },
    { x: cx, y: eyeY + ed * 0.3, z: 0 },
    { x: cx, y: fb.y + fb.h * 0.6, z: 0 },
    { x: cx, y: fb.y + fb.h * 0.65, z: 0 },
    { x: le.x + ed * 0.1, y: fb.y + fb.h * 0.72, z: 0 },
    { x: cx, y: fb.y + fb.h * 0.7, z: 0 },
    { x: re.x - ed * 0.1, y: fb.y + fb.h * 0.72, z: 0 },
    { x: cx, y: fb.y + fb.h * 0.78, z: 0 },
    { x: cx, y: fb.y + fb.h * 0.92, z: 0 },
    { x: fb.x + fb.w * 0.15, y: fb.y + fb.h * 0.3, z: 0 },
    { x: fb.x + fb.w * 0.85, y: fb.y + fb.h * 0.3, z: 0 },
    { x: fb.x + fb.w * 0.1, y: fb.y + fb.h * 0.7, z: 0 },
    { x: fb.x + fb.w * 0.9, y: fb.y + fb.h * 0.7, z: 0 },
  ];
}

function rgbToHsv(r: number, g: number, b: number) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0, s = max === 0 ? 0 : d / max, v = max / 255;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h, s, v };
}

function isSkin(r: number, g: number, b: number) {
  const { h, s, v } = rgbToHsv(r, g, b);
  const hue = h * 360;
  return hue >= 0 && hue <= 30 && s >= 0.08 && s <= 0.85 && v >= 0.15 && v <= 0.95;
}

export function createHeuristicTracker() {
  const offscreen = document.createElement('canvas');
  offscreen.width = CW;
  offscreen.height = CH;
  const ctx = offscreen.getContext('2d', { willReadFrequently: true })!;
  const buf = new Uint8Array(CW * CH * 4);

  let prevLeftDark = 0;
  let prevRightDark = 0;
  let blinkCooldown = 0;

  let latestFace: {
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    faceBox: { x: number; y: number; w: number; h: number };
  } | null = null;

  return {
    track(video: HTMLVideoElement): HeuristicFaceResult {
      ctx.drawImage(video, 0, 0, CW, CH);
      const imgData = ctx.getImageData(0, 0, CW, CH);
      buf.set(imgData.data);

      if (blinkCooldown > 0) blinkCooldown--;

      // Skin-color face detection
      let sumX = 0, sumY = 0, count = 0;
      let minX = CW, maxX = 0, minY = CH, maxY = 0;
      for (let row = 0; row < CH; row++) {
        for (let col = 0; col < CW; col++) {
          const i = (row * CW + col) << 2;
          if (isSkin(buf[i], buf[i + 1], buf[i + 2])) {
            sumX += col; sumY += row; count++;
            if (col < minX) minX = col;
            if (col > maxX) maxX = col;
            if (row < minY) minY = row;
            if (row > maxY) maxY = row;
          }
        }
      }

      const faceDetected = count > CW * CH * 0.01;

      if (faceDetected) {
        const cx = sumX / count;
        const cy = sumY / count;
        const pw = Math.max(maxX - minX, 30);
        const ph = Math.max(maxY - minY, 40);
        const fx = Math.max(0, cx - pw * 0.4);
        const fy = Math.max(0, cy - ph * 0.35);
        latestFace = {
          leftEye: { x: fx + pw * 0.3, y: fy + ph * 0.4 },
          rightEye: { x: fx + pw * 0.7, y: fy + ph * 0.4 },
          faceBox: { x: fx, y: fy, w: Math.min(CW - fx, pw), h: Math.min(CH - fy, ph) },
        };
      }

      if (!latestFace) {
        prevLeftDark = 0; prevRightDark = 0;
        return {
          openness: { left: 1, right: 1 }, gazeX: 0, gazeY: 0, mouthOpenness: 0,
          faceDetected: false, landmarks: [],
        };
      }

      const half = 10;
      const thresh = 60;
      const getDark = (cx: number, cy: number) => {
        let total = 0, dark = 0;
        for (let row = Math.max(0, cy - half); row < Math.min(CH, cy + half); row++) {
          for (let col = Math.max(0, cx - half); col < Math.min(CW, cx + half); col++) {
            const i = (row * CW + col) << 2;
            const g = (buf[i] + buf[i + 1] + buf[i + 2]) / 3;
            total++; if (g < thresh) dark++;
          }
        }
        return total === 0 ? 0 : dark / total;
      };

      const leftDark = getDark(Math.round(latestFace.leftEye.x), Math.round(latestFace.leftEye.y));
      const rightDark = getDark(Math.round(latestFace.rightEye.x), Math.round(latestFace.rightEye.y));
      const avgDark = (leftDark + rightDark) / 2;
      const avgPrev = (prevLeftDark + prevRightDark) / 2;
      const darkDelta = avgPrev - avgDark;

      let leftOpen = 1, rightOpen = 1;
      if (darkDelta > 0.08 && blinkCooldown === 0) { blinkCooldown = 6; leftOpen = 0.1; rightOpen = 0.1; }
      if (blinkCooldown > 3) { leftOpen = 0.1; rightOpen = 0.1; }
      else if (blinkCooldown > 0) { const t = (6 - blinkCooldown) / 6; leftOpen = t; rightOpen = t; }

      prevLeftDark = leftDark; prevRightDark = rightDark;

      const cx = (latestFace.leftEye.x + latestFace.rightEye.x) / 2;
      const cy = (latestFace.leftEye.y + latestFace.rightEye.y) / 2;
      const gazeX = ((cx / CW) - 0.5) * 2;
      const gazeY = ((cy / CH) - 0.35) * 2;

      const mc = Math.round(latestFace.faceBox.x + latestFace.faceBox.w / 2);
      const my = Math.round(latestFace.faceBox.y + latestFace.faceBox.h * 0.78);
      let total = 0, dark = 0;
      for (let row = Math.max(0, my - half); row < Math.min(CH, my + half); row++) {
        for (let col = Math.max(0, mc - half); col < Math.min(CW, mc + half); col++) {
          const i = (row * CW + col) << 2;
          const g = (buf[i] + buf[i + 1] + buf[i + 2]) / 3;
          total++; if (g < thresh) dark++;
        }
      }
      const mouthOpenness = Math.min(1, (total === 0 ? 0 : dark / total) * 5);

      return {
        openness: { left: leftOpen, right: rightOpen },
        gazeX, gazeY, mouthOpenness,
        faceDetected: true,
        landmarks: estimateLandmarks(latestFace.leftEye, latestFace.rightEye, latestFace.faceBox),
      };
    },
  };
}
