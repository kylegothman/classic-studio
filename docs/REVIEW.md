# Classic Studio: pre-release code review

Reviewed at commit `d9f2efc` (Rebuild back shell procedurally and fix faceplate shading). Scope: `dist/*.js`, `index.html`, `style.css`, `tests/*`, `build-single.py`, `README.md`, repo layout. Both test suites were run against the real GLB in a clean Node 22 environment and pass.

## Verdict

The app is in good shape for a public v1. State handling, saved-link migration, BOM math, and the compatibility engine are careful and tested. The 3D pipeline is well structured. Nothing here is a showstopper, but there are four things I would fix before tagging a release, one data correction, and a set of smaller items that can follow.

## Fix before release

### 1. The shell build blocks the main thread for seconds at startup

`buildShellCache` runs six CSG evaluations (thin and thick, each with three port layouts) synchronously before the first frame. In Node on a fast machine it takes about 2.9 seconds; on a mid-range phone it will be longer and the page is frozen while it runs. Because the plate dimensions never change, there is no reason to do this at runtime.

Recommended fix: bake the six shell geometries once with a build script and ship them as an asset (a single GLB with six meshes, or a compact JSON of positions, normals, and indices). `viewer.js` then just loads and picks a variant. This also removes `three-bvh-csg` and `three-mesh-bvh` from the runtime import map, which means two fewer CDN dependencies and a smaller portable HTML. Keep `buildShellCache` in a `tools/` script and keep `tests/geometry.mjs` running against it so the baked asset can be regenerated and verified.

If baking is too much for this release, the minimum is to build only the currently selected variant before first render and generate the other five in `requestIdleCallback` or a Web Worker.

### 2. The repo cannot run its own tests from a fresh clone

`tests/geometry.mjs` imports `three`, `three-bvh-csg`, and `three-mesh-bvh`, but there is no `package.json`, so `node tests/geometry.mjs` fails on a fresh checkout with a module-not-found error. Node also warns on every run that the module type is unspecified.

Add a `package.json` with `"type": "module"`, `"private": true`, a `test` script that runs both files, and the three packages as `devDependencies` pinned to the versions in the import map (three 0.180.0, three-bvh-csg 0.0.18, three-mesh-bvh 0.9.7). Then add a GitHub Actions workflow that runs `npm ci && npm test` on push and pull request. This is the single biggest improvement for a public repo because it tells contributors and Astra immediately when something breaks.

### 3. No license file

The repo redistributes a CC BY 4.0 model and a CC0 HDR, both attributed correctly in the README and footer, but the project's own code has no license. Without one, nobody can legally reuse it. Add a `LICENSE` file (MIT is the usual choice for a project like this) and a one-line "License" section in the README that also restates the two asset licenses.

### 4. Em dashes in user-facing text

Two places ship an em dash: the page `<title>` ("Classic Studio — iPod Mod Configurator") and the copied parts list header in `exportBOM` ("CLASSIC STUDIO — PARTS LIST"). Replace with a colon or a middle dot to match the rest of the interface, which already uses "·".

## Data correction

`data.js` describes the 6.5th generation board (MB565, 2008 120GB) as still capped at 128GB, and the `lba` rule treats it that way. That is consistent with the iFlash compatibility page and other sources; only the 2009 and later 7th generation thin boards (MC293 and MC297) use LBA48. I told you earlier in this conversation that the MB565 was also uncapped. That was wrong; the app's data is right. `AGENTS.md` repeats my error under "Ground truth to preserve" and should be corrected to: "6th gen (2007) and 6.5th gen (2008, MB565) boards are capped at 128GB in Apple firmware (LBA28). Only 7th gen (MC293/MC297) boards are not."

## Correctness and behavior

These are real but small. None corrupts state.

- **Hold assembly does not follow the body.** Switching thin to thick leaves `hold` at `hs-thin-black`, so the "Headphone jack / hold assembly has the wrong depth" warning fires on every thick build until the user finds the Details group. Either have `normalize` swap `hs-thin-*` to the matching `hs-thick-*` when the body changes (and vice versa), or give the `hold-fit` rule a `fix` so the warning gets a one-click button like the others.
- **`adapt` in `catalog.js` does not validate id characters.** Ids are interpolated into `data-value` attributes and price keys. The current JSON is clean, but since the file is designed to be replaced, add a check that ids match `^[a-z0-9-]+$` and fail loudly otherwise, the same way colors and prices are validated.
- **`build-single.py` strips `export` with a regex.** `re.sub(r'\bexport\s+', '', text)` will also remove the word "export" followed by whitespace inside any string or comment in the source. Nothing in the current code triggers it, but a future hint like "Use export to save" would silently break the portable build. Anchor the pattern to line starts (`^export\s+` with `re.M`) or restrict it to `export (const|function|async function|let)`.
- **`build-single.py` import stripping is brittle.** It only removes `import ... from './data.js'` and `'./catalog.js'` when written with single quotes on one line. Any reformatting of those import statements will break the portable build without an error. Consider generating the portable file with a small bundler step instead, or at least assert that no `from './` remains in the concatenated script.
- **`measureFaceplate` throws a generic error if the plate outline does not match.** The message ("Front plate outline needs a new shell adapter") is good, but it surfaces to the user as "The 3D preview could not load. Check your connection and WebGL support," which points them at the wrong cause. Show the actual message when the error is not a network or WebGL failure.
- **Mobile pixel-ratio choice is evaluated once.** `matchMedia('(max-width: 700px)')` is read at viewer creation. Rotating a tablet or resizing a window does not re-evaluate it. Minor; move the check into `resize()`.
- **`renderFrame` swaps every mesh's material twice per frame for the bloom pass.** It works and is cheap at this scene size, but `layers` are the idiomatic Three.js way to do selective bloom and would avoid the traversal and the `Map` churn. Optional.

## Security

Nothing serious. Output is escaped with `esc()` everywhere user or vendor text lands in HTML. Catalog URLs are forced to `https://`. External links carry `rel="noreferrer"`. The CSV export neutralizes formula injection by prefixing `= + @ -` with a quote. The saved-link decoder validates every field against the catalog before accepting it, caps string lengths, and range-checks prices. The WebMCP `configure_ipod_build` tool re-validates through `normalize` and rejects any key that did not survive. Good work throughout.

Two notes: the import map loads three CDN packages by pinned version without subresource integrity (module import maps do not support SRI, so this is a known limitation, not a bug), and the portable HTML still needs the CDN for Three.js, which the README says clearly.

## Performance

- Startup: the CSG issue above dominates. After that, the HDR (1.6 MB) and GLB (0.3 MB) are the main loads. The 1K HDR is fine; do not go larger.
- Runtime: SSAO at 65 percent resolution plus SMAA plus a second bloom composer at 60 percent is a reasonable budget. The adaptive `qualityScale` that steps down after three slow windows is a nice touch. Measured 40 to 55 FPS desktop, 60 FPS phone-sized, per Astra's report; consistent with the pass list.
- `renderConfigure` rebuilds the whole configure panel with `innerHTML` on every selection. At 215 swatches this is still fast, but it also resets scroll position inside the panel on some browsers. If that becomes noticeable, re-render only the affected `details` group.

## Accessibility

Good baseline: tab roles and arrow-key navigation, `aria-pressed` on toggles, `aria-label` on swatches with name, family, price, and vendor, a `role="status"` toast, `prefers-reduced-motion` respected in both CSS and the viewer's camera easing, and keyboard orbit on the canvas. Two gaps: disabled option buttons cannot receive focus, so a screen reader user tabbing through a group skips the conflicting options entirely and only hears the fix button; consider `aria-disabled` plus a no-op click instead of `disabled`. And the theme button's only visible label is the "◐" glyph; add visually hidden text.

## Code quality and maintainability

The code is correct but written as very long single lines (`app.js` is 61 lines for 27 KB; `viewer.js` 184 lines for 32 KB). That is fine for a generated artifact but hard for a human to review or for a future contributor to diff. Since the repo is going public, run a formatter once (Prettier with default settings is enough), commit the result as its own "Format source" commit, and add a `.prettierrc` so Astra keeps the style. Do this after the functional fixes so the diffs stay readable.

Other maintainability notes:

- `viewer.js` hardcodes the center button split (`Math.hypot(x + .002, y + .872) > .4`) and the screen UV mapping to this specific GLB. That is acknowledged in comments. Move those constants to a small `MODEL_ADAPTER` object at the top of the file so a future model swap is one edit.
- `data.js` mixes catalog data, rules, BOM assembly, the build guide, and URL migration in one file. It is cohesive enough for now; if it grows, split `rules.js` and `migrate.js` out.
- The README is thorough. Add a short "Development" section that says: clone, `npm ci`, `npm test`, `python3 -m http.server 5173 --directory dist`, `python3 build-single.py`.
- `.openai/hosting.json` is committed. It contains only a hosting project id and the static directory, so it is not a secret, but it is deploy configuration for one host. Either leave it with a comment in the README or move it to `.gitignore`.

## What is already good

The test suites are the strongest part of the project. `compatibility.mjs` exercises the full battery-by-storage fit matrix, kit restrictions and their fixes, retained conflicting selections, runtime math, every catalog option through encode/decode, BOM, CSV, and guide, v1 and v2 link restoration, and bundle pricing. `geometry.mjs` measures the real GLB, checks the flat-normal fix triangle by triangle, builds all six shells, and ray-casts through the ports to prove they are true through-holes and that the walls are continuous elsewhere. That is more rigorous than most hobby projects and worth keeping green.

## Suggested release sequence

1. Fix items 1 through 4 and the AGENTS.md data correction. Astra can do all of these from the prompt below.
2. Run a formatter and commit separately.
3. Tag `v1.0.0`, write a short release note, and add the published URL to the README.

## Prompt for Astra

Pull `main` and read `docs/REVIEW.md`. Implement the four "Fix before release" items and the data correction in AGENTS.md, plus the hold-assembly fix under "Correctness and behavior". Specifically: bake the six shell variants into a static asset with a script under `tools/` and load them in `viewer.js` instead of running CSG at startup, keeping `tests/geometry.mjs` pointed at the baking code; add `package.json` with `"type": "module"`, the three pinned dev dependencies, and an `npm test` script that runs both test files; add `.github/workflows/test.yml` running `npm ci && npm test`; add an MIT `LICENSE` and a License section in the README; replace the two em dashes; make `normalize` swap the hold assembly to match the body or give the `hold-fit` rule a fix. Run the tests and the portable build, commit each item separately with a clear message, and push to `main`. Then, in a final separate commit, run Prettier with default settings over `dist/*.js` and `tests/*.mjs`, add a `.prettierrc`, and confirm the tests still pass.
