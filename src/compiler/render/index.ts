import { writeFile } from "node:fs/promises";
import { inspect } from "node:util";
import type { Statement } from "@swc/core";
import * as htmlparser2 from "htmlparser2";
import type { AST } from "../ast";
import { generateAppendExpresion } from "./dom-gen/appender";
import { parseStatements } from "./dom-gen/expression";
import { walk } from "./walk";

export const generateRenderFunction = async (
	AST: AST,
	options: {
		log: boolean;
	},
) => {
	const template = AST.template;
	const parsed = htmlparser2.parseDocument(template, {
		lowerCaseTags: false,
		lowerCaseAttributeNames: false,
	});
	if (options.log)
		await writeFile(
			"./log/parsed.json",
			inspect(parsed, { depth: null, colors: false }),
		);

	const stmts = await walk(parsed.children, { AST });
	const importStatement = parseStatements(`const fe = await import('fe');
	const _computed = fe.computed;
	const _signal = fe.signal;
	const _effect = fe.effect;
	const _effectScope = fe.effectScope;
	const _readonlySignal = fe.readonlySignal;
	`);

	const flat = stmts.flatMap((e) => e.stmts);

	flat.push(...generateAppendExpresion(stmts.flatMap((e) => e.varName)));

	flat.unshift(...importStatement);
	return flat;
};
