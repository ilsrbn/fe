import type { Expression, ExpressionStatement } from "@swc/core";
import { parseExpression } from "../expression";

const span = { start: 0, end: 0, ctxt: 0 };

export const generateEventListenerStatement = (
	attr: string,
	value: string,
	elVarName: string,
): ExpressionStatement => {
	const eventName = attr.slice(1); // @click → click

	const expr = parseExpression(value, false);

	if ("arguments" in expr) {
		expr.arguments = [
			{
				expression: {
					optional: false,
					type: "Identifier",
					value: "$event",
					span,
				},
			},
		];
	}

	return {
		type: "ExpressionStatement",
		span,
		expression: {
			type: "CallExpression",
			span,
			callee: {
				type: "MemberExpression",
				span,
				object: {
					type: "Identifier",
					value: elVarName,
					span,
					optional: false,
				},
				property: {
					type: "Identifier",
					value: "addEventListener",
					span,
					optional: false,
				},
			},
			arguments: [
				{
					expression: {
						type: "StringLiteral",
						value: eventName,
						span,
					},
				},
				{
					expression: {
						type: "ArrowFunctionExpression",
						span,
						async: false,
						generator: false,
						params: [
							{
								type: "Identifier",
								value: "$event",
								span,
								optional: false,
							},
						],
						body: {
							type: "BlockStatement",
							span,
							stmts: [
								{
									type: "ExpressionStatement",
									span,
									expression: expr, // 👈 теперь можно писать alert('test') или increment()
								},
							],
						},
					},
				},
			],
		},
	};
};

function flattenNestedCallExpression(expr: Expression): Expression {
	if (
		expr.type === "CallExpression" &&
		expr.callee.type === "CallExpression" &&
		expr.callee.arguments.length === 0
	) {
		return {
			...expr,

			callee: expr.callee.callee,
		};
	}

	return expr;
}
