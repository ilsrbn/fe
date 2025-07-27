export async function mount(
	ComponentClass: any,
	target: Element | DocumentFragment,
) {
	const instance = new ComponentClass();

	if (typeof instance.__render !== "function") {
		console.info(instance);
		throw new Error(
			"Component is missing __render method. Did you compile it?",
		);
	}

	const rendered = await instance.__render();
	if (!(rendered instanceof Node)) {
		throw new Error("__render() must return a DOM Node or Fragment");
	}

	target.appendChild(rendered);
}
