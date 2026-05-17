'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store';

export function LightingController() {
  const { scene } = useStore();
  const mainLightRef = useRef<THREE.DirectionalLight>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);

  useFrame(() => {
    if (mainLightRef.current) {
      mainLightRef.current.intensity = THREE.MathUtils.lerp(
        mainLightRef.current.intensity,
        scene.lighting.intensity,
        0.05
      );
      mainLightRef.current.color.set(scene.lighting.color);
    }

    if (spotLightRef.current) {
      spotLightRef.current.intensity = scene.lighting.intensity * 0.5;
    }
  });

  const getLightColor = () => {
    switch (scene.lighting.mood) {
      case 'dramatic':
        return '#ff6b35';
      case 'mysterious':
        return '#4a3b8c';
      case 'dim':
        return '#6b7280';
      default:
        return scene.lighting.color;
    }
  };

  return (
    <>
      <directionalLight
        ref={mainLightRef}
        position={[5, 8, 5]}
        intensity={scene.lighting.intensity}
        color={getLightColor()}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <spotLight
        ref={spotLightRef}
        position={[0, 6, 2]}
        angle={0.3}
        penumbra={0.5}
        intensity={scene.lighting.intensity * 0.5}
        color={getLightColor()}
        castShadow
      />

      <pointLight position={[-3, 3, 2]} intensity={0.3} color="#60a5fa" />
      <pointLight position={[3, 3, 2]} intensity={0.3} color="#f472b6" />
    </>
  );
}
