import type { TFunction } from "i18next";

/** Translate a validation namespace key or pass through API messages. */
export function translateError(t: TFunction, message?: string): string | undefined {
  if (!message) return undefined;
  if (message.includes(" ")) return message;
  return t(message, { ns: "validation", defaultValue: message });
}
