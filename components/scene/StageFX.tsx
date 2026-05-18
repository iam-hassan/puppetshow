'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store';
import { soundEngine } from '@/lib/audio/soundEngine';

export function StageFX() {
  const dustRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const lightningRef = useRef<THREE.Mesh>(null);
  const lightningTimer = useRef(0);
  const stageMood = useStore((s) => s.scene.stageMood);
  const action = useStore((s) => s.puppet.action);
  const weather = useStore((s) => s.scene.weather);

  const dustGeo = useMemo(() => {
    const count = 80;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = Math.random() * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (dustRef.current) {
      const pos = dustRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 80; i++) {
        pos[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.002;
        pos[i * 3] += Math.cos(state.clock.elapsedTime * 0.5 + i * 0.3) * 0.001;
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (spotRef.current) {
      const intensity = action !== 'idle' ? 3 : 1.5;
      spotRef.current.intensity = THREE.MathUtils.lerp(spotRef.current.intensity, intensity, 0.05);
    }

    if (glowRef.current) {
      glowRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }

    if (weather === 'storm' && lightningRef.current) {
      lightningTimer.current += delta;
      if (lightningTimer.current > 2 + Math.random() * 3) {
        lightningTimer.current = 0;
        lightningRef.current.visible = true;
        soundEngine.playThunder();
        setTimeout(() => {
          if (lightningRef.current) lightningRef.current.visible = false;
        }, 100);
        setTimeout(() => {
          if (lightningRef.current) {
            lightningRef.current.visible = true;
            setTimeout(() => {
              if (lightningRef.current) lightningRef.current.visible = false;
            }, 50);
          }
        }, 150);
      }
    }
  });

  const isDramatic = stageMood === 'eerie' || stageMood === 'intense' || action !== 'idle';
  const spotColor = isDramatic ? '#8b5cf6' : '#fbbf24';

  return (
    <>
      <spotLight
        ref={spotRef}
        position={[0, 6, 2]}
        angle={0.4}
        penumbra={0.6}
        intensity={1.5}
        color={spotColor}
        distance={15}
      />

      <points ref={dustRef} geometry={dustGeo}>
        <pointsMaterial color="#fef3c7" size={0.03} transparent opacity={0.3} sizeAttenuation depthWrite={false} />
      </points>

      <mesh ref={glowRef} position={[0, 0.5, 0]}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.15} depthWrite={false} />
      </mesh>

      <mesh ref={lightningRef} position={[0, 3, -4]} visible={false}>
        <boxGeometry args={[0.05, 4, 0.05]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
    </>
  );
}
