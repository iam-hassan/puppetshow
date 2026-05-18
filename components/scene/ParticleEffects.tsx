'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store';

export function ParticleEffects() {
  const weather = useStore((s) => s.scene.weather);
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const count = getParticleCount(weather);
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = Math.random() * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [weather]);

  const velocities = useMemo(() => {
    const count = getParticleCount(weather);
    const vel = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      vel[i] = Math.random() * 0.5 + 0.2;
    }
    return vel;
  }, [weather]);

  useFrame((state, delta) => {
    if (!pointsRef.current || weather === 'clear') return;

    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const count = pos.length / 3;

    for (let i = 0; i < count; i++) {
      if (weather === 'rain' || weather === 'storm') {
        pos[i * 3 + 1] -= velocities[i] * delta * 10;
        if (pos[i * 3 + 1] < -1) {
          pos[i * 3 + 1] = 10;
        }
      } else if (weather === 'snow') {
        pos[i * 3 + 1] -= velocities[i] * delta * 2;
        pos[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.01;
        if (pos[i * 3 + 1] < -1) {
          pos[i * 3 + 1] = 10;
        }
      } else {
        pos[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i * 0.1) * 0.002;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const getMaterialProps = () => {
    switch (weather) {
      case 'rain':
        return { color: '#9ca3af', size: 0.02, opacity: 0.6 };
      case 'storm':
        return { color: '#6b7280', size: 0.02, opacity: 0.6 };
      case 'snow':
        return { color: '#ffffff', size: 0.05, opacity: 0.8 };
      case 'fog':
        return { color: '#9ca3af', size: 0.1, opacity: 0.2 };
      default:
        return { color: '#fef3c7', size: 0.03, opacity: 0.3 };
    }
  };

  const materialProps = getMaterialProps();

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        {...materialProps}
        transparent
        sizeAttenuation
      />
    </points>
  );
}

function getParticleCount(weather: string): number {
  switch (weather) {
    case 'rain':
      return 500;
    case 'storm':
      return 800;
    case 'snow':
      return 300;
    case 'fog':
      return 100;
    default:
      return 50;
  }
}
