import type { Plugin } from "vite";
import { transformComponent } from "../compiler/transform";

export function FePlugin(): Plugin {
	return {
		name: "fe-transform",
		enforce: "pre",
		async transform(code, id) {
			if (
				!id.endsWith(".ts") ||
				id.includes("node_modules") ||
				!id.includes("src") ||
				id.includes("dist")
			)
				return;

			try {
				const result = await transformComponent(code);
				return { code: result, map: null };
			} catch (e) {
				console.error(`[fe-transform] Failed to transform ${id}`, e);
				return null;
			}
		},
	};
}
