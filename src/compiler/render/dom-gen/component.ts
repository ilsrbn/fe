import type { Expression, Statement } from "@swc/core";
import { parseExpression, parseStatements } from "./expression";

type ComponentMount = {
	varName: string;
	stmts: Statement[];
};

export const generateComponentMount = (
	tagName: string,
	parentVar?: string,
): ComponentMount => {
	const span = { start: 0, end: 0, ctxt: 0 };
	const varName = `cmp_${Math.random().toString(36).slice(2, 8)}`;
	const statements: Statement[] = [];

	const isAsync = true; // можно попытаться определить в рантайме?

	if (isAsync) {
		const expr = parseStatements(
			`const import_${varName} = await this.components["${tagName}"]();
           const ${varName} = await new import_${varName}.default().__render();`,
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
	} else {
		// Для sync варианта:
		statements.push({
			type: "VariableDeclaration",
			kind: "const",
			span,
			declare: false,
			declarations: [
				{
					type: "VariableDeclarator",
					span,
					id: {
						type: "Identifier",
						value: varName,
						span,
						optional: false,
					},
					definite: false,
					init: parseExpression(
						`this.components["${tagName}"].__render()`,
						false,
					),
				},
			],
		});
		parentVar &&
			statements.push({
				type: "ExpressionStatement",
				span,
				expression: parseExpression(
					`${parentVar}.appendChild(${varName})`,
					false,
				),
			});
	}
	return { varName, stmts: statements };
};
