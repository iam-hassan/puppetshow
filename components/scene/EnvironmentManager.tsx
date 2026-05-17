'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '@/store';

export function EnvironmentManager() {
  const { scene } = useStore();
  const groupRef = useRef<THREE.Group>(null);

  const environmentElements = useMemo(() => {
    switch (scene.environment) {
      case 'castle':
        return <CastleEnvironment />;
      case 'pirate-ship':
        return <PirateShipEnvironment />;
      case 'nighttime':
        return <NighttimeEnvironment />;
      case 'storm':
        return <StormEnvironment />;
      case 'forest':
        return <ForestEnvironment />;
      case 'desert':
        return <DesertEnvironment />;
      case 'underwater':
        return <UnderwaterEnvironment />;
      default:
        return <CastleEnvironment />;
    }
  }, [scene.environment]);

  return (
    <group ref={groupRef}>
      {environmentElements}
    </group>
  );
}

function CastleEnvironment() {
  return (
    <group>
      <mesh position={[0, -0.5, -3]} receiveShadow>
        <boxGeometry args={[10, 1, 6]} />
        <meshStandardMaterial color="#4a4a5a" />
      </mesh>

      <mesh position={[-4, 1, -4]} castShadow>
        <boxGeometry args={[1.5, 3, 1.5]} />
        <meshStandardMaterial color="#5a5a6a" />
      </mesh>
      <mesh position={[4, 1, -4]} castShadow>
        <boxGeometry args={[1.5, 3, 1.5]} />
        <meshStandardMaterial color="#5a5a6a" />
      </mesh>

      <mesh position={[-4, 2.8, -4]}>
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[4, 2.8, -4]}>
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      <mesh position={[0, 0.5, -4.5]} castShadow>
        <boxGeometry args={[3, 2, 0.3]} />
        <meshStandardMaterial color="#6a6a7a" />
      </mesh>

      <mesh position={[0, 1.5, -4.3]}>
        <boxGeometry args={[1.2, 1.5, 0.2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      <mesh position={[-2, 0.8, -4.2]}>
        <boxGeometry args={[0.3, 0.8, 0.2]} />
        <meshStandardMaterial color="#6a6a7a" />
      </mesh>
      <mesh position={[2, 0.8, -4.2]}>
        <boxGeometry args={[0.3, 0.8, 0.2]} />
        <meshStandardMaterial color="#6a6a7a" />
      </mesh>
    </group>
  );
}

function PirateShipEnvironment() {
  return (
    <group>
      <mesh position={[0, -0.3, -3]} receiveShadow>
        <boxGeometry args={[8, 0.5, 4]} />
        <meshStandardMaterial color="#8b6914" />
      </mesh>

      <mesh position={[0, 1, -4]} castShadow>
        <boxGeometry args={[0.2, 4, 0.2]} />
        <meshStandardMaterial color="#5a4a2a" />
      </mesh>

      <mesh position={[0, 2.5, -4]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>

      <mesh position={[-3.5, 0.2, -3]} castShadow>
        <boxGeometry args={[0.3, 1, 3.5]} />
        <meshStandardMaterial color="#6a5a3a" />
      </mesh>
      <mesh position={[3.5, 0.2, -3]} castShadow>
        <boxGeometry args={[0.3, 1, 3.5]} />
        <meshStandardMaterial color="#6a5a3a" />
      </mesh>

      <mesh position={[0, -0.1, -5]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
    </group>
  );
}

function NighttimeEnvironment() {
  const starsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  const starGeometry = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 10 + 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  return (
    <group>
      <mesh position={[0, -0.5, -3]} receiveShadow>
        <boxGeometry args={[10, 1, 6]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      <points ref={starsRef} geometry={starGeometry}>
        <pointsMaterial color="#ffffff" size={0.05} sizeAttenuation />
      </points>

      <mesh position={[3, 4, -6]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#fef3c7" emissive="#fef3c7" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function StormEnvironment() {
  const lightningRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (lightningRef.current) {
      lightningRef.current.visible = Math.sin(state.clock.elapsedTime * 10) > 0.95;
    }
  });

  return (
    <group>
      <mesh position={[0, -0.5, -3]} receiveShadow>
        <boxGeometry args={[10, 1, 6]} />
        <meshStandardMaterial color="#2d2d3d" />
      </mesh>

      <mesh ref={lightningRef} position={[0, 3, -4]}>
        <boxGeometry args={[0.1, 3, 0.1]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2} />
      </mesh>

      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 8, 2, -3]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#9ca3af" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function ForestEnvironment() {
  return (
    <group>
      <mesh position={[0, -0.5, -3]} receiveShadow>
        <boxGeometry args={[10, 1, 6]} />
        <meshStandardMaterial color="#2d4a2d" />
      </mesh>

      {[-3, -1, 1, 3].map((x, i) => (
        <group key={i} position={[x, 0, -4]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.2, 2, 8]} />
            <meshStandardMaterial color="#5a3a1a" />
          </mesh>
          <mesh position={[0, 1.5, 0]} castShadow>
            <coneGeometry args={[0.8, 2, 8]} />
            <meshStandardMaterial color="#228b22" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function DesertEnvironment() {
  return (
    <group>
      <mesh position={[0, -0.5, -3]} receiveShadow>
        <boxGeometry args={[10, 1, 6]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>

      <mesh position={[0, -0.3, -3]}>
        <sphereGeometry args={[5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c4956a" />
      </mesh>

      <mesh position={[2, 0.5, -3]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
        <meshStandardMaterial color="#8b6914" />
      </mesh>
    </group>
  );
}

function UnderwaterEnvironment() {
  return (
    <group>
      <mesh position={[0, -0.5, -3]} receiveShadow>
        <boxGeometry args={[10, 1, 6]} />
        <meshStandardMaterial color="#1a3a4a" />
      </mesh>

      {[-2, 0, 2].map((x, i) => (
        <mesh key={i} position={[x, 0.5, -4]}>
          <cylinderGeometry args={[0.3, 0.5, 1.5, 8]} />
          <meshStandardMaterial color="#2a5a4a" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}
