import type { ExpressionStatement } from "@swc/core";

const span = { ctxt: 0, end: 0, start: 0 };

export const generateStaticAttributeStatement = (
  name: string,
  value: string,
  parentName: string,
): ExpressionStatement => {
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
          value: parentName,
          optional: false,
        },
        property: {
          type: "Identifier",
          span,
          value: "setAttribute",
          optional: false,
        },
      },
      arguments: [
        {
          spread: undefined,
          expression: {
            type: "StringLiteral",
            span,
            value: name,
          },
        },
        {
          spread: undefined,
          expression: {
            type: "StringLiteral",
            span,
            value,
          },
        },
      ],
      typeArguments: undefined,
    },
  };
};
