'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store';

const EYE_Y = 0.08;
const LEFT_EYE_X = -0.09;
const RIGHT_EYE_X = 0.09;
const EYE_Z = 0.26;
const PUPIL_RADIUS = 0.025;
const IRIS_RADIUS = 0.045;
const SCLERA_RADIUS = 0.065;
const EYELID_HEIGHT = 0.12;
const EYELID_WIDTH = 0.14;
const BROW_LENGTH = 0.13;
const BROW_WIDTH = 0.02;
const MAX_PUPIL_OFFSET = SCLERA_RADIUS - IRIS_RADIUS;
const MOUTH_Z = 0.31;
const MOUTH_Y = -0.08;
const MOUTH_RADIUS = 0.055;

type HeadGroupRef = React.RefObject<THREE.Group | null>;

export function EyeController({ headRef }: { headRef: HeadGroupRef }) {
  const leftUpperLidRef = useRef<THREE.Mesh>(null);
  const leftLowerLidRef = useRef<THREE.Mesh>(null);
  const rightUpperLidRef = useRef<THREE.Mesh>(null);
  const rightLowerLidRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const leftIrisRef = useRef<THREE.Mesh>(null);
  const rightIrisRef = useRef<THREE.Mesh>(null);
  const leftEyebrowRef = useRef<THREE.Mesh>(null);
  const rightEyebrowRef = useRef<THREE.Mesh>(null);
  const upperLipRef = useRef<THREE.Mesh>(null);
  const lowerLipRef = useRef<THREE.Mesh>(null);
  const mouthInnerRef = useRef<THREE.Mesh>(null);

  const eyeWhiteMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f0f0f0', roughness: 0.1 }), []);
  const irisMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a6741', roughness: 0.3 }), []);
  const pupilMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.1 }), []);
  const lidMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f5d6c6', roughness: 0.6, side: THREE.DoubleSide,
  }), []);
  const browMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8b6914', roughness: 0.7 }), []);
  const lipMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e08080', roughness: 0.4, side: THREE.DoubleSide }), []);
  const mouthInnerMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#5a1010', roughness: 0.5, side: THREE.DoubleSide }), []);

  const smooth = useRef({
    eyes: [1, 1],
    gazeX: 0, gazeY: 0,
    brow: 0,
    mouth: 0,
    hTurn: 0, hNod: 0,
  });

  useFrame(() => {
    const st = useStore.getState();
    const ta = st.isFaceTracking;

    const tLeft = ta ? st.faceTrackingOpenness[0] : 1;
    const tRight = ta ? st.faceTrackingOpenness[1] : 1;
    const tgX = ta ? st.faceGazeX : 0;
    const tgY = ta ? st.faceGazeY : 0;
    const tb = ta ? st.faceEyebrowRaise : 0;
    const tm = ta ? st.faceMouthOpenness : 0;
    const thTurn = ta ? st.faceHeadTurn : 0;
    const thNod = ta ? st.faceHeadNod : 0;

    const sp = 0.5;
    smooth.current.eyes[0] += (tLeft - smooth.current.eyes[0]) * sp;
    smooth.current.eyes[1] += (tRight - smooth.current.eyes[1]) * sp;
    smooth.current.gazeX += (tgX - smooth.current.gazeX) * sp * 0.7;
    smooth.current.gazeY += (tgY - smooth.current.gazeY) * sp * 0.7;
    smooth.current.brow += (tb - smooth.current.brow) * sp;
    smooth.current.mouth += (tm - smooth.current.mouth) * sp * 0.8;

    const hs = 0.25;
    smooth.current.hTurn += (thTurn - smooth.current.hTurn) * hs;
    smooth.current.hNod += (thNod - smooth.current.hNod) * hs;

    const leftO = smooth.current.eyes[0];
    const rightO = smooth.current.eyes[1];
    const gX = THREE.MathUtils.clamp(smooth.current.gazeX * MAX_PUPIL_OFFSET, -MAX_PUPIL_OFFSET, MAX_PUPIL_OFFSET);
    const gY = THREE.MathUtils.clamp(smooth.current.gazeY * MAX_PUPIL_OFFSET, -MAX_PUPIL_OFFSET, MAX_PUPIL_OFFSET);
    const brow = smooth.current.brow;
    const mO = smooth.current.mouth;

    if (leftUpperLidRef.current) {
      const close = (1 - leftO) * 0.9;
      leftUpperLidRef.current.position.y = EYE_Y + EYELID_HEIGHT * 0.25 - close * EYELID_HEIGHT;
    }
    if (leftLowerLidRef.current) {
      const close = (1 - leftO) * 0.9;
      leftLowerLidRef.current.position.y = EYE_Y - EYELID_HEIGHT * 0.25 + close * EYELID_HEIGHT;
    }
    if (rightUpperLidRef.current) {
      const close = (1 - rightO) * 0.9;
      rightUpperLidRef.current.position.y = EYE_Y + EYELID_HEIGHT * 0.25 - close * EYELID_HEIGHT;
    }
    if (rightLowerLidRef.current) {
      const close = (1 - rightO) * 0.9;
      rightLowerLidRef.current.position.y = EYE_Y - EYELID_HEIGHT * 0.25 + close * EYELID_HEIGHT;
    }

    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = LEFT_EYE_X + gX;
      leftPupilRef.current.position.y = EYE_Y + gY;
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = RIGHT_EYE_X + gX;
      rightPupilRef.current.position.y = EYE_Y + gY;
    }
    if (leftIrisRef.current) {
      leftIrisRef.current.position.x = LEFT_EYE_X + gX * 0.5;
      leftIrisRef.current.position.y = EYE_Y + gY * 0.5;
    }
    if (rightIrisRef.current) {
      rightIrisRef.current.position.x = RIGHT_EYE_X + gX * 0.5;
      rightIrisRef.current.position.y = EYE_Y + gY * 0.5;
    }

    if (leftEyebrowRef.current) {
      leftEyebrowRef.current.position.y = EYE_Y + 0.12 + brow * 0.15;
    }
    if (rightEyebrowRef.current) {
      rightEyebrowRef.current.position.y = EYE_Y + 0.12 + brow * 0.15;
    }

    const mouthOpen = mO;
    const lipOffset = mouthOpen * 0.04;

    if (upperLipRef.current) {
      upperLipRef.current.position.y = MOUTH_Y + lipOffset;
    }
    if (lowerLipRef.current) {
      lowerLipRef.current.position.y = MOUTH_Y - lipOffset;
    }
    if (mouthInnerRef.current) {
      const gap = mouthOpen * 0.04;
      mouthInnerRef.current.scale.y = THREE.MathUtils.lerp(mouthInnerRef.current.scale.y, 1 + mouthOpen * 2, 0.3);
    }

    if (headRef.current) {
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, smooth.current.hNod, 0.1);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, smooth.current.hTurn, 0.1);
    }
  });

  return (
    <group>
      <mesh position={[LEFT_EYE_X, EYE_Y, EYE_Z]}>
        <sphereGeometry args={[SCLERA_RADIUS, 16, 16]} />
        <primitive object={eyeWhiteMat} />
      </mesh>
      <mesh position={[RIGHT_EYE_X, EYE_Y, EYE_Z]}>
        <sphereGeometry args={[SCLERA_RADIUS, 16, 16]} />
        <primitive object={eyeWhiteMat} />
      </mesh>

      <mesh ref={leftIrisRef} position={[LEFT_EYE_X, EYE_Y, EYE_Z + 0.005]}>
        <sphereGeometry args={[IRIS_RADIUS, 12, 12]} />
        <primitive object={irisMat} />
      </mesh>
      <mesh ref={rightIrisRef} position={[RIGHT_EYE_X, EYE_Y, EYE_Z + 0.005]}>
        <sphereGeometry args={[IRIS_RADIUS, 12, 12]} />
        <primitive object={irisMat} />
      </mesh>

      <mesh ref={leftPupilRef} position={[LEFT_EYE_X, EYE_Y, EYE_Z + 0.01]}>
        <sphereGeometry args={[PUPIL_RADIUS, 8, 8]} />
        <primitive object={pupilMat} />
      </mesh>
      <mesh ref={rightPupilRef} position={[RIGHT_EYE_X, EYE_Y, EYE_Z + 0.01]}>
        <sphereGeometry args={[PUPIL_RADIUS, 8, 8]} />
        <primitive object={pupilMat} />
      </mesh>

      <mesh ref={leftUpperLidRef} position={[LEFT_EYE_X, EYE_Y + EYELID_HEIGHT * 0.25, EYE_Z]}>
        <planeGeometry args={[EYELID_WIDTH, EYELID_HEIGHT]} />
        <primitive object={lidMat} />
      </mesh>
      <mesh ref={leftLowerLidRef} position={[LEFT_EYE_X, EYE_Y - EYELID_HEIGHT * 0.25, EYE_Z]}>
        <planeGeometry args={[EYELID_WIDTH, EYELID_HEIGHT]} />
        <primitive object={lidMat} />
      </mesh>
      <mesh ref={rightUpperLidRef} position={[RIGHT_EYE_X, EYE_Y + EYELID_HEIGHT * 0.25, EYE_Z]}>
        <planeGeometry args={[EYELID_WIDTH, EYELID_HEIGHT]} />
        <primitive object={lidMat} />
      </mesh>
      <mesh ref={rightLowerLidRef} position={[RIGHT_EYE_X, EYE_Y - EYELID_HEIGHT * 0.25, EYE_Z]}>
        <planeGeometry args={[EYELID_WIDTH, EYELID_HEIGHT]} />
        <primitive object={lidMat} />
      </mesh>

      <mesh ref={leftEyebrowRef} position={[LEFT_EYE_X, EYE_Y + 0.12, EYE_Z + 0.01]}>
        <boxGeometry args={[BROW_LENGTH, BROW_WIDTH, 0.01]} />
        <primitive object={browMat} />
      </mesh>
      <mesh ref={rightEyebrowRef} position={[RIGHT_EYE_X, EYE_Y + 0.12, EYE_Z + 0.01]}>
        <boxGeometry args={[BROW_LENGTH, BROW_WIDTH, 0.01]} />
        <primitive object={browMat} />
      </mesh>

      <mesh ref={mouthInnerRef} position={[0, MOUTH_Y, MOUTH_Z]}>
        <planeGeometry args={[0.1, 0.015]} />
        <primitive object={mouthInnerMat} />
      </mesh>

      <mesh ref={upperLipRef} position={[0, MOUTH_Y, MOUTH_Z]}>
        <torusGeometry args={[MOUTH_RADIUS, 0.018, 8, 16, Math.PI]} />
        <primitive object={lipMat} />
      </mesh>
      <mesh ref={lowerLipRef} position={[0, MOUTH_Y, MOUTH_Z]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[MOUTH_RADIUS, 0.018, 8, 16, Math.PI]} />
        <primitive object={lipMat} />
      </mesh>
    </group>
  );
}
