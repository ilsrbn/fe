import type { ComponentClass, ComponentInstance } from "../types";

export function compileTemplate(
	template: string,
	instance: ComponentInstance,
): DocumentFragment {
	const container = document.createElement("div");
	container.innerHTML = template;

	const components = instance.components || {};
	Object.entries(components).forEach(([tagName, ComponentClass]) => {
		const elements = container.querySelectorAll(tagName);
		elements.forEach((el) => {
			const childInstance = new (ComponentClass as ComponentClass)();
			const rendered = compileTemplate(childInstance.template, childInstance);
			el.replaceWith(rendered);
		});
	});

	const textNodes: Text[] = [];
	const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
	while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

	for (const node of textNodes) {
		const parts = node.textContent?.split(/({{\s*[\w]+\s*}})/g);
		if (!parts || parts.length === 1) continue;

		const fragment = document.createDocumentFragment();

		for (const part of parts) {
			const match = part.match(/^{{\s*([\w]+)\s*}}$/);
			if (match) {
				const key = match[1] as keyof typeof instance;
				const getter = instance[key];
				if (typeof getter === "function") {
					const textNode = document.createTextNode("");
					fragment.appendChild(textNode);
					import("alien-signals").then(({ effect }) =>
						effect(() => {
							textNode.textContent = getter().toString();
						}),
					);
				}
			} else {
				fragment.appendChild(document.createTextNode(part));
			}
		}

		node.parentNode?.replaceChild(fragment, node);
	}

	const allElements = container.querySelectorAll("*");
	allElements.forEach((el) => {
		Array.from(el.attributes).forEach((attr) => {
			const eventMatch = attr.name.match(/^@([a-zA-Z]+)$/);
			if (eventMatch) {
				const eventName = eventMatch[1] as keyof HTMLElementEventMap;
				const handlerName = attr.value.trim();
				const handlerFn = instance[handlerName];
				if (typeof handlerFn === "function") {
					el.addEventListener(eventName, handlerFn.bind(instance));
				}
				el.removeAttribute(attr.name);
			}
		});
	});

	const frag = document.createDocumentFragment();
	Array.from(container.childNodes).forEach((node) => frag.appendChild(node));
	return frag;
}
