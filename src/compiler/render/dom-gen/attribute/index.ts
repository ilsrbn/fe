import type { ExpressionStatement } from "@swc/core";
import { generateStaticAttributeStatement } from "./static";
import { generateDynamicAttributeStatement } from "./dynamic";
import { generateEventListenerStatement } from "./event";

export const getAttributeStatement = (
  name: string,
  value: string,
  parentName: string,
): ExpressionStatement => {
  if (name.startsWith("@"))
    return generateEventListenerStatement(name, value, parentName);
  if (name.startsWith(":"))
    return generateDynamicAttributeStatement(name, value, parentName);
  return generateStaticAttributeStatement(name, value, parentName);
};
