import {
	type Expression,
	ExpressionStatement,
	type Identifier,
	type MemberExpression,
	type Program,
	parseSync,
	type Statement,
} from "@swc/core";
import { DomUtils, parseDocument } from "htmlparser2";

const SPAN = { start: 0, end: 0, ctxt: 0 } as const;
function fillSpans(node: any) {
	// 1) нет ноды или не объект — выход
	if (!node || typeof node !== "object") return;
	// 2) не заходим внутрь самого SPAN
	if (node === SPAN) return;
	// 3) вставляем span, если его нет
	if (node.span === undefined) {
		node.span = SPAN;
	}
	// 4) рекурсивно по всем ключам, кроме 'span'
	for (const key of Object.keys(node)) {
		if (key === "span") continue;
		fillSpans(node[key]);
	}
}
let UID = 0;
function ident(name: string): Identifier {
	return { type: "Identifier", value: name, optional: false, span: SPAN };
}
function strLit(val: string): Expression {
	return { type: "StringLiteral", value: val, span: SPAN } as Expression;
}
function member(obj: Expression, prop: string): Expression {
	return {
		type: "MemberExpression",
		object: obj,
		property: ident(prop),
		computed: false,
		span: SPAN,
	} as MemberExpression;
}
function call(callee: Expression, args: Expression[] = []): Expression {
	return {
		type: "CallExpression",
		callee,
		arguments: args.map((e) => ({ expression: e })),
		span: SPAN,
	} as any;
}
function varDecl(id: Identifier, init: Expression): Statement {
	return {
		type: "VariableDeclaration",
		kind: "const",
		span: SPAN,
		declarations: [
			{ type: "VariableDeclarator", id, init, definite: false, span: SPAN },
		],
	} as Statement;
}
function exprStmt(expr: Expression): Statement {
	return {
		type: "ExpressionStatement",
		expression: expr,
		span: SPAN,
	} as Statement;
}
function effectStmt(stmt: Statement): Statement {
	return exprStmt(
		call(ident("effect"), [
			{
				type: "ArrowFunctionExpression",
				params: [],
				body: { type: "BlockStatement", stmts: [stmt], span: SPAN },
				async: false,
				generator: false,
				span: SPAN,
			} as any,
		]),
	);
}

function validateExpr(src: string): Expression {
	const p = parseSync(src, { syntax: "typescript" }) as Program;
	const expr = (p.body[0] as any).expression as Expression;
	if (expr.type === "Identifier" || expr.type === "MemberExpression") {
		return replaceCtx(expr);
	}
	throw new Error(`Template expression must be identifier/member, got: ${src}`);
}
function replaceCtx(e: Expression): Expression {
	if (e.type === "Identifier") {
		return member(ident("ctx"), (e as any).value);
	}
	if (e.type === "MemberExpression") {
		const me = e as MemberExpression;
		return { ...me, object: replaceCtx(me.object) } as Expression;
	}
	return e;
}

export function compileTemplateSWC(html: string): Expression {
	const decls: Statement[] = [];
	function addGetter(src: string): Identifier {
		const id = ident(`_g${UID++}`);
		const v = ident(`_v${UID++}`);
		// парсим исходное выражение
		const p = parseSync(src, { syntax: "typescript" }) as Program;
		const e = (p.body[0] as any).expression as Expression;
		// fn: (ctx) => { const v=replaceCtx(e); return typeof v==='function'&&v.__isSignal? v(): v }
		const fn = {
			type: "ArrowFunctionExpression",
			params: [ident("ctx")],
			body: {
				type: "BlockStatement",
				stmts: [
					varDecl(v, replaceCtx(e)),
					{
						type: "ReturnStatement",
						argument: {
							type: "ConditionalExpression",
							test: {
								type: "BinaryExpression",
								operator: "&&",
								left: {
									type: "BinaryExpression",
									operator: "===",
									left: {
										type: "UnaryExpression",
										operator: "typeof",
										argument: v,
										span: SPAN,
									},
									right: strLit("function"),
									span: SPAN,
								},
								right: member(v, "__isSignal"),
								span: SPAN,
							},
							consequent: call(v, []),
							alternate: v,
						},
						span: SPAN,
					},
				],
				span: SPAN,
			},
			async: false,
			generator: false,
			span: SPAN,
		} as any;
		decls.push(varDecl(id, fn));
		return id;
	}
	// ────────────────────────────────────────────────────────────────
	const doc = parseDocument(html, { lowerCaseAttributeNames: false });
	const nodes = DomUtils.getChildren(doc);
	const stmts: Statement[] = [];
	const frag = ident("frag");
	// Только создаём фрагмент (без decls!)
	stmts.push(
		varDecl(frag, call(member(ident("document"), "createDocumentFragment"))),
	);

	function walk(items: any[], parent: Identifier) {
		for (const node of items) {
			if (DomUtils.isText(node)) {
				// разбиваем на статические/динамические сегменты
				const parts = node.data.split(/\{\{([\s\S]+?)\}\}/g);
				parts.forEach((seg, i) => {
					if (i % 2 === 0) {
						// --- статический текст ---
						if (seg) {
							const tStatic = ident(`t${UID++}`);
							// 1) const tStatic = document.createTextNode(seg);
							stmts.push(
								varDecl(
									tStatic,
									call(member(ident("document"), "createTextNode"), [
										strLit(seg),
									]),
								),
							);
							// 2) parent.appendChild(tStatic)
							stmts.push(
								exprStmt(call(member(parent, "appendChild"), [tStatic])),
							);
						}
					} else {
						// --- динамический сегмент ---
						const getterId = addGetter(seg.trim());
						const tDyn = ident(`t${UID++}`);
						// 1) const tDyn = document.createTextNode("");
						stmts.push(
							varDecl(
								tDyn,
								call(member(ident("document"), "createTextNode"), [strLit("")]),
							),
						);
						// 2) parent.appendChild(tDyn)
						stmts.push(exprStmt(call(member(parent, "appendChild"), [tDyn])));
						// 3) effect(() => { tDyn.textContent = getter(ctx) })
						stmts.push(
							effectStmt(
								exprStmt({
									type: "AssignmentExpression",
									operator: "=",
									left: member(tDyn, "textContent"),
									right: call(getterId, [ident("ctx")]),
									span: SPAN,
								} as any),
							),
						);
					}
				});
			} else if ((node as any).name) {
				const name = (node as any).name;
				const el = ident(`el${UID++}`);
				stmts.push(
					varDecl(
						el,
						call(member(ident("document"), "createElement"), [strLit(name)]),
					),
				);
				const attribs = (node as any).attribs || {};
				for (const [k, v] of Object.entries(attribs)) {
					if (k.startsWith(":")) {
						const getter = validateExpr((v as string).trim());
						stmts.push(
							effectStmt(
								exprStmt(
									call(member(el, "setAttribute"), [
										strLit(k.slice(1)),
										call(getter, [ident("ctx")]),
									]),
								),
							),
						);
					} else if (k.startsWith("@")) {
						const cb = validateExpr((v as string).trim());
						stmts.push(
							exprStmt(
								call(member(el, "addEventListener"), [strLit(k.slice(1)), cb]),
							),
						);
					} else {
						stmts.push(
							exprStmt(
								call(member(el, "setAttribute"), [
									strLit(k),
									strLit(v as string),
								]),
							),
						);
					}
				}
				walk(DomUtils.getChildren(node as any), el);
				stmts.push(exprStmt(call(member(parent, "appendChild"), [el])));
			}
		}
	}

	walk(nodes, frag);
	const bodyStmts = [
		...decls,
		...stmts,
		{
			type: "ReturnStatement",
			argument: frag,
			span: SPAN,
		} as Statement,
	];
	// и только теперь склеиваем decls+stmts в тело render-функции
	const renderFn = {
		type: "ArrowFunctionExpression",
		params: [ident("ctx"), ident("emit")],
		body: { type: "BlockStatement", stmts: bodyStmts, span: SPAN },
		async: false,
		generator: false,
		span: SPAN,
	} as Expression;

	// ── именно здесь заполняем все пропущенные span ──
	fillSpans(renderFn);

	return renderFn;
}
