import type {
	ExpressionStatement,
	Statement,
	VariableDeclaration,
} from "@swc/core";
import { parseExpression } from "../expression";

const span = { start: 0, end: 0, ctxt: 0 };
let counter = 0;

export async function generateTextInterpolation(
	expressionSource: string,
	parentVarName: string,
): Promise<Statement[]> {
	const textVar = `txt_${counter++}`;

	const createText: VariableDeclaration = {
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
					value: textVar,
					span,
					optional: false,
					typeAnnotation: undefined,
				},
				definite: false,
				init: {
					type: "CallExpression",
					span,
					callee: {
						type: "MemberExpression",
						span,
						object: {
							type: "Identifier",
							value: "document",
							span,
							optional: false,
						},
						property: {
							type: "Identifier",
							value: "createTextNode",
							span,
							optional: false,
						},
					},
					arguments: [
						{ expression: { type: "StringLiteral", value: "", span } },
					],
					typeArguments: undefined,
				},
			},
		],
	};

	const appendText: ExpressionStatement = {
		type: "ExpressionStatement",
		span,
		expression: {
			type: "CallExpression",
			span,
			callee: {
				type: "MemberExpression",
				span,
				object: {
					optional: false,
					type: "Identifier",
					value: parentVarName,
					span,
				},
				property: {
					optional: false,
					type: "Identifier",
					value: "appendChild",
					span,
				},
			},
			arguments: [
				{
					expression: {
						optional: false,
						type: "Identifier",
						value: textVar,
						span,
					},
				},
			],
			typeArguments: undefined,
		},
	};

	// Парсим выражение как Program → Expression
	const parsed = parseExpression(expressionSource, false);

	const effectExpr: ExpressionStatement = {
		type: "ExpressionStatement",
		span,
		expression: {
			type: "CallExpression",
			callee: { optional: false, type: "Identifier", value: "_effect", span },
			arguments: [
				{
					expression: {
						type: "ArrowFunctionExpression",
						async: false,
						generator: false,
						span,
						params: [],
						body: {
							span,
							type: "BlockStatement",
							stmts: [
								{
									type: "ExpressionStatement",
									span,
									expression: {
										type: "AssignmentExpression",
										span,
										operator: "=",
										left: {
											type: "MemberExpression",
											span,
											object: {
												optional: false,
												type: "Identifier",
												value: textVar,
												span,
											},
											property: {
												optional: false,
												type: "Identifier",
												value: "nodeValue",
												span,
											},
										},
										right: parsed,
									},
								},
							],
						},
					},
				},
			],
			span,
		},
	};

	return [createText, appendText, effectExpr];
}
