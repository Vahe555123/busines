export type Lang = "ru" | "en" | "hy";

export type Localized = { ru?: string; en?: string; hy?: string };

export function getLocalized(
  value: string | Localized | undefined,
  lang: Lang
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  const v = value as Localized;
  return v[lang] ?? v.ru ?? v.en ?? v.hy ?? "";
}

export function getLocalizedArray(
  value: string[] | { ru?: string[]; en?: string[]; hy?: string[] } | undefined,
  lang: Lang
): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  const v = value as { ru?: string[]; en?: string[]; hy?: string[] };
  return v[lang] ?? v.ru ?? v.en ?? v.hy ?? [];
}
