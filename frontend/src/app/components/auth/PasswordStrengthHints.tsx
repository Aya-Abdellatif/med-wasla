import { PASSWORD_RULES } from "../../../utils/authValidation";

interface PasswordStrengthHintsProps {
  password: string;
  showErrors?: boolean;
}

export function PasswordStrengthHints({ password, showErrors = false }: PasswordStrengthHintsProps) {
  if (!password && !showErrors) return null;

  return (
    <ul className="mt-2 space-y-1">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        const showFail = showErrors && !passed;

        return (
          <li
            key={rule.id}
            className={`text-xs font-medium ${
              passed ? "text-emerald-600" : showFail ? "text-red-500" : "text-slate-400"
            }`}
          >
            {passed ? "✓" : showFail ? "•" : "○"} {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
