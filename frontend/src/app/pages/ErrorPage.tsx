import { useLocation } from "react-router-dom";
import { AppStatusPage } from "../components/common/AppStatusPage";

interface ErrorPageState {
  message?: string;
  actionTo?: string;
  actionLabel?: string;
}

export default function ErrorPage() {
  const location = useLocation();
  const state = (location.state as ErrorPageState | null) ?? {};

  return (
    <AppStatusPage
      code="Error"
      message={state.message ?? "Something went wrong. Please try again later."}
      actionTo={state.actionTo ?? "/"}
      actionLabel={state.actionLabel ?? "Return to Home"}
    />
  );
}
