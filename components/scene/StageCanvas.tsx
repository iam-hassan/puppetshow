'use client';

import { Canvas } from '@react-three/fiber';
import { Stage, Environment } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import { useStore } from '@/store';
import { StageScene } from './StageScene';
import { PuppetCharacter } from './PuppetCharacter';
import { EnvironmentManager } from './EnvironmentManager';
import { LightingController } from './LightingController';
import { ParticleEffects } from './ParticleEffects';
import { SceneManager } from './SceneManager';

export function StageCanvas() {
  const { scene, puppet } = useStore();

  const cameraPosition = useMemo(() => {
    switch (scene.environment) {
      case 'castle':
        return [0, 2, 8];
      case 'pirate-ship':
        return [0, 3, 10];
      case 'nighttime':
        return [0, 2, 7];
      case 'storm':
        return [0, 3, 9];
      default:
        return [0, 2, 8];
    }
  }, [scene.environment]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: cameraPosition as [number, number, number], fov: 50 }}
        style={{ background: getBackgroundGradient(scene.environment) }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={scene.lighting.intensity * 0.3} />

          <LightingController />

          <EnvironmentManager />

          <StageScene />

          {scene.characters.map((character) => (
            <PuppetCharacter key={character.id} character={character} />
          ))}

          <PuppetCharacter
            character={{
              id: 'player-puppet',
              name: 'Player',
              type: 'knight',
              position: puppet.position,
              color: '#60a5fa',
              emotion: puppet.emotion,
              dialogue: '',
            }}
            isPlayer
          />

          {scene.props.map((prop) => (
            <PropObject key={prop.id} prop={prop} />
          ))}

          <ParticleEffects />

          <SceneManager />
        </Suspense>
      </Canvas>
    </div>
  );
}

function PropObject({ prop }: { prop: { type: string; position: { x: number; y: number; z: number }; scale: number; color: string } }) {
  return (
    <group position={[prop.position.x, prop.position.y, prop.position.z]}>
      {prop.type === 'castle' && (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 1.5, 1]} />
          <meshStandardMaterial color={prop.color} />
        </mesh>
      )}
      {prop.type === 'dragon' && (
        <mesh castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color={prop.color} />
        </mesh>
      )}
      {prop.type === 'ship' && (
        <mesh castShadow>
          <boxGeometry args={[1.5, 0.3, 0.8]} />
          <meshStandardMaterial color={prop.color} />
        </mesh>
      )}
      {prop.type === 'ball' && (
        <mesh castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color={prop.color} />
        </mesh>
      )}
      {prop.type === 'sword' && (
        <mesh castShadow>
          <boxGeometry args={[0.1, 1.2, 0.1]} />
          <meshStandardMaterial color={prop.color} />
        </mesh>
      )}
      {prop.type === 'treasure' && (
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.4, 0.4]} />
          <meshStandardMaterial color={prop.color} />
        </mesh>
      )}
      {!['castle', 'dragon', 'ship', 'ball', 'sword', 'treasure'].includes(prop.type) && (
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={prop.color} />
        </mesh>
      )}
    </group>
  );
}

function getBackgroundGradient(environment: string): string {
  switch (environment) {
    case 'castle':
      return 'linear-gradient(to bottom, #1a1a2e, #16213e)';
    case 'pirate-ship':
      return 'linear-gradient(to bottom, #0f172a, #1e3a5f)';
    case 'nighttime':
      return 'linear-gradient(to bottom, #0a0a1a, #1a1a3e)';
    case 'storm':
      return 'linear-gradient(to bottom, #1a1a1a, #2d2d3d)';
    case 'forest':
      return 'linear-gradient(to bottom, #0a1a0a, #1a2a1a)';
    case 'desert':
      return 'linear-gradient(to bottom, #2a1a0a, #3a2a1a)';
    case 'underwater':
      return 'linear-gradient(to bottom, #0a1a2a, #0a2a3a)';
    default:
      return 'linear-gradient(to bottom, #1a1a2e, #16213e)';
  }
}
