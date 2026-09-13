# Classic Studio update: body rules, USB-C port fix, render quality

Three changes to Classic Studio. Keep everything else working, including saved links.

## 1. Thin vs. thick body rules

The body choice (Thin 10.5 mm or Thick 13.5 mm) should drive what else can be selected. Implement these as real rules in the compatibility engine, with the warning text shown inline next to the affected option and summarized in the warnings list. Do not silently deselect anything; show the conflict and offer a one-click "switch to thick" or "switch to thin" fix where that resolves it.

Rules when Thin is selected:

- Bluetooth and USB-C back plate kits (EOE Backplate Kit USB-C & Internal Bluetooth, moonlit.market Classic Connect 2) are thick-body kits. Mark them unavailable with the note "Requires thick body. These kits are built into a thick back plate."
- Qi wireless charging and kit-integrated haptics are only available through those kits, so they inherit the same restriction. A standalone taptic motor stays available in thin.
- AirTag integration is unavailable in thin. Note: "No internal space with a thin back and an extended battery."
- Battery options in thin: stock 550 to 650 mAh, 2000 mAh thin, 3000 mAh thin model, 3800 mAh thin model. The thick-model 3000 mAh and 3800 mAh cells are unavailable.
- Storage adapter restriction tied to the thin extended batteries, taken from EOE's own fit notes:
  - 2000 mAh square: only iFlash Solo, iFlash Quad, iFlash uDUAL, or generic dual microSD.
  - 2000 mAh rectangle, 3000 mAh thin, 3800 mAh thin: only iFlash Quad or iFlash uDUAL.
  - iFlash Sata, M.2 SSD adapters, and CF adapters are unavailable with any thin extended battery. Warning text: "This battery only fits with low-profile adapters (iFlash Quad or uDUAL) under a thin back."
- Thin back plates in the catalog are the only back plate colors offered; hide the thick entries.

Rules when Thick is selected:

- Everything above becomes available. Show a short "Unlocked by thick body" tag on Bluetooth kits, USB-C kits, Qi, AirTag, and the thick 3000 and 3800 mAh batteries the first time the user switches, so it is obvious what the choice bought them.
- Thick body still warns when AirTag, a 3000 mAh or larger battery, and a Bluetooth kit are all selected together: "Tight fit. Plan the internal layout before ordering."
- Thick back plates in the catalog are the only back plate colors offered.

Add a runtime estimate line under the battery picker. Use a simple model: assume 18 mA average draw on Apple firmware with a spinning drive, reduce to about 14 mA with flash storage, add about 10 percent on Rockbox and about 25 percent with Bluetooth active. Show "estimated X to Y hours of audio playback" using 80 percent of the rated capacity as the low end and 100 percent as the high end, and note that aftermarket capacity ratings are optimistic.

## 2. Fix the USB-C port rendering

Screenshot attached. With Thick body selected and the USB-C kit chosen, the USB-C opening renders as a white rectangle with a black oval floating on the front face plate near the bottom, instead of an opening in the bottom edge of the device. The thick back also does not carry the bottom edge with it, so the port region and the bottom strip (`Material.016` mesh) stay at thin depth while the back shell (`Shiney_Back`) is scaled deeper.

Fix it like this:

- Treat the bottom edge as a group: the `Port` mesh, the `Material.016` strip, and the bottom face of `Shiney_Back` move and scale together when the body switches between thin and thick. Compute the new depth from the back shell's bounding box after scaling and reposition the port group so it stays centered on the bottom edge, flush with the back shell surface.
- Render the USB-C opening as a rounded-rectangle cutout on the bottom edge face, oriented along the device's width axis, sized to a real USB-C receptacle (about 8.9 mm by 3.2 mm, which is roughly 0.35 by 0.125 in model units). Give it a slightly recessed dark interior with a thin metallic lip. Never draw it on the front face plate.
- When Original 30-pin is selected, show the wide 30-pin opening in the same location instead (about 21 mm by 2.5 mm).
- The dock bezel color from the Details group tints the lip of whichever opening is shown.
- Add the same treatment for the headphone jack and hold switch on the top edge: a small round hole and a small slider, both moving with the body depth.
- Verify by switching thin to thick and back with each port option and checking the Front, Back, 3/4 and Exploded presets. The opening must stay on the bottom edge in every case.

## 3. Render quality

I want the viewer to look closer to Apple's product pages. Keep Three.js, but upgrade the pipeline:

- Switch to `MeshPhysicalMaterial` everywhere. Use clearcoat on painted and plastic parts, anisotropy on brushed metal, transmission with thickness for transparent parts, and iridescence for the rainbow and polychrome finishes.
- Use a real HDRI environment (a studio softbox HDR loaded with `RGBELoader`, with `PMREMGenerator`) rather than a procedural or single-color environment. Add a subtle ground contact shadow using a shadow-catcher plane or a baked `ContactShadows` style blur.
- Enable ACES filmic tone mapping, sRGB output, and MSAA. Add post-processing with `EffectComposer`: a mild SSAO or GTAO pass, a low-threshold bloom for the screen only, and SMAA.
- Add a very slight beveled edge look to the face plate and back shell. If the mesh has hard edges, either compute smooth normals with an angle threshold or add a thin chamfer geometry along the outline.
- Add a screen glass layer: a transparent plane just above the screen with low roughness and a fresnel reflection, so the display reads as glass over an LCD.
- Add an idle turntable that starts after a few seconds of inactivity and stops on interaction, and ease camera preset transitions.
- If it can be done without hurting load time, consider the Three.js WebGPU renderer with a WebGL fallback. Do not adopt it if it breaks Safari or mobile.
- Do not add a physics engine or a game engine for this. Keep it a single-page app.

Tell me which of these you implemented and what the frame rate looks like on a mid-range laptop and on a phone.
