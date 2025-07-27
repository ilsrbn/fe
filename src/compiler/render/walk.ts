import type { Statement } from "@swc/core";
import { type ChildNode, isTag, isText } from "domhandler";
import { generateElementCreate } from "./dom-gen/element";
import { generateTextInterpolation } from "./dom-gen/interpolation";
import { generateStaticTextNode } from "./dom-gen/interpolation/staticText";

export const walk = async (children: ChildNode[], parentVar?: string) => {
	const result: { varName: string; stmts: Statement[] }[] = [];

	for (const child of children) {
		if (isTag(child)) {
			const el = generateElementCreate(child);
			result.push(el);

			// Рекурсивно вызываем walk для потомков
			const nested = await walk(child.children, el.varName);
			result.push(...nested);
		}

		if (isText(child) && parentVar) {
			if (child.data.includes("{{")) {
				const match = child.data.match(/\{\{\s*([\s\S]+?)\s*\}\}/);
				if (!match) continue;
				const expr = match[1].trim();
				const stmts = await generateTextInterpolation(expr, parentVar);
				result.push({ varName: "", stmts });
			} else {
				const stmts = generateStaticTextNode(child.data, parentVar);
				result.push({ varName: "", stmts });
			}
		}
	}

	return result;
};
