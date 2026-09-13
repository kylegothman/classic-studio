import fs from "node:fs";
import assert from "node:assert/strict";
globalThis.IPOD_EOE_CATALOG = JSON.parse(
  fs.readFileSync(new URL("../dist/eoe-color-catalog.json", import.meta.url)),
);
const {
  DEFAULT,
  CATALOG,
  normalize,
  decode,
  encode,
  bom,
  warnings,
  optionConstraint,
  runtimeEstimate,
  csv,
  guide,
} = await import("../dist/data.js");
const { APPEARANCE } = await import("../dist/catalog.js");
const build = (patch) => normalize({ ...DEFAULT, ...patch });
const blocked = (s, k, id) => !!optionConstraint(s, k, id);
for (const battery of ["2000", "2000-square", "3000-thin", "3800-thin"])
  for (const storage of CATALOG.storage.map((x) => x.id)) {
    const allowed =
      battery === "2000-square"
        ? ["solo", "quad", "udual", "dual"]
        : ["quad", "udual"];
    const s = build({ battery, storage });
    assert.equal(
      blocked(s, "storage", storage),
      !allowed.includes(storage),
      `${battery}/${storage}`,
    );
    assert.equal(blocked({ ...s, body: "thick" }, "storage", storage), false);
    assert.equal(
      warnings(s).some((w) => w.id === "fit-storage"),
      !allowed.includes(storage),
    );
  }
for (const [key, ids] of Object.entries({
  connectivity: ["eoe", "moon"],
  battery: ["3000", "3800"],
  airtag: ["on"],
}))
  for (const id of ids) {
    const s = build({ [key]: id });
    assert(blocked(s, key, id));
    assert.equal(s[key], id, "Conflicts must retain selection");
    assert(!blocked({ ...s, body: "thick" }, key, id));
    const rule = warnings(s).find((w) => w.id === "fit-" + key);
    assert(rule?.fix);
    assert(!blocked({ ...s, ...rule.fix }, key, id));
  }
for (const connectivity of ["original", "eoe", "moon"])
  for (const body of ["thin", "thick"]) {
    const s = build({ connectivity, body });
    assert.equal(
      blocked(s, "qi", "on"),
      body === "thin" || connectivity === "original",
    );
    assert.equal(
      blocked(s, "taptic", "kit"),
      body === "thin" || connectivity === "original",
    );
    assert(!blocked(s, "taptic", "on"));
  }
assert(
  warnings(
    build({
      body: "thick",
      battery: "3800-thin",
      connectivity: "eoe",
      airtag: "on",
    }),
  ).some((w) => w.id === "crowded"),
);
assert.deepEqual(
  [runtimeEstimate(DEFAULT).low, runtimeEstimate(DEFAULT).high],
  [114, 143],
);
assert.equal(
  runtimeEstimate(build({ storage: "hdd", battery: "stock" })).draw,
  18,
);
assert.equal(
  runtimeEstimate(build({ firmware: "rockbox", bluetooth: "aptx" })).draw,
  14 * 1.1 * 1.25,
);
for (const [key, rows] of Object.entries({ ...CATALOG, ...APPEARANCE }))
  for (const row of rows) {
    const s = build({ [key]: row.id });
    assert.equal(decode(encode(s))[key], row.id);
    assert(bom(s).every((r) => Number.isFinite(r.price)));
    assert(guide(s).length > 5);
    assert(csv(bom(s)).includes("Estimated USD"));
  }
for (const battery of ["2000", "3000"]) {
  const old = decode(
    encode({
      board: "7g",
      battery,
      front: "black",
      wheel: "white",
      button: "white",
      finish: "polished",
      body: "thin",
    }),
  );
  assert.equal(old.battery, battery);
  assert.equal(old.front, "fp-metal-black");
}
const v2 = decode(
  encode(
    build({ body: "thin", battery: "3000", connectivity: "eoe", qi: "on" }),
  ),
);
assert.equal(v2.connectivity, "eoe");
assert.equal(v2.qi, "on");
assert.equal(v2.body, "thin");
assert(warnings(v2).some((w) => w.id === "fit-connectivity"));
const total = (s) => bom(s).reduce((n, r) => n + r.price, 0);
const base = build({});
const front = build({ buttonBundle: "front" });
const installed = build({ buttonBundle: "front", preinstalled: true });
assert.notEqual(total(base), total(front));
assert.notEqual(total(front), total(installed));
assert(bom(front).find((r) => r.group === "Center button").included);
assert(
  bom(installed)
    .filter((r) => r.group === "Details")
    .every((r) => r.included),
);
assert.equal(
  Object.values(APPEARANCE).reduce((n, a) => n + a.length, 0),
  215,
);
// Keep explicit and saved small-part choices until the user applies the fix.
for (const part of APPEARANCE.hold) {
  const body = part.body === "thin" ? "thick" : "thin",
    s = build({ body, hold: part.id });
  assert.equal(s.hold, part.id);
  assert.equal(decode(encode(s)).hold, part.id);
  const warning = warnings(s).find((w) => w.id === "hold-fit");
  assert(warning?.fix);
  const fixed = build({ ...s, ...warning.fix });
  assert.equal(fixed.body, body);
  assert.equal(
    fixed.hold,
    "hs-" + body + "-" + (part.id.endsWith("-white") ? "white" : "black"),
  );
  assert(!warnings(fixed).some((w) => w.id === "hold-fit"));
  assert(bom(fixed).some((row) => row.key === "hold:" + fixed.hold));
}
assert(
  !warnings(
    build({ body: "thick", hold: "hs-thin-black", connectivity: "moon" }),
  ).some((w) => w.id === "hold-fit"),
  "Back kits supply their own assembly",
);
console.log(
  "PASS: battery/storage fit matrix, kit restrictions/fixes, retained conflicts, runtime math, all option links/BOM/CSV/guide, v1/v2 restoration, catalog and bundle pricing, hold-depth fixes.",
);
