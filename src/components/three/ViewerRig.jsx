import { Suspense } from 'react';
import { OrbitControls, Sparkles } from '@react-three/drei';
import ModelLighting from './ModelLighting';
import PerfumeModel from './PerfumeModel';
import SoftGlow from './SoftGlow';

function ViewerRig({ product, controlsRef }) {
  return (
    <>
      <ModelLighting
        keyColor={product.lighting.key}
        rimColor={product.lighting.rim}
        fillColor={product.lighting.glow}
        intensity={1.05}
      />
      <group>
        <Suspense fallback={null}>
          <PerfumeModel url={product.model} scale={2.05} envMapIntensity={1.25} />
        </Suspense>
      </group>
      <Sparkles
        count={24}
        scale={[3, 4.4, 2]}
        size={1.3}
        speed={0.16}
        opacity={0.24}
        color="#e4c693"
        noise={0.8}
      />
      <SoftGlow
        color={product.accent}
        opacity={0.22}
        size={5.2}
        position={[0, -0.06, -1.7]}
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.055}
        minDistance={3.1}
        maxDistance={6.2}
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.66}
        autoRotate
        autoRotateSpeed={0.55}
        target={[0, 0, 0]}
      />
    </>
  );
}

export default ViewerRig;
