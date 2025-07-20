import { compileTemplate } from "../core/compiler";
import type { ComponentClass, ComponentInstance } from "../types";

export function mount<T extends ComponentInstance>(
	ComponentClass: ComponentClass<T>,
	mountPoint: HTMLElement,
): void {
	const instance = new ComponentClass();
	const fragment = compileTemplate(instance.template, instance);
	mountPoint.appendChild(fragment);
}
