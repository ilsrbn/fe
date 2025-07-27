import { type Expression, parseSync, type Statement } from "@swc/core";

const span = { start: 0, end: 0, ctxt: 0 };

const expressionCache = new Map<string, Expression>();

export function parseExpression(source: string, transform = true): Expression {
	if (expressionCache.has(source)) {
		return expressionCache.get(source)!;
	}
	const ast = parseSync(source, {
		syntax: "typescript",
		target: "es2022",
		isModule: false,
	});

	let expression: Expression;
	if (ast.body[0]?.type === "ExpressionStatement") {
		expression = ast.body[0].expression;
	} else {
		throw new Error("Failed to parse expression: " + source);
	}

	// Трансформируем все Identifier → this.<id>()
	if (!transform) return expression;
	const wrapped = transformIdentifiers(expression);

	expressionCache.set(source, wrapped);

	return wrapped;
}

function transformIdentifiers(node: Expression): Expression {
	const visit = (node: any): any => {
		if (node.type === "Identifier") {
			return {
				type: "CallExpression",
				span,
				callee: {
					type: "MemberExpression",
					object: { type: "ThisExpression", span },
					property: {
						type: "Identifier",
						value: node.value,
						span,
						optional: false,
					},
					span,
				},
				arguments: [],
				typeArguments: undefined,
			};
		}

		// Рекурсивно обходим всё остальное
		for (const key in node) {
			const val = node[key];
			if (Array.isArray(val)) {
				node[key] = val.map((v) => (typeof v === "object" ? visit(v) : v));
			} else if (typeof val === "object" && val !== null && val.type) {
				node[key] = visit(val);
			}
		}

		return node;
	};

	return visit({ ...node });
}
export function parseStatements(source: string): Statement[] {
	const ast = parseSync(source, {
		syntax: "typescript",
		target: "es2022",
		isModule: false,
	});

	return ast.body as Statement[];
}
