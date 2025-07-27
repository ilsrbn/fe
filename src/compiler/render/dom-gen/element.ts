import type {
	ExpressionStatement,
	Statement,
	VariableDeclaration,
} from "@swc/core";
import type { Element } from "domhandler";
import { getAttributeStatement } from "./attribute";

const span = { start: 0, end: 0, ctxt: 0 };

let idCounter = 0;

export const generateElementCreate = (el: Element) => {
	const varName = `${el.name}_${idCounter++}`; // e.g., div_0, p_1

	const stmts: any[] = [];

	// 1. const elName = document.createElement("div")
	const createDecl: VariableDeclaration = {
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
					span,
					value: varName,
					optional: false,
					typeAnnotation: undefined,
				},
				definite: false,
				init: {
					type: "CallExpression",
					typeArguments: undefined,
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
							value: "createElement",
							optional: false,
						},
					},
					arguments: [
						{
							spread: undefined,
							expression: {
								type: "StringLiteral",
								value: el.name,
								span,
							},
						},
					],
				},
			},
		],
	};

	stmts.push(createDecl);
	Object.keys(el.attribs).forEach((attr) => {
		const attributeStatement = getAttributeStatement(
			attr,
			el.attribs[attr],
			varName,
		);
		stmts.push(attributeStatement);
	});

	return {
		varName,
		stmts,
	};
};

export const generateParentPush = (el: string, parent: string): Statement => {
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
					span,
					value: parent,
					optional: false,
				},
				property: {
					type: "Identifier",
					span,
					value: "appendChild",
					optional: false,
				},
			},
			arguments: [
				{
					spread: undefined,
					expression: {
						type: "Identifier",
						span,
						value: el,
						optional: false,
					},
				},
			],
			typeArguments: undefined,
		},
	};
};
