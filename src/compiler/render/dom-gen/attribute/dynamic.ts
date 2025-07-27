import type { ExpressionStatement } from "@swc/core";
import { parseExpression } from "../expression";

const span = { start: 0, end: 0, ctxt: 0 };

export const generateDynamicAttributeStatement = (
	attr: string,
	value: string,
	elVarName: string,
): ExpressionStatement => {
	const parsedValue = parseExpression(value, false);
	return {
		type: "ExpressionStatement",
		span,
		expression: {
			type: "CallExpression",
			span,
			callee: {
				optional: false,
				type: "Identifier",
				value: "_effect",
				span,
			},
			arguments: [
				{
					expression: {
						type: "ArrowFunctionExpression",
						span,
						async: false,
						generator: false,
						params: [],
						body: {
							type: "BlockStatement",
							span,
							stmts: [
								{
									type: "ExpressionStatement",
									span,
									expression: {
										type: "CallExpression",
										typeArguments: undefined,
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
												value: "setAttribute",
												span,
												optional: false,
											},
										},
										arguments: [
											{
												expression: {
													type: "StringLiteral",
													value: attr.replace(":", ""),
													span,
												},
											},
											{
												expression: parsedValue,
											},
										],
									},
								},
							],
						},
					},
				},
			],
		},
	};
};
