import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Home as HomeIcon,
  MapPin,
  Phone,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { HomeServiceRequest } from "./dashboardTypes";
import { DASHBOARD_THEME } from "./dashboardUtils";
import { MissedAppointmentsPanel } from "./MissedAppointmentsPanel";

interface RequestsTabProps {
  requests: HomeServiceRequest[];
  loading?: boolean;
  updatingRequestId?: string | null;
  onRequestAction: (requestId: string, action: "accepted" | "rejected") => void;
}

function getStatusLabel(request: HomeServiceRequest, t: TFunction) {
  if (request.backendStatus === "completed") return t("requests.status.completed");
  if (request.backendStatus === "overdue") return t("requests.status.overdue");
  if (request.backendStatus === "cancelled" || request.status === "rejected")
    return t("requests.status.rejected");
  if (request.backendStatus === "confirmed" || request.status === "accepted")
    return t("requests.status.accepted");
  return t("requests.status.pending");
}

function getStatusStyles(request: HomeServiceRequest) {
  if (request.backendStatus === "completed") {
    return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
  }
  if (request.backendStatus === "overdue") {
    return { backgroundColor: "#e5e7eb", color: "#4b5563" };
  }
  if (request.status === "pending") {
    return { backgroundColor: "#fed7aa", color: "#c2410c" };
  }
  if (request.status === "accepted") {
    return { backgroundColor: "#bbf7d0", color: "#15803d" };
  }
  return { backgroundColor: "#fecaca", color: "#b91c1c" };
}

function getCardStyles(request: HomeServiceRequest) {
  if (request.backendStatus === "overdue") {
    return { borderColor: "#e5e7eb", backgroundColor: "#fafafa" };
  }
  if (request.status === "pending") {
    return { borderColor: "#fed7aa", backgroundColor: "#fff7ed" };
  }
  if (request.status === "accepted") {
    return { borderColor: "#bbf7d0", backgroundColor: "#f0fdf4" };
  }
  return { borderColor: "#fecaca", backgroundColor: "#fef2f2" };
}

interface RequestCardProps {
  request: HomeServiceRequest;
  showActions: boolean;
  updatingRequestId?: string | null;
  onRequestAction: (requestId: string, action: "accepted" | "rejected") => void;
}

function RequestCard({
  request,
  showActions,
  updatingRequestId,
  onRequestAction,
}: RequestCardProps) {
  const { t } = useTranslation("dashboard");
  const cardStyles = getCardStyles(request);

  return (
    <div className="p-6 border-2 rounded-xl" style={cardStyles}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#ccfbf1" }}
          >
            <HomeIcon className="w-6 h-6" style={{ color: "#0d9488" }} />
          </div>
          <div>
            <h3 className="font-semibold text-lg" style={{ color: "#111827" }}>
              {request.patientName}
            </h3>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
              {request.service}
            </p>
          </div>
        </div>
        <span
          className="px-3 py-1 text-sm rounded-full font-medium"
          style={getStatusStyles(request)}
        >
          {getStatusLabel(request, t)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#9ca3af" }} />
          <span className="text-sm" style={{ color: "#374151" }}>
            {request.address}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: "#9ca3af" }} />
            <span className="text-sm" style={{ color: "#374151" }}>
              {request.requestedDate}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: "#9ca3af" }} />
            <span className="text-sm" style={{ color: "#374151" }}>
              {request.requestedTime}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" style={{ color: "#9ca3af" }} />
          <span className="text-sm" style={{ color: "#374151" }}>
            {request.phone}
          </span>
        </div>
      </div>

      {showActions && request.backendStatus === "pending" && (
        <div className="flex gap-3">
          <button
            onClick={() => onRequestAction(request.id, "accepted")}
            disabled={updatingRequestId === request.id}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: DASHBOARD_THEME.primary }}
          >
            {updatingRequestId === request.id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>{t("requests.accept")}</span>
          </button>
          <button
            onClick={() => onRequestAction(request.id, "rejected")}
            disabled={updatingRequestId === request.id}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: DASHBOARD_THEME.danger }}
          >
            <XCircle className="w-4 h-4" />
            <span>{t("requests.reject")}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function sortByScheduledTimeDesc(a: HomeServiceRequest, b: HomeServiceRequest) {
  return (b.scheduledAtMs ?? 0) - (a.scheduledAtMs ?? 0);
}

function groupRecentRequests(requests: HomeServiceRequest[]) {
  const accepted = requests
    .filter((r) => r.backendStatus === "confirmed")
    .sort(sortByScheduledTimeDesc);
  const completed = requests
    .filter((r) => r.backendStatus === "completed")
    .sort(sortByScheduledTimeDesc);
  const declined = requests
    .filter((r) => r.backendStatus === "cancelled" || r.status === "rejected")
    .sort(sortByScheduledTimeDesc);

  return { accepted, completed, declined };
}

export function RequestsTab({
  requests,
  loading = false,
  updatingRequestId = null,
  onRequestAction,
}: RequestsTabProps) {
  const { t } = useTranslation("dashboard");

  const activeRequests = requests.filter((r) => r.backendStatus === "pending");
  const missedRequests = requests.filter((r) => r.backendStatus === "overdue");
  const otherRequests = requests.filter(
    (r) => r.backendStatus !== "pending" && r.backendStatus !== "overdue",
  );
  const { accepted, completed, declined } = groupRecentRequests(otherRequests);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 flex items-center justify-center min-h-60">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      <h2 className="text-xl font-bold mb-6" style={{ color: "#111827" }}>
        {t("requests.title")}
      </h2>

      {requests.length === 0 ? (
        <div className="text-center py-12 rounded-lg" style={{ backgroundColor: "#f9fafb" }}>
          <HomeIcon className="w-12 h-12 mx-auto mb-3" style={{ color: "#9ca3af" }} />
          <p className="text-sm font-medium" style={{ color: "#374151" }}>
            {t("requests.empty")}
          </p>
          <p className="text-sm mt-1 max-w-md mx-auto" style={{ color: "#6b7280" }}>
            {t("requests.emptyDescription")}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {activeRequests.length > 0 ? (
            <div className="space-y-4">
              <h3
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: DASHBOARD_THEME.muted }}
              >
                {t("requests.needsResponse")}
              </h3>
              {activeRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  showActions
                  updatingRequestId={updatingRequestId}
                  onRequestAction={onRequestAction}
                />
              ))}
            </div>
          ) : (
            <p
              className="text-sm text-center py-4 rounded-lg"
              style={{ color: DASHBOARD_THEME.muted, backgroundColor: "#f9fafb" }}
            >
              {t("requests.noPendingRightNow")}
            </p>
          )}

          {otherRequests.length > 0 && (
            <div className="space-y-4">
              <h3
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: DASHBOARD_THEME.muted }}
              >
                {t("requests.recent")}
              </h3>

              <MissedAppointmentsPanel
                count={accepted.length}
                title={t("requests.groups.acceptedTitle")}
                description={t("requests.groups.acceptedDescription")}
              >
                {accepted.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    showActions={false}
                    onRequestAction={onRequestAction}
                  />
                ))}
              </MissedAppointmentsPanel>

              <MissedAppointmentsPanel
                count={completed.length}
                title={t("requests.groups.completedTitle")}
                description={t("requests.groups.completedDescription")}
              >
                {completed.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    showActions={false}
                    onRequestAction={onRequestAction}
                  />
                ))}
              </MissedAppointmentsPanel>

              <MissedAppointmentsPanel
                count={declined.length}
                title={t("requests.groups.declinedTitle")}
                description={t("requests.groups.declinedDescription")}
              >
                {declined.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    showActions={false}
                    onRequestAction={onRequestAction}
                  />
                ))}
              </MissedAppointmentsPanel>
            </div>
          )}

          <MissedAppointmentsPanel
            count={missedRequests.length}
            title={t("requests.groups.missedTitle")}
            description={t("requests.groups.missedDescription")}
          >
            {missedRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                showActions={false}
                onRequestAction={onRequestAction}
              />
            ))}
          </MissedAppointmentsPanel>
        </div>
      )}
    </div>
  );
}