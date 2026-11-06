import { Suspense, useMemo, useRef } from 'react';
import { Sparkles } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ModelLighting from './ModelLighting';
import PerfumeModel from './PerfumeModel';
import { damp, scrollState, useMediaQuery } from '../../hooks/useScrollProgress';
import { products } from '../../data/products';

function GalleryModel({ product, index, activeRef, fadeRef }) {
  const group = useRef(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const active = activeRef.current;
    const diff = index - active;
    const distance = Math.min(1, Math.abs(diff));
    const raw = Math.max(0, 1 - distance);
    fadeRef.current = raw * raw * (3 - 2 * raw);

    const scale = 2.1 * (1 - distance * 0.12);
    group.current.scale.setScalar(scale);

    if (scrollState.reducedMotion) {
      group.current.rotation.y = 0.4 + index * 0.5;
      group.current.rotation.x = 0;
      group.current.position.y = -diff * 0.45;
      return;
    }

    group.current.rotation.y =
      0.4 +
      scrollState.galleryRotation +
      t * 0.12 +
      index * 0.4 +
      scrollState.pointer.x * 0.15;
    group.current.rotation.x =
      scrollState.pointer.y * 0.03 - diff * 0.04;
    group.current.rotation.z = Math.sin(t * 0.3 + index) * 0.006;
    group.current.position.y =
      -diff * 0.42 + Math.sin(t * 0.5 + index) * 0.02;
    group.current.position.x = diff * 0.05;
    group.current.visible = fadeRef.current > 0.005;
  });

  return (
    <group ref={group}>
      <Suspense fallback={null}>
        <PerfumeModel url={product.model} fadeRef={fadeRef} envMapIntensity={1.22} />
      </Suspense>
    </group>
  );
}

export default function GalleryScene({ activeIndex = 0 }) {
  const fadeRefs = useMemo(() => products.map(() => ({ current: 0 })), []);
  const activeRef = useRef(activeIndex);
  const { camera } = useThree();
  const isMobile = useMediaQuery('(max-width: 768px)');

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    activeRef.current = damp(activeRef.current, activeIndex, 4, dt);

    camera.position.z = damp(
      camera.position.z,
      isMobile ? 5.1 : 4.75,
      3,
      dt,
    );
    camera.position.y = damp(
      camera.position.y,
      0.06 + scrollState.pointer.y * -0.03,
      3,
      dt,
    );
    camera.position.x = damp(
      camera.position.x,
      scrollState.pointer.x * 0.08,
      3,
      dt,
    );
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ModelLighting
        keyColor={products[0].lighting.key}
        rimColor={products[0].lighting.rim}
        fillColor={products[0].lighting.glow}
      />
      {products.map((product, index) => (
        <GalleryModel
          key={product.id}
          product={product}
          index={index}
          activeRef={activeRef}
          fadeRef={fadeRefs[index]}
        />
      ))}
      {!isMobile && (
        <Sparkles
          count={26}
          scale={[3.6, 4.6, 2]}
          size={1.25}
          speed={0.15}
          opacity={0.22}
          color="#e0c08a"
          noise={0.8}
        />
      )}
    </>
  );
}
