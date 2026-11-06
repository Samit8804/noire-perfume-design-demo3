import { forwardRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.58)');
  gradient.addColorStop(0.48, 'rgba(255, 255, 255, 0.16)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * A soft, edge-free light pool rendered behind a flacon. Unlike a circle mesh,
 * the radial canvas texture fades naturally into the dark stage.
 */
const SoftGlow = forwardRef(function SoftGlow(
  {
    color = '#c9a96a',
    opacity = 0.4,
    size = 4.4,
    position = [0, 0.02, -1.7],
  },
  ref,
) {
  const texture = useMemo(createGlowTexture, []);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <sprite ref={ref} position={position} scale={[size, size, 1]} renderOrder={-2}>
      <spriteMaterial
        map={texture}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
});

export default SoftGlow;
