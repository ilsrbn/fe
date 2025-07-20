// types.ts
export type Reactive<T> = ReturnType<typeof import("alien-signals").signal<T>>;
export type R_Reactive<T> = ReturnType<
	typeof import("alien-signals").computed<T>
>;
export type Effect = ReturnType<typeof import("alien-signals").effect>;

export interface ComponentInstance {
	template: string;
	components?: Record<string, ComponentClass>;

	[key: string]: unknown;
}

export type ComponentClass<T extends ComponentInstance = ComponentInstance> =
	new () => T;
