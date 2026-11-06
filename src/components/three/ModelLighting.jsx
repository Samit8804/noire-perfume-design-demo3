import { Environment, Lightformer } from '@react-three/drei';

/**
 * A hand-built studio environment. Reflections are formed from warm rectangular
 * light panels rather than an external HDRI, keeping the scene self-contained.
 */
export default function ModelLighting({
  keyColor = '#f0d09a',
  rimColor = '#a66d2f',
  fillColor = '#d8a45a',
  intensity = 1,
}) {
  return (
    <>
      <ambientLight intensity={0.16 * intensity} color="#e7d9c4" />

      <directionalLight
        position={[3.4, 4.2, 3]}
        intensity={2.1 * intensity}
        color={keyColor}
      />

      <spotLight
        position={[-3.1, 1.6, 2.6]}
        angle={0.48}
        penumbra={1}
        intensity={34 * intensity}
        distance={12}
        decay={2}
        color={rimColor}
      />

      <pointLight
        position={[0.2, -1.35, 1.9]}
        intensity={5 * intensity}
        distance={6}
        decay={2}
        color={fillColor}
      />

      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#070504']} />
        <Lightformer
          form="rect"
          intensity={4.2}
          color={keyColor}
          position={[3, 2.2, 2.4]}
          rotation={[0, -0.5, 0]}
          scale={[2.2, 5.4, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.2}
          color={fillColor}
          position={[-3, 0.4, 1.4]}
          rotation={[0, 0.6, 0]}
          scale={[1.4, 4.4, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="ring"
          intensity={1.6}
          color={rimColor}
          position={[0, -2.2, -1.4]}
          scale={3.4}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.8}
          color="#ffe7c0"
          position={[0, 4, -1.8]}
          rotation={[0.4, 0, 0]}
          scale={[4, 1.2, 1]}
          target={[0, 0, 0]}
        />
      </Environment>
    </>
  );
}
