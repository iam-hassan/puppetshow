'use client';

import { useStore } from '@/store';
import * as THREE from 'three';

export function PropsRenderer() {
  const props = useStore((s) => s.scene.props);

  return (
    <group>
      {props.map((prop) => {
        switch (prop.type) {
          case 'castle':
            return (
              <group key={prop.id} position={[prop.position.x, prop.position.y, prop.position.z]}>
                <mesh position={[0, 0.5, 0]}>
                  <boxGeometry args={[0.6, 1, 0.6]} />
                  <meshStandardMaterial color="#8b8b8b" roughness={0.7} />
                </mesh>
                <mesh position={[0, 1.2, 0]}>
                  <coneGeometry args={[0.4, 0.5, 4]} />
                  <meshStandardMaterial color="#6b6b6b" roughness={0.7} />
                </mesh>
                <mesh position={[-0.35, 0.3, 0]}>
                  <boxGeometry args={[0.3, 0.6, 0.3]} />
                  <meshStandardMaterial color="#8b8b8b" roughness={0.7} />
                </mesh>
                <mesh position={[0.35, 0.3, 0]}>
                  <boxGeometry args={[0.3, 0.6, 0.3]} />
                  <meshStandardMaterial color="#8b8b8b" roughness={0.7} />
                </mesh>
              </group>
            );
          case 'ball':
            return (
              <mesh key={prop.id} position={[prop.position.x, prop.position.y + 0.3, prop.position.z]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color={prop.color || '#ef4444'} roughness={0.3} />
              </mesh>
            );
          case 'sword':
            return (
              <group key={prop.id} position={[prop.position.x, prop.position.y + 0.5, prop.position.z]} rotation={[0, 0, Math.PI / 4]}>
                <mesh>
                  <boxGeometry args={[0.05, 0.8, 0.05]} />
                  <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0, -0.4, 0]}>
                  <boxGeometry args={[0.2, 0.05, 0.05]} />
                  <meshStandardMaterial color="#d4a574" roughness={0.5} />
                </mesh>
              </group>
            );
          case 'treasure':
            return (
              <group key={prop.id} position={[prop.position.x, prop.position.y, prop.position.z]}>
                <mesh position={[0, 0.15, 0]}>
                  <boxGeometry args={[0.5, 0.3, 0.35]} />
                  <meshStandardMaterial color="#8b6914" roughness={0.6} />
                </mesh>
                <mesh position={[0, 0.35, 0]}>
                  <boxGeometry args={[0.5, 0.05, 0.35]} />
                  <meshStandardMaterial color="#d4a574" roughness={0.4} />
                </mesh>
                <mesh position={[0, 0.2, 0.18]}>
                  <sphereGeometry args={[0.06, 8, 8]} />
                  <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
                </mesh>
              </group>
            );
          default:
            return (
              <mesh key={prop.id} position={[prop.position.x, prop.position.y, prop.position.z]}>
                <boxGeometry args={[0.4, 0.4, 0.4]} />
                <meshStandardMaterial color={prop.color || '#8b5cf6'} roughness={0.5} />
              </mesh>
            );
        }
      })}
    </group>
  );
}
