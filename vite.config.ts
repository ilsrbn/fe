// ===== vite.config.ts =====

import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import vaporPluginSwc from "./src/plugin";

export default defineConfig({
	plugins: [vaporPluginSwc(), dts({ insertTypesEntry: true })],
	optimizeDeps: {
		exclude: ["@swc/core"],
	},
	build: {
		lib: {
			entry: {
				index: resolve(__dirname, "src/index.ts"),
				plugin: resolve(__dirname, "src/plugin.ts"),
			},
			formats: ["es", "cjs"],
			fileName: (format, name) =>
				format === "es" ? `${name}.es.js` : `${name}.cjs`,
		},
		rollupOptions: {
			external: ["@swc/core", "alien-signals"],
		},
	},
	assetsInclude: ["**/*.node"],
});
