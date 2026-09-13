# Prompt: iPod Classic Mod Configurator

I want you to build a web app that works like a product configurator (think Nike By You, where you pick colors and materials and the shoe updates in front of you), but for planning a modded iPod Classic. I am modding a real iPod and I will use this app to decide on and price out my build, so accuracy about the actual mods matters as much as the visuals.

Ask me any clarifying questions you need before you start. Then build the whole thing, not a stub.

## What it is

A single-page web app with two halves.

On the left (or top on mobile): a rotatable 3D iPod Classic that visibly changes as I pick options. Front plate color, back plate finish, click wheel color, screen, and which internals are installed should all show on the model.

On the right (or below on mobile): a guided form, grouped by category, where I select mods. Each option has a short plain-English explanation of what it does, why someone would want it, roughly how hard it is to install, an approximate price, and where it is usually bought. A running total and a parts list update as I go.

## The device

The base unit is an iPod Classic in the A1238 chassis (6th and 7th generation, 2007 to 2014 form factor). I own a 2007 6th gen 80GB (thin body) and I am swapping in a 7th gen logic board.

## 3D model

I am supplying the model: `ipod_classic.glb` (attached). It is "iPod Classic" by Jacob Mougharbel, CC-BY-4.0, https://sketchfab.com/3d-models/ipod-classic-6839a82c7c644fe5a99fce0bf11be727. Show that attribution in the app footer. The license info is also embedded in the file's asset.extras.

I have already inspected the file so you do not have to guess at its structure. It is glTF 2.0, 7.8k triangles, no extensions, one embedded PNG texture. The scene is `Sketchfab_model > root > GLTF_SceneRootNode > iPod_0`, and iPod_0 has six child nodes named Object_4 through Object_9, each holding one mesh. Units are inches (the body is 4.08 tall, 2.47 wide, 0.39 deep, which matches the real 103.5 x 61.8 x 10.5 mm thin body). Some parent nodes carry rotation matrices, so read the world transform rather than assuming Y is up.

The meshes, by material name (match on material name, not node name):

- `Material.006`: the front face plate. 4142 triangles, a thin flat slab (0.066 deep). Solid dark color, no texture. Recolor this for the front plate option. For "transparent," set transmission or opacity and make sure the internals are visible through it.
- `Shiney_Back`: the back shell. 3523 triangles, 0.324 deep, light gray, roughness 0, no texture. This is the thin body. For the thick body option, scale this mesh along its depth axis by about 1.29 (13.5 mm / 10.5 mm) and offset it so the front face stays put. Recolor and change metalness/roughness for the finishes.
- `Screen`: a flat plane, 2.06 x 1.54, 4:3 aspect, solid black, no texture. Put a canvas texture on it for the Apple firmware and Rockbox UI mockups. Give it a slight emissive so it reads as a lit display.
- `Wheel`: a flat disc, 1.572 in diameter, 62 triangles, textured with a small PNG (`button.png`) that contains both the wheel ring and the center button. The center button is not a separate mesh. To color the wheel and the button independently, replace this texture with a generated canvas texture: outer ring in the wheel color, inner circle in the button color, plus the Menu, back, forward, and play/pause glyphs drawn on the ring.
- `Port`: the 30-pin connector opening at the bottom edge. Swap or hide it and draw a USB-C shaped opening when the USB-C option is selected.
- `Material.016`: a narrow strip along the bottom edge, about 1.96 wide, 0.27 deep. Treat it as part of the body and color it with the back plate.

There is no separate headphone jack or hold switch geometry; do not worry about them. Because the model is in inches and roughly 4 units tall, frame the camera accordingly and place the internals (iFlash board, battery, Bluetooth board, taptic motor, AirTag) in inches inside the back shell: the battery sits behind the click wheel, the flash board behind the screen, the AirTag and Bluetooth board wherever there is room near the bottom.

Use Three.js (or React Three Fiber if you go with React). Requirements for the viewer:

- Orbit controls: click and drag to rotate, scroll to zoom, with sensible limits so I cannot lose the object.
- Physically based materials with an environment map so brushed aluminum, polished chrome, matte plastic, and transparent plastic all read correctly.
- A "thin" and "thick" body state. Selecting the thick back plate should make the body visibly deeper.
- An exploded or x-ray toggle that shows the internals I have selected (flash adapter, battery, Bluetooth board, taptic motor, AirTag) positioned roughly where they sit in the real device.
- The screen should show a simple mockup of the Apple firmware UI by default and switch to a Rockbox-style UI if Rockbox is selected.
- Smooth transitions when materials or parts change.
- Preset camera angles: front, back, three-quarter, and exploded.

## Mod options to include

Organize the form into these groups. For each option include the explanation, difficulty (1 to 5), estimated price in USD, and typical vendor. Use the prices below as starting points; I will adjust them.

### Logic board
- Keep original 6th gen board (2007). Explain the 128GB storage cap (LBA28 addressing) in Apple firmware.
- 7th gen board swap (MC293 / MC297) or 6.5th gen (MB565). Explain LBA48 removes the cap. About $60 to $100 used.

### Storage
- iFlash Solo (one SD card), iFlash Quad (up to four microSD cards), iFlash Sata (mSATA SSD), and CF adapter options. About $35 to $50 for the board plus card cost.
- Capacity selector: 128GB, 256GB, 512GB, 1TB, 2TB. Show a compatibility warning if capacity exceeds 128GB while the 6th gen board is selected.

### Battery
- Stock replacement (550 to 650 mAh), 2000 mAh thin, 3000 mAh thick. Explain that 3000 mAh requires the thick back plate. About $15 to $35.

### Back plate
- Thin or thick body. Finishes: stock polished stainless, brushed, black, gold, blue, and other colors. About $15 to $30.
- USB-C port back plate (replaces 30-pin). Explain the tradeoff: modern charging and data, but you lose 30-pin dock and accessory compatibility.
- Combined USB-C plus internal Bluetooth back plate kits (for example Elite Obsolete Electronics at about $150, or the moonlit.market Classic Connect 2 at about $140 which also adds Qi wireless charging and haptics).

### Front plate
- Color options including black, silver, white, red, blue, gold, and transparent. Transparent should actually be see-through in the 3D view so the iFlash board and battery are visible.

### Click wheel
- Color options including black, white, silver, red, blue, and transparent.

### Screen
- Stock replacement LCD, or a higher-brightness replacement if you know of a real product; otherwise just stock replacement.

### Wireless and connectivity
- Internal Bluetooth 5.x with aptX. Explain that it taps the audio output and keeps the 3.5 mm jack working.
- Qi wireless charging.
- AirTag integration (disassembled AirTag powered from the iPod battery). Explain that it needs internal space, so it conflicts with a thin back plus a 3000 mAh battery.
- Wi-Fi: include this as an option only to explain that no Wi-Fi mod exists for the stock hardware; the only path is a Raspberry Pi replacement of the whole logic board, which conflicts with everything else in this configurator. Do not let it be selected alongside the other mods.

### Feel and firmware
- Taptic engine (haptic click wheel feedback). About $20 to $35.
- Rockbox firmware. Explain FLAC and ALAC support, gapless playback, custom themes, accurate battery gauge for high-capacity cells, and dual boot with Apple firmware.
- Audio capacitor bypass: include it but note it is a 5th and 5.5th gen (Wolfson DAC) mod and is generally not done on 6th and 7th gen boards.

### Cosmetic extras
- Engraving on the back plate (free text field, rendered on the model).

## Compatibility rules

Implement these as visible warnings, not silent blocks, unless noted. Each warning should say what the conflict is and how to fix it.

1. 6th gen board plus any storage over 128GB: warn, explain the LBA28 cap and the Rockbox-only workaround, suggest the 7th gen board.
2. 3000 mAh battery plus thin back plate: warn, require thick back.
3. Bluetooth or USB-C combo back plate kit plus thin back plate: warn, require thick back.
4. AirTag plus thin back plate: warn.
5. AirTag plus 3000 mAh battery plus Bluetooth kit: warn that internal space is tight and the layout must be planned.
6. USB-C back plate plus any 30-pin dock or accessory: informational note.
7. Wi-Fi: hard block with explanation (see above).
8. Audio capacitor bypass on a 6th or 7th gen board: informational note that it does not apply.

## Other features

- Running total price, with a breakdown by group, and a parts list (BOM) I can copy as text or download as CSV. Each line should have the part, the vendor, the estimated price, and a link if you have one.
- Build order and difficulty guide: based on what I selected, show a suggested install sequence with a difficulty rating for each step and a rough total time. A sensible default order is logic board, flash storage, firmware, battery, back plate or connectivity kit, front plate and click wheel and screen, taptic, AirTag, then cosmetics.
- Save and share: encode the entire configuration in the URL hash so a link restores the build. Add a "copy link" button.
- Presets: "Stock restore," "Daily driver" (7G board, iFlash Quad 512GB, 3000 mAh, thick back, Bluetooth and USB-C kit, taptic, Rockbox), and "Audiophile" (7G board, iFlash Sata, 3000 mAh, thick back, no Bluetooth, Rockbox).
- Reset button.
- Dark and light theme following the system setting.
- Works on a phone width screen, with the 3D view on top and the form below.

## Build quality

- Make it a real app, not a demo. Every option should be wired up and every warning should fire correctly.
- Keep the option data (names, explanations, prices, vendors, conflict rules) in one clearly separated data file or object so I can edit it without touching the rendering code.
- Use a clean, restrained design. Think Apple product page, not a gaming UI. No emoji in the interface.
- If you can produce a single self-contained HTML file with Three.js loaded from a CDN, do that. If a React and Vite project produces a meaningfully better result, that is fine too, but tell me how to run it.
- Comment the 3D setup code well enough that I could swap in a different model later.

## Before you start

Ask me anything that is unclear, and tell me if you think something is missing from the mod list or the compatibility rules. Then build it in full.
