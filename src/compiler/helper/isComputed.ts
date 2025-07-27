import type { ClassMember } from "@swc/core";

export const isComputed = (C_Member: ClassMember): boolean => {
	return (
		C_Member.type === "ClassProperty" &&
		C_Member.value?.type === "CallExpression" &&
		C_Member.value.callee.type === "Identifier" &&
		C_Member.value.callee.value === "computed"
	);
};
