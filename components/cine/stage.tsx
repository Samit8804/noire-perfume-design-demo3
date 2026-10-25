"use client";

import * as THREE from "three";
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  useGLTF,
} from "@react-three/drei";
import { FRAGRANCES } from "@/lib/collection-data";

interface CineStageProps {
  fragrances: typeof FRAGRANCES;
  progressRef: RefObject<number>;
  stateIndexRef: RefObject<number>;
  onModelError: (error: Error) => void;
  onModelReady: (index: number) => void;
  loadedModels: number[];
}

const MODEL_PATHS = FRAGRANCES.map((fragrance) => `/models/${encodeURI(fragrance.model)}`);

type Keyframe = readonly [number, number];

interface BottleTracks {
  x: Keyframe[];
  y: Keyframe[];
  z: Keyframe[];
  scale: Keyframe[];
  opacity: Keyframe[];
  rx: Keyframe[];
  ry: Keyframe[];
}

function track(progress: number, keys: Keyframe[]) {
  if (progress <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i += 1) {
    const [start, startValue] = keys[i];
    const [end, endValue] = keys[i + 1];
    if (progress <= end) {
      return THREE.MathUtils.lerp(
        startValue,
        endValue,
        THREE.MathUtils.smoothstep(progress, start, end),
      );
    }
  }
  return keys[keys.length - 1][1];
}

const DESKTOP_TRACKS: BottleTracks[] = [
  {
    x: [[0, 2.35], [0.34, 2.35], [0.46, -3.4], [0.86, -3.4], [0.92, -2.4], [1, -2.4]],
    y: [[0, -0.12], [0.34, -0.12], [0.46, -1], [0.86, -1.2], [0.92, -1.8], [1, -1.8]],
    z: [[0, 0], [0.34, 0], [0.46, -1.5], [0.86, -1.2], [0.92, 0], [1, 0]],
    scale: [[0, 0.95], [0.34, 0.95], [0.46, 0.78], [0.86, 0.7], [0.92, 0.55], [1, 0.55]],
    opacity: [[0, 0.9], [0.08, 1], [0.34, 0.95], [0.42, 0], [0.86, 0], [0.92, 1], [1, 1]],
    rx: [[0, -0.16], [0.46, -0.06], [1, -0.02]],
    ry: [[0, -0.3], [0.34, -0.22], [0.46, -0.06], [0.86, 0], [0.92, 0.06], [1, 0.06]],
  },
  {
    x: [[0, 4], [0.34, 4], [0.44, 2.35], [0.58, 2.35], [0.7, 0], [1, 0]],
    y: [[0, -1.4], [0.34, -1.4], [0.44, -0.12], [0.7, -0.12], [0.86, -1.2], [0.92, -1.8], [1, -1.8]],
    z: [[0, -2], [0.34, -2], [0.44, 0], [1, 0]],
    scale: [[0, 0.95], [0.44, 0.95], [0.62, 0.95], [0.72, 0.8], [0.92, 0.55], [1, 0.55]],
    opacity: [[0, 0], [0.36, 0], [0.44, 1], [0.64, 1], [0.73, 0], [0.86, 0], [0.92, 1], [1, 1]],
    rx: [[0, -0.1], [0.44, -0.08], [1, -0.02]],
    ry: [[0, 0.15], [0.44, 0.08], [0.7, 0], [1, 0]],
  },
  {
    x: [[0, 4], [0.6, 4], [0.7, 2.35], [0.86, 2.35], [0.92, 2.4], [1, 2.4]],
    y: [[0, -1.4], [0.6, -1.4], [0.7, -0.12], [0.86, -1.2], [0.92, -1.8], [1, -1.8]],
    z: [[0, -2], [0.6, -2], [0.7, 0], [1, 0]],
    scale: [[0, 0.95], [0.6, 0.95], [0.7, 0.95], [0.84, 0.85], [0.92, 0.55], [1, 0.55]],
    opacity: [[0, 0], [0.62, 0], [0.7, 1], [1, 1]],
    rx: [[0, 0.02], [0.7, 0.04], [1, -0.02]],
    ry: [[0, 0.18], [0.7, 0.1], [0.86, 0.04], [1, 0]],
  },
];

const MOBILE_TRACKS: BottleTracks[] = [
  {
    x: [[0, 0], [1, 0]],
    y: [[0, 1.15], [0.34, 1.15], [0.46, -2.8], [0.86, -2.6], [0.92, 0.65], [1, 0.65]],
    z: [[0, 0], [1, 0]],
    scale: [[0, 0.52], [0.34, 0.52], [0.46, 0.45], [0.86, 0.4], [0.92, 0.34], [1, 0.34]],
    opacity: [[0, 0.9], [0.08, 1], [0.34, 0.95], [0.42, 0], [0.86, 0], [0.92, 1], [1, 1]],
    rx: [[0, -0.16], [0.46, -0.06], [1, -0.02]],
    ry: [[0, -0.3], [0.34, -0.22], [0.46, -0.06], [0.86, 0], [0.92, 0.06], [1, 0.06]],
  },
  {
    x: [[0, 0], [0.7, -0.62], [1, -0.62]],
    y: [[0, -2.8], [0.34, -2.8], [0.44, 1.15], [0.7, 1.15], [0.86, -1.4], [0.92, 0.65], [1, 0.65]],
    z: [[0, 0], [1, 0]],
    scale: [[0, 0.52], [0.44, 0.52], [0.62, 0.52], [0.72, 0.45], [0.92, 0.34], [1, 0.34]],
    opacity: [[0, 0], [0.36, 0], [0.44, 1], [0.64, 1], [0.73, 0], [0.86, 0], [0.92, 1], [1, 1]],
    rx: [[0, -0.1], [0.44, -0.08], [1, -0.02]],
    ry: [[0, 0.15], [0.44, 0.08], [0.7, 0], [1, 0]],
  },
  {
    x: [[0, 0], [0.86, 0.62], [1, 0.62]],
    y: [[0, -2.8], [0.6, -2.8], [0.7, 1.15], [0.86, -1.4], [0.92, 0.65], [1, 0.65]],
    z: [[0, 0], [1, 0]],
    scale: [[0, 0.52], [0.6, 0.52], [0.7, 0.52], [0.84, 0.45], [0.92, 0.34], [1, 0.34]],
    opacity: [[0, 0], [0.62, 0], [0.7, 1], [1, 1]],
    rx: [[0, 0.02], [0.7, 0.04], [1, -0.02]],
    ry: [[0, 0.18], [0.7, 0.1], [0.86, 0.04], [1, 0]],
  },
];

function getBottlePose(progress: number, index: number, mobile: boolean) {
  const tracks = (mobile ? MOBILE_TRACKS : DESKTOP_TRACKS)[index];
  return {
    x: track(progress, tracks.x),
    y: track(progress, tracks.y),
    z: track(progress, tracks.z),
    rotationX: track(progress, tracks.rx),
    rotationY: track(progress, tracks.ry) + progress * 0.05,
    rotationZ: 0,
    scale: track(progress, tracks.scale),
    opacity: track(progress, tracks.opacity),
  };
}

class ModelErrorBoundary extends Component<
  { onError: (error: Error) => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Bottle({
  index,
  modelPath,
  progressRef,
  mobile,
  onReady,
}: {
  index: number;
  modelPath: string;
  progressRef: RefObject<number>;
  mobile: boolean;
  onReady: (index: number) => void;
}) {
  const { scene } = useGLTF(modelPath, true, true);
  const groupRef = useRef<THREE.Group>(null);
  const model = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const cloneMaterial = (material: THREE.Material) => {
        const instance = material.clone();
        if ("transparent" in instance) {
          instance.transparent = true;
          instance.depthWrite = false;
          instance.opacity = 0;
        }
        if ("envMapIntensity" in instance) {
          (instance as THREE.MeshStandardMaterial).envMapIntensity = 1.7;
        }
        return instance;
      };
      object.material = Array.isArray(object.material)
        ? object.material.map(cloneMaterial)
        : cloneMaterial(object.material);
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const targetHeight = 2.7;
    const fit = targetHeight / Math.max(size.y, 0.0001);
    cloned.position.set(-center.x, -center.y, -center.z);

    const wrapper = new THREE.Group();
    wrapper.add(cloned);
    wrapper.scale.setScalar(fit);
    return wrapper;
  }, [scene]);

  const readyRef = useRef(false);
  useEffect(() => {
    if (readyRef.current) return;
    readyRef.current = true;
    onReady(index);
  }, [index, onReady]);

  useEffect(() => {
    const materials: THREE.Material[] = [];
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      materials.push(...(Array.isArray(object.material) ? object.material : [object.material]));
    });
    return () => materials.forEach((material) => material.dispose());
  }, [model]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const pose = getBottlePose(progressRef.current, index, mobile);
    group.position.x = THREE.MathUtils.damp(group.position.x, pose.x, 8, delta);
    group.position.y = THREE.MathUtils.damp(group.position.y, pose.y, 8, delta);
    group.position.z = THREE.MathUtils.damp(group.position.z, pose.z, 8, delta);
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, pose.rotationX, 8, delta);
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, pose.rotationY, 8, delta);
    group.rotation.z = THREE.MathUtils.damp(group.rotation.z, pose.rotationZ, 8, delta);
    group.scale.setScalar(THREE.MathUtils.damp(group.scale.x, pose.scale, 8, delta));
    group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if ("opacity" in material) {
          material.opacity = THREE.MathUtils.damp(material.opacity, pose.opacity, 10, delta);
        }
      });
    });
    group.visible = pose.opacity > 0.005;
  });

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={model} />
    </group>
  );
}

function BottleSlot({
  index,
  progressRef,
  onModelError,
  onModelReady,
  mobile,
}: {
  index: number;
  progressRef: RefObject<number>;
  onModelError: (error: Error) => void;
  onModelReady: (index: number) => void;
  mobile: boolean;
}) {
  return (
    <ModelErrorBoundary onError={onModelError}>
      <Suspense fallback={null}>
        <Bottle
          index={index}
          modelPath={MODEL_PATHS[index]}
          progressRef={progressRef}
          mobile={mobile}
          onReady={onModelReady}
        />
      </Suspense>
    </ModelErrorBoundary>
  );
}

function Lights({ stateIndexRef }: { stateIndexRef: RefObject<number> }) {
  const { scene } = useThree();
  const palettes = useMemo(
    () => [0xc8a96b, 0xc8a96b, 0xd4a543, 0xb87045, 0xc8a96b].map((color) => new THREE.Color(color)),
    [],
  );
  const keyLightRef = useRef<THREE.SpotLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);
  const frontLightRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    const key = new THREE.SpotLight(0xfff5e6, 3.2, 25, Math.PI / 5, 0.6, 1);
    key.position.set(3, 4, 4);
    key.target.position.set(0, 0, 0);
    scene.add(key, key.target);

    const rim = new THREE.PointLight(0xc8a96b, 1.6, 12, 2);
    rim.position.set(-4, 1.5, -3);
    scene.add(rim);

    const fill = new THREE.DirectionalLight(0xffeedd, 0.45);
    fill.position.set(0, 5, 0);
    scene.add(fill);

    const front = new THREE.PointLight(0xfff2df, 1.5, 18, 1.6);
    front.position.set(1.5, 1, 6);
    scene.add(front);

    const back = new THREE.PointLight(0xd4a543, 2.2, 16, 2);
    back.position.set(0, 1.6, -4);
    scene.add(back);

    keyLightRef.current = key;
    rimLightRef.current = rim;
    fillLightRef.current = fill;
    frontLightRef.current = front;
    return () => {
      scene.remove(key, key.target, rim, fill, front, back);
      key.dispose();
    };
  }, [scene]);

  useFrame((_, delta) => {
    const palette = palettes[Math.min(stateIndexRef.current, palettes.length - 1)];
    const factor = 1 - Math.exp(-delta * 3);
    if (rimLightRef.current) {
      rimLightRef.current.color.lerp(palette, factor);
    }
    if (keyLightRef.current) {
      keyLightRef.current.intensity = THREE.MathUtils.damp(
        keyLightRef.current.intensity,
        stateIndexRef.current === 2 ? 2.5 : 2.1,
        3,
        delta,
      );
    }
    if (fillLightRef.current) {
      fillLightRef.current.intensity = THREE.MathUtils.damp(
        fillLightRef.current.intensity,
        stateIndexRef.current === 3 ? 0.5 : 0.35,
        3,
        delta,
      );
    }
  });
  return null;
}

function Scene({
  fragrances,
  progressRef,
  stateIndexRef,
  onModelError,
  onModelReady,
  loadedModels,
  mobile,
}: CineStageProps & { loadedModels: number[]; mobile: boolean }) {
  const { gl, camera, scene } = useThree();

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.25;
    gl.setClearColor(0x000000, 0);
    scene.environmentIntensity = 1.35;
    camera.position.set(0, mobile ? 0.5 : 0.4, mobile ? 8 : 9);
    camera.updateProjectionMatrix();
  }, [camera, gl, mobile, scene]);

  return (
    <>
      <color attach="background" args={[0x050505]} />
      <fog attach="fog" args={[0x020202, 5, 35]} />
      <Environment resolution={128} frames={1} background={false}>
        <Lightformer
          form="rect"
          intensity={2.4}
          color={0xfff8e8}
          position={[3, 2.5, 2]}
          rotation={[-Math.PI / 4, 0, 0]}
          scale={[3, 1.5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.4}
          color={0xc8a96b}
          position={[-3, 1.5, -2]}
          rotation={[Math.PI / 5, 0, Math.PI]}
          scale={[2, 1, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.1}
          color={0xffffff}
          position={[0, 1, 5]}
          rotation={[0, 0, 0]}
          scale={[2, 1, 1]}
        />
      </Environment>
      <Lights stateIndexRef={stateIndexRef} />
      {!mobile && <ContactShadows opacity={0.35} blur={2} scale={7} position={[1.8, -1.2, 0]} far={12} resolution={256} />}
      {loadedModels.map((index) => (
        <BottleSlot
          key={index}
          index={index}
          progressRef={progressRef}
          onModelError={onModelError}
          onModelReady={onModelReady}
          mobile={mobile}
        />
      ))}
    </>
  );
}

export function CineStage({
  fragrances,
  progressRef,
  stateIndexRef,
  onModelError,
  onModelReady,
  loadedModels,
}: CineStageProps) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <div className="cine-canvas-wrapper" data-loaded={loadedModels.join(",")} data-mobile={mobile ? "1" : "0"}>
      <ModelErrorBoundary onError={onModelError}>
        <Canvas
          camera={{ fov: 34, position: [0, 0.4, 9] }}
          gl={{ antialias: false, alpha: true, powerPreference: "low-power", preserveDrawingBuffer: false }}
          dpr={mobile ? 1 : [1, 1.35]}
          frameloop="always"
        >
          <Scene
            fragrances={fragrances}
            progressRef={progressRef}
            stateIndexRef={stateIndexRef}
            onModelError={onModelError}
            onModelReady={onModelReady}
            loadedModels={loadedModels}
            mobile={mobile}
          />
        </Canvas>
      </ModelErrorBoundary>
    </div>
  );
}
