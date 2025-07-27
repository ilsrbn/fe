import type { Expression, Statement } from "@swc/core";
import type { Element } from "domhandler";
import type { Walk_Options } from "../types";
import { parseExpression, parseStatements } from "./expression";

type ComponentMount = {
	varName: string;
	stmts: Statement[];
};

export const generateComponentMount = (
	tag: Element,
	{ parentVar, AST }: Walk_Options,
): ComponentMount => {
	const { name: tagName } = tag;
	const span = { start: 0, end: 0, ctxt: 0 };
	const varName = `cmp_${tagName}_${Math.random().toString(36).slice(2, 8)}`;
	const statements: Statement[] = [];
	const templateAttributes = tag.attributes
		.filter((attr) => attr.name.startsWith("$"))
		.map((attr) => ({ value: attr.value, name: attr.name.replace("$", "") }));

	const handlers = templateAttributes.map((attr) => {
		let handler: string | undefined;
		if (
			AST.methods.some(
				(attrib) =>
					attrib.key.type === "Identifier" && attrib.key.value === attr.value,
			)
		) {
			handler = `${attr.value}`;
		} else if (
			AST.computed.some(
				(comp) =>
					comp.key.type === "Identifier" && comp.key.value === attr.value,
			) ||
			AST.signals.some(
				(sig) => sig.key.type === "Identifier" && sig.key.value === attr.value,
			)
		) {
			handler = `_readonlySignal(${attr.value})`;
		} else handler = `${attr.value}`;
		return `${attr.name}: ${handler}`;
	});

	const handlersString = !handlers.length
		? ""
		: "{" + handlers.join(", ") + "}";
	const expr = parseStatements(
		`const import_${varName} = await this.components["${tagName}"]();
         const ${varName} = await new import_${varName}.default(${handlersString}).__render();`,
	);
	// Пример для async-компонента
	statements.push(...expr);
	parentVar &&
		statements.push({
			type: "ExpressionStatement",
			span,
			expression: parseExpression(
				`${parentVar}.appendChild(${varName})`,
				false,
			) as Expression,
		});

	return { varName, stmts: statements };
};
