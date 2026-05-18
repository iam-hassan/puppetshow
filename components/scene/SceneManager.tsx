'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store';
import { soundEngine } from '@/lib/audio/soundEngine';

const envTargets: Record<string, [number, number, number]> = {
  castle: [0, 3, 11],
  'pirate-ship': [0, 4, 13],
  nighttime: [0, 3, 10],
  storm: [0, 4, 12],
  forest: [0, 3.5, 11],
  desert: [0, 3, 12],
  underwater: [0, 3, 10],
};

export function SceneManager() {
  const { scene: threeScene, camera } = useThree();
  const transitionRef = useRef(false);
  const envRef = useRef(useStore.getState().scene.environment);
  const weatherRef = useRef(useStore.getState().scene.weather);

  useEffect(() => {
    const unsubEnv = useStore.subscribe((state, prev) => {
      if (state.scene.environment !== prev.scene.environment) {
        envRef.current = state.scene.environment;
        if (state.scene.sceneTransition && !transitionRef.current) {
          triggerTransition(state.scene.environment);
        }
      }
      if (state.scene.weather !== prev.scene.weather) {
        weatherRef.current = state.scene.weather;
        handleWeatherChange(state.scene.weather);
      }
    });

    return () => unsubEnv();
  }, [threeScene]);

  function triggerTransition(env: string) {
    transitionRef.current = true;
    const pos = envTargets[env] || [0, 1.8, 6];
    camera.position.set(pos[0], pos[1], pos[2]);
    camera.lookAt(0, 0.6, 3);

    threeScene.fog = new THREE.Fog('#000000', 0.1, 0.5);
    soundEngine.playCurtain();
    setTimeout(() => {
      threeScene.fog = null;
      transitionRef.current = false;
      useStore.getState().setSceneTransition(false);
    }, 800);
  }

  function handleWeatherChange(weather: string) {
    if (weather === 'fog') {
      threeScene.fog = new THREE.Fog('#6b7280', 3, 12);
    } else if (!transitionRef.current) {
      threeScene.fog = null;
    }
  }

  return null;
}
