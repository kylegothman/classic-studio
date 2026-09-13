# AGENTS.md

Classic Studio is a client-side Three.js configurator for planning mods to an iPod Classic A1238 (6th/7th gen). This file is for any AI agent (Codex/Astra, Claude, etc.) working in this repo.

## Layout

- `dist/` is the app. `index.html`, `app.js` (UI, BOM, URL state), `viewer.js` (Three.js scene, materials, model adapter), `data.js` (options, prices, presets, compatibility rules), `catalog.js` (adapts `eoe-color-catalog.json`), `style.css`, `assets/` (GLB model, HDR).
- `dist/eoe-color-catalog.json` is vendor data. Update prices by replacing the file, not by editing renderer code.
- `tests/compatibility.mjs` checks the rules engine and saved-link migration.
- `build-single.py` regenerates the portable single-file build into `outputs/classic-studio.html`.
- `docs/prompts/` holds the task prompts that drove each change, in order. Add the prompt for any new task there.
- `work/` and `outputs/` are scratch and build products. They are gitignored; never commit them.

## Workflow

1. `git pull` on `main` before starting.
2. Make the change. Keep option data in `data.js`/`catalog.js` and rendering in `viewer.js`.
3. Run `node tests/compatibility.mjs`. Add a test when you add a compatibility rule.
4. Run `python3 build-single.py` and open `outputs/classic-studio.html` once to confirm it still loads.
5. Commit with a short imperative message describing the user-visible change. Push to `main`. Use a `feature/<name>` branch for anything experimental or that changes the 3D pipeline in a way that could regress, and say so in the report.
6. Saved build links must keep working. Map old option ids forward; never break URL restoration.

## Ground truth to preserve

- 6th gen (2007) boards are capped at 128GB in Apple firmware (LBA28). 6.5G (MB565) and 7G (MC293/MC297) are not.
- Thin body is 10.5 mm, thick is 13.5 mm. Bluetooth/USB-C back plate kits, AirTag, and thick-format batteries need thick.
- EOE thin extended batteries (2000 rectangle, 3000 thin, 3800 thin) fit only with iFlash Quad or uDUAL.
- Wi-Fi is not a mod on stock hardware. Keep it blocked with the explanation.
- Model attribution: "iPod Classic" by Jacob Mougharbel, CC BY 4.0. Keep the footer credit.

## Style

- Plain, restrained UI. No emoji in the interface.
- Prices are estimates; label them that way.
