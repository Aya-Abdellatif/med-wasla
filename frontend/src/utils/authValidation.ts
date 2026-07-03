const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type PasswordRuleId = "length" | "upper" | "lower" | "number";

export type PasswordRule = {
  id: PasswordRuleId;
  labelKey: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", labelKey: "password.rules.length", test: (p) => p.length >= 8 },
  { id: "upper", labelKey: "password.rules.upper", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", labelKey: "password.rules.lower", test: (p) => /[a-z]/.test(p) },
  { id: "number", labelKey: "password.rules.number", test: (p) => /[0-9]/.test(p) },
];

export function validateEmail(value: string): string | undefined {
  const email = value.trim();

  if (!email) return "email.required";
  if (!emailRegex.test(email)) return "email.invalid";

  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "password.required";

  const failedRules = PASSWORD_RULES.filter((rule) => !rule.test(value));
  if (failedRules.length === 0) return undefined;

  return "password.weak";
}

export function mapRegisterErrorMessage(message: string): {
  field?: "email" | "licenseNumber";
  text: string;
} {
  const lower = message.toLowerCase();

  if (lower.includes("email") && (lower.includes("registered") || lower.includes("exist"))) {
    return { field: "email", text: "register.emailInUse" };
  }

  if (lower.includes("license")) {
    return { field: "licenseNumber", text: message };
  }

  return { text: message };
}
