import { Suspense, useMemo, useRef } from 'react';
import { Sparkles } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ModelLighting from './ModelLighting';
import PerfumeModel from './PerfumeModel';
import SoftGlow from './SoftGlow';
import { damp, scrollState, useMediaQuery } from '../../hooks/useScrollProgress';
import { products } from '../../data/products';

const colorA = new THREE.Color();
const colorB = new THREE.Color();

function mixColors(from, to, t, target) {
  colorA.set(from);
  colorB.set(to);
  return target.lerpColors(colorA, colorB, t);
}

function CollectionModel({ product, index, fadeRef, load }) {
  const group = useRef(null);
  const introRef = useRef(0);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const stage = scrollState.collection * 2;
    const diff = index - stage;
    const distance = Math.min(1, Math.abs(diff));
    const raw = Math.max(0, 1 - distance * 1.04);
    const opacity = raw * raw * (3 - 2 * raw);

    fadeRef.current = opacity;
    introRef.current = damp(introRef.current, load ? 1 : 0, 2.6, dt);

    const baseScale = (isMobile ? 1.72 : 2.08) * (0.9 + introRef.current * 0.1);
    const scale = baseScale * (1 - distance * 0.1);
    group.current.scale.setScalar(scale);

    if (scrollState.reducedMotion) {
      group.current.rotation.y = 0.5 + index * 0.55;
      group.current.rotation.x = 0;
      group.current.position.y = -diff * 0.5;
      group.current.position.x = 0;
      return;
    }

    group.current.position.y =
      -diff * 0.54 + Math.sin(t * 0.55 + index * 1.4) * 0.018;
    group.current.position.x =
      diff * 0.06 + Math.sin(t * 0.4 + index) * 0.012;
    group.current.rotation.y =
      0.55 +
      scrollState.collection * Math.PI * 1.75 +
      index * 0.72 +
      t * 0.1 +
      scrollState.pointer.x * 0.12;
    group.current.rotation.x =
      -diff * 0.08 + scrollState.pointer.y * 0.018;
    group.current.rotation.z = Math.sin(t * 0.3 + index) * 0.008;
  });

  if (!load) return null;

  return (
    <group ref={group}>
      <Suspense fallback={null}>
        <PerfumeModel url={product.model} fadeRef={fadeRef} envMapIntensity={1.2} />
      </Suspense>
    </group>
  );
}

export default function CollectionScene({ loadSecondary = true }) {
  const fadeRefs = useMemo(
    () => products.map(() => ({ current: 0 })),
    [],
  );
  const keyRef = useRef(null);
  const rimRef = useRef(null);
  const fillRef = useRef(null);
  const haloRef = useRef(null);
  const { camera } = useThree();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const color = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const stage = scrollState.collection * 2;
    const segment = Math.min(1, Math.max(0, stage));
    const lower = Math.min(1, Math.floor(segment));
    const t = Math.min(1, Math.max(0, segment - lower));
    const a = products[lower];
    const b = products[Math.min(2, lower + 1)];

    if (keyRef.current?.color) {
      mixColors(a.lighting.key, b.lighting.key, t, keyRef.current.color);
      keyRef.current.intensity = 30 + t * 8;
    }
    if (rimRef.current?.color) {
      mixColors(a.lighting.rim, b.lighting.rim, t, rimRef.current.color);
      rimRef.current.intensity = 22 + t * 8;
    }
    if (fillRef.current?.color) {
      mixColors(a.lighting.glow, b.lighting.glow, t, fillRef.current.color);
      fillRef.current.intensity = 4.5 + t * 1.5;
    }
    if (haloRef.current) {
      mixColors(a.accent, b.accent, t, color);
      haloRef.current.material.color.copy(color);
      haloRef.current.material.opacity =
        0.22 + Math.sin(segment * Math.PI) * 0.05;
    }

    if (scrollState.reducedMotion) {
      camera.position.set(0, 0.08, isMobile ? 4.9 : 4.45);
      camera.lookAt(0, 0, 0);
      return;
    }

    const wave = Math.sin(segment * Math.PI * 0.5);
    camera.position.z = damp(
      camera.position.z,
      (isMobile ? 4.9 : 4.45) + Math.sin(segment * Math.PI) * 0.18,
      3,
      dt,
    );
    camera.position.y = damp(
      camera.position.y,
      0.08 + t * 0.05 + scrollState.pointer.y * -0.02,
      3,
      dt,
    );
    camera.position.x = damp(
      camera.position.x,
      wave * 0.08 + scrollState.pointer.x * 0.05,
      3,
      dt,
    );
    camera.lookAt(0, 0.01, 0);
  });

  return (
    <>
      <ModelLighting
        keyColor={products[0].lighting.key}
        rimColor={products[0].lighting.rim}
        fillColor={products[0].lighting.glow}
        intensity={1}
      />

      <spotLight
        ref={keyRef}
        position={[2.8, 3.4, 2.6]}
        angle={0.5}
        penumbra={1}
        intensity={30}
        distance={12}
        decay={2}
        color={products[0].lighting.key}
      />
      <spotLight
        ref={rimRef}
        position={[-3, 1.1, 1.8]}
        angle={0.6}
        penumbra={1}
        intensity={22}
        distance={12}
        decay={2}
        color={products[0].lighting.rim}
      />
      <pointLight
        ref={fillRef}
        position={[0, -1.3, 1.4]}
        intensity={4.5}
        distance={6}
        decay={2}
        color={products[0].lighting.glow}
      />

      {products.map((product, index) => (
        <CollectionModel
          key={product.id}
          product={product}
          index={index}
          fadeRef={fadeRefs[index]}
          load={index === 0 || loadSecondary}
        />
      ))}

      <SoftGlow
        ref={haloRef}
        color={products[0].accent}
        opacity={0.22}
        size={5.4}
        position={[0, 0.02, -1.7]}
      />

      {!isMobile && (
        <Sparkles
          count={34}
          scale={[3.4, 4.4, 2]}
          size={1.4}
          speed={0.18}
          opacity={0.28}
          color="#e2c38d"
          noise={0.75}
        />
      )}
    </>
  );
}
