import { toast, type ToastOptions } from "react-toastify";
import { getSpecialistDisplayName } from "./displayName";

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

type ToastUserOptions = ToastOptions & { userName?: string | null };

function formatToastContent(message: string, userName?: string | null) {
  const specialistName = getSpecialistDisplayName(userName);
  if (!specialistName) return message;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide opacity-90 mb-1">{specialistName}</p>
      <p>{message}</p>
    </div>
  );
}

export function showSuccess(message: string, options?: ToastUserOptions) {
  const { userName, ...toastOptions } = options ?? {};
  toast.success(formatToastContent(message, userName), { ...defaultOptions, ...toastOptions });
}

export function showError(message: string, options?: ToastUserOptions) {
  const { userName, ...toastOptions } = options ?? {};
  toast.error(formatToastContent(message, userName), { ...defaultOptions, ...toastOptions });
}

export function showInfo(message: string, options?: ToastUserOptions) {
  const { userName, ...toastOptions } = options ?? {};
  toast.info(formatToastContent(message, userName), { ...defaultOptions, ...toastOptions });
}

export function showWarning(message: string, options?: ToastUserOptions) {
  const { userName, ...toastOptions } = options ?? {};
  toast.warning(formatToastContent(message, userName), { ...defaultOptions, ...toastOptions });
}
