/** Inspect GLB files: parse the JSON glTF chunk and summarize structure. */
import { readFileSync } from "node:fs";

const FILES = [
  "3d model/noire-perfume-black-NOIR.glb",
  "3d model/noire-perfume-GOLDEN OUD.glb",
  "3d model/noire-velvet-amber.glb",
];

for (const file of FILES) {
  const buf = readFileSync(file);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error(`${file}: not GLB`);
  let off = 12;
  let gltf = null;
  while (off < buf.length) {
    const chunkLength = buf.readUInt32LE(off);
    const chunkType = buf.readUInt32LE(off + 4);
    if (chunkType === 0x4e4f534a) {
      gltf = JSON.parse(buf.subarray(off + 8, off + 8 + chunkLength).toString("utf8"));
    }
    off += 8 + chunkLength;
  }
  console.log("\n---", file);
  console.log("asset:", gltf.asset?.generator, "version", gltf.asset?.version);
  console.log("scene nodes:", gltf.scene, "nodes:", gltf.nodes?.length);

  // Node hierarchy
  const walk = (index, depth, prefix = "") => {
    const n = gltf.nodes[index];
    let meshInfo = "";
    if (n.mesh !== undefined) {
      const mesh = gltf.meshes[n.mesh];
      meshInfo = ` mesh#${n.mesh}(${mesh?.name ?? "anon"} prims=${mesh.primitives.length})`;
    }
    console.log(
      `${"  ".repeat(depth)}[${index}] name="${n.name ?? "anon"}"${
        n.skin !== undefined ? " skin" : ""
      }${meshInfo}`
    );
    (n.children ?? []).forEach((c) => walk(c, depth + 1));
  };
  (gltf.scenes?.[0]?.nodes ?? []).forEach((n) => walk(n, 0));

  console.log("meshes:", gltf.meshes?.length, "materials:", gltf.materials?.length);

  // Materials detail
  (gltf.materials ?? []).forEach((m, i) => {
    const mr = m.pbrMetallicRoughness ?? {};
    const slots = Object.entries(mr)
      .map(([k, v]) => {
        if (typeof v !== "object") return `${k}=${v}`;
        if (v.index !== undefined) {
          const tex = gltf.textures?.[v.index];
          const img = gltf.images?.[tex.source];
          const bufView = gltf.bufferViews?.[img?.bufferView];
          return `${k}=<tex#${v.index} img:"${img?.name ?? img?.uri ?? "embed"}" ${(bufView?.byteLength ?? 0) / 1024 | 0}KB>`;
        }
        return `${k}=${JSON.stringify(v).slice(0, 40)}`;
      })
      .join(" ");
    const extra = [
      m.occlusionTexture && "occTex",
      m.normalTexture && "nrmTex",
      m.emissiveTexture && "emisTex",
      m.extensions && Object.keys(m.extensions).join("+"),
      m.alphaMode !== "OPAQUE" && `alpha=${m.alphaMode}`,
      m.alphaCutoff !== undefined && `cutoff=${m.alphaCutoff}`,
    ]
      .filter(Boolean)
      .join(" ");
    console.log(
      `  mat[${i}]"${m.name ?? "anon"}" base=${JSON.stringify(m.baseColorFactor ?? mr.baseColorFactor)} metallic=${mr.metallicFactor} rough=${mr.roughnessFactor} ${extra} :: ${slots}`
    );
  });

  const bumpSum = (gltf.buffers ?? []).map((b) => b.byteLength);
  console.log(
    "images:",
    gltf.images?.map((im) => `${im.name ?? "?"}:${im.mimeType ?? "?"}`).join(", ")
  );
  console.log("buffer bytes:", bumpSum);
}
