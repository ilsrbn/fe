import type { ExpressionStatement } from "@swc/core";

const span = { start: 0, end: 0, ctxt: 0 };

export const generateEventListenerStatement = (
  attr: string,
  value: string,
  elVarName: string,
): ExpressionStatement => {
  const eventName = attr.slice(1); // @click → click

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
          value: elVarName,
          span,
          optional: false,
        },
        property: {
          type: "Identifier",
          value: "addEventListener",
          span,
          optional: false,
        },
      },
      arguments: [
        {
          expression: {
            type: "StringLiteral",
            value: eventName,
            span,
          },
        },
        {
          expression: {
            type: "CallExpression",
            span,
            callee: {
              type: "MemberExpression",
              span,
              object: {
                type: "MemberExpression",
                span,
                object: {
                  type: "ThisExpression",
                  span,
                },
                property: {
                  type: "Identifier",
                  value: value,
                  optional: false,
                  span,
                },
              },
              property: {
                type: "Identifier",
                value: "bind",
                optional: false,
                span,
              },
            },
            arguments: [
              {
                expression: {
                  type: "ThisExpression",
                  span,
                },
              },
            ],
          },
        },
      ],
    },
  };
};
