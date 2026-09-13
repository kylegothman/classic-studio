import {
  EOE,
  APPEARANCE,
  FAMILY_NAMES,
  APPEARANCE_LABELS,
  appearance,
  LEGACY_IDS,
  LEGACY_APPROXIMATE,
  nearestBack,
  BUNDLE_ESTIMATES,
  ENGRAVING_STYLES,
} from "./catalog.js";
// Edit all names, prices, vendors, explanations and compatibility rules here.
// Prices are planning allowances in USD, not live quotes. Updated 2026-09-12.
export const VENDORS = {
  iflash: { name: "iFlash", url: "https://www.iflash.xyz/store/" },
  eoe: { name: "Elite Obsolete Electronics", url: "https://eoe.works/" },
  moon: {
    name: "moonlit.market",
    url: "https://moonlit.market/products/classic-connect-2",
  },
  used: { name: "Used parts / eBay", url: "https://www.ebay.com/" },
  apple: { name: "Apple", url: "https://www.apple.com/airtag/" },
  rockbox: { name: "Rockbox", url: "https://www.rockbox.org/" },
  diy: { name: "DIY parts supplier", url: "https://www.digikey.com/" },
};
const o = (id, name, price, difficulty, description, vendor = "eoe") => ({
  id,
  name,
  price,
  difficulty,
  description,
  vendor,
});
export const CATALOG = {
  board: [
    o(
      "6g",
      "Original 6th generation",
      0,
      1,
      "Keep your 2007 80GB board. Apple firmware is limited to 128GB by LBA28 addressing.",
      "used",
    ),
    o(
      "7g",
      "7th generation · MC293 / MC297",
      80,
      4,
      "A used 2009–2014 board supports LBA48, removing the 128GB addressing cap. Budget includes a new purchase.",
      "used",
    ),
    o(
      "65g",
      "6.5 generation · MB565",
      70,
      4,
      "The 2008 120GB board still has the 128GB Apple-firmware flash-storage cap. It is not equivalent to the 7th generation.",
      "used",
    ),
  ],
  storage: [
    o(
      "hdd",
      "Original 80GB hard drive",
      0,
      1,
      "Reuse the spinning drive. Original capacity, more weight and moving parts.",
      "used",
    ),
    o(
      "solo",
      "iFlash Solo",
      38,
      2,
      "One full-size SD slot; a microSD card needs an SD sleeve. Simple, low-power flash storage.",
      "iflash",
    ),
    o(
      "quad",
      "iFlash Quad",
      45,
      2,
      "Four microSD slots in the slimmest iFlash adapter. Helps leave room for a larger battery.",
      "iflash",
    ),
    o(
      "udual",
      "iFlash uDUAL",
      42,
      2,
      "Low-profile dual microSD adapter. Check card compatibility with the maker.",
      "iflash",
    ),
    o(
      "dual",
      "Generic dual microSD",
      25,
      3,
      "Generic dual microSD adapter; fit allowance only. Verify exact board and firmware support.",
      "diy",
    ),
    o(
      "m2",
      "M.2 SATA adapter",
      40,
      3,
      "M.2 SATA, not NVMe. Verify the adapter and SSD combination; extended thin batteries are not supported.",
      "diy",
    ),
    o(
      "sata",
      "iFlash Sata",
      40,
      3,
      "Uses an mSATA SSD, not M.2 or NVMe. Runs warmer and uses more power than SD. Confirm SSD compatibility.",
      "iflash",
    ),
    o(
      "cf",
      "CompactFlash adapter",
      35,
      3,
      "Uses a compatible true-IDE CompactFlash card. Card compatibility and high-capacity availability vary.",
      "iflash",
    ),
  ],
  battery: [
    o(
      "stock",
      "Stock replacement · 550–650 mAh",
      18,
      2,
      "Standard replacement cell; runtime uses a nominal 650 mAh.",
    ),
    o(
      "2000",
      "2000 mAh thin · rectangle",
      25,
      3,
      "Thin rectangle: iFlash Quad or uDUAL under a thin back. Legacy 2000 mAh selections retain this ID.",
    ),
    o(
      "2000-square",
      "2000 mAh thin · square",
      25,
      3,
      "Thin square: Solo, Quad, uDUAL or generic dual microSD under a thin back.",
    ),
    o(
      "3000-thin",
      "3000 mAh · thin model",
      32,
      3,
      "Thin-format cell: iFlash Quad or uDUAL under a thin back.",
    ),
    o(
      "3800-thin",
      "3800 mAh · thin model",
      38,
      3,
      "Thin-format cell: iFlash Quad or uDUAL under a thin back.",
    ),
    o(
      "3000",
      "3000 mAh · thick model",
      32,
      3,
      "Thick-format cell requires a thick back; distinct from the thin 3000 mAh product.",
    ),
    o(
      "3800",
      "3800 mAh · thick model",
      38,
      3,
      "Thick-format cell requires a thick back. Check actual cell dimensions and capacity.",
    ),
  ],
  body: [
    o(
      "thin",
      "Thin · 10.5 mm",
      20,
      2,
      "Matches your original 80GB enclosure. Less room for batteries and wireless boards.",
    ),
    o(
      "thick",
      "Thick · 13.5 mm",
      25,
      3,
      "Adds internal depth. Usually needs a matching thick headphone-jack / hold-switch assembly.",
    ),
  ],
  connectivity: [
    o(
      "original",
      "Original 30-pin",
      0,
      1,
      "Keep charging, sync, docks and accessories through the original connector.",
    ),
    o(
      "usbc",
      "USB-C dock replacement",
      100,
      5,
      "USB-C charging and USB 2.0 data conversion. This replacement requires intensive microsoldering and removes the original 30-pin connector.",
    ),
    o(
      "eoe",
      "USB-C + Bluetooth kit",
      150,
      4,
      "Planning allowance for a combined back kit. Confirm board fit, codec, data and included parts with the seller; aptX is not assumed.",
    ),
    o(
      "moon",
      "Classic Connect 2",
      140,
      4,
      "Custom enclosure, included battery, Bluetooth 5.2 with aptX, Qi and haptics. Retains 30-pin. USB-C data needs three soldered wires. Price is a $140 planning allowance.",
      "moon",
    ),
  ],
  screen: [
    o(
      "keep",
      "Keep original LCD",
      0,
      1,
      "Reuse the existing working screen. No verified higher-brightness upgrade is listed.",
    ),
    o(
      "stock",
      "Stock replacement LCD",
      25,
      3,
      "Replace a damaged or dim display with a standard compatible A1238 LCD.",
    ),
  ],
  bluetooth: [
    o(
      "off",
      "No additional Bluetooth",
      0,
      1,
      "Keep the original wired audio path.",
    ),
    o(
      "aptx",
      "Internal Bluetooth 5.x · aptX",
      40,
      5,
      "DIY transmitter tapping analog audio; the 3.5 mm jack stays usable if wired correctly. Confirm aptX codec support on both devices.",
      "diy",
    ),
  ],
  qi: [
    o("off", "No additional Qi", 0, 1, "Charge by cable."),
    o(
      "on",
      "Kit-integrated Qi",
      15,
      4,
      "Available only with a thick-body back kit. Classic Connect 2 includes Qi; confirm this optional feature with the EOE kit seller.",
    ),
  ],
  airtag: [
    o("off", "No AirTag", 0, 1, "Leave the internal space available."),
    o(
      "on",
      "Integrated AirTag",
      35,
      5,
      "A disassembled AirTag needs regulated 3V power, insulation and internal space. Never connect directly to the iPod lithium cell.",
      "apple",
    ),
  ],
  taptic: [
    o(
      "off",
      "Original wheel feedback",
      0,
      1,
      "Keep the original audible click.",
    ),
    o(
      "on",
      "Taptic engine",
      25,
      5,
      "DIY haptic feedback driven from the wheel-click signal. Requires soldering, a suitable driver circuit and room for the motor.",
      "diy",
    ),
    o(
      "kit",
      "Kit-integrated haptics",
      25,
      4,
      "Available through a thick-body kit. Included with Classic Connect 2; confirm the EOE kit configuration.",
    ),
  ],
  firmware: [
    o(
      "apple",
      "Apple firmware",
      0,
      1,
      "Familiar menus, ALAC and gapless playback. FLAC needs conversion. Sync with compatible desktop software.",
      "apple",
    ),
    o(
      "rockbox",
      "Rockbox · dual boot",
      0,
      3,
      "FLAC, ALAC, gapless playback and themes. Dual boot is supported; battery capacity adjusts runtime estimates, not the battery percentage gauge.",
      "rockbox",
    ),
  ],
  bypass: [
    o(
      "off",
      "Standard audio circuit",
      0,
      1,
      "Keep the Cirrus-based audio path.",
    ),
    o(
      "on",
      "Audio capacitor bypass",
      0,
      5,
      "Informational only: the common iMod capacitor bypass is for Wolfson-based 5th / 5.5th gen boards, not these 6th / 7th gen boards.",
      "diy",
    ),
  ],
};
export const CAPACITIES = [128, 256, 512, 1024, 2048];
export const MEDIA_PRICES = {
  udual: [15, 25, 45, 95, 180],
  dual: [15, 25, 45, 95, 180],
  m2: [20, 30, 50, 90, 180],
  solo: [15, 25, 45, 95, 185],
  quad: [15, 25, 45, 95, 180],
  sata: [20, 30, 50, 90, 180],
  cf: [100, 190, 350, 700, 1400],
};
export const COSMETICS = {
  front: {
    price: 22,
    difficulty: 3,
    vendor: "eoe",
    description:
      "Clear plastic reveals the selected internals. Check replacement faceplate fit for A1238.",
  },
  wheel: {
    price: 15,
    difficulty: 3,
    vendor: "eoe",
    description:
      "Check wheel generation compatibility. Ring and center colors are priced as one assembly.",
  },
  engraving: {
    price: 0,
    difficulty: 1,
    vendor: "eoe",
    description:
      "Confirm engraving service with the shell vendor; enter their quote in the parts list.",
  },
};
export const DEFAULT = {
  schemaVersion: 2,
  board: "7g",
  storage: "quad",
  capacity: 512,
  battery: "2000",
  body: "thin",
  finish: "bp-silver-stock-stainless",
  front: "fp-metal-silver",
  wheel: "cw-white",
  button: "cb-metal-silver",
  bezel: "db-white",
  hold: "hs-thin-black",
  buttonBundle: "none",
  preinstalled: false,
  engravingStyle: "universal",
  capacityMark: "512GB",
  screen: "keep",
  connectivity: "original",
  bluetooth: "off",
  qi: "off",
  airtag: "off",
  taptic: "off",
  firmware: "apple",
  bypass: "off",
  engraving: "",
  engravingPrice: 0,
  prices: {},
  view: "three",
  xray: false,
  theme: "system",
};
export const PRESETS = {
  stock: {
    ...DEFAULT,
    board: "6g",
    storage: "hdd",
    capacity: 128,
    battery: "stock",
    capacityMark: "80GB",
  },
  daily: {
    ...DEFAULT,
    board: "7g",
    storage: "quad",
    capacity: 512,
    battery: "3000",
    body: "thick",
    finish: "bp-silver-chrome",
    hold: "hs-thick-black",
    connectivity: "eoe",
    taptic: "on",
    firmware: "rockbox",
    front: "fp-metal-black",
    wheel: "cw-black",
    button: "cb-metal-black",
  },
  audiophile: {
    ...DEFAULT,
    board: "7g",
    storage: "sata",
    capacity: 512,
    battery: "3000",
    body: "thick",
    finish: "bp-silver-chrome",
    hold: "hs-thick-black",
    firmware: "rockbox",
  },
};
export const SOURCES = [
  [
    "iFlash board compatibility",
    "https://www.iflash.xyz/store/iflash-compatibility/",
  ],
  [
    "iFlash battery fit guide",
    "https://www.iflash.xyz/3rd-party-extended-battery-guide/",
  ],
  [
    "Rockbox iPod Classic manual",
    "https://download.rockbox.org/daily/manual/rockbox-ipod6g/rockbox-build.html",
  ],
  [
    "Classic Connect 2 specifications",
    "https://moonlit.market/products/classic-connect-2",
  ],
  [
    "Classic Connect 2 enclosure and ports",
    "https://moonlit.market/pages/classic-connect-2",
  ],
  [
    "Classic Connect 2 adapter fit",
    "https://moonlit.market/pages/compatibility",
  ],
];
export const isKit = (s) => ["eoe", "moon"].includes(s.connectivity);
export const hasBT = (s) => isKit(s) || s.bluetooth === "aptx";
export const hasQi = (s) => s.connectivity === "moon" || s.qi === "on";
export const hasTaptic = (s) => s.connectivity === "moon" || s.taptic !== "off";
export const selected = (s, k) => CATALOG[k].find((x) => x.id === s[k]);
const rule = (id, test, level, title, message, fix) => ({
  id,
  test,
  level,
  title,
  message,
  fix,
});
export const batteryCapacity = (s) =>
  s.connectivity === "moon"
    ? 2000
    : s.battery === "stock"
      ? 650
      : parseInt(s.battery, 10);
export function runtimeEstimate(s) {
  const draw =
      (s.storage === "hdd" ? 18 : 14) *
      (s.firmware === "rockbox" ? 1.1 : 1) *
      (hasBT(s) ? 1.25 : 1),
    capacity = batteryCapacity(s);
  return {
    low: Math.round((capacity * 0.8) / draw),
    high: Math.round(capacity / draw),
    draw,
    capacity,
    kit: s.connectivity === "moon",
  };
}
const THICK_KIT =
  "Requires thick body. These kits are built into a thick back plate.";
const LOW_PROFILE =
  "This battery only fits with low-profile adapters (iFlash Quad or uDUAL) under a thin back.";
export function optionConstraint(s, key, id) {
  const fail = (message, fix) => ({ message, fix });
  if (
    key === "connectivity" &&
    ["eoe", "moon"].includes(id) &&
    s.body === "thin"
  )
    return fail(
      id === "moon"
        ? "Requires thick body in this planner. Classic Connect 2 supplies its own custom back enclosure."
        : THICK_KIT,
      { body: "thick" },
    );
  if (key === "airtag" && id === "on" && s.body === "thin")
    return fail("No internal space with a thin back and an extended battery.", {
      body: "thick",
    });
  if (key === "battery" && ["3000", "3800"].includes(id) && s.body === "thin")
    return fail("This thick-model cell requires a thick body.", {
      body: "thick",
    });
  if ((key === "qi" && id === "on") || (key === "taptic" && id === "kit")) {
    if (s.body === "thin")
      return fail(
        "Requires thick body and a compatible back kit.",
        isKit(s) ? { body: "thick" } : { body: "thick", connectivity: "eoe" },
      );
    if (!isKit(s))
      return fail(
        "Available only through a compatible back kit. Confirm this feature with the seller.",
        { connectivity: "eoe" },
      );
  }
  if (
    key === "storage" &&
    s.body === "thin" &&
    s.battery !== "stock" &&
    s.connectivity !== "moon"
  ) {
    const allowed =
      s.battery === "2000-square"
        ? ["solo", "quad", "udual", "dual"]
        : ["quad", "udual"];
    if (!allowed.includes(id))
      return fail(
        s.battery === "2000-square" && !["sata", "m2", "cf"].includes(id)
          ? "The 2000 mAh square cell fits Solo, Quad, uDUAL or generic dual microSD under a thin back."
          : LOW_PROFILE,
        { body: "thick" },
      );
  }
  if (
    key === "finish" &&
    !APPEARANCE.finish.find((p) => p.id === id)?.bodies.includes(s.body)
  ) {
    const part = APPEARANCE.finish.find((p) => p.id === id);
    const alternative =
      APPEARANCE.finish.find(
        (p) =>
          p.bodies.includes(s.body) &&
          p.family === part?.family &&
          p.name.split(" ")[0] === part?.name.split(" ")[0],
      ) ?? APPEARANCE.finish.find((p) => p.bodies.includes(s.body));
    return fail(
      "This backplate color is only sold in a " +
        (part?.bodies[0] ?? "thin") +
        " body. " +
        alternative.name +
        " is the closest " +
        s.body +
        " option.",
      { finish: alternative.id },
    );
  }
  return null;
}
export const unlockedByThick = (key, id) =>
  (key === "connectivity" && ["eoe", "moon"].includes(id)) ||
  (key === "battery" && ["3000", "3800"].includes(id)) ||
  (key === "airtag" && id === "on") ||
  (key === "qi" && id === "on") ||
  (key === "taptic" && id === "kit");
export const RULES = [
  rule(
    "crowded",
    (s) =>
      s.body === "thick" &&
      s.airtag === "on" &&
      batteryCapacity(s) >= 3000 &&
      hasBT(s),
    "warning",
    "Tight internal layout",
    "Tight fit. Plan the internal layout before ordering.",
    { airtag: "off" },
  ),
  rule(
    "button-fit",
    (s) =>
      (appearance(s, "front").material === "metal") !==
      (appearance(s, "button").material === "metal"),
    "warning",
    "Faceplate and center button materials do not match",
    "Metal faceplates take metal buttons. Plastic and crystal-clear faceplates take plastic or crystal-clear buttons. Select a matching button before ordering.",
  ),
  rule(
    "hold-fit",
    (s) => !isKit(s) && appearance(s, "hold").body !== s.body,
    "warning",
    "Headphone jack / hold assembly has the wrong depth",
    "Match the assembly to your thin or thick back. The U2 black-and-red assembly in this catalog is thin only. The suggested fix uses black when no matching U2 variant exists.",
    (s) => ({
      hold:
        "hs-" + s.body + "-" + (s.hold.endsWith("-white") ? "white" : "black"),
    }),
  ),
  rule(
    "bundle-variant",
    (s) => s.buttonBundle !== "none" || s.preinstalled,
    "info",
    "Bundle prices are planning allowances",
    "Center-button bundles add an estimated $8 to the chosen faceplate or wheel; preinstalled jack and bezel add $20 to a standard back. Confirm the selected colors/materials are offered together. Included components are not charged again.",
  ),
  rule(
    "kit-cosmetics",
    (s) => isKit(s),
    "info",
    "Back kit controls its own enclosure and small parts",
    "Catalog back color, engraving style, bezel and hold assembly are appearance references for this kit. They appear as included / verify in the parts list, not additional purchases. Confirm those options with the kit maker.",
  ),

  rule(
    "lba",
    (s) => s.board !== "7g" && s.storage !== "hdd" && s.capacity > 128,
    "warning",
    "Apple firmware stops at 128GB",
    "Both 6th and 6.5th generation boards use LBA28. Rockbox-only configurations can work around this; Apple dual boot cannot access the larger layout reliably. Choose a 7th-generation board for full capacity in Apple firmware.",
    { board: "7g" },
  ),
  rule(
    "moonairtag",
    (s) => s.airtag === "on" && s.connectivity === "moon",
    "warning",
    "AirTag fit is unverified in Classic Connect 2",
    "The kit uses a fixed enclosure and battery layout. Changing the standard thin/thick selection does not create space. Remove AirTag or confirm a custom layout with the maker.",
    { airtag: "off" },
  ),
  rule(
    "dock",
    (s) => s.connectivity === "usbc",
    "info",
    "30-pin accessories will no longer fit",
    "A USB-C conversion replaces the 30-pin connection. Existing docks, line-out cables and other 30-pin accessories are not retained.",
  ),
  rule(
    "bypass",
    (s) => s.bypass === "on",
    "info",
    "Capacitor bypass does not apply",
    "The usual Wolfson iMod procedure targets 5th / 5.5th gen boards. It is not a supported part of this A1238 build and is excluded from cost and assembly.",
  ),
  rule(
    "hdd",
    (s) =>
      s.storage === "hdd" &&
      batteryCapacity(s) >= 3000 &&
      s.connectivity !== "moon",
    "warning",
    "Hard drive and large cell may collide",
    "A thick back is not a fit guarantee with the original hard drive. Use flash storage or a stock-size cell.",
    { storage: "quad" },
  ),
  rule(
    "moonhdd",
    (s) => s.connectivity === "moon" && s.storage === "hdd",
    "warning",
    "Classic Connect 2 requires flash storage",
    "Its enclosure does not fit the original mechanical hard drive. Check the maker’s approved adapter list, then select a supported flash setup.",
  ),
  rule(
    "mooncap",
    (s) => s.connectivity === "moon" && s.capacity > 1024,
    "warning",
    "Beyond the kit’s advertised capacity",
    "The kit advertises up to 1TB. Confirm a larger configuration with the maker before purchasing.",
    { capacity: 1024 },
  ),
  rule(
    "moonsata",
    (s) =>
      s.connectivity === "moon" && ["sata", "quad", "solo"].includes(s.storage),
    "warning",
    "Confirm the kit’s adapter fit",
    "The maker lists CF-ZIF and other specific adapters. Solo needs PCB trimming; Quad and Sata are not on the approved list. Check the vendor compatibility guide before buying.",
    undefined,
  ),
  rule(
    "eoedock",
    (s) => s.connectivity === "eoe",
    "info",
    "Confirm kit dock and codec support",
    "The EOE listing confirms USB-C and Bluetooth, but does not establish aptX, Qi, exact depth or retained dock compatibility. Verify these with the seller.",
  ),
  rule(
    "moonparts",
    (s) => s.connectivity === "moon",
    "info",
    "Kit battery, haptics, Qi and Bluetooth are included",
    "The kit is about 0.5 mm thicker than a thin Classic and retains 30-pin. Battery, back, Bluetooth, Qi and taptic costs are replaced by the kit. USB-C data requires soldering; exterior finishes are previews only.",
  ),
  rule(
    "tracks",
    (s) => s.storage !== "hdd" && s.capacity >= 1024,
    "info",
    "Storage capacity is not a track-count guarantee",
    "Apple firmware has library / RAM limits; large libraries can fail before the drive is full. Rockbox handles files differently. Confirm card compatibility and format.",
  ),
  rule(
    "cfmedia",
    (s) => s.storage === "cf" && s.capacity >= 512,
    "warning",
    "High-capacity CompactFlash is not a confirmed kit",
    "These are budget placeholders, not verified available compatible cards. Select a tested card from the adapter maker or use iFlash Quad.",
    { storage: "quad" },
  ),
];
export const warnings = (s) => [
  ...RULES.filter((r) => r.test(s)).map(({ test, fix, ...r }) => ({
    ...r,
    fix: typeof fix === "function" ? fix(s) : fix,
  })),
  ...[
    "connectivity",
    "battery",
    "storage",
    "qi",
    "taptic",
    "airtag",
    "finish",
  ].flatMap((key) => {
    const c = optionConstraint(s, key, s[key]);
    return c
      ? [
          {
            id: "fit-" + key,
            level: "warning",
            title:
              (key === "finish"
                ? "Backplate"
                : key[0].toUpperCase() + key.slice(1)) +
              " conflicts with this build",
            ...c,
          },
        ]
      : [];
  }),
];
export function appearanceKey(s, key) {
  if (key === "front" || key === "wheel") return key + ":" + s[key];
  if (key === "finish")
    return "back:" + s.finish + ":" + s.body + ":" + s.engravingStyle;
  return key + ":" + s[key];
}
export function bom(s) {
  const rows = [];
  const add = (
    key,
    group,
    name,
    basePrice,
    vendor,
    description = "",
    included = false,
    url = null,
    extra = 0,
  ) => {
    const v = VENDORS[vendor] || { name: vendor, url: "https://eoe.works/" };
    const editablePrice = s.prices[key] ?? basePrice;
    rows.push({
      key,
      group,
      name,
      price: included ? 0 : Math.round((editablePrice + extra) * 100) / 100,
      basePrice,
      editablePrice,
      extra,
      vendor: v.name,
      url: url ?? v.url,
      description,
      included,
    });
  };
  for (const [key, group] of [
    ["board", "Logic board"],
    ["storage", "Storage"],
    ["battery", "Battery"],
    ["connectivity", "Connectivity"],
    ["screen", "Screen"],
    ["bluetooth", "Wireless"],
    ["qi", "Wireless"],
    ["airtag", "Wireless"],
    ["taptic", "Feel"],
    ["firmware", "Firmware"],
  ]) {
    const p = selected(s, key);
    if (["bluetooth", "qi", "airtag", "taptic"].includes(key) && p.id === "off")
      continue;
    if (key === "connectivity" && p.id === "original") continue;
    if (key === "battery" && s.connectivity === "moon") continue;
    if (
      (key === "bluetooth" && isKit(s)) ||
      (["qi", "taptic"].includes(key) && s.connectivity === "moon")
    )
      continue;
    add(key + ":" + p.id, group, p.name, p.price, p.vendor, p.description);
    if (key === "connectivity" && p.id === "moon")
      rows.at(-1).description +=
        " Planner uses the thick category; the actual enclosure is custom.";
    if (key === "firmware" && p.id === "apple")
      rows.at(-1).url = "https://support.apple.com/ipod";
    if (
      key === "storage" &&
      ["solo", "quad", "sata", "cf", "udual"].includes(p.id)
    )
      rows.at(-1).url = "https://www.iflash.xyz/store/iflash-" + p.id + "/";
    if (key === "connectivity" && p.id === "eoe")
      rows.at(-1).url =
        "https://eoe.works/products/backplate-mod-kit-usb-c-internal-bluetooth-5-2-for-apple-ipod-video-5th-5-5-a1136-ipod-classic-6th-7th-a1238";
    if (key === "connectivity" && p.id === "usbc")
      rows.at(-1).url =
        "https://eoe.works/products/new-usb-c-dock-replacement-for-apple-ipod-video-5th-5-5-a1136-ipod-classic-6th-7th-a1238";
  }
  if (s.storage !== "hdd") {
    const kind =
      s.storage === "m2"
        ? "M.2 SATA SSD"
        : s.storage === "sata"
          ? "mSATA SSD"
          : s.storage === "cf"
            ? "CompactFlash card"
            : "microSD media";
    add(
      `media:${s.storage}:${s.capacity}`,
      "Storage",
      `${s.capacity >= 1024 ? s.capacity / 1024 + "TB" : s.capacity + "GB"} ${kind}`,
      MEDIA_PRICES[s.storage][CAPACITIES.indexOf(s.capacity)],
      "used",
      "Media allowance; verify compatibility. Quad total can be spread over up to four cards.",
    );
  }
  for (const [key, group] of [
    ["front", "Front plate"],
    ["wheel", "Click wheel"],
    ["button", "Center button"],
    ["finish", "Back plate"],
    ["bezel", "Details"],
    ["hold", "Details"],
  ]) {
    const part = appearance(s, key);
    let included = false,
      extra = 0,
      detail = "",
      family = FAMILY_NAMES[part.family] || part.family,
      name =
        part.name +
        (part.name.toLowerCase().includes(family.toLowerCase())
          ? " "
          : " (" + family + ") ") +
        APPEARANCE_LABELS[key].toLowerCase();
    if (key === "front" || key === "wheel") {
      if (s.buttonBundle === key) {
        extra =
          BUNDLE_ESTIMATES[key === "front" ? "frontButton" : "wheelButton"];
        name += " + " + appearance(s, "button").name + " center button";
        detail =
          "Includes selected center button. Bundle surcharge is an estimate.";
      }
    }
    if (key === "button" && s.buttonBundle !== "none") {
      included = true;
      detail =
        "Included with " +
        (s.buttonBundle === "front" ? "faceplate" : "click wheel") +
        ".";
    }
    if (key === "finish") {
      name =
        part.name +
        " back · " +
        s.body +
        " · " +
        ENGRAVING_STYLES[s.engravingStyle] +
        (s.engravingStyle === "capacity" ? " " + s.capacityMark : "");
      extra =
        (s.body === "thick"
          ? (s.prices["back-premium:" + s.finish + ":" + s.body] ??
            BUNDLE_ESTIMATES.thickBody)
          : 0) + (s.preinstalled ? BUNDLE_ESTIMATES.preinstalled : 0);
      if (s.preinstalled) {
        name += " + preinstalled jack & bezel";
        detail =
          "Includes " +
          appearance(s, "hold").name +
          " " +
          appearance(s, "hold").body +
          " jack and " +
          appearance(s, "bezel").name +
          " bezel. Confirm bundle availability.";
      }
      if (isKit(s)) {
        included = true;
        detail =
          "Kit enclosure: color/style is a reference; verify with the kit maker.";
      }
    }
    if (["bezel", "hold"].includes(key) && (s.preinstalled || isKit(s))) {
      included = true;
      detail = isKit(s)
        ? "Kit detail reference; verify the chosen variant."
        : "Included with preinstalled backplate bundle.";
    }
    add(
      appearanceKey(s, key),
      group,
      name,
      part.price,
      part.vendor,
      detail,
      included,
      part.url,
      extra,
    );
  }
  if (s.engraving.trim())
    add(
      "engraving",
      "Cosmetics",
      "Custom engraving: " + s.engraving,
      s.engravingPrice,
      "eoe",
      "Custom text is additional to the selected factory engraving style. Confirm service availability.",
    );
  return rows;
}
export function guide(s) {
  const steps = [
    {
      name: "Open and inspect the donor",
      detail:
        "Back up music. Discharge and disconnect the battery. Opening A1238 metal clips is usually the hardest mechanical step.",
      difficulty: 4,
      minutes: 40,
    },
  ];
  const add = (name, detail, difficulty, minutes) =>
    steps.push({ name, detail, difficulty, minutes });
  if (s.board !== "6g")
    add(
      "Swap and inspect the logic board",
      "Transfer the compatible board; inspect fragile ribbon connectors before seating them.",
      4,
      35,
    );
  if (s.storage !== "hdd")
    add(
      "Install and restore flash storage",
      "Fit compatible media and adapter, connect the drive ribbon, restore and verify full capacity.",
      selected(s, "storage").difficulty,
      30,
    );
  add(
    "Set up and test firmware",
    s.firmware === "rockbox"
      ? "Restore Apple firmware first, then follow the current Rockbox iPod Classic manual. Test dual boot and library access."
      : "Restore with compatible Apple desktop software and test sync, audio and controls.",
    s.firmware === "rockbox" ? 3 : 2,
    s.firmware === "rockbox" ? 35 : 20,
  );
  add(
    s.connectivity === "moon"
      ? "Fit the kit battery"
      : "Fit and insulate the battery",
    "Use the cell supplier’s fit guidance. Avoid pinching, bending or compressing lithium cells.",
    3,
    20,
  );
  add(
    "Fit the back and connectivity",
    s.connectivity === "original"
      ? "Check the matching hold-switch and headphone-jack assembly. Leave the shell open for testing."
      : "Follow the kit maker’s wiring instructions. Verify charging, USB data and both wired and wireless audio as applicable.",
    s.connectivity === "original" ? 3 : 5,
    s.connectivity === "original" ? 20 : 65,
  );
  add(
    "Fit the front, wheel, center button and LCD",
    appearance(s, "front").name +
      " faceplate; " +
      appearance(s, "wheel").name +
      " wheel; " +
      appearance(s, "button").name +
      " center button. " +
      (s.buttonBundle !== "none"
        ? "Center button is ordered with the " +
          s.buttonBundle +
          "; verify its material. "
        : "") +
      "Seat flex cables and test every button before closing.",
    3,
    35,
  );
  add(
    s.preinstalled && !isKit(s)
      ? "Check the preinstalled jack and dock bezel"
      : "Fit and test the small details",
    appearance(s, "hold").name +
      " " +
      appearance(s, "hold").body +
      " headphone/hold assembly and " +
      appearance(s, "bezel").name +
      " dock bezel. " +
      (isKit(s)
        ? "Confirm that these references match the chosen kit."
        : s.preinstalled
          ? "Vendor installs these with the back; test hold, audio and port alignment."
          : "Match the body depth, insulate the ribbon and test hold, audio and port alignment."),
    s.preinstalled ? 2 : 3,
    s.preinstalled ? 10 : 25,
  );
  add(
    "Confirm back color and factory engraving",
    appearance(s, "finish").name +
      " · " +
      s.body +
      " · " +
      ENGRAVING_STYLES[s.engravingStyle] +
      (s.engravingStyle === "capacity" ? " · " + s.capacityMark : "") +
      ". " +
      (isKit(s)
        ? "Kit customization must be confirmed with its maker."
        : "Order this factory variant before assembly. Capacity text is a cosmetic marking; it does not change storage."),
    1,
    5,
  );
  if (s.bluetooth === "aptx" && !isKit(s))
    add(
      "Wire and test the Bluetooth transmitter",
      "Test analog audio, isolation, antenna placement and the 3.5 mm jack.",
      5,
      55,
    );
  if (s.qi === "on" && s.connectivity !== "moon")
    add(
      "Verify and test kit Qi charging",
      "Confirm that the chosen back kit supports Qi and provides its required charging window. Test alignment, insulation and charging heat.",
      4,
      40,
    );
  if (s.taptic === "kit" && s.connectivity !== "moon")
    add(
      "Test kit-integrated haptics",
      "Confirm the selected back kit includes a haptic driver and motor. Test feedback before closing.",
      4,
      20,
    );
  if (s.taptic === "on" && s.connectivity !== "moon")
    add(
      "Install and test taptic feedback",
      "Follow a proven driver-circuit design and insulate the motor and wiring.",
      5,
      40,
    );
  if (s.airtag === "on")
    add(
      "Fit AirTag and regulated power",
      "Use a regulated 3V supply and verify antenna reception before fixing the board in place.",
      5,
      60,
    );
  add(
    "Finish, test and close",
    s.engraving
      ? "Confirm engraving with the shell vendor before assembly. Check clearances, charging, audio and controls before closing."
      : "Check clearances, charging, audio and controls. Close only when the build is fully tested.",
    3,
    25,
  );
  return steps;
}
export function normalize(input, notices = []) {
  const s = { ...DEFAULT, prices: {} };
  if (!input || typeof input !== "object" || Array.isArray(input)) return s;
  const legacy = input.schemaVersion !== 2;
  for (const k of Object.keys(CATALOG))
    if (CATALOG[k].some((o) => o.id === input[k])) s[k] = input[k];
  for (const key of Object.keys(APPEARANCE)) {
    const original = input[key];
    let id = original;
    if (legacy && key === "finish" && original === "custom")
      id = nearestBack(input.customFinish);
    else if (legacy && Object.hasOwn(LEGACY_IDS[key] ?? {}, original))
      id = LEGACY_IDS[key][original];
    if (APPEARANCE[key].some((p) => p.id === id)) {
      s[key] = id;
      if (id !== original && LEGACY_APPROXIMATE[key]?.includes(original))
        notices.push(
          APPEARANCE_LABELS[key] +
            ": " +
            original +
            " was matched to " +
            appearance(s, key).name +
            ".",
        );
    } else if (original !== undefined)
      notices.push(
        APPEARANCE_LABELS[key] +
          ": unavailable option replaced with " +
          appearance(s, key).name +
          ".",
      );
  }
  if (legacy && !input.hold)
    s.hold = s.body === "thick" ? "hs-thick-black" : "hs-thin-black";
  if (CAPACITIES.includes(input.capacity)) s.capacity = input.capacity;
  for (const k of ["engravingPrice"])
    if (Number.isFinite(input[k]) && input[k] >= 0 && input[k] <= 10000)
      s[k] = input[k];
  s.engraving = String(input.engraving || "").slice(0, 80);
  s.capacityMark = String(
    input.capacityMark ??
      (legacy
        ? s.storage === "hdd"
          ? "80GB"
          : s.capacity >= 1024
            ? s.capacity / 1024 + "TB"
            : s.capacity + "GB"
        : DEFAULT.capacityMark),
  ).slice(0, 24);
  if (["front", "back", "three", "exploded"].includes(input.view))
    s.view = input.view;
  if (["system", "light", "dark"].includes(input.theme)) s.theme = input.theme;
  s.xray = input.xray === true;
  if (["none", "front", "wheel"].includes(input.buttonBundle))
    s.buttonBundle = input.buttonBundle;
  s.preinstalled = input.preinstalled === true;
  const styles = appearance(s, "finish").engravingStyles;
  const desired =
    input.engravingStyle ?? (legacy ? "blank" : DEFAULT.engravingStyle);
  s.engravingStyle = styles.includes(desired) ? desired : styles[0];
  if (input.engravingStyle && !styles.includes(desired))
    notices.push(
      "Engraving style changed to " +
        ENGRAVING_STYLES[s.engravingStyle] +
        " for this back color.",
    );
  if (input.prices && typeof input.prices === "object")
    for (const [k, v] of Object.entries(input.prices))
      if (
        /^[a-z0-9:_-]{1,240}$/.test(k) &&
        Number.isFinite(v) &&
        v >= 0 &&
        v <= 100000
      )
        s.prices[k] = v;
  if (legacy) {
    const old = input.prices ?? {};
    const migrate = (oldKey, newKey) => {
      if (
        Number.isFinite(old[oldKey]) &&
        old[oldKey] >= 0 &&
        old[oldKey] <= 100000
      )
        s.prices[newKey] = old[oldKey];
    };
    migrate("front:" + input.front, appearanceKey(s, "front"));
    migrate("body:" + s.body, appearanceKey(s, "finish"));
    if (
      Number.isFinite(old["body:" + s.body]) &&
      old["body:" + s.body] >= 0 &&
      old["body:" + s.body] <= 100000
    )
      s.prices["back-premium:" + s.finish + ":" + s.body] = 0;
    if (
      Number.isFinite(input.frontPrice) &&
      input.frontPrice !== 22 &&
      input.frontPrice >= 0 &&
      input.frontPrice <= 100000
    )
      s.prices[appearanceKey(s, "front")] = input.frontPrice;
    const wheelQuote =
      old["wheel:" + input.wheel + ":" + input.button] ??
      (input.wheelPrice !== 15 ? input.wheelPrice : undefined);
    if (
      Number.isFinite(wheelQuote) &&
      wheelQuote >= 0 &&
      wheelQuote <= 100000
    ) {
      s.prices[appearanceKey(s, "wheel")] = wheelQuote;
      s.prices[appearanceKey(s, "button")] = 0;
      notices.push(
        "Your saved wheel/button assembly quote is retained; its button is shown at $0.",
      );
    }
    if (!input.hold) {
      s.prices[appearanceKey(s, "hold")] =
        s.body === "thick"
          ? Number.isFinite(old["hold:thick"]) &&
            old["hold:thick"] >= 0 &&
            old["hold:thick"] <= 100000
            ? old["hold:thick"]
            : 20
          : 0;
    }
    if (!input.bezel) s.prices[appearanceKey(s, "bezel")] = 0;
    notices.unshift(
      "Older build restored. Matching EOE colors are selected; original small parts are treated as owned.",
    );
  }
  return s;
}
export const encode = (s) => encodeURIComponent(JSON.stringify(s));
export function decode(hash, notices = []) {
  try {
    const value = JSON.parse(decodeURIComponent(hash.replace(/^#/, "")));
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error("Invalid configuration");
    return normalize(value, notices);
  } catch {
    notices.push(
      "This saved link could not be read. The default build has been restored.",
    );
    return normalize(null);
  }
}
export function csv(rows) {
  const esc = (v) =>
    '"' +
    String(v)
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  return (
    "\uFEFF" +
    [
      ["Group", "Part", "Vendor", "Estimated USD", "Status", "Notes", "Link"],
      ...rows.map((r) => [
        r.group,
        r.name,
        r.vendor,
        r.price.toFixed(2),
        r.included ? "Included" : r.extra ? "Base + estimate" : "Estimate",
        r.description,
        r.url,
      ]),
      [
        "Total",
        "Estimated parts total",
        "",
        rows.reduce((n, r) => n + r.price, 0).toFixed(2),
        "",
        "Excludes tax, shipping, tools and labor.",
        "",
      ],
    ]
      .map((r) => r.map(esc).join(","))
      .join("\r\n")
  );
}
