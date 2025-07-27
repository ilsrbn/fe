import { writeFile } from "node:fs/promises";
import { inspect } from "node:util";
import type { Statement } from "@swc/core";
import * as htmlparser2 from "htmlparser2";
import { generateAppendExpresion } from "./dom-gen/appender";
import { walk } from "./walk";

export const generateRenderFunction = async (
	template: string,
	options: {
		log: boolean;
	},
) => {
	const parsed = htmlparser2.parseDocument(template);
	if (options.log)
		await writeFile(
			"./log/parsed.json",
			inspect(parsed, { depth: null, colors: false }),
		);

	const stmts = await walk(parsed.children);

	const flat = stmts.flatMap((e) => e.stmts);

	flat.push(...generateAppendExpresion(stmts.flatMap((e) => e.varName)));

	return flat;
};
