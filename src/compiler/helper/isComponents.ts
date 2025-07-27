import type { ClassMember } from "@swc/core";

export const isComponents = (C_Member: ClassMember) => {
	return (
		C_Member.type === "ClassProperty" &&
		C_Member.key.type === "Identifier" &&
		C_Member.key.value === "components"
	);
};
