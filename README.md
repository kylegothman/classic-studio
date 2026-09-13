# Classic Studio

A complete, client-side Three.js iPod Classic A1238 mod configurator.

## Open the portable app

Open `classic-studio.html` in a modern browser. The model, option data, interface and styles are embedded. Three.js 0.180.0 and the optional DM Sans font load from CDNs, so the first load needs internet access. No React, npm install or build step is required.

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

Select a preset or customize the ten groups. The initial build counts a used 7th-generation board at $80. Drag to orbit, scroll to zoom, or focus the viewer and use arrow keys. Use camera presets, X-ray, or Clear front to inspect selected internal modules. The actual GLB faceplate, back and display are used, with a separately extracted raised center button.

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
