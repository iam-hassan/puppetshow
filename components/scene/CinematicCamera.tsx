'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store';

/**
 * Camera controller that provides a STATIC theater audience viewpoint during shows.
 * In normal mode, the camera gently tracks dialogue and environment changes.
 * In performance/show mode, the camera is COMPLETELY FIXED like a real theater audience.
 */

const THEATER_CAMERA = {
  position: new THREE.Vector3(0, 2.5, 8),
  target: new THREE.Vector3(0, 0.5, 2),
  fov: 50,
};

export function CinematicCamera() {
  const { camera } = useThree();
  const currentPosition = useRef(new THREE.Vector3(0, 2.5, 8));
  const currentTarget = useRef(new THREE.Vector3(0, 0.5, 2));
  const currentFov = useRef(50);

  const isPerformanceMode = useStore((s) => s.isPerformanceMode);

  useEffect(() => {
    camera.position.copy(THEATER_CAMERA.position);
    currentPosition.current.copy(THEATER_CAMERA.position);
    currentTarget.current.copy(THEATER_CAMERA.target);
    camera.lookAt(currentTarget.current);
  }, [camera]);

  useFrame(() => {
    if (isPerformanceMode) {
      /* STATIC CAMERA during show: fixed theater audience perspective.
         No drift, no rotation, no cinematic movement.
         The audience viewpoint remains completely fixed. */
      camera.position.copy(THEATER_CAMERA.position);
      camera.lookAt(THEATER_CAMERA.target);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THEATER_CAMERA.fov;
        camera.updateProjectionMatrix();
      }
      return;
    }

    /* Normal mode: gentle interpolation to environment camera */
    const targetPos = THEATER_CAMERA.position;
    const targetLook = THEATER_CAMERA.target;

    const lerpFactor = 0.03;
    currentPosition.current.lerp(targetPos, lerpFactor);
    currentTarget.current.lerp(targetLook, lerpFactor);
    currentFov.current = THREE.MathUtils.lerp(currentFov.current, THEATER_CAMERA.fov, lerpFactor);

    camera.position.copy(currentPosition.current);
    camera.lookAt(currentTarget.current);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = currentFov.current;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
