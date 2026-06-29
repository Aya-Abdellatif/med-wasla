import { toast, type ToastOptions } from "react-toastify";
import type { User } from "../app/context/AuthContext";
import { getToastUserLabel, type ToastUserRole } from "./displayName";

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export type ToastUserOptions = ToastOptions & {
  userName?: string | null;
  userRole?: ToastUserRole | null;
};

export function getToastUserContext(user?: Pick<User, "name" | "role"> | null) {
  if (!user) return {};
  return { userName: user.name, userRole: user.role };
}

function formatToastContent(
  message: string,
  userName?: string | null,
  userRole?: ToastUserRole | null,
) {
  const label = getToastUserLabel(userName, userRole);
  if (!label) return message;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide opacity-90 mb-1">{label}</p>
      <p>{message}</p>
    </div>
  );
}

export function showSuccess(message: string, options?: ToastUserOptions) {
  const { userName, userRole, ...toastOptions } = options ?? {};
  toast.success(formatToastContent(message, userName, userRole), {
    ...defaultOptions,
    ...toastOptions,
  });
}

export function showError(message: string, options?: ToastUserOptions) {
  const { userName, userRole, ...toastOptions } = options ?? {};
  toast.error(formatToastContent(message, userName, userRole), {
    ...defaultOptions,
    ...toastOptions,
  });
}

export function showInfo(message: string, options?: ToastUserOptions) {
  const { userName, userRole, ...toastOptions } = options ?? {};
  toast.info(formatToastContent(message, userName, userRole), {
    ...defaultOptions,
    ...toastOptions,
  });
}

export function showWarning(message: string, options?: ToastUserOptions) {
  const { userName, userRole, ...toastOptions } = options ?? {};
  toast.warning(formatToastContent(message, userName, userRole), {
    ...defaultOptions,
    ...toastOptions,
  });
}
