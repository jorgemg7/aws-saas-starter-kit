import { build } from "esbuild";

await build({
  entryPoints: ["src/handlers/api.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  sourcemap: true,
});

console.log("✅ Backend compilado");
