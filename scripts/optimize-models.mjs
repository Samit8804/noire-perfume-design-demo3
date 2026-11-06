/**
 * Optimizes the supplied Noire flacon models for the web.
 *
 * - Loses no more than 14% of vertices (lossy but visually faithful).
 * - Applies Meshopt (reorder + quantize + compress) geometry encoding.
 * - Re-encodes image textures as WebP.
 *
 * Reads the untouched sources from `3d model/` and writes optimized GLBs
 * into `public/models/`.
 */
import { NodeIO } from '@gltf-transform/core';
import {
  EXTMeshoptCompression,
  KHRMeshQuantization,
} from '@gltf-transform/extensions';
import {
  meshopt,
  simplify,
  textureCompress,
} from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const io = new NodeIO().registerExtensions([
  EXTMeshoptCompression,
  KHRMeshQuantization,
]).registerDependencies({
  'meshopt.decoder': MeshoptDecoder,
  'meshopt.encoder': MeshoptEncoder,
});

await MeshoptDecoder.ready;
await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;

const JOBS = [
  {
    source: '3d model/noire-perfume-black-NOIR.glb',
    output: 'public/models/black-noire.glb',
    label: 'Black Noire',
  },
  {
    source: '3d model/noire-perfume-GOLDEN OUD.glb',
    output: 'public/models/golden-noire.glb',
    label: 'Golden Noire',
  },
  {
    source: '3d model/noire-velvet-amber.glb',
    output: 'public/models/velvet-amber-noire.glb',
    label: 'Velvet Amber Noire',
  },
];

for (const job of JOBS) {
  console.log(`Optimizing ${job.label} (${job.source})`);

  const document = await io.read(job.source);

  await document.transform(
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.14, error: 0.0001 }),
  );
  await document.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  await document.transform(
    textureCompress({
      encoder: sharp,
      targetFormat: 'webp',
      slots: /^(?!.*normalTexture).*$/,
    }),
  );

  const glb = await io.writeBinary(document);
  writeFileSync(job.output, Buffer.from(glb));
  console.log(`${job.label}: ${Math.round(glb.byteLength / 1024)} KB glb -> ${job.output}`);
}
