'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Character } from '@/types';

interface PuppetCharacterProps {
  character: Character;
  isPlayer?: boolean;
}

export function PuppetCharacter({ character, isPlayer = false }: PuppetCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const targetY = character.position.y + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      0.1
    );

    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      character.position.x,
      0.1
    );

    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      character.position.z,
      0.1
    );

    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  const bodyColor = getCharacterColor(character.type, character.color);
  const headColor = getHeadColor(character.type);

  return (
    <group ref={groupRef} position={[character.position.x, character.position.y, character.position.z]}>
      <group ref={headRef} position={[0, 1.2, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color={headColor} roughness={0.3} />
        </mesh>

        {renderEyes(character.emotion)}
        {renderMouth(character.emotion)}
        {renderHeadAccessory(character.type)}
      </group>

      <mesh ref={bodyRef} position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.8, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} />
      </mesh>

      <group position={[0.35, 0.5, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
      </group>

      <group position={[-0.35, 0.5, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
      </group>

      {isPlayer && (
        <Text
          position={[0, 2, 0]}
          fontSize={0.2}
          color="#60a5fa"
          anchorX="center"
          anchorY="middle"
        >
          {character.name}
        </Text>
      )}
    </group>
  );
}

function renderEyes(emotion: string) {
  const eyeY = 0.05;
  const eyeSpacing = 0.12;

  switch (emotion) {
    case 'angry':
      return (
        <>
          <mesh position={[-eyeSpacing, eyeY, 0.3]}>
            <boxGeometry args={[0.08, 0.04, 0.02]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[eyeSpacing, eyeY, 0.3]}>
            <boxGeometry args={[0.08, 0.04, 0.02]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </>
      );
    case 'happy':
      return (
        <>
          <mesh position={[-eyeSpacing, eyeY, 0.3]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[eyeSpacing, eyeY, 0.3]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </>
      );
    case 'sad':
      return (
        <>
          <mesh position={[-eyeSpacing, eyeY - 0.05, 0.3]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[eyeSpacing, eyeY - 0.05, 0.3]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </>
      );
    case 'surprised':
      return (
        <>
          <mesh position={[-eyeSpacing, eyeY, 0.3]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[eyeSpacing, eyeY, 0.3]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </>
      );
    default:
      return (
        <>
          <mesh position={[-eyeSpacing, eyeY, 0.3]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[eyeSpacing, eyeY, 0.3]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </>
      );
  }
}

function renderMouth(emotion: string) {
  switch (emotion) {
    case 'happy':
      return (
        <mesh position={[0, -0.12, 0.3]}>
          <torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      );
    case 'angry':
      return (
        <mesh position={[0, -0.12, 0.3]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      );
    case 'surprised':
      return (
        <mesh position={[0, -0.12, 0.3]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      );
    default:
      return (
        <mesh position={[0, -0.12, 0.3]}>
          <boxGeometry args={[0.1, 0.02, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      );
  }
}

function renderHeadAccessory(type: string) {
  switch (type) {
    case 'king':
      return (
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.15, 5]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
      );
    case 'wizard':
      return (
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[0.2, 0.4, 16]} />
          <meshStandardMaterial color="#7c3aed" />
        </mesh>
      );
    case 'pirate':
      return (
        <mesh position={[0, 0.1, 0.32]}>
          <boxGeometry args={[0.25, 0.08, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      );
    case 'dragon':
      return (
        <>
          <mesh position={[-0.2, 0.15, 0]}>
            <coneGeometry args={[0.05, 0.15, 8]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0.2, 0.15, 0]}>
            <coneGeometry args={[0.05, 0.15, 8]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </>
      );
    default:
      return null;
  }
}

function getCharacterColor(type: string, customColor: string): string {
  const colors: Record<string, string> = {
    king: '#fbbf24',
    knight: '#6b7280',
    wizard: '#7c3aed',
    dragon: '#ef4444',
    pirate: '#92400e',
    custom: customColor,
  };
  return colors[type] || customColor;
}

function getHeadColor(type: string): string {
  const colors: Record<string, string> = {
    king: '#fde68a',
    knight: '#d1d5db',
    wizard: '#c4b5fd',
    dragon: '#fca5a5',
    pirate: '#d4a574',
    custom: '#e5e7eb',
  };
  return colors[type] || '#e5e7eb';
}
