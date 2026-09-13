# Classic Studio update: full EOE color catalog

Update the Classic Studio configurator to carry the complete color lineup that Elite Obsolete Electronics sells for the iPod Classic 6th and 7th gen (A1238). The full catalog is attached as `eoe-color-catalog.json` (also as CSV). Load it into the app's option data rather than retyping it, keep every existing feature working, and preserve saved-link compatibility for builds that were created before this update (map old option ids to the new ones where they overlap; otherwise fall back to the closest default and show a small notice).

## What is in the catalog

- 57 faceplates: 34 metal (including two gradient finishes), 13 solid plastic, 10 crystal clear transparent.
- 56 click wheels: 17 standard, 2 clear, 1 polychrome, 9 crystal clear, 27 "Atomic" (transparent swirl, glitter, metallic and gradient finishes at $33.99).
- 38 center select buttons: 17 metal, 11 plastic, 10 crystal clear.
- 28 backplate colors, each sold in thin and thick bodies and in up to five engraving styles (universal, fully blank, U2 Special Edition, logo only, capacity marked).
- 31 dock bezels: 12 solid and 19 Atomic transparent (two are glow in the dark).
- 5 headphone jack and hold switch assemblies (black or white, thin or thick, plus a U2 black and red).

Each entry has an id, display name, material or finish, an approximate hex color (or a `->` separated list for gradients and rainbows), the lowest listed price, the vendor, and a link. Prices are the "from" price; faceplates and click wheels cost about $6 to $10 more with the center button bundled, and backplates cost about $20 more with the headphone jack and dock bezel pre-installed. Model both of those as toggles that adjust the line item price.

## UI changes

1. Replace the current faceplate, click wheel, and backplate color pickers with swatch grids grouped by finish family (for example Metal, Matte, Plastic, Crystal Clear, Atomic). Each swatch shows the color, and hovering or tapping shows the name and price. Keep a search or filter box because 57 faceplates is too many to scan.
2. Add a center button picker as its own control. Enforce the pairing rule: metal faceplates take metal buttons, plastic and transparent faceplates take plastic or crystal clear buttons. Show a warning rather than a hard block if the user mixes them, since some people do.
3. Add a dock bezel picker and a hold switch picker. Both are small parts, so put them under an "Details" group that is collapsed by default.
4. Backplate picker gets three sub-controls: color, body (thin or thick, already tied to the battery and Bluetooth compatibility rules), and engraving style. Only offer engraving styles that exist for the chosen color (the `engravingStyles` array on each color). Add a text field for the capacity when the capacity-marked style is chosen so it can render on the model.

## 3D rendering rules

- Metal finishes: metalness about 0.9, roughness about 0.35, tinted by the hex.
- Matte finishes: metalness 0, roughness about 0.8.
- Plastic: metalness 0, roughness about 0.4, slight clearcoat.
- Crystal clear and Atomic: transmission or opacity so the internals show through, tinted by the hex. Atomic finishes with two or more hex values get a simple procedural gradient or noise texture; do not try to reproduce every swirl exactly.
- Gradient and rainbow entries (any `color` with `->`) get a vertical gradient texture across the part.
- Chrome backplates: metalness 1, roughness about 0.15, environment map reflections.
- Glow in the dark bezels get a mild emissive.
- The center button color must be drawn into the generated click wheel texture as the inner circle, independent of the ring color.
- Dock bezel color is applied to the port opening region on the bottom edge. Hold switch color applies to a small rectangle on the top edge; since the model has no hold switch geometry, add a tiny box mesh for it.

## Data and export

- All new options must flow through to the running total, the BOM, the CSV export, the assembly guide, and the shareable link.
- Keep the catalog in its own data file so I can update prices later by replacing the file.
- Add a "Vendor: EOE" tag on every catalog item, since I will be adding other vendors later.

## Verify before you hand it back

- Pick a transparent faceplate and confirm the iFlash board and battery are visible through it.
- Pick a thick backplate with the capacity style and confirm the text renders.
- Load an old saved link and confirm it restores without errors.
- Confirm the BOM total changes when the center button bundle and the pre-installed jack toggles are flipped.
