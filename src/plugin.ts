import {
	type ClassDeclaration,
	type ClassProperty,
	ExportDeclaration,
	Identifier,
	type Identifier as IdentifierAST,
	type Program,
	parseSync,
	printSync,
} from "@swc/core";
import type { Plugin } from "vite";
import { compileTemplateSWC } from "./core/compiler";

export default function vaporPluginSwc(): Plugin {
	return {
		name: "vapor:swc",
		enforce: "pre",
		transform(code, id) {
			if (!/\.[cm]?tsx?$/.test(id)) return null;

			const ast = parseSync(code, {
				syntax: "typescript",
				tsx: true,
				decorators: true,
				target: "es2022",
			}) as Program;

			let modified = false;
			const fillCtxt = (node: any) => {
				if (!node || typeof node !== "object") return;
				if (node.span && node.span.ctxt == null) node.span.ctxt = 0;
				for (const key of Object.keys(node)) fillCtxt(node[key]);
			};
			fillCtxt(ast);

			for (const stmt of ast.body) {
				if (stmt.type !== "ExportDeclaration") continue;
				if (stmt.declaration.type !== "ClassDeclaration") continue;

				const cls = stmt.declaration as ClassDeclaration;

				// Правильно достаём массив ClassMember[]
				const members = cls.body; // ClassBody node

				// Находим template
				const idx = members.findIndex(
					(m) =>
						m.type === "ClassProperty" &&
						(m.key as IdentifierAST).value === "template",
				);
				if (idx === -1) continue;
				const prop = members[idx] as ClassProperty;

				// 1) Вытащить «сырое» содержимое шаблона
				let rawTpl = "";
				const init = prop.value;
				if (init) {
					if (init.type === "TemplateLiteral") {
						// TemplateLiteral (SWC может называть его Tpl)
						rawTpl = init.quasis.map((q: any) => q.raw).join("");
					} else if (init.type === "StringLiteral") {
						// А если просто строка
						rawTpl = init.value;
					} else {
						// На случай чего-то ещё — берём свойство raw или value
						rawTpl = (
							(init as any).raw ??
							(init as any).value ??
							""
						).toString();
					}
				}

				// 2) Скомпилировать в AST-функцию
				const renderFn = compileTemplateSWC(rawTpl);

				// 3) Заменяем template на __render в одном шаге
				members.splice(idx, 1, {
					type: "ClassProperty",
					key: {
						type: "Identifier",
						value: "__render",
						span: { ...prop.span, ctxt: 0 },
					},
					value: renderFn,
					span: { ...prop.span, ctxt: 0 },
				} as any);

				modified = true;
			}

			if (!modified) return null;

			fillCtxt(ast);

			const out = printSync(ast).code;
			return { code: out, map: null };
		},
	};
}
