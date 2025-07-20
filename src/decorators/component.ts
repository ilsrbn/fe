import type { ComponentClass } from "../types";

export type Constructor<T = ComponentClass> = new (...args: unknown[]) => T;

export function Component(options: {
	template: string;
	components?: Record<string, ComponentClass>;
}) {
	return <TFunction extends Constructor>(target: TFunction) => {
		target.prototype.template = options.template;
		target.prototype.components = options.components || {};
	};
}
