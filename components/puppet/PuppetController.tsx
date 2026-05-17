'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store';

export function PuppetController() {
  const { puppet, updatePuppetPosition, updatePuppetRotation } = useStore();
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 6;
      const y = -(e.clientY / window.innerHeight - 0.5) * 4;
      targetRef.current = { x, y };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const animate = () => {
      const lerpFactor = 0.08;

      currentRef.current.x +=
        (targetRef.current.x - currentRef.current.x) * lerpFactor;
      currentRef.current.y +=
        (targetRef.current.y - currentRef.current.y) * lerpFactor;

      updatePuppetPosition({
        x: currentRef.current.x,
        y: currentRef.current.y,
      });

      updatePuppetRotation({
        y: (targetRef.current.x - currentRef.current.x) * 0.5,
      });

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [updatePuppetPosition, updatePuppetRotation]);

  return null;
}
