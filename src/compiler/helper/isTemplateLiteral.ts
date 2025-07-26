import type { ClassMember } from "@swc/core";

export const isTemplateLiteral = (C_Member: ClassMember) => {
  return (
    C_Member.type === "ClassProperty" &&
    C_Member.key.type === "Identifier" &&
    C_Member.key.value === "template" &&
    C_Member.value?.type === "TemplateLiteral"
  );
};
