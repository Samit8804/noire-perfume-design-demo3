import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useMediaQuery } from '../../hooks/useScrollProgress';

export default function PerfumeCanvas({
  active = true,
  camera,
  className = '',
  children,
  mobile = false,
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const compact = mobile || isMobile;

  return (
    <Canvas
      className={className}
      frameloop={active ? 'always' : 'never'}
      dpr={[1, compact ? 1.4 : 1.75]}
      gl={{
        alpha: true,
        antialias: !compact,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      camera={camera ?? { position: [0, 0.1, 4.4], fov: 30, near: 0.1, far: 30 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
