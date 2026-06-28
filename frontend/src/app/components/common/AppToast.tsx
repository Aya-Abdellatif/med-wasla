import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AppToast() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      newestOnTop
      closeOnClick
      rtl={false}
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
