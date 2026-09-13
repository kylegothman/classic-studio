# Classic Studio

A complete, client-side Three.js iPod Classic A1238 mod configurator.

## Open the portable app

Open `classic-studio.html` in a modern browser. The model, baked shells, studio HDR environment, option data, interface and styles are embedded. Three.js 0.180.0 and the optional DM Sans font load from CDNs, so the first load needs internet access. Opening the app needs no npm install or build step. Regenerating its portable HTML requires the development dependencies.

## Run the editable source

From this folder, run:

    python3 -m http.server 5173 --directory dist

Open http://localhost:5173. Stop the server with Ctrl+C.

- `dist/data.js`: option descriptions, vendors, prices, presets, compatibility rules, BOM, build-order estimates and URL validation.
- `dist/viewer.js`: documented GLB adapter, materials, textures, internal components and camera controls.
- `dist/app.js`: form, editable prices, CSV / clipboard exports, URL persistence and WebMCP tools.
- `dist/style.css`: responsive layout and system/light/dark themes.
- `dist/assets/ipod_classic.glb`: the supplied model.
- `dist/assets/shells.glb`: six baked shell geometries; regenerate with `npm run bake:shells`.
- `tools/shell-geometry.mjs` and `tools/bake-shells.mjs`: build-time CSG and deterministic GLB baking.
- `dist/model-geometry.js`: shared faceplate normals, detail outlines and baked-asset loading.

Run `python3 build-single.py` to regenerate `outputs/classic-studio.html` after editing the source. Prices can also be adjusted in the app's Parts list; $0 marks an already-owned part. Those edits are included in its build link.

## Development

```sh
git clone https://github.com/kylegothman/your-classic.git
cd your-classic
npm ci
npm test
python3 -m http.server 5173 --directory dist
# In another terminal, regenerate the portable app:
python3 build-single.py
```

Use Node.js 22 or newer and Python 3. Run `npm run bake:shells` if the model or shell generator changes. GitHub Actions runs installation, both test suites and the portable build on pushes and pull requests. The checked-in `.openai/hosting.json` identifies the existing Classic Studio Sites deployment; it contains no credentials. Forks should use their own hosting configuration before deploying.

Published app: https://classic-studio-kyle.kyle-gothman.chatgpt.site/ (current access policy applies).

## Using the app

Select a preset or customize the twelve groups. The initial build counts a used 7th-generation board at $80. Drag to orbit, scroll to zoom, or focus the viewer and use arrow keys. Use camera presets, X-ray, or Clear front to inspect selected internal modules. The GLB faceplate, wheel and display are retained, with a separately extracted raised center button and a procedural hollow back shell.

Parts list exports include vendors, estimates and links. Build guide updates with selected work and a rough time allowance. Copy build link saves the complete selection, engraving, price overrides, view and theme in the URL hash. A local file link only works on the same file path; use the hosted app URL to share between devices. The hosted site's current access policy still applies.

## Accuracy notes

Prices are editable USD allowances dated September 12, 2026; they are not live quotes. Tax, shipping, tools, labor and custom fabrication are excluded. The 3D internals are schematic and cannot establish mechanical fit.

- MB565/MB562 6.5th-generation boards retain the 128GB Apple firmware cap. MC293/MC297 7th-generation boards remove the LBA28 addressing restriction. Large libraries still have firmware/RAM limits.
- “3000 mAh thick-format” specifically means a cell requiring a thick back. Some different 3000 mAh products fit thin builds with approved adapters. Capacity alone does not prove dimensions.
- Classic Connect 2 retains 30-pin and uses a custom enclosure roughly 0.5mm deeper than a thin Classic. Its battery, Bluetooth, Qi and haptics are counted once. USB-C data requires soldering. Quad and Sata are not on the maker's approved fit list; Solo requires PCB trimming. Select based on the maker's current compatibility guide.
- EOE's generic combo is budgeted at $150; undocumented depth, codecs and dock compatibility must be verified with the seller.
- Rockbox supports FLAC, ALAC, gapless playback and dual boot. Its capacity setting affects runtime estimates, not an automatically corrected battery percentage. Apple firmware also supports ALAC and gapless playback.
- Qi needs a nonmetal charging window. AirTag requires regulated approximately 3V power and careful insulation, not a direct connection to the lithium cell.
- Wi-Fi is disabled because it requires replacing the core computer. Capacitor bypass is informational and excluded from BOM/assembly on this chassis.

Source links are included in the app. This is a planning tool, not a detailed electrical modification tutorial.

## License

Original project code is [MIT licensed](LICENSE). The supplied iPod model remains CC BY 4.0 and the Poly Haven HDR remains CC0, as attributed below; their licenses are not replaced by MIT.

## Attribution

“iPod Classic” by Jacob Mougharbel, licensed CC BY 4.0:
https://sketchfab.com/3d-models/ipod-classic-6839a82c7c644fe5a99fce0bf11be727
https://creativecommons.org/licenses/by/4.0/

Modified materials, generated screen/wheel textures, split center-button geometry and added schematic internals. The supplied original GLB is retained. Three.js is MIT licensed: https://github.com/mrdoob/three.js/blob/dev/LICENSE

## EOE color catalog update

The complete supplied `dist/eoe-color-catalog.json` is loaded at runtime: 57 faceplates, 56 click wheels, 38 center buttons, 28 back colors, 31 dock bezels and 5 hold/jack assemblies. Replace the JSON file to refresh prices without editing renderer code. `dist/catalog.js` adapts the vendor schema, materials and legacy IDs. Regenerate the portable HTML after changing the JSON.

Searchable swatches are grouped by finish. A selected card and hover label show the item, vendor, and from price. Factory engraving styles are limited to the chosen back color; capacity text is cosmetic and independent of storage capacity. Details contains dock bezels and depth-specific hold/jack assemblies. Mismatched face/button materials and hold/body depth produce warnings.

Bundle allowances live in `BUNDLE_ESTIMATES` in `catalog.js`: $8 for one center button bundled with the faceplate OR wheel, $20 for a preinstalled jack/bezel pair, and $3 for a thick back. These are estimates, not verified variant quotes. The BOM edits base prices and adds these allowances separately. Included components appear at $0, so toggling a bundle may lower the total by replacing a more expensive standalone part.

Saved links use schema version 2. Old colors map to overlapping catalog IDs, with notices for nearest replacements. Brushed stainless is mapped to stock stainless because no brushed entry appears in this catalog; custom backs use the closest catalog color. Explicit old quotes are preserved, including wheel/button assembly quotes and owned small parts. New default prices use the catalog.

Verified: all 215 IDs round-trip through saved links; transparent faceplate exposes the flash board and battery; thick stock-stainless back shows 1TB capacity marking; legacy links load without errors; bundle changes alter totals without double-charging included components. The camera now travels around the device between front and back, avoiding a path through its center.

## Body rules and rendering update

The body selector now controls option availability through one shared constraint engine. Conflicting saved selections remain selected, with inline explanations and one-click fixes. The picker distinguishes square/rectangle 2000 mAh batteries, thin/thick 3000 and 3800 mAh cells, and adds uDUAL, generic dual microSD and M.2 SATA adapter choices. New hardware prices are editable planning allowances.

Thin extended-battery storage fit follows the requested matrix. AirTag and both back kits require the planner’s thick category. Qi and kit haptics require a compatible back kit; standalone taptic remains available in thin. Classic Connect 2 still has a custom enclosure, so the planner’s 13.5 mm illustration is not a claim about the vendor’s actual dimensions. EOE Qi/haptic options require vendor confirmation. Runtime uses 18 mA for a drive or 14 mA for flash, multiplied by 1.1 for Rockbox and 1.25 for Bluetooth, with 80–100% of rated capacity. Kit runtime uses an explicit 2000 mAh assumption.

The one-piece procedural rear shell uses fixed USB-C (0.35 × 0.125 model inches) or 30-pin (0.83 × 0.10) openings. Their centers, headphone jack and hold switch follow the selected shell depth. Classic Connect depicts both ports. Front/back changes use eased spherical paths; selecting the same preset recenters the viewer. Idle rotation begins after seven seconds and stops on interaction. Reduced-motion settings disable it.

All product meshes use MeshPhysicalMaterial, with clearcoat, catalog-driven transmission/thickness, brushed-metal anisotropy support and rainbow/polychrome iridescence. The current catalog has no separate brushed finish. The screen has a subtle physical glass reflection overlay. Crease-angle normals soften the case edges. Studio Small 09 by Sergej Majboroda / Poly Haven is bundled at 1K under CC0: https://polyhaven.com/a/studio_small_09 . RGBELoader and PMREM provide the environment. A baked radial contact shadow, ACES, sRGB, 4× MSAA where supported, mild SSAO, screen-only bloom and SMAA complete the WebGL pipeline. AO is skipped for transparent/X-ray builds to avoid false occlusion. WebGPU was not adopted; keeping the existing WebGL path avoids adding a second renderer and compatibility burden.

The renderer caps pixel density, computes bloom and AO below full resolution, and reduces rendering resolution after sustained low frame rates. The portable file embeds the supplied GLB, baked shell GLB and HDR. CDN access is needed only for Three.js and its addons; the CSG/BVH libraries are build-time dependencies.

Validation: `node tests/compatibility.mjs` checks the battery/storage matrix, kit restrictions and fixes, retained conflicts, runtime math, every option’s saved-link/BOM/CSV/guide path, v1/v2 restoration, all 215 catalog entries, and bundle accounting. Browser verification covered 48 port/body/preset combinations, underside inspection, clear internals and 1TB engraving. Physical laptop/phone benchmarks were not available; browser viewport measurements are reported separately from device performance.

Observed local browser performance: approximately 40–55 FPS during desktop checks (1440 × 900 viewport, 764 × 614 viewer, DPR 1–1.5), and 60 FPS at a 390 × 844 phone viewport (390 × 420 viewer, DPR 1). These are measurements on the same available computer, not physical mid-range laptop or phone benchmarks. Initial shader compilation can briefly stall before the steady-state samples.


## One-piece shell and faceplate update

`viewer.js` now ignores `Shiney_Back`, `Material.016` and `Port` when creating the scene. It measures the retained faceplate at 2.440427 × 4.054299 inches and its four outline tangencies at a 0.242078-inch radius. Matching offsets keep the existing plate and its screen/wheel openings; a replacement faceplate was unnecessary.

A rounded-rectangle extrusion has a 0.06-inch roll with 12 bevel segments. Subtracting an inset extrusion with three-bvh-csg makes a 0.02-inch hollow wall. The finished shell is exactly 0.39 or 0.52 inches deep, including the bevel. Its maximum outline extends 0.01 inch beyond the plate on each side; the front lip curls under the plate, whose flat face is 0.002 inch proud of the rim. One material covers the entire shell, including the sides, ends and cavity.

Six variants (thin/thick × dock/USB-C/both) are baked into `dist/assets/shells.glb` and loaded alongside the model and HDR. Switching body or connector swaps a geometry without rebuilding or scaling. No CSG runs in the browser. The dock, USB-C, 0.14-inch round headphone jack and 0.35 × 0.06-inch hold slot are CSG openings through the top/bottom walls. Recessed dark receptacles, selected-color lips and the hold slider follow their centers. Rear engraving follows the actual rear surface.

Flat face triangles now have exact axial normals; only the existing bevel receives smoothed normals. This removes the diagonal highlights between the screen and the plate corners while preserving the source front geometry and independent center button.

Run `npm ci` once for local geometry-test dependencies, then `npm test` (or run the two files in `tests/` separately). The static app still needs no npm build. Geometry tests load the actual GLB, verify planar normals and measured dimensions, regenerate the shell asset byte-for-byte, and raycast all six generated and shipped shells to check hollow walls, closed backs, aperture dimensions and surrounding continuous steel. Compatibility, old-link migration and BOM/export tests pass unchanged. Browser checks cover both bodies from 3/4 and Back, top/bottom openings, transparent internals, hollow exploded/X-ray views, capacity engraving and legacy-link restoration without console errors. The regenerated portable file is opened and checked through the local HTTP preview. The browser security policy blocks direct file:// navigation, so opening it directly from disk could not be verified in this session.

Matched before/after desktop measurement on September 13, 2026: **60 FPS → 60 FPS** for the settled default 3/4 view, at a 1440 × 900 browser viewport, 764 × 614 viewer, DPR 1, full quality scale and 4× MSAA. Earlier baseline samples ranged from 56 to 60 FPS while rotating; new thin/thick samples were 60 FPS. Before baking was moved out of the browser, generating all six shells took **623 ms**, with roughly 12,100–13,200 triangles per shell. This is a same-computer browser measurement, not a physical-phone benchmark, and excludes initial shader compilation.


## Baked shells and portable generation

The shell baker writes a deterministic indexed GLB (about 1.76 MB) with source-model provenance and per-variant dimensions. `npm test` fails if it no longer matches the model or baking code. Run `npm run bake:shells` after changing either, then regenerate the portable HTML. Keeping full float32 geometry preserves the tested cutouts and normals; the portable file is now about 5.1 MB because it embeds the baked geometry. Removing runtime CSG trades a larger asset for eliminating the synchronous startup calculation and two CDN dependencies.

`build-single.py` uses the pinned esbuild dependency to bundle local modules, leaving only Three.js imports external. It no longer rewrites import/export text with regular expressions, so multiline imports, double quotes, and literal words in comments or strings survive formatting.
