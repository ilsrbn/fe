import type { PathLike } from "node:fs";
import { type FileHandle, readFile } from "node:fs/promises";
import {
  type ClassExpression,
  type ClassMethod,
  type ClassProperty,
  type Module,
  type ParseOptions,
  parse,
  type StringLiteral,
  type TemplateLiteral,
} from "@swc/core";
import { errAsync, ok, type Result } from "neverthrow";
import { isMethod } from "./helper/isMethod";
import { isSignal } from "./helper/isSignal";
import { isTemplate } from "./helper/isTemplate";
import { isTemplateLiteral } from "./helper/isTemplateLiteral";

const options: ParseOptions = {
  syntax: "typescript",
};

export type AST = {
  name: string;
  signals: ClassProperty[];
  methods: ClassMethod[];
  ast: Module;
  declaration: ClassExpression;
  templateProperty: ClassProperty;
  template: string;
};

export const generateScriptAst = async (
  code: string,
): Promise<Result<AST, string>> => {
  console.log(code);
  const ast = await parse(code, options);

  const exportD = ast.body.find(
    (node) => node.type === "ExportDefaultDeclaration",
  );
  if (!exportD) return errAsync("'export default' not found!");

  const isClassDeclaration = exportD.decl.type === "ClassExpression";
  if (!isClassDeclaration)
    return errAsync("'export default' need to be class declaration!");

  const declaration = exportD.decl as unknown as ClassExpression;

  const name = declaration.identifier?.value || "";

  let templateProperty: ClassProperty | undefined;
  let template: string | undefined;
  const signals: ClassProperty[] = [];
  const methods: ClassMethod[] = [];

  for (const C_Member of declaration.body) {
    if (isTemplate(C_Member)) {
      templateProperty = C_Member as ClassProperty;
      template = (templateProperty.value as StringLiteral).value;
      continue;
    }
    if (isTemplateLiteral(C_Member)) {
      templateProperty = C_Member as ClassProperty;
      template = (templateProperty.value as TemplateLiteral).quasis[0].cooked;
      continue;
    }
    if (isSignal(C_Member)) {
      signals.push(C_Member as ClassProperty);
      continue;
    }
    if (isMethod(C_Member)) {
      methods.push(C_Member as ClassMethod);
    }
  }

  if (!templateProperty || !template)
    throw new Error("'template' property must be provided");

  return ok({
    name,
    signals,
    methods,
    ast,
    declaration,
    templateProperty,
    template,
  });
};
