// The supplied JSON stays unchanged. Replace that file to refresh vendor prices.
// The portable HTML supplies the same JSON object inline at generation time.
export const EOE =
  globalThis.IPOD_EOE_CATALOG ??
  (await fetch(new URL("./eoe-color-catalog.json", import.meta.url), {
    cache: "no-cache",
  }).then((r) => {
    if (!r.ok) throw new Error("EOE catalog could not load");
    return r.json();
  }));
export const BUNDLE_ESTIMATES = {
  frontButton: 8,
  wheelButton: 8,
  preinstalled: 20,
  thickBody: 3,
};
export const FAMILY_NAMES = {
  metal: "Metal",
  matte: "Matte",
  gradient: "Gradient",
  plastic: "Plastic",
  transparent: "Crystal Clear",
  standard: "Standard",
  iridescent: "Rainbow / Polychrome",
  atomic: "Atomic",
  chrome: "Chrome",
  thin: "Thin",
  thick: "Thick",
};
export const ENGRAVING_STYLES = EOE.backplates.engravingStyles;
export const APPEARANCE_LABELS = {
  front: "Faceplate",
  wheel: "Click wheel",
  button: "Center button",
  finish: "Backplate",
  bezel: "Dock bezel",
  hold: "Headphone jack / hold switch",
};
function adapt(items, key) {
  if (!Array.isArray(items) || !items.length)
    throw new Error("Missing catalog: " + key);
  const ids = new Set();
  return items.map((item) => {
    if (!item.id || ids.has(item.id))
      throw new Error("Duplicate or missing catalog ID");
    ids.add(item.id);
    const colors = String(item.color)
      .split("->")
      .map((x) => x.trim());
    if (!colors.every((x) => /^#[\da-f]{6}$/i.test(x)))
      throw new Error("Invalid catalog color: " + item.id);
    const price = item.price ?? item.priceFrom;
    if (!Number.isFinite(price) || price < 0)
      throw new Error("Invalid catalog price: " + item.id);
    let family = item.finish ?? item.material ?? "plastic";
    if (key === "hold") family = item.body;
    if (key === "bezel")
      family = /atomic|glow/i.test(item.id)
        ? "atomic"
        : /transparent|clear/i.test(item.id)
          ? "transparent"
          : "plastic";
    const clear = ["transparent", "atomic"].includes(family);
    return {
      ...item,
      price,
      colors,
      hex: colors[0],
      family,
      clear,
      glow: /glow/i.test(item.id),
      material: item.material ?? (key === "finish" ? "metal" : "plastic"),
      url: /^https:\/\//.test(item.url) ? item.url : "https://eoe.works/",
      vendor: item.vendor || "EOE",
    };
  });
}
export const APPEARANCE = {
  front: adapt(EOE.faceplates, "front"),
  wheel: adapt(EOE.clickWheels, "wheel"),
  button: adapt(EOE.centerButtons, "button"),
  finish: adapt(EOE.backplates.colors, "finish"),
  bezel: adapt(EOE.dockBezels, "bezel"),
  hold: adapt(EOE.holdSwitchJack, "hold"),
};
export const appearance = (s, key) =>
  APPEARANCE[key].find((p) => p.id === s[key]) ?? APPEARANCE[key][0];
export const paintCSS = (p) =>
  p.colors.length > 1
    ? "linear-gradient(to bottom," + p.colors.join(",") + ")"
    : p.hex;
export function surfaceSpec(p) {
  if (p.clear)
    return { metalness: 0, roughness: 0.055, clearcoat: 0.2, opacity: 0.24 };
  if (p.family === "matte")
    return { metalness: 0, roughness: 0.8, clearcoat: 0, opacity: 1 };
  if (p.family === "chrome")
    return { metalness: 1, roughness: 0.15, clearcoat: 0, opacity: 1 };
  if (p.material === "metal")
    return { metalness: 0.9, roughness: 0.35, clearcoat: 0, opacity: 1 };
  return { metalness: 0, roughness: 0.4, clearcoat: 0.25, opacity: 1 };
}
export const LEGACY_IDS = {
  front: {
    black: "fp-metal-black",
    silver: "fp-metal-silver",
    white: "fp-metal-white-matte",
    red: "fp-metal-red",
    blue: "fp-metal-blue",
    gold: "fp-metal-gold",
    transparent: "fp-plastic-crystal-clear",
  },
  wheel: {
    black: "cw-black",
    white: "cw-white",
    silver: "cw-grey",
    red: "cw-red",
    blue: "cw-blue",
    gold: "cw-atomic-gold-metallic",
    transparent: "cw-fully-transparent-clear",
  },
  button: {
    black: "cb-metal-black",
    silver: "cb-metal-silver",
    white: "cb-plastic-white",
    red: "cb-metal-red",
    blue: "cb-plastic-blue",
    gold: "cb-metal-gold",
    transparent: "cb-clear-transparent-crystal-clear",
  },
  finish: {
    polished: "bp-silver-stock-stainless",
    brushed: "bp-silver-stock-stainless",
    black: "bp-black",
    gold: "bp-gold",
    blue: "bp-ocean-blue",
    red: "bp-sangria-red",
  },
};
export const LEGACY_APPROXIMATE = {
  front: ["white"],
  wheel: ["silver", "gold"],
  finish: ["brushed", "blue", "red", "custom"],
};
export function nearestBack(hex) {
  const rgb = (h) =>
    h
      .slice(1)
      .match(/../g)
      .map((v) => parseInt(v, 16));
  const target = rgb(/^#[a-f\d]{6}$/i.test(hex || "") ? hex : "#668576");
  return [...APPEARANCE.finish].sort((a, b) => {
    const distance = (p) =>
      rgb(p.hex).reduce((v, c, i) => v + (c - target[i]) ** 2, 0);
    return distance(a) - distance(b);
  })[0].id;
}
