'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store';

export function SceneManager() {
  const { scene: threeScene, camera } = useThree();
  const { scene } = useStore();
  const transitionRef = useRef(false);

  useEffect(() => {
    if (scene.sceneTransition && !transitionRef.current) {
      transitionRef.current = true;

      const originalFog = threeScene.fog;
      threeScene.fog = new THREE.Fog('#000000', 0.1, 0.5);

      setTimeout(() => {
        threeScene.fog = null;
        transitionRef.current = false;
      }, 800);
    }
  }, [scene.environment, threeScene]);

  useEffect(() => {
    if (scene.weather === 'fog') {
      threeScene.fog = new THREE.Fog('#6b7280', 3, 12);
    } else if (!transitionRef.current) {
      threeScene.fog = null;
    }
  }, [scene.weather, threeScene]);

  useEffect(() => {
    const targetPosition = new THREE.Vector3(0, 2, 8);

    switch (scene.environment) {
      case 'castle':
        targetPosition.set(0, 2, 8);
        break;
      case 'pirate-ship':
        targetPosition.set(0, 3, 10);
        break;
      case 'nighttime':
        targetPosition.set(0, 2, 7);
        break;
      case 'storm':
        targetPosition.set(0, 3, 9);
        break;
      case 'forest':
        targetPosition.set(0, 2.5, 8);
        break;
      case 'desert':
        targetPosition.set(0, 2, 9);
        break;
      case 'underwater':
        targetPosition.set(0, 2, 7);
        break;
    }

    camera.position.lerp(targetPosition, 0.05);
    camera.lookAt(0, 1, 0);
  }, [scene.environment, camera]);

  return null;
}
