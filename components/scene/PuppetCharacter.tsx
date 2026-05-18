'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store';
import { soundEngine } from '@/lib/audio/soundEngine';
import type { Character, PuppetAction } from '@/types';

interface PuppetCharacterProps {
  character: Character;
  isPlayer?: boolean;
}

const ACTION_DURATION: Record<PuppetAction, number> = {
  idle: 0,
  jump: 700,
  bow: 1000,
  theaterBow: 1500,
  shootArrow: 800,
  celebrate: 800,
  wave: 1000,
  salute: 800,
  attack: 600,
  defend: 600,
  walkLeft: 1000,
  walkRight: 1000,
  walkCenter: 1000,
  roar: 1000,
  heroicStance: 1000,
  perform: 1500,
  powerStance: 1200,
  magicCast: 1200,
  slam: 700,
  summon: 1200,
  point: 800,
};

export function PuppetCharacter({ character, isPlayer = false }: PuppetCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const actionStartRef = useRef<number>(0);
  const prevActionRef = useRef<PuppetAction>('idle');
  const blinkRef = useRef(0);
  const eyeOpenRef = useRef(true);
  const stretchRef = useRef(1);
  const targetStretchRef = useRef(1);
  const overshootXRef = useRef(0);
  const overshootYRef = useRef(0);
  const landedRef = useRef(false);
  const dustRef = useRef<THREE.Points>(null);
  const dustVelRef = useRef<Float32Array>(new Float32Array(30 * 3));
  const dustActive = useRef(false);
  const dustTimer = useRef(0);
  const sparkleRef = useRef<THREE.Points>(null);
  const sparkleVelRef = useRef<Float32Array>(new Float32Array(20 * 3));
  const sparkleActive = useRef(false);
  const sparkleTimer = useRef(0);
  const confettiRef = useRef<THREE.Points>(null);
  const confettiVelRef = useRef<Float32Array>(new Float32Array(40 * 3));
  const confettiActive = useRef(false);
  const confettiTimer = useRef(0);
  const bowRef = useRef<THREE.Mesh>(null);
  const arrowMeshRef = useRef<THREE.Group>(null);
  const swordRef = useRef<THREE.Group>(null);
  const wanderTimer = useRef(0);
  const wanderTarget = useRef({ x: character.position.x, z: character.position.z });
  const idleBobRef = useRef(Math.random() * Math.PI * 2);

  const puppetAction = useStore((s) => s.puppet.action);
  const action = isPlayer ? puppetAction : 'idle';
  const isPerformanceMode = useStore((s) => s.isPerformanceMode);

  const dustGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(30 * 3);
    for (let i = 0; i < 30; i++) { pos[i * 3 + 1] = -10; }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  const sparkleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(20 * 3);
    for (let i = 0; i < 20; i++) { pos[i * 3 + 1] = -10; }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  const confettiGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(40 * 3);
    for (let i = 0; i < 40; i++) { pos[i * 3 + 1] = -10; }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const currentAction = isPlayer ? useStore.getState().puppet.action : (character.action || 'idle');
    const action = currentAction;

    if (action !== prevActionRef.current) {
      if (prevActionRef.current === 'shootArrow' && action !== 'shootArrow') {
        if (bowRef.current) bowRef.current.visible = false;
        if (arrowMeshRef.current) { arrowMeshRef.current.visible = false; arrowMeshRef.current.position.z = -0.5; }
      }
      const combatActions: PuppetAction[] = ['attack', 'defend', 'heroicStance'];
      if (combatActions.includes(action) && !combatActions.includes(prevActionRef.current)) {
        if (swordRef.current) swordRef.current.visible = true;
      } else if (!combatActions.includes(action) && combatActions.includes(prevActionRef.current)) {
        if (swordRef.current) swordRef.current.visible = false;
      }
      actionStartRef.current = performance.now();
      if (action !== 'idle') {
        targetStretchRef.current = 0.7;
        overshootXRef.current = 0;
        overshootYRef.current = 0;
        landedRef.current = false;
        if (action === 'jump') soundEngine.playJump();
        else if (action === 'bow') soundEngine.playSwoosh();
        else if (action === 'shootArrow') {
          soundEngine.playSwoosh();
          if (arrowMeshRef.current) {
            arrowMeshRef.current.position.set(-0.2, 0.55, -0.5);
            arrowMeshRef.current.visible = true;
          }
          if (bowRef.current) {
            bowRef.current.visible = true;
          }
        }
        else if (action === 'salute') {
          soundEngine.playSwoosh();
        }
        else if (action === 'celebrate') {
          soundEngine.playSparkle();
          sparkleActive.current = true;
          sparkleTimer.current = 0;
          confettiActive.current = true;
          confettiTimer.current = 0;
          const sPos = sparkleRef.current?.geometry.attributes.position.array as Float32Array;
          if (sPos) {
            for (let i = 0; i < 20; i++) {
              const angle = (i / 20) * Math.PI * 2;
              sPos[i * 3] = Math.cos(angle) * 0.3;
              sPos[i * 3 + 1] = 0.5;
              sPos[i * 3 + 2] = Math.sin(angle) * 0.3;
              sparkleVelRef.current[i * 3] = Math.cos(angle) * 0.02;
              sparkleVelRef.current[i * 3 + 1] = 0.02 + Math.random() * 0.02;
              sparkleVelRef.current[i * 3 + 2] = Math.sin(angle) * 0.02;
            }
            sparkleRef.current!.geometry.attributes.position.needsUpdate = true;
          }
          const cPos = confettiRef.current?.geometry.attributes.position.array as Float32Array;
          if (cPos) {
            for (let i = 0; i < 40; i++) {
              cPos[i * 3] = (Math.random() - 0.5) * 0.3;
              cPos[i * 3 + 1] = 1.0 + Math.random() * 0.5;
              cPos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
              confettiVelRef.current[i * 3] = (Math.random() - 0.5) * 0.03;
              confettiVelRef.current[i * 3 + 1] = 0.01 + Math.random() * 0.02;
              confettiVelRef.current[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
            }
            confettiRef.current!.geometry.attributes.position.needsUpdate = true;
          }
        }
        else if (action === 'theaterBow') {
          soundEngine.playSwoosh();
        }
        else if (action === 'attack') {
          soundEngine.playSwordClash();
        }
        else if (action === 'roar') {
          soundEngine.playRoar();
        }
        else if (action === 'heroicStance') {
          soundEngine.playSwoosh();
        }
        else if (action === 'perform') {
          soundEngine.playMagicCast();
        }
        else if (action === 'powerStance') {
          soundEngine.playStomp();
        }
        else if (action === 'magicCast') {
          soundEngine.playMagicCast();
        }
        else if (action === 'slam') {
          soundEngine.playSwordClash();
        }
        else if (action === 'summon') {
          soundEngine.playSparkle();
        }
        else if (action === 'point') {
          soundEngine.playSwoosh();
        }
      }
      prevActionRef.current = action;
    }

    const elapsed = performance.now() - actionStartRef.current;
    const dur = ACTION_DURATION[action];
    const t = dur > 0 ? Math.min(elapsed / dur, 1) : 1;

    const pos = isPlayer
      ? useStore.getState().puppet.position
      : character.position;
    const emotion = isPlayer
      ? useStore.getState().puppet.emotion
      : character.emotion;

    stretchRef.current = THREE.MathUtils.lerp(stretchRef.current, targetStretchRef.current, 0.12);
    if (t > 0.05) targetStretchRef.current = 1;
    if (t > 0.8 && action === 'jump') {
      targetStretchRef.current = 0.85;
    }

    if (bodyRef.current) {
      const s = stretchRef.current;
      bodyRef.current.scale.y = s;
      bodyRef.current.scale.x = 1.5 - s * 0.5;
      bodyRef.current.scale.z = 1.5 - s * 0.5;
    }

    let targetY = pos.y;
    let scaleX = 1;
    let scaleY = 1;

    if (action === 'jump') {
      const arc = Math.sin(t * Math.PI);
      targetY = pos.y + arc * 1.2;
      if (t < 0.1) { scaleY = 0.8; scaleX = 1.2; }
      else if (t > 0.9) { scaleY = 0.85; scaleX = 1.15; }
      else { scaleY = 1.1; scaleX = 0.9; }
      groupRef.current.rotation.set(0, 0, 0);
      overshootYRef.current = t > 0.95 ? Math.sin((t - 0.95) / 0.05 * Math.PI) * 0.08 : 0;
    } else if (action === 'bow') {
      const bowAngle = Math.sin(t * Math.PI) * 0.6;
      groupRef.current.rotation.set(bowAngle, 0, 0);
      targetY = pos.y - Math.sin(t * Math.PI) * 0.15;
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(t * Math.PI) * 0.4;
      }
    } else if (action === 'shootArrow') {
      const drawT = Math.min(t / 0.4, 1);
      const releaseT = t > 0.4 ? (t - 0.4) / 0.35 : 0;
      const done = t > 0.75 ? (t - 0.75) / 0.25 : 0;
      targetY = pos.y;
      if (rightArmRef.current) {
        const pull = drawT * (1 - releaseT);
        rightArmRef.current.rotation.z = -pull * 0.8;
        rightArmRef.current.rotation.x = -pull * 0.2;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = drawT * 0.2 * (1 - releaseT);
        leftArmRef.current.rotation.x = drawT * 0.1;
      }
      if (headRef.current) {
        const aim = drawT * (1 - releaseT * 0.5);
        headRef.current.rotation.z = aim * 0.15;
        headRef.current.rotation.y = -aim * 0.15;
      }
      groupRef.current.rotation.set(0, drawT * 0.2, 0);
      const recoil = releaseT > 0.1 && releaseT < 0.4 ? Math.sin((releaseT - 0.1) / 0.3 * Math.PI) * 0.15 : 0;
      overshootXRef.current = recoil;
      if (arrowMeshRef.current) {
        if (releaseT === 0) {
          const arrowDraw = drawT * 0.35;
          arrowMeshRef.current.position.set(-0.2, 0.55, -0.5 + arrowDraw);
          arrowMeshRef.current.visible = true;
        } else if (releaseT > 0 && releaseT < 1) {
          const flyZ = -0.2 - releaseT * 3.0;
          const flyY = 0.55 - releaseT * 0.1;
          arrowMeshRef.current.position.set(-0.2, flyY, flyZ);
          if (releaseT > 0.5 && arrowMeshRef.current.visible) {
            arrowMeshRef.current.visible = false;
          }
        }
      }
    } else if (action === 'salute') {
      const raiseT = Math.min(t / 0.35, 1);
      const hold = t > 0.35 && t < 0.65 ? 1 : 0;
      const lowerT = t > 0.65 ? (t - 0.65) / 0.35 : 0;
      const armPos = raiseT * (1 - lowerT);
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -armPos * 2.0;
        rightArmRef.current.rotation.x = armPos * 0.5;
      }
      if (headRef.current) {
        headRef.current.rotation.z = -armPos * 0.15;
        headRef.current.rotation.y = armPos * 0.12;
        headRef.current.rotation.x = -armPos * 0.08;
      }
      groupRef.current.rotation.set(0, 0, 0);
      targetY = pos.y;
    } else if (action === 'celebrate') {
      targetY = pos.y + Math.sin(t * Math.PI * 3) * 0.2;
      groupRef.current.rotation.set(0, 0, 0);
      scaleX = 1 + Math.sin(t * Math.PI * 6) * 0.05;
      scaleY = 1 + Math.sin(t * Math.PI * 3) * 0.08;
    } else if (action === 'theaterBow') {
      // Slow, respectful theater bow with hand near chest
      const bowT = Math.sin(t * Math.PI) * 0.5;
      groupRef.current.rotation.set(bowT, 0, 0);
      targetY = pos.y - Math.sin(t * Math.PI) * 0.2;
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(t * Math.PI) * 0.5;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -Math.sin(t * Math.PI) * 0.4;
        rightArmRef.current.rotation.x = Math.sin(t * Math.PI) * 0.3;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = Math.sin(t * Math.PI) * 0.2;
      }
    } else if (action === 'attack') {
      // Sword swing forward
      const swingT = Math.sin(t * Math.PI * 2);
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -1.2 * Math.abs(swingT);
        rightArmRef.current.rotation.x = -0.5 * swingT;
      }
      groupRef.current.rotation.set(0, swingT * 0.3, 0);
      targetY = pos.y + Math.abs(swingT) * 0.1;
    } else if (action === 'defend') {
      // Shield/block stance
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = 1.0;
        leftArmRef.current.rotation.x = 0.3;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -0.5;
      }
      groupRef.current.rotation.set(-0.1, 0, 0);
      targetY = pos.y - 0.05;
    } else if (action === 'roar') {
      // Head throw back, arms out
      if (headRef.current) {
        headRef.current.rotation.x = -Math.sin(t * Math.PI) * 0.6;
        headRef.current.rotation.z = Math.sin(t * Math.PI * 3) * 0.1;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -Math.sin(t * Math.PI) * 0.8;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = Math.sin(t * Math.PI) * 0.8;
      }
      scaleY = 1 + Math.sin(t * Math.PI) * 0.1;
      targetY = pos.y + Math.sin(t * Math.PI) * 0.15;
    } else if (action === 'heroicStance') {
      // Wide stance, arm raised with sword
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -1.8 * Math.min(t * 2, 1);
        rightArmRef.current.rotation.x = 0.3;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = 0.3;
      }
      if (headRef.current) {
        headRef.current.rotation.y = -0.2;
        headRef.current.rotation.x = -0.1;
      }
      targetY = pos.y + 0.05;
    } else if (action === 'perform') {
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -Math.sin(t * Math.PI) * 1.5;
        rightArmRef.current.rotation.x = Math.sin(t * Math.PI) * 0.3;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = Math.sin(t * Math.PI) * 1.5;
        leftArmRef.current.rotation.x = -Math.sin(t * Math.PI) * 0.3;
      }
      if (headRef.current) {
        headRef.current.rotation.x = -Math.sin(t * Math.PI) * 0.2;
        headRef.current.rotation.y = Math.sin(t * Math.PI) * 0.15;
      }
      targetY = pos.y + Math.sin(t * Math.PI) * 0.1;
    } else if (action === 'powerStance') {
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -Math.min(t * 3, 1) * 1.2;
        rightArmRef.current.rotation.x = 0.2;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = Math.min(t * 3, 1) * 0.6;
      }
      if (headRef.current) {
        headRef.current.rotation.x = -0.15;
        headRef.current.rotation.y = -0.2;
      }
      targetY = pos.y + 0.05;
      const stomp = t < 0.15 ? Math.sin(t / 0.15 * Math.PI) * 0.15 : 0;
      overshootYRef.current = -stomp;
      scaleY = 1 - stomp * 0.3;
      scaleX = 1 + stomp * 0.2;
    } else if (action === 'magicCast') {
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -Math.min(t * 3, 1) * 2.0;
        rightArmRef.current.rotation.x = Math.min(t * 3, 1) * 0.6;
      }
      if (headRef.current) {
        headRef.current.rotation.z = Math.min(t * 3, 1) * 0.15;
        headRef.current.rotation.y = Math.min(t * 3, 1) * 0.2;
      }
      targetY = pos.y + Math.sin(t * Math.PI) * 0.15;
      groupRef.current.rotation.set(0, Math.sin(t * Math.PI * 2) * 0.1, 0);
    } else if (action === 'slam') {
      const slamT = Math.sin(t * Math.PI * 2);
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -1.5 * Math.abs(slamT);
        rightArmRef.current.rotation.x = -0.6 * Math.sign(slamT);
      }
      groupRef.current.rotation.set(0, slamT * 0.2, 0);
      targetY = pos.y - Math.abs(slamT) * 0.1;
      const impact = t < 0.15 ? Math.sin(t / 0.15 * Math.PI) * 0.12 : 0;
      overshootYRef.current = -impact;
      scaleY = 1 - impact * 0.4;
    } else if (action === 'summon') {
      if (rightArmRef.current) {
        const raiseT = Math.min(t / 0.3, 1);
        const lowerT = t > 0.7 ? (t - 0.7) / 0.3 : 0;
        rightArmRef.current.rotation.z = -(raiseT - lowerT) * 2.5;
        rightArmRef.current.rotation.x = (raiseT - lowerT) * 0.8;
      }
      targetY = pos.y + Math.sin(t * Math.PI) * 0.2;
    } else if (action === 'point') {
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -Math.min(t / 0.3, 1) * 0.8;
        rightArmRef.current.rotation.x = Math.min(t / 0.3, 1) * 0.8;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * Math.PI) * 0.5;
      }
      groupRef.current.rotation.set(0, Math.sin(t * Math.PI) * 0.3, 0);
      targetY = pos.y;
    } else if (action === 'walkCenter' || action === 'walkLeft' || action === 'walkRight') {
      targetY = pos.y + Math.abs(Math.sin(t * Math.PI * 2)) * 0.1;
      groupRef.current.rotation.set(0, Math.sin(t * Math.PI * 2) * 0.1, 0);
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = Math.sin(t * Math.PI * 2) * 0.3;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = -Math.sin(t * Math.PI * 2) * 0.3;
      }
    } else if (action === 'wave') {
      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(t * Math.PI * 5) * 0.25;
        headRef.current.rotation.y = Math.sin(t * Math.PI * 2) * 0.15;
      }
      targetY = pos.y;
      groupRef.current.rotation.set(0, 0, 0);
    } else {
      targetY = pos.y + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      overshootXRef.current = THREE.MathUtils.lerp(overshootXRef.current, 0, 0.05);
      overshootYRef.current = THREE.MathUtils.lerp(overshootYRef.current, 0, 0.05);
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0, 0.1);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.1);
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0, 0.1);
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.1);
      }
      if (isPlayer && !isPerformanceMode) {
        pos.x = THREE.MathUtils.lerp(pos.x, 0, 0.008);
        pos.y = THREE.MathUtils.lerp(pos.y, 0, 0.008);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.05);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.05);
      }
    }

    if ((action === 'jump') && t > 0.85 && !landedRef.current) {
      landedRef.current = true;
      soundEngine.playLanding();
      dustActive.current = true;
      dustTimer.current = 0;
      const posArr = dustRef.current?.geometry.attributes.position.array as Float32Array;
      if (posArr) {
        for (let i = 0; i < 30; i++) {
          posArr[i * 3] = (Math.random() - 0.5) * 0.4;
          posArr[i * 3 + 1] = 0;
          posArr[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
          dustVelRef.current[i * 3] = (Math.random() - 0.5) * 0.04;
          dustVelRef.current[i * 3 + 1] = Math.random() * 0.03 + 0.01;
          dustVelRef.current[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
        }
        dustRef.current!.geometry.attributes.position.needsUpdate = true;
      }
    }

    if (dustActive.current && dustRef.current) {
      dustTimer.current += delta;
      const posArr = dustRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 30; i++) {
        posArr[i * 3] += dustVelRef.current[i * 3];
        posArr[i * 3 + 1] += dustVelRef.current[i * 3 + 1];
        posArr[i * 3 + 2] += dustVelRef.current[i * 3 + 2];
        dustVelRef.current[i * 3 + 1] -= 0.001;
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true;
      if (dustTimer.current > 0.6) {
        dustActive.current = false;
        const posArr = dustRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < 30; i++) {
          posArr[i * 3] = 0;
          posArr[i * 3 + 1] = -10;
          posArr[i * 3 + 2] = 0;
        }
        dustRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }

    if (sparkleActive.current && sparkleRef.current) {
      sparkleTimer.current += delta;
      const posArr = sparkleRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 20; i++) {
        posArr[i * 3] += sparkleVelRef.current[i * 3];
        posArr[i * 3 + 1] += sparkleVelRef.current[i * 3 + 1];
        posArr[i * 3 + 2] += sparkleVelRef.current[i * 3 + 2];
        sparkleVelRef.current[i * 3 + 1] -= 0.0005;
      }
      sparkleRef.current.geometry.attributes.position.needsUpdate = true;
      if (sparkleTimer.current > 0.8) {
        sparkleActive.current = false;
        const posArr = sparkleRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < 20; i++) {
          posArr[i * 3] = 0;
          posArr[i * 3 + 1] = -10;
          posArr[i * 3 + 2] = 0;
        }
        sparkleRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }

    if (confettiActive.current && confettiRef.current) {
      confettiTimer.current += delta;
      const posArr = confettiRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 40; i++) {
        posArr[i * 3] += confettiVelRef.current[i * 3];
        posArr[i * 3 + 1] += confettiVelRef.current[i * 3 + 1];
        posArr[i * 3 + 2] += confettiVelRef.current[i * 3 + 2];
        confettiVelRef.current[i * 3 + 1] -= 0.0008;
        confettiVelRef.current[i * 3] *= 0.99;
        confettiVelRef.current[i * 3 + 2] *= 0.99;
      }
      confettiRef.current.geometry.attributes.position.needsUpdate = true;
      if (confettiTimer.current > 1.5) {
        confettiActive.current = false;
        const posArr = confettiRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < 40; i++) {
          posArr[i * 3] = 0;
          posArr[i * 3 + 1] = -10;
          posArr[i * 3 + 2] = 0;
        }
        confettiRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }

    const overshootX = overshootXRef.current;
    const overshootY = overshootYRef.current;

    const lerpSpeed = 0.12;
    const targetX = pos.x + overshootX;
    const finalTargetY = targetY + overshootY;
    const targetZ = pos.z;

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, lerpSpeed);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, finalTargetY, lerpSpeed);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, lerpSpeed);

    groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, scaleX, 0.1);
    groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, scaleY, 0.1);

    blinkRef.current += delta;
    const blinkCycle = blinkRef.current % 5;
    const isBlinking = blinkCycle > 4.85 && blinkCycle < 4.95;
    eyeOpenRef.current = !isBlinking;

    if (headRef.current && action !== 'wave' && action !== 'bow' && action !== 'salute') {
      const headSway = Math.sin(state.clock.elapsedTime * 1.2) * 0.08;
      const headTilt = Math.sin(state.clock.elapsedTime * 0.7) * 0.05;
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, headSway, 0.05);
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, headTilt, 0.05);
    }

    if (bodyRef.current && action === 'idle') {
      const breathe = Math.sin(state.clock.elapsedTime * 1.8) * 0.015;
      const weightShift = Math.sin(state.clock.elapsedTime * 0.9) * 0.008;
      bodyRef.current.scale.y = 1 + breathe;
      bodyRef.current.scale.x = 1 + weightShift;
      bodyRef.current.scale.z = 1 - breathe * 0.5;
    }

    if (!isPlayer && action === 'idle') {
      idleBobRef.current += delta * 1.5;
      groupRef.current.position.y += Math.sin(idleBobRef.current) * 0.002;
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8 + character.position.x) * 0.15;
      }

      if (!isPerformanceMode) {
        wanderTimer.current += delta;
        if (wanderTimer.current > 3 + Math.random() * 4) {
          wanderTimer.current = 0;
          wanderTarget.current = {
            x: THREE.MathUtils.clamp(character.position.x + (Math.random() - 0.5) * 2, -2.5, 2.5),
            z: THREE.MathUtils.clamp(character.position.z + (Math.random() - 0.5) * 1, 1, 4),
          };
        }
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, wanderTarget.current.x, 0.005);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, wanderTarget.current.z, 0.005);
      }

      const dx = useStore.getState().puppet.position.x - groupRef.current.position.x;
      if (Math.abs(dx) > 0.5 && headRef.current) {
        headRef.current.rotation.y = dx > 0 ? 0.4 : -0.4;
      }


    }
  });

  const bodyColor = getBodyColor(character.type);
  const headColor = getHeadColor(character.type);

  return (
    <group ref={groupRef} position={[character.position.x, character.position.y, character.position.z]} scale={isPlayer ? 1.1 : 1}>
      <mesh ref={bodyRef} position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.7, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} />
      </mesh>

      <group ref={rightArmRef} position={[0.28, 0.45, 0]}>
        <mesh>
          <capsuleGeometry args={[0.05, 0.35, 4, 8]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} />
        </mesh>
        <group ref={swordRef} position={[0, 0.2, 0]} rotation={[0.3, 0, 0]} visible={false}>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.025, 0.35, 0.004]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.025, 0]}>
            <boxGeometry args={[0.1, 0.02, 0.02]} />
            <meshStandardMaterial color="#8b4513" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.03, 0]}>
            <cylinderGeometry args={[0.015, 0.02, 0.06, 6]} />
            <meshStandardMaterial color="#5c3317" roughness={0.8} />
          </mesh>
        </group>
      </group>
      <group ref={leftArmRef} position={[-0.28, 0.45, 0]}>
        <mesh>
          <capsuleGeometry args={[0.05, 0.35, 4, 8]} />
          <meshStandardMaterial color={bodyColor} roughness={0.6} />
        </mesh>
      </group>

      <group ref={headRef} position={[0, 0.95, 0]}>
        <mesh>
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshStandardMaterial color={headColor} roughness={0.35} />
        </mesh>
        {renderEyes(character.emotion)}
        {renderMouth(character.emotion)}
        <mesh position={[-0.18, -0.05, 0.22]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#ff9999" transparent opacity={0.3} />
        </mesh>
        <mesh position={[0.18, -0.05, 0.22]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#ff9999" transparent opacity={0.3} />
        </mesh>
        {renderAccessory(character.type)}
      </group>

      {isPlayer && (
        <Text position={[0, 1.5, 0]} fontSize={0.14} color="#fbbf24" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          {character.name}
        </Text>
      )}
      {!isPlayer && (
        <Text position={[0, 1.5, 0]} fontSize={0.12} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          {character.name}
        </Text>
      )}

      <points ref={dustRef} geometry={dustGeo}>
        <pointsMaterial color="#d4a574" size={0.06} transparent opacity={0.5} depthWrite={false} sizeAttenuation />
      </points>
      <points ref={sparkleRef} geometry={sparkleGeo}>
        <pointsMaterial color="#fbbf24" size={0.04} transparent opacity={0.7} depthWrite={false} sizeAttenuation />
      </points>
      <points ref={confettiRef} geometry={confettiGeo}>
        <pointsMaterial color="#ec4899" size={0.05} transparent opacity={0.8} depthWrite={false} sizeAttenuation />
      </points>

      <mesh ref={bowRef} position={[-0.35, 0.5, -0.35]} rotation={[Math.PI / 2, Math.PI, 0]} visible={false}>
        <torusGeometry args={[0.3, 0.045, 10, 16, Math.PI]} />
        <meshStandardMaterial color="#c8a87c" roughness={0.7} />
      </mesh>
      <group ref={arrowMeshRef} position={[-0.2, 0.55, -0.5]} visible={false}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.55, 8]} />
          <meshStandardMaterial color="#8b4513" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, -0.28]}>
          <coneGeometry args={[0.025, 0.07, 8]} />
          <meshStandardMaterial color="#555" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.2]}>
          <coneGeometry args={[0.008, 0.05, 6]} />
          <meshStandardMaterial color="#888" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

function renderEyes(emotion: string) {
  const eyeY = 0.08;
  const s = 0.1;

  if (emotion === 'angry') return (
    <>
      <mesh position={[-s, eyeY, 0.26]}><boxGeometry args={[0.08, 0.04, 0.02]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[s, eyeY, 0.26]}><boxGeometry args={[0.08, 0.04, 0.02]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[-s, eyeY + 0.08, 0.27]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.1, 0.02, 0.01]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[s, eyeY + 0.08, 0.27]} rotation={[0, 0, -0.3]}><boxGeometry args={[0.1, 0.02, 0.01]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
    </>
  );
  if (emotion === 'sad') return (
    <>
      <mesh position={[-s, eyeY - 0.04, 0.26]}><sphereGeometry args={[0.05, 16, 16]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[s, eyeY - 0.04, 0.26]}><sphereGeometry args={[0.05, 16, 16]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[-s, eyeY + 0.06, 0.27]} rotation={[0, 0, -0.2]}><boxGeometry args={[0.1, 0.02, 0.01]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[s, eyeY + 0.06, 0.27]} rotation={[0, 0, 0.2]}><boxGeometry args={[0.1, 0.02, 0.01]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
    </>
  );
  if (emotion === 'surprised') return (
    <>
      <mesh position={[-s, eyeY, 0.26]}><sphereGeometry args={[0.065, 16, 16]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[s, eyeY, 0.26]}><sphereGeometry args={[0.065, 16, 16]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[-s, eyeY + 0.1, 0.27]}><boxGeometry args={[0.1, 0.02, 0.01]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[s, eyeY + 0.1, 0.27]}><boxGeometry args={[0.1, 0.02, 0.01]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
    </>
  );
  return (
    <>
      <mesh position={[-s, eyeY, 0.26]}><sphereGeometry args={[0.055, 16, 16]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[s, eyeY, 0.26]}><sphereGeometry args={[0.055, 16, 16]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[-s + 0.02, eyeY + 0.02, 0.28]}><sphereGeometry args={[0.015, 8, 8]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <mesh position={[s + 0.02, eyeY + 0.02, 0.28]}><sphereGeometry args={[0.015, 8, 8]} /><meshStandardMaterial color="#ffffff" /></mesh>
    </>
  );
}

function renderMouth(emotion: string) {
  if (emotion === 'happy') return <mesh position={[0, -0.1, 0.26]}><torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} /><meshStandardMaterial color="#1a1a1a" /></mesh>;
  if (emotion === 'angry') return <mesh position={[0, -0.1, 0.26]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} /><meshStandardMaterial color="#1a1a1a" /></mesh>;
  if (emotion === 'surprised') return <mesh position={[0, -0.1, 0.26]}><sphereGeometry args={[0.05, 16, 16]} /><meshStandardMaterial color="#1a1a1a" /></mesh>;
  return <mesh position={[0, -0.1, 0.26]}><torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} /><meshStandardMaterial color="#1a1a1a" /></mesh>;
}

function renderAccessory(type: string) {
  if (type === 'lion') return (
    <>
      {/* Lion mane - ring of tufts around head */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const r = 0.34;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, Math.sin(angle) * r, -0.05]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#b45309" roughness={0.8} />
          </mesh>
        );
      })}
      {/* Inner mane layer */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2 + 0.2;
        const r = 0.28;
        return (
          <mesh key={`m-${i}`} position={[Math.cos(angle) * r, Math.sin(angle) * r, -0.08]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#92400e" roughness={0.9} />
          </mesh>
        );
      })}
      {/* Lion nose */}
      <mesh position={[0, -0.02, 0.3]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Whiskers */}
      <mesh position={[0.15, -0.02, 0.28]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.12, 0.005, 0.005]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.15, -0.02, 0.28]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.12, 0.005, 0.005]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.15, -0.06, 0.28]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.1, 0.005, 0.005]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.15, -0.06, 0.28]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.1, 0.005, 0.005]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </>
  );
  if (type === 'panda') return (
    <>
      {/* Panda ears */}
      <mesh position={[-0.2, 0.25, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.2, 0.25, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Panda eye patches */}
      <mesh position={[-0.12, 0.06, 0.24]} rotation={[0, 0, -0.3]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.12, 0.06, 0.24]} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Panda nose */}
      <mesh position={[0, -0.02, 0.3]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </>
  );
  if (type === 'king') return (
    <>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.2, 0.22, 0.12, 5]} /><meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} /></mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos(i * Math.PI * 2 / 5) * 0.18, 0.38, Math.sin(i * Math.PI * 2 / 5) * 0.18]}>
          <coneGeometry args={[0.03, 0.08, 4]} /><meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.32, 0.2]}><sphereGeometry args={[0.025, 8, 8]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} /></mesh>
    </>
  );
  if (type === 'wizard') return (
    <>
      <mesh position={[0, 0.25, 0]}><coneGeometry args={[0.2, 0.4, 16]} /><meshStandardMaterial color="#6d28d9" /></mesh>
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.22, 0.03, 8, 16]} /><meshStandardMaterial color="#6d28d9" /></mesh>
      <mesh position={[0, 0.35, 0.15]}><sphereGeometry args={[0.02, 8, 8]} /><meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} /></mesh>
    </>
  );
  if (type === 'pirate') return (
    <>
      <mesh position={[0.1, 0.08, 0.28]}><circleGeometry args={[0.06, 16]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[0, 0.08, 0.27]} rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[0.35, 0.015, 0.01]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[0, 0.28, 0]}><cylinderGeometry args={[0.22, 0.22, 0.05, 16]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.15, 0.18, 0.12, 16]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[0, 0.32, 0.18]}><sphereGeometry args={[0.025, 8, 8]} /><meshStandardMaterial color="#f5f5dc" /></mesh>
    </>
  );
  if (type === 'dragon') return (
    <>
      <mesh position={[-0.15, 0.2, 0]}><coneGeometry args={[0.04, 0.15, 8]} /><meshStandardMaterial color="#dc2626" /></mesh>
      <mesh position={[0.15, 0.2, 0]}><coneGeometry args={[0.04, 0.15, 8]} /><meshStandardMaterial color="#dc2626" /></mesh>
      <mesh position={[0, -0.05, 0.25]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="#dc2626" /></mesh>
      <mesh position={[-0.04, -0.05, 0.33]}><sphereGeometry args={[0.015, 8, 8]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
      <mesh position={[0.04, -0.05, 0.33]}><sphereGeometry args={[0.015, 8, 8]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
    </>
  );
  if (type === 'enemy') return (
    <>
      {/* Dark horns */}
      <mesh position={[-0.15, 0.25, 0]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.04, 0.2, 6]} /><meshStandardMaterial color="#2d1b2e" /></mesh>
      <mesh position={[0.15, 0.25, 0]} rotation={[0, 0, 0.3]}><coneGeometry args={[0.04, 0.2, 6]} /><meshStandardMaterial color="#2d1b2e" /></mesh>
      {/* Glowing red eyes */}
      <mesh position={[-0.1, 0.08, 0.28]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} /></mesh>
      <mesh position={[0.1, 0.08, 0.28]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} /></mesh>
      {/* Dark aura spikes */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.3, Math.sin(angle) * 0.15 + 0.1, -0.1]} rotation={[0, 0, angle]}>
            <coneGeometry args={[0.02, 0.12, 4]} />
            <meshStandardMaterial color="#1a0020" transparent opacity={0.7} />
          </mesh>
        );
      })}
    </>
  );
  return null;
}

function getBodyColor(type: string): string {
  const m: Record<string, string> = { king: '#f59e0b', knight: '#3b82f6', wizard: '#6d28d9', dragon: '#dc2626', pirate: '#92400e', lion: '#d97706', panda: '#f5f5f5', enemy: '#1a0020', custom: '#3b82f6' };
  return m[type] || '#3b82f6';
}

function getHeadColor(type: string): string {
  const m: Record<string, string> = { king: '#fde68a', knight: '#bfdbfe', wizard: '#c4b5fd', dragon: '#fca5a5', pirate: '#d4a574', lion: '#fbbf24', panda: '#f5f5f5', enemy: '#2d1b2e', custom: '#bfdbfe' };
  return m[type] || '#bfdbfe';
}
