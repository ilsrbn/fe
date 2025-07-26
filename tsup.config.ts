import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/runtime/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    outDir: "dist/runtime",
    clean: true,
    external: ["alien-signals"],
  },
  {
    entry: ["src/plugin/vte.ts"],
    format: ["esm"],
    dts: true,
    outDir: "dist/plugin",
    clean: false,
    external: ["@swc/core", "node:fs", "node:path"],
  },
  {
    entry: ["src/compiler/ast.ts"],
    format: ["esm"],
    dts: true,
    outDir: "dist/compiler",
    clean: false,
    external: ["@swc/core", "node:fs", "node:path"],
  },
]);
