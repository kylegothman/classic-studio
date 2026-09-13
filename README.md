# Classic Studio

Plan a modded iPod Classic before you spend a dollar on it.

Pick a logic board, flash storage, battery, back plate, click wheel, and the rest. Watch it happen on a 3D iPod you can spin around. Get told when two parts will not fit together. Walk away with a priced parts list and an install order.

**https://kylegothman.github.io/classic-studio/**

## Why

The A1238 mod scene has a hundred parts that mostly fit and a dozen combinations that quietly do not. A 2007 board caps you at 128GB. A 3000 mAh cell needs a thick back unless it is the thin one, which then only fits under two of the seven flash adapters. Nobody writes this down in one place. Classic Studio does, and it checks your build against it as you click.

## Running it

It is a static site. No build step to use it.

    python3 -m http.server 5173 --directory dist

For the offline single-file version, open `outputs/classic-studio.html`. Three.js still comes from a CDN.

## Hacking on it

    git clone https://github.com/kylegothman/classic-studio.git
    cd classic-studio
    npm ci
    npm test

Node 22 and Python 3.

Everything you would want to edit is in one of three files:

- `dist/data.js` is the product. Options, prices, presets, the compatibility rules, the parts list, the build guide.
- `dist/eoe-color-catalog.json` is the vendor color catalog. Replace the file to update prices.
- `dist/viewer.js` is the Three.js scene.

The back shell is baked geometry (`dist/assets/shells.glb`). If you change the model or `tools/shell-geometry.mjs`, run `npm run bake:shells`. After any change, `python3 build-single.py` regenerates the portable file.

`npm test` runs two suites. One walks every option through the rules engine, the parts list, the CSV export, and saved-link migration. The other loads the real GLB, checks the faceplate normals triangle by triangle, and ray-casts through the baked shells to prove the port openings are holes. CI runs both plus the Prettier check on every push.

## What it is not

It is a planning tool. Prices are estimates from September 2026, not quotes. The internals are drawn schematically and do not prove mechanical fit. Wi-Fi is deliberately absent, because no such mod exists for the stock board. Read [docs/ACCURACY.md](docs/ACCURACY.md) before you order anything.

## License

MIT. The iPod model is "iPod Classic" by [Jacob Mougharbel](https://sketchfab.com/3d-models/ipod-classic-6839a82c7c644fe5a99fce0bf11be727), CC BY 4.0, modified. The studio HDR is [Poly Haven](https://polyhaven.com/a/studio_small_09), CC0. Those licenses stay with their assets.
