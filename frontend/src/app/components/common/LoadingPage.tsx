import { Loader2 } from "lucide-react";

export function LoadingPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-linear-to-br from-teal-50 via-white to-slate-50 px-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
      <p className="mt-4 text-sm font-medium text-slate-600 sm:text-base">
        Loading...
      </p>
    </div>
  );
}
