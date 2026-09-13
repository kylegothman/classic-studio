# Classic Studio update: one-piece shell, faceplate creases, and repo workflow

## Work from the git repo from now on

The project is now a git repository with a GitHub remote: https://github.com/kylegothman/classic-studio (local folder: the existing project directory with `dist/`, `tests/`, `build-single.py`, `README.md`). Read `AGENTS.md` at the repo root before changing anything. For this and every future task: pull `main` first, make the change, run `node tests/compatibility.mjs` and `python3 build-single.py`, commit with a clear message, and push to `main`. If a change is experimental, push it to a branch named `feature/<short-name>` instead and tell me. Never commit `work/` or `outputs/`; they are ignored on purpose.

## The remaining geometry problem

The last update fixed the gaps and put the ports on the bottom edge, but the bottom of the iPod still reads as a separate boxy slab. Screenshot attached: the silver bottom band has hard vertical faces and a flat top where it meets the black faceplate, so the device looks like it is standing on a foot. On a real Classic there is no band. The polished steel back is one drawn shell: the flat back face rolls into the sides and the bottom through a continuous radius, and that shell meets the front plate at a single fine seam all the way around. The dock opening is cut straight into the curved steel.

The reason is in `viewer.js`: `Shiney_Back`, `Material.016` and `Port` from the GLB are still being grouped under `shellDepth` and scaled. `Material.016` is a separate slab in the source model, and no amount of scaling or normal creasing will make it flow into `Shiney_Back`. Replace those three meshes with a shell you generate.

## Build the shell procedurally

Keep `Material.006` (front plate, with your existing button split), `Screen` and `Wheel` from the GLB. Stop loading `Shiney_Back`, `Material.016` and `Port` into the scene.

Outer shell:

1. Take the footprint from the front plate's bounding box (about 2.44 by 4.05 in the model's inch units) and measure its corner radius from the plate outline; do not guess it.
2. Make a rounded-rectangle `Shape` with that footprint and radius, and extrude it along the depth axis with `ExtrudeGeometry` using `bevelEnabled: true`. Depth is 0.39 for thin and 0.52 for thick. Set `bevelSize` and `bevelThickness` to roughly 0.06 with at least 8 `bevelSegments` so the rear edge is a smooth roll, and apply the same bevel on the front edge so the shell curls in toward the plate. There should be no hard vertical face anywhere on the sides or bottom.
3. Subtract an inner extrusion inset by a wall thickness of about 0.02 with `three-bvh-csg` so the x-ray and exploded views show a hollow. If CSG at every body switch is too slow, generate the thin and thick shells once at startup and swap.
4. Cut the openings into the shell with CSG, all on the curved bottom and top faces, never on the front plate: the dock (0.83 by 0.10 for 30-pin, 0.35 by 0.125 for USB-C), the headphone jack (0.14 round) and the hold slot (0.35 by 0.06). Place a dark receptacle and a bezel-colored lip inside each cutout.
5. Give the entire shell, including sides, top and bottom, the back plate material. Smooth normals across the roll, `toCreasedNormals` only if a seam appears at the CSG boundaries.

Seat the front plate:

6. Sink the plate into the shell's front opening so the plate's outer edge is about 0.01 inside the shell's outer edge on all sides. The shell's front bevel then shows as a thin rim around the plate. The plate face should sit flush with, or a hair proud of, the rim, like the real aluminum face.
7. If the plate's corner radius and the shell's radius do not match within a few thousandths, rebuild the plate too: a rounded-rectangle `ShapeGeometry` with the screen and wheel openings as holes, extruded to 0.066 with a tiny bevel. Reuse your existing button split logic on the wheel opening.

## Faceplate creases

Four shading lines still run from the plate corners to the screen corners. They are smooth-normal interpolation across the long triangles that fan from the screen cutout to the outer edge. `toCreasedNormals` at 36 degrees does not fix this because all those triangles are coplanar. For the flat face, either call `toNonIndexed()` then `computeVertexNormals()` so every face gets its own normal, or set `flatShading: true` on the plate material, and keep only the bevel with smooth normals. If you rebuild the plate per step 7 this goes away on its own.

## Verify

- From the 3/4 and Back presets, thin and thick both show a single continuous shell: no band, no hard vertical faces, no color break, no gaps.
- The seam between shell and plate is one thin line all the way around.
- Ports, jack and hold slot are cut into the curved surfaces and follow body depth.
- The faceplate has uniform shading with highlights only along its edges.
- X-ray and exploded views still show the internals inside a hollow shell.
- Old saved links load. Tests pass. Single-file build regenerates.

Commit as `Rebuild back shell procedurally and fix faceplate shading`, push to `main`, and report what changed in `viewer.js` and the frame rate before and after.
