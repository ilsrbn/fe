import type {
	ExpressionStatement,
	Statement,
	VariableDeclaration,
} from "@swc/core";

const span = { start: 0, end: 0, ctxt: 0 };
let counter = 0;

export function generateStaticTextNode(
	text: string,
	parentVarName: string,
): Statement[] {
	const textVar = `static_txt_${counter++}`;

	const createText: VariableDeclaration = {
		type: "VariableDeclaration",
		kind: "const",
		span,
		declare: false,
		declarations: [
			{
				type: "VariableDeclarator",
				span,
				definite: false,
				id: {
					type: "Identifier",
					value: textVar,
					span,
					optional: false,
				},
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
						{
							expression: {
								type: "StringLiteral",
								value: text,
								span,
							},
						},
					],
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
					type: "Identifier",
					value: parentVarName,
					span,
					optional: false,
				},
				property: {
					type: "Identifier",
					value: "appendChild",
					span,
					optional: false,
				},
			},
			arguments: [
				{
					expression: {
						type: "Identifier",
						value: textVar,
						span,
						optional: false,
					},
				},
			],
		},
	};

	return [createText, appendText];
}
