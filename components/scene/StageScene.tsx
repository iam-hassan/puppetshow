'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store';

/**
 * The main stage scene with theater frame, curtains, floor, and audience.
 * Curtains animate based on curtainsOpen state for show intro/outro.
 */
export function StageScene() {
  const stageRef = useRef<THREE.Group>(null);
  const leftCurtainRef = useRef<THREE.Mesh>(null);
  const rightCurtainRef = useRef<THREE.Mesh>(null);
  const leftFoldRef = useRef<THREE.Mesh>(null);
  const rightFoldRef = useRef<THREE.Mesh>(null);

  const curtainsOpen = useStore((s) => s.curtainsOpen);

  useFrame(() => {
    // Curtain animation: when curtainsOpen=true, curtains slide out to sides
    // When curtainsOpen=false, curtains slide to center to cover stage
    const openOffset = curtainsOpen ? 2.2 : 0;
    const speed = 0.04;

    if (leftCurtainRef.current) {
      const targetX = -3.2 - openOffset;
      leftCurtainRef.current.position.x = THREE.MathUtils.lerp(
        leftCurtainRef.current.position.x, targetX, speed
      );
    }
    if (rightCurtainRef.current) {
      const targetX = 3.2 + openOffset;
      rightCurtainRef.current.position.x = THREE.MathUtils.lerp(
        rightCurtainRef.current.position.x, targetX, speed
      );
    }
    if (leftFoldRef.current) {
      const targetX = -2.6 - openOffset;
      leftFoldRef.current.position.x = THREE.MathUtils.lerp(
        leftFoldRef.current.position.x, targetX, speed
      );
    }
    if (rightFoldRef.current) {
      const targetX = 2.6 + openOffset;
      rightFoldRef.current.position.x = THREE.MathUtils.lerp(
        rightFoldRef.current.position.x, targetX, speed
      );
    }
  });

  return (
    <group ref={stageRef}>
      {/* Dark backdrop */}
      <mesh position={[0, 1.5, -4]}>
        <boxGeometry args={[12, 5, 0.2]} />
        <meshStandardMaterial color="#1a0a0a" roughness={0.95} />
      </mesh>

      {/* Stage floor wooden planks */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[8, 0.15, 5]} />
        <meshStandardMaterial color="#8b6914" roughness={0.7} />
      </mesh>
      {/* Floor highlight */}
      <mesh position={[0, -0.21, 0]}>
        <boxGeometry args={[7.8, 0.02, 4.8]} />
        <meshStandardMaterial color="#a07828" roughness={0.5} />
      </mesh>

      {/* Front ledge */}
      <mesh position={[0, -0.15, 2.2]}>
        <boxGeometry args={[9, 0.4, 0.6]} />
        <meshStandardMaterial color="#6b4423" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.05, 2.45]}>
        <boxGeometry args={[9.2, 0.15, 0.15]} />
        <meshStandardMaterial color="#8b6914" roughness={0.5} />
      </mesh>

      {/* Proscenium arch top frame */}
      <mesh position={[0, 3.8, -1.5]}>
        <boxGeometry args={[10, 0.5, 1]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.6} />
      </mesh>
      {/* Decorative top trim */}
      <mesh position={[0, 4.1, -1.5]}>
        <boxGeometry args={[10.2, 0.15, 0.3]} />
        <meshStandardMaterial color="#d4a574" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Left frame pillar */}
      <mesh position={[-4.8, 1.8, -1.5]}>
        <boxGeometry args={[0.5, 4.5, 1]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.6} />
      </mesh>
      {/* Right frame pillar */}
      <mesh position={[4.8, 1.8, -1.5]}>
        <boxGeometry args={[0.5, 4.5, 1]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.6} />
      </mesh>

      {/* Decorative pillar trim */}
      <mesh position={[-4.8, 3.8, -1.5]}>
        <boxGeometry args={[0.6, 0.2, 1.1]} />
        <meshStandardMaterial color="#d4a574" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[4.8, 3.8, -1.5]}>
        <boxGeometry args={[0.6, 0.2, 1.1]} />
        <meshStandardMaterial color="#d4a574" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* LEFT CURTAIN (main panel, wider for closing) */}
      <mesh ref={leftCurtainRef} position={[-3.2, 2, -2.2]}>
        <boxGeometry args={[3.5, 3.5, 0.08]} />
        <meshStandardMaterial color="#8b0000" side={THREE.DoubleSide} roughness={0.85} />
      </mesh>
      {/* Left curtain fold */}
      <mesh ref={leftFoldRef} position={[-2.6, 2, -2.2]}>
        <boxGeometry args={[0.3, 3.5, 0.08]} />
        <meshStandardMaterial color="#a50000" side={THREE.DoubleSide} roughness={0.85} />
      </mesh>

      {/* RIGHT CURTAIN (main panel, wider for closing) */}
      <mesh ref={rightCurtainRef} position={[3.2, 2, -2.2]}>
        <boxGeometry args={[3.5, 3.5, 0.08]} />
        <meshStandardMaterial color="#8b0000" side={THREE.DoubleSide} roughness={0.85} />
      </mesh>
      {/* Right curtain fold */}
      <mesh ref={rightFoldRef} position={[2.6, 2, -2.2]}>
        <boxGeometry args={[0.3, 3.5, 0.08]} />
        <meshStandardMaterial color="#a50000" side={THREE.DoubleSide} roughness={0.85} />
      </mesh>

      {/* Curtain valance scalloped top */}
      <mesh position={[0, 3.7, -2.2]}>
        <boxGeometry args={[7, 0.4, 0.1]} />
        <meshStandardMaterial color="#8b0000" side={THREE.DoubleSide} roughness={0.85} />
      </mesh>
      {/* Valance trim */}
      <mesh position={[0, 3.95, -2.2]}>
        <boxGeometry args={[7.2, 0.08, 0.12]} />
        <meshStandardMaterial color="#d4a574" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* Gold bulbs along top */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[-3.3 + i * 0.6, 3.55, -2.1]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} />
        </mesh>
      ))}

      {/* Side bulbs */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`sl-${i}`} position={[-4.55, 0.5 + i * 0.6, -2.1]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={`sr-${i}`} position={[4.55, 0.5 + i * 0.6, -2.1]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.4} />
        </mesh>
      ))}

      {/* Audience silhouettes (2 rows for depth) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <group key={`aud-${i}`} position={[-4.5 + i * 0.85, -0.15, -5.5]}>
          <mesh>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#0a0a12" />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
            <boxGeometry args={[0.3, 0.45, 0.15]} />
            <meshStandardMaterial color="#0a0a12" />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <group key={`aud2-${i}`} position={[-3.8 + i * 0.85, -0.35, -6.2]}>
          <mesh>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#050510" />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <boxGeometry args={[0.25, 0.35, 0.12]} />
            <meshStandardMaterial color="#050510" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
