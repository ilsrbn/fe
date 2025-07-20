import { computed, signal } from "alien-signals";
export { signal, computed };
export type Emit = (event: string, payload?: any) => void;
export interface ComponentInstance {
	__render: (ctx: any, emit: Emit) => DocumentFragment;
	__emit: Emit;
	[key: string]: any;
}
export function mount(Clazz: new () => ComponentInstance, host: HTMLElement) {
	const inst = new Clazz();
	const bus: Record<string, Set<(p?: any) => void>> = {};
	inst.__emit = (e: string, p?: any) => bus[e]?.forEach((fn) => fn(p));

	const ctx = new Proxy(inst, {
		get(target, prop) {
			const v = (target as any)[prop];
			if (typeof v === "function" && !(v as any).__isSignal)
				return v.bind(target);
			return v;
		},
	});

	const frag = inst.__render(ctx, inst.__emit);
	host.appendChild(frag);
}
