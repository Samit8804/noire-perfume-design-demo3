import { useRef } from 'react';
import { Sparkles } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import ModelLighting from './ModelLighting';
import PerfumeModel from './PerfumeModel';
import SoftGlow from './SoftGlow';
import {
  damp,
  scrollState,
  useMediaQuery,
} from '../../hooks/useScrollProgress';
import { products } from '../../data/products';

export default function HeroScene({ ready }) {
  const group = useRef(null);
  const fadeRef = useRef(0);
  const appearRef = useRef(0);
  const { camera } = useThree();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const black = products[0];

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = scrollState.hero;
    const reduced = scrollState.reducedMotion;
    const dt = Math.min(delta, 0.05);

    fadeRef.current = damp(fadeRef.current, ready ? 1 : 0, 3.4, dt);
    appearRef.current = damp(appearRef.current, ready ? 1 : 0, 2.8, dt);

    if (!group.current) return;

    const baseScale = isMobile ? 1.82 : 2.02;
    group.current.scale.setScalar(baseScale * (0.94 + appearRef.current * 0.06));
    group.current.rotation.y = reduced
      ? 0.45 + p * 0.9
      : 0.45 + t * 0.14 + p * 0.9 + scrollState.pointer.x * 0.2;
    group.current.rotation.x = reduced ? 0 : scrollState.pointer.y * 0.025;
    group.current.rotation.z = reduced ? 0 : Math.sin(t * 0.25) * 0.006;
    group.current.position.y =
      (reduced ? 0 : Math.sin(t * 0.55) * 0.022) -
      0.06 -
      p * 0.18 +
      (1 - appearRef.current) * -0.12;
    group.current.position.x = reduced ? 0 : scrollState.pointer.x * 0.035;

    const targetZ = (isMobile ? 4.8 : 4.35) + p * 0.5;
    const targetY = 0.08 + p * 0.22;
    camera.position.z = damp(camera.position.z, targetZ, 4, dt);
    camera.position.x = damp(
      camera.position.x,
      reduced ? 0 : scrollState.pointer.x * 0.08,
      4,
      dt,
    );
    camera.position.y = damp(
      camera.position.y,
      reduced ? 0.08 : targetY + scrollState.pointer.y * -0.035,
      4,
      dt,
    );
    camera.lookAt(0, 0.02, 0);
  });

  return (
    <>
      <ModelLighting
        keyColor={black.lighting.key}
        rimColor={black.lighting.rim}
        fillColor={black.lighting.glow}
      />

      <group ref={group}>
        <PerfumeModel
          url={black.model}
          fadeRef={fadeRef}
          envMapIntensity={1.2}
        />
      </group>

      <SoftGlow
        color={black.accent}
        opacity={0.22}
        size={5.3}
        position={[0, -0.06, -1.9]}
      />

      {!isMobile && (
        <Sparkles
          count={42}
          scale={[4.2, 5.4, 2.6]}
          size={1.5}
          speed={0.22}
          opacity={0.32}
          color="#e5c894"
          noise={0.7}
        />
      )}
    </>
  );
}
