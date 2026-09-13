import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { buildShellCache, measureFaceplate } from "./shell-geometry.mjs";

export const modelURL = new URL(
  "../dist/assets/ipod_classic.glb",
  import.meta.url,
);
export const shellURL = new URL("../dist/assets/shells.glb", import.meta.url);
export async function sourcePlate() {
  const bytes = await fs.readFile(modelURL);
  // Geometry-only decoding does not need DOM image APIs in Node.
  const loader = new GLTFLoader().register((parser) => ({
    name: "geometry-only",
    loadMaterial: (i) =>
      Promise.resolve(
        new THREE.MeshBasicMaterial({ name: parser.json.materials[i].name }),
      ),
  }));
  const gltf = await loader.parseAsync(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    "",
  );
  gltf.scene.updateMatrixWorld(true);
  const origin = new THREE.Box3()
    .setFromObject(gltf.scene)
    .getCenter(new THREE.Vector3());
  let geometry;
  gltf.scene.traverse((mesh) => {
    if (mesh.isMesh && mesh.material.name === "Material.006") {
      geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
      geometry.translate(-origin.x, -origin.y, -origin.z);
    }
  });
  if (!geometry)
    throw new Error("The source model has no Material.006 faceplate.");
  return {
    geometry,
    sourceModelSha256: createHash("sha256").update(bytes).digest("hex"),
  };
}

// Deterministic glTF 2 binary encoding. Indexed float32 geometry preserves the
// original CSG normals; UVs are derived from XY by the viewer for catalog colors.
export function serializeShells(cache, sourceModelSha256) {
  const document = {
    asset: { version: "2.0", generator: "Classic Studio shell baker" },
    scene: 0,
    scenes: [
      {
        nodes: [],
        extras: {
          schemaVersion: 1,
          sourceModelSha256,
          plate: cache.plate,
          wall: cache.wall,
        },
      },
    ],
    nodes: [],
    meshes: [],
    buffers: [{ byteLength: 0 }],
    bufferViews: [],
    accessors: [],
  };
  const chunks = [];
  let offset = 0;
  const attribute = (array, itemSize, target, min, max) => {
    const bytes = Buffer.from(array.buffer, array.byteOffset, array.byteLength),
      bufferView = document.bufferViews.length;
    document.bufferViews.push({
      buffer: 0,
      byteOffset: offset,
      byteLength: bytes.length,
      target,
    });
    chunks.push(bytes);
    offset += bytes.length;
    const pad = (4 - (offset % 4)) % 4;
    if (pad) {
      chunks.push(Buffer.alloc(pad));
      offset += pad;
    }
    const index = document.accessors.length;
    document.accessors.push({
      bufferView,
      componentType:
        array instanceof Float32Array
          ? 5126
          : array instanceof Uint16Array
            ? 5123
            : 5125,
      count: array.length / itemSize,
      type: itemSize === 1 ? "SCALAR" : "VEC3",
      ...(min ? { min, max } : {}),
    });
    return index;
  };
  for (const [name, variant] of cache.variants) {
    const raw = variant.geometry.clone();
    raw.deleteAttribute("uv");
    const g = mergeVertices(raw, 1e-6);
    g.computeBoundingBox();
    const position = attribute(
      g.attributes.position.array,
      3,
      34962,
      g.boundingBox.min.toArray(),
      g.boundingBox.max.toArray(),
    );
    const normal = attribute(g.attributes.normal.array, 3, 34962),
      indices = attribute(g.index.array, 1, 34963);
    const { geometry, ...metadata } = variant,
      index = document.nodes.length;
    document.scenes[0].nodes.push(index);
    document.nodes.push({
      name,
      mesh: index,
      extras: { ...metadata, variantKey: name },
    });
    document.meshes.push({
      name,
      primitives: [
        { attributes: { POSITION: position, NORMAL: normal }, indices },
      ],
    });
    raw.dispose();
    g.dispose();
  }
  document.buffers[0].byteLength = offset;
  const json = Buffer.from(JSON.stringify(document));
  const jsonChunk = Buffer.concat([
      json,
      Buffer.alloc((4 - (json.length % 4)) % 4, 0x20),
    ]),
    binary = Buffer.concat(chunks);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonChunk.length + 8 + binary.length, 8);
  const chunkHeader = (length, type) => {
    const h = Buffer.alloc(8);
    h.writeUInt32LE(length, 0);
    h.writeUInt32LE(type, 4);
    return h;
  };
  return Buffer.concat([
    header,
    chunkHeader(jsonChunk.length, 0x4e4f534a),
    jsonChunk,
    chunkHeader(binary.length, 0x004e4942),
    binary,
  ]);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const { geometry, sourceModelSha256 } = await sourcePlate(),
    cache = buildShellCache(measureFaceplate(geometry)),
    bytes = serializeShells(cache, sourceModelSha256);
  await fs.writeFile(shellURL, bytes);
  console.log(
    `Baked ${cache.variants.size} shell variants into dist/assets/shells.glb (${bytes.length.toLocaleString()} bytes).`,
  );
}
