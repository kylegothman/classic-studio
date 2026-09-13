import * as THREE from "three";
import { Brush, Evaluator, SUBTRACTION } from "three-bvh-csg";
import { finishPlateNormals, rounded } from "../dist/model-geometry.js";

// The source plate is the dimensional reference. Tangencies of its projected
// outline give a radius at each corner; the largest planar triangle gives the
// face plane (the button's raised face is deliberately not the reference).
export function measureFaceplate(geometry) {
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox.clone(),
    size = bounds.getSize(new THREE.Vector3()),
    p = geometry.attributes.position;
  const corners = [];
  for (const sx of [-1, 1])
    for (const sy of [-1, 1]) {
      let tangent = -Infinity;
      for (let i = 0; i < p.count; i++)
        if (
          Math.abs(p.getX(i) - (sx < 0 ? bounds.min.x : bounds.max.x)) < 0.00001
        )
          tangent = Math.max(tangent, sy * p.getY(i));
      corners.push((sy < 0 ? -bounds.min.y : bounds.max.y) - tangent);
    }
  const flat = geometry.index ? geometry.toNonIndexed() : geometry,
    q = flat.attributes.position;
  let largest = 0,
    faceZ = 0;
  for (let i = 0; i < q.count; i += 3) {
    const a = new THREE.Vector3().fromBufferAttribute(q, i),
      b = new THREE.Vector3().fromBufferAttribute(q, i + 1),
      c = new THREE.Vector3().fromBufferAttribute(q, i + 2),
      n = b.clone().sub(a).cross(c.clone().sub(a)),
      area = n.length();
    if (n.z / area > 0.99999 && area > largest) {
      largest = area;
      faceZ = (a.z + b.z + c.z) / 3;
    }
  }
  if (flat !== geometry) flat.dispose();
  const radius = corners.reduce((a, b) => a + b, 0) / 4;
  if (
    !Number.isFinite(radius) ||
    radius <= 0 ||
    Math.max(...corners) - Math.min(...corners) > 0.003
  )
    throw new Error("Front plate outline needs a new shell adapter.");
  return {
    width: size.x,
    height: size.y,
    radius,
    cornerRadii: corners,
    faceZ,
    bounds,
  };
}

export function buildShellCache(plate) {
  const started = performance.now(),
    wall = 0.02,
    bevel = 0.06,
    segments = 12,
    width = plate.width + 0.02,
    height = plate.height + 0.02,
    radius = plate.radius + 0.01;
  const evaluator = new Evaluator();
  evaluator.useGroups = false;
  const brush = (g) => {
    const b = new Brush(g);
    b.updateMatrixWorld();
    return b;
  };
  const subtract = (a, g) => {
    const b = brush(g),
      result = evaluator.evaluate(a, b, SUBTRACTION);
    g.dispose();
    return result;
  };
  const extrude = (w, h, r, depth, b) =>
    finishPlateNormals(
      new THREE.ExtrudeGeometry(rounded(w - 2 * b, h - 2 * b, r - b), {
        depth: depth - 2 * b,
        bevelEnabled: true,
        bevelSize: b,
        bevelThickness: b,
        bevelSegments: segments,
        curveSegments: 16,
        steps: 1,
      }),
    );
  // The cavity trims the front roll at the wall thickness. Account for that
  // trim so the finished shell, not the uncut extrusion, is .39 / .52 deep.
  let tip = 0;
  for (let i = 1; i <= segments; i++) {
    const a = (((i - 1) / segments) * Math.PI) / 2,
      b = ((i / segments) * Math.PI) / 2,
      x0 = bevel * Math.sin(a),
      x1 = bevel * Math.sin(b),
      x = bevel - wall;
    if (x >= x0 && x <= x1)
      tip = THREE.MathUtils.lerp(
        bevel * Math.cos(a),
        bevel * Math.cos(b),
        (x - x0) / (x1 - x0),
      );
  }
  const trim = bevel - tip,
    frontZ = plate.faceZ - 0.002,
    variants = new Map();
  for (const body of ["thin", "thick"]) {
    const depth = body === "thin" ? 0.39 : 0.52,
      rearZ = frontZ - depth,
      rawDepth = depth + trim;
    const outer = extrude(width, height, radius, rawDepth, bevel);
    outer.translate(0, 0, rearZ + bevel);
    const inner = extrude(
      width - 2 * wall,
      height - 2 * wall,
      radius - wall,
      rawDepth + 0.3,
      bevel - wall,
    );
    inner.translate(0, 0, rearZ + wall + bevel - wall);
    const outerBrush = brush(outer),
      hollow = subtract(outerBrush, inner);
    outer.dispose();
    const centerZ = (rearZ + frontZ) / 2;
    for (const layout of ["original", "usbc", "moon"]) {
      let result = hollow;
      const cut = (g) => {
        const previous = result;
        result = subtract(result, g);
        if (previous !== hollow) previous.geometry.dispose();
      };
      const slot = (w, h, x, top = false) => {
        const g = new THREE.ExtrudeGeometry(
          rounded(w, h, Math.min(h / 2, 0.04)),
          { depth: 0.2, bevelEnabled: false, curveSegments: 12 },
        );
        g.rotateX(Math.PI / 2);
        g.translate(x, (top ? height / 2 : -height / 2) + 0.1, centerZ);
        cut(g);
      };
      if (layout !== "usbc") slot(0.83, 0.1, 0);
      if (layout !== "original") slot(0.35, 0.125, layout === "moon" ? 0.8 : 0);
      const jack = new THREE.CylinderGeometry(0.07, 0.07, 0.2, 40);
      jack.translate(0.78, height / 2, centerZ);
      cut(jack);
      slot(0.35, 0.06, -0.68, true);
      const geometry = result.geometry;
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      variants.set(body + ":" + layout, {
        geometry,
        depth,
        rearZ,
        frontZ,
        centerZ,
        width,
        height,
        radius,
        wall,
      });
    }
    hollow.geometry.dispose();
  }
  return {
    variants,
    buildMs: Math.round(performance.now() - started),
    plate: {
      width: plate.width,
      height: plate.height,
      radius: plate.radius,
      cornerRadii: plate.cornerRadii,
      faceZ: plate.faceZ,
    },
    wall,
  };
}
