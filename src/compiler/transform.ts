import {
	type ClassMember,
	type ClassMethod,
	type ExportDefaultDeclaration,
	print,
} from "@swc/core";
import { generateScriptAst } from "./ast";
import { generateRenderFunction } from "./render";

const span = { start: 0, end: 0, ctxt: 0 };

export async function transformComponent(code: string) {
	const result = await generateScriptAst(code);
	const v = result.unwrapOr(null);
	if (!v) return undefined;
	const statements = await generateRenderFunction(v.template, { log: false });

	const renderMethod: ClassMethod = {
		type: "ClassMethod",
		span,
		key: { type: "Identifier", value: "__render", span, optional: false },
		isOptional: false,
		function: {
			params: [],
			span,
			async: true,
			generator: false,
			body: {
				span,
				type: "BlockStatement",
				stmts: statements, // 👈 сюда твой массив
			},
		},
		isStatic: false,
		kind: "method",
		accessibility: undefined,
		isAbstract: false,
		isOverride: false,
	};
	const idx = v.ast.body.findIndex(
		(el) => el.type === "ExportDefaultDeclaration",
	);
	(
		(v.ast.body[idx] as ExportDefaultDeclaration).decl.body as ClassMember[]
	).push(renderMethod);
	const { code: transformed } = await print(v.ast);
	return transformed;
}
