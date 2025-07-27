type Constructor<T> = new (...args: any[]) => T;
type Scope = string | symbol;

const globalInstances = new WeakMap<Constructor<any>, any>();
const scopedInstances = new Map<Scope, WeakMap<Constructor<any>, any>>();

interface InjectOptions {
	scope?: Scope;
}

export function inject<T>(Service: Constructor<T>, options?: InjectOptions): T {
	if (options?.scope) {
		let scopeMap = scopedInstances.get(options.scope);
		if (!scopeMap) {
			scopeMap = new WeakMap();
			scopedInstances.set(options.scope, scopeMap);
		}

		let instance = scopeMap.get(Service);
		if (!instance) {
			instance = new Service();
			scopeMap.set(Service, instance);
		}

		return instance;
	}

	let instance = globalInstances.get(Service);
	if (!instance) {
		instance = new Service();
		globalInstances.set(Service, instance);
	}

	return instance;
}
