import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	build: {
		outDir: "dist",
		lib: {
			entry: "./src/index.ts",
			name: "fe",
			fileName: "fe",
			formats: ["es"], // можно добавить 'cjs' при необходимости
		},
	},
	plugins: [dts()],
});
