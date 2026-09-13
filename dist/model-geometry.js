import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";

// Weld only for smooth bevel normals, then give every coplanar face triangle
// an exact axial normal. Long screen-to-corner triangles cannot pull a highlight
// across the face. The source bevel and screen/wheel openings remain intact.
export function finishPlateNormals(geometry) {
  const g = toCreasedNormals(geometry, Math.PI / 3),
    p = g.attributes.position,
    n = g.attributes.normal;
  for (let i = 0; i < p.count; i += 3) {
    const a = new THREE.Vector3().fromBufferAttribute(p, i),
      b = new THREE.Vector3().fromBufferAttribute(p, i + 1),
      c = new THREE.Vector3().fromBufferAttribute(p, i + 2),
      v = b.sub(a).cross(c.sub(a)).normalize();
    if (Math.abs(v.z) > 0.99999)
      for (let j = 0; j < 3; j++) n.setXYZ(i + j, 0, 0, Math.sign(v.z));
  }
  return g;
}

export function rounded(w, h, r) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.absarc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0);
  s.lineTo(w / 2, h / 2 - r);
  s.absarc(w / 2 - r, h / 2 - r, r, 0, Math.PI / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.absarc(-w / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI);
  s.lineTo(-w / 2, -h / 2 + r);
  s.absarc(-w / 2 + r, -h / 2 + r, r, Math.PI, Math.PI * 1.5);
  s.closePath();
  return s;
}

export function readShellCache(scene) {
  const { schemaVersion, plate, wall } = scene.userData;
  const variants = new Map();
  scene.traverse((mesh) => {
    if (mesh.isMesh)
      variants.set(mesh.userData.variantKey, {
        ...mesh.userData,
        geometry: mesh.geometry,
      });
  });
  if (
    schemaVersion !== 1 ||
    !plate ||
    wall !== 0.02 ||
    variants.size !== 6 ||
    !["thin", "thick"].every((body) =>
      ["original", "usbc", "moon"].every((layout) =>
        variants.has(body + ":" + layout),
      ),
    )
  )
    throw new Error(
      "The baked shell asset is incomplete. Regenerate it with npm run bake:shells.",
    );
  return { variants, plate, wall };
}
