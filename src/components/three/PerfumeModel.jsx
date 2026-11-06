import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Loads one supplied NOIRE GLB and renders it without altering its geometry,
 * UVs or texture maps. Materials are cloned only so the scene can fade between
 * models without touching the cached source asset.
 */
const PerfumeModel = forwardRef(function PerfumeModel(
  { url, fadeRef, scale = 1, envMapIntensity = 1.15 },
  ref,
) {
  const { scene } = useGLTF(url, false, true);
  const groupRef = useRef(null);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.name = `noire-model-${url.split('/').pop()}`;
    clone.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = false;
        object.receiveShadow = false;
        object.material = Array.isArray(object.material)
          ? object.material.map((material) => material.clone())
          : object.material.clone();
      }
    });
    return clone;
  }, [scene, url]);

  const materials = useMemo(() => {
    const list = [];
    clonedScene.traverse((object) => {
      if (!object.isMesh) return;
      const source = Array.isArray(object.material)
        ? object.material
        : [object.material];
      source.forEach((material) => list.push(material));
    });
    return list;
  }, [clonedScene]);

  useEffect(() => {
    return () => {
      materials.forEach((material) => material.dispose());
    };
  }, [materials]);

  useEffect(() => {
    materials.forEach((material) => {
      material.envMapIntensity = envMapIntensity;
      if (fadeRef) {
        material.transparent = true;
        material.opacity = fadeRef.current;
        material.depthWrite = true;
        material.needsUpdate = true;
      }
    });
  }, [materials, fadeRef, envMapIntensity]);

  useFrame(() => {
    if (!fadeRef || !groupRef.current) return;
    const opacity = THREE.MathUtils.clamp(fadeRef.current, 0, 1);
    groupRef.current.visible = opacity > 0.008;
    materials.forEach((material) => {
      if (material.opacity !== opacity) {
        material.opacity = opacity;
        material.depthWrite = opacity > 0.55;
      }
    });
  });

  useImperativeHandle(ref, () => groupRef.current, []);

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
});

export default PerfumeModel;
