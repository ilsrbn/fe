import type { Statement } from "@swc/core";

const span = { start: 0, end: 0, ctxt: 0 };

export const generateAppendExpresion = (varNames: string[]) => {
	const stmts: Statement[] = [];
	stmts.push({
		type: "VariableDeclaration",
		span,
		kind: "const",
		declare: false,
		declarations: [
			{
				type: "VariableDeclarator",
				span,
				id: {
					type: "Identifier",
					span,
					value: "_fragment",
					optional: false,
					typeAnnotation: undefined,
				},
				init: {
					type: "CallExpression",
					span,
					callee: {
						type: "MemberExpression",
						span,
						object: {
							type: "Identifier",
							span,
							value: "document",
							optional: false,
						},
						property: {
							type: "Identifier",
							span,
							value: "createDocumentFragment",
							optional: false,
						},
					},
					arguments: [],
					typeArguments: undefined,
				},
				definite: false,
			},
		],
	});
	for (const varName of varNames.filter((v) => !!v)) {
		stmts.push({
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
						span,
						value: "_fragment",
						optional: false,
					},
					property: {
						type: "Identifier",
						span,
						value: "append",
						optional: false,
					},
				},
				arguments: [
					{
						spread: undefined,
						expression: {
							type: "Identifier",
							span,
							value: varName,
							optional: false,
						},
					},
				],
				typeArguments: undefined,
			},
		});
	}
	stmts.push({
		type: "ReturnStatement",
		span,
		argument: {
			type: "Identifier",
			span,
			value: "_fragment",
			optional: false,
		},
	});
	return stmts;
};
