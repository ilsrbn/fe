import type { Statement } from "@swc/core";
import { type ChildNode, isTag, isText } from "domhandler";
import { AST } from "../ast";
import { isPascalComponent } from "../helper/isPascalComponent";
import { generateComponentMount } from "./dom-gen/component";
import { generateElementCreate, generateParentPush } from "./dom-gen/element";
import { generateTextInterpolation } from "./dom-gen/interpolation";
import { generateStaticTextNode } from "./dom-gen/interpolation/staticText";
import type { Walk_Options } from "./types";

export const walk = async (
	children: ChildNode[],
	{ parentVar, AST }: Walk_Options,
) => {
	const result: { varName: string; stmts: Statement[] }[] = [];

	for (const child of children) {
		if (isTag(child) && isPascalComponent(child.name)) {
			const { stmts, varName } = generateComponentMount(child, {
				parentVar,
				AST,
			});
			result.push({ varName: !parentVar ? varName : "", stmts });
			continue;
		}
		if (isTag(child) && !isPascalComponent(child.name)) {
			const el = generateElementCreate(child);
			result.push({ varName: !parentVar ? el.varName : "", stmts: el.stmts });

			// Рекурсивно вызываем walk для потомков
			const nested = await walk(child.children, { AST, parentVar: el.varName });
			result.push(...nested);
			if (parentVar) {
				result.push({
					varName: "",
					stmts: [generateParentPush(el.varName, parentVar)],
				});
			}
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
