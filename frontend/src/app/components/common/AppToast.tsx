import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import { isRtlLanguage } from "../../../utils/i18nHelpers";
import "react-toastify/dist/ReactToastify.css";

export default function AppToast() {
  const { i18n } = useTranslation();
  const isRtl = isRtlLanguage(i18n.language);

  return (
    <ToastContainer
      position={isRtl ? "top-left" : "top-right"}
      autoClose={4000}
      newestOnTop
      closeOnClick
      rtl={isRtl}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      limit={4}
      toastClassName="!rounded-2xl !text-sm !font-semibold !shadow-lg medwasla-toast"
      progressClassName="!bg-white/30"
    />
  );
}
