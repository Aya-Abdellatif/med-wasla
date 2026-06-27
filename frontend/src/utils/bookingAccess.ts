import type { NavigateFunction } from "react-router-dom";

/** Show booking CTAs for guests and patients only (not doctors/nurses). */
export function canBookAppointments(user?: { role?: string } | null): boolean {
  if (!user) return true;
  return user.role === "patient";
}

export function isSpecialistAccount(user?: { role?: string } | null): boolean {
  return user?.role === "doctor" || user?.role === "nurse";
}

export function getBookingLoginRedirect(returnTo?: string) {
  const from =
    returnTo ??
    (typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/");

  return {
    pathname: "/login",
    state: { from },
  };
}

export function handleBookClick(
  user: { role?: string } | null | undefined,
  navigate: NavigateFunction,
  openBooking: () => void,
  returnTo?: string,
): void {
  if (!user) {
    const redirect = getBookingLoginRedirect(returnTo);
    navigate(redirect.pathname, { state: redirect.state });
    return;
  }

  if (user.role === "patient") {
    openBooking();
  }
}
