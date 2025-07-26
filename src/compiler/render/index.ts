import { writeFile } from "node:fs/promises";
import { inspect } from "node:util";
import type { Statement } from "@swc/core";
import * as htmlparser2 from "htmlparser2";
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
  return stmts
    .flatMap((e) => e.stmts)
    .filter((s): s is Statement => Boolean(s && s.type)); // 💡 обязательно
};
