const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type PasswordRule = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "One number", test: (p) => /[0-9]/.test(p) },
];

export function validateEmail(value: string): string | undefined {
  const email = value.trim();

  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Enter a valid email address";

  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Password is required";

  const failedRules = PASSWORD_RULES.filter((rule) => !rule.test(value));
  if (failedRules.length === 0) return undefined;

  return "Password is not strong enough";
}

export function mapRegisterErrorMessage(message: string): {
  field?: "email" | "licenseNumber";
  text: string;
} {
  const lower = message.toLowerCase();

  if (lower.includes("email") && (lower.includes("registered") || lower.includes("exist"))) {
    return { field: "email", text: "This email is already in use" };
  }

  if (lower.includes("license")) {
    return { field: "licenseNumber", text: message };
  }

  return { text: message };
}
