'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function StageScene() {
  const stageRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (stageRef.current) {
      stageRef.current.children.forEach((child, i) => {
        if (child.userData.animate) {
          child.position.y += Math.sin(state.clock.elapsedTime * 2 + i) * 0.001;
        }
      });
    }
  });

  return (
    <group ref={stageRef}>
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[8, 0.2, 5]} />
        <meshStandardMaterial color="#5a3a1a" />
      </mesh>

      <mesh position={[-4.1, 1, -1]} castShadow>
        <boxGeometry args={[0.2, 3, 3]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[4.1, 1, -1]} castShadow>
        <boxGeometry args={[0.2, 3, 3]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[0, 2.6, -1]} castShadow>
        <boxGeometry args={[8.4, 0.2, 3]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      <mesh position={[-3.5, 1.5, -2.4]}>
        <boxGeometry args={[0.8, 2, 0.05]} />
        <meshStandardMaterial color="#8b0000" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[3.5, 1.5, -2.4]}>
        <boxGeometry args={[0.8, 2, 0.05]} />
        <meshStandardMaterial color="#8b0000" side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 2.8, -2.4]}>
        <boxGeometry args={[8, 0.3, 0.05]} />
        <meshStandardMaterial color="#8b0000" side={THREE.DoubleSide} />
      </mesh>

      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={i}
          position={[-3.6 + i * 0.6, 2.5, -2.3]}
          userData={{ animate: true }}
        >
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}
