type ClassPart = string | false | null | undefined;

export const cx = (...parts: readonly ClassPart[]): string => parts.filter(Boolean).join(' ');
