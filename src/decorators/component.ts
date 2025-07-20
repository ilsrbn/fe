import type { ComponentClass } from "../types";

// biome-ignore lint/suspicious/noExplicitAny: consturctor
export type Constructor<T = ComponentClass> = new (...args: any[]) => T;

export function Component(opts: {
	template: string;
	components?: Record<string, ComponentClass>;
}) {
	// biome-ignore lint/suspicious/noExplicitAny: consturctor
	// biome-ignore lint/complexity/noBannedTypes: consturctor
	return <T extends new (...args: any[]) => {}>(target: T) =>
		class extends target {
			template = opts.template;
			components = opts.components || {};
		};
}
