'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { useStore } from '@/store';
import { StageScene } from './StageScene';
import { PuppetCharacter } from './PuppetCharacter';
import { EnvironmentManager } from './EnvironmentManager';
import { ParticleEffects } from './ParticleEffects';
import { StageFX } from './StageFX';
import { SceneManager } from './SceneManager';
import { PropsRenderer } from './PropsRenderer';
import { CinematicCamera } from './CinematicCamera';
import { BattleSystem } from '@/components/battle/BattleSystem';

export function StageCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 2.5, 8], fov: 50, near: 0.1, far: 100 }}
      style={{ width: '100%', height: '100%', display: 'block' }}
      dpr={1}
    >
      <color attach="background" args={['#0a0505']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 8, 4]} intensity={1.5} color="#fff5e6" />
      <pointLight position={[0, 5, 2]} intensity={2} color="#fbbf24" distance={12} />
      <pointLight position={[-3, 4, 1]} intensity={0.8} color="#8b5cf6" distance={10} />
      <pointLight position={[3, 4, 1]} intensity={0.8} color="#ec4899" distance={10} />
      <spotLight position={[0, 6, 1]} angle={0.5} penumbra={0.5} intensity={1.5} color="#fff5e6" distance={15} />
      <hemisphereLight args={['#87ceeb', '#2d1b0e', 0.3]} />

      <CinematicCamera />

      <Suspense fallback={null}>
        <StageScene />
        <StageFX />
        <PropsRenderer />
        <BattleSystem />

        <PuppetCharacter
          character={{
            id: 'player-puppet',
            name: 'Player',
            type: 'knight',
            position: { x: 0, y: 0, z: 3 },
            color: '#60a5fa',
            emotion: 'neutral',
            dialogue: '',
          }}
          isPlayer
        />

        {useStore((s) => s.scene.characters).map((c) => (
          <PuppetCharacter key={c.id} character={c} />
        ))}

        <EnvironmentManager />
        <ParticleEffects />
        <SceneManager />
      </Suspense>
    </Canvas>
  );
}
