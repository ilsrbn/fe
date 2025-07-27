export { computed, effect, effectScope, signal } from "alien-signals";

export function readonlySignal<T>(s: () => T): () => T {
	return s.bind(null);
}
