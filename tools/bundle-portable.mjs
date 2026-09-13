import { build } from "esbuild";
import { fileURLToPath } from "node:url";
const result = await build({
  absWorkingDir: fileURLToPath(new URL("..", import.meta.url)),
  entryPoints: ["dist/app.js"],
  bundle: true,
  write: false,
  format: "esm",
  platform: "browser",
  target: "es2022",
  external: ["three"],
  metafile: true,
});
for (const output of Object.values(result.metafile.outputs))
  for (const entry of output.imports)
    if (entry.external && !/^three(?:\/|$)/.test(entry.path))
      throw new Error("Unexpected portable dependency: " + entry.path);
process.stdout.write(result.outputFiles[0].text);
