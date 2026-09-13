# Classic Studio

A complete, client-side Three.js iPod Classic A1238 mod configurator.

## Open the portable app

Open `classic-studio.html` in a modern browser. The model, studio HDR environment, option data, interface and styles are embedded. Three.js 0.180.0 and the optional DM Sans font load from CDNs, so the first load needs internet access. No React, npm install or build step is required.

## Run the editable source

From this folder, run:

    python3 -m http.server 5173 --directory dist

Open http://localhost:5173. Stop the server with Ctrl+C.

- `dist/data.js`: option descriptions, vendors, prices, presets, compatibility rules, BOM, build-order estimates and URL validation.
- `dist/viewer.js`: documented GLB adapter, materials, textures, internal components and camera controls.
- `dist/app.js`: form, editable prices, CSV / clipboard exports, URL persistence and WebMCP tools.
- `dist/style.css`: responsive layout and system/light/dark themes.
- `dist/assets/ipod_classic.glb`: the supplied model.

Run `python3 build-single.py` to regenerate `outputs/classic-studio.html` after editing the source. Prices can also be adjusted in the app's Parts list; $0 marks an already-owned part. Those edits are included in its build link.

## Using the app

Select a preset or customize the twelve groups. The initial build counts a used 7th-generation board at $80. Drag to orbit, scroll to zoom, or focus the viewer and use arrow keys. Use camera presets, X-ray, or Clear front to inspect selected internal modules. The actual GLB faceplate, back and display are used, with a separately extracted raised center button.

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

The rear shell and original lower strip share a depth transform. New bottom-only apertures retain fixed USB-C (0.35 × 0.125 model units) or 30-pin (0.827 × 0.098) dimensions. Their centers, headphone jack and hold switch follow the transformed shell bounds. Classic Connect depicts both ports. Front/back changes use eased spherical paths; selecting the same preset recenters the viewer. Idle rotation begins after seven seconds and stops on interaction. Reduced-motion settings disable it.

All product meshes use MeshPhysicalMaterial, with clearcoat, catalog-driven transmission/thickness, brushed-metal anisotropy support and rainbow/polychrome iridescence. The current catalog has no separate brushed finish. The screen has a subtle physical glass reflection overlay. Crease-angle normals soften the case edges. Studio Small 09 by Sergej Majboroda / Poly Haven is bundled at 1K under CC0: https://polyhaven.com/a/studio_small_09 . RGBELoader and PMREM provide the environment. A baked radial contact shadow, ACES, sRGB, 4× MSAA where supported, mild SSAO, screen-only bloom and SMAA complete the WebGL pipeline. AO is skipped for transparent/X-ray builds to avoid false occlusion. WebGPU was not adopted; keeping the existing WebGL path avoids adding a second renderer and compatibility burden.

The renderer caps pixel density, computes bloom and AO below full resolution, and reduces rendering resolution after sustained low frame rates. The portable file is about 2.75 MB including the supplied GLB and HDR. CDN access is still needed for Three.js and its addons.

Validation: `node tests/compatibility.mjs` checks the battery/storage matrix, kit restrictions and fixes, retained conflicts, runtime math, every option’s saved-link/BOM/CSV/guide path, v1/v2 restoration, all 215 catalog entries, and bundle accounting. Browser verification covered 48 port/body/preset combinations, underside inspection, clear internals and 1TB engraving. Physical laptop/phone benchmarks were not available; browser viewport measurements are reported separately from device performance.

Observed local browser performance: approximately 40–55 FPS during desktop checks (1440 × 900 viewport, 764 × 614 viewer, DPR 1–1.5), and 60 FPS at a 390 × 844 phone viewport (390 × 420 viewer, DPR 1). These are measurements on the same available computer, not physical mid-range laptop or phone benchmarks. Initial shader compilation can briefly stall before the steady-state samples.
