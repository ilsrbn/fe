import type { ClassMember } from "@swc/core";

export const isMethod = (C_Member: ClassMember): boolean => {
  return C_Member.type === "ClassMethod";
};
