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
import type { HomeServiceRequest } from "./dashboardTypes";

interface RequestsTabProps {
  requests: HomeServiceRequest[];
  loading?: boolean;
  updatingRequestId?: string | null;
  onRequestAction: (requestId: string, action: "accepted" | "rejected") => void;
}

function getStatusLabel(request: HomeServiceRequest) {
  if (request.backendStatus === "completed") return "Completed";
  if (request.backendStatus === "overdue") return "Overdue";
  if (request.backendStatus === "cancelled" || request.status === "rejected") return "Rejected";
  if (request.backendStatus === "confirmed" || request.status === "accepted") return "Accepted";
  return "Pending";
}

function getStatusStyles(request: HomeServiceRequest) {
  if (request.backendStatus === "completed") {
    return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
  }
  if (request.backendStatus === "overdue") {
    return { backgroundColor: "#fee2e2", color: "#b91c1c" };
  }
  if (request.status === "pending") {
    return { backgroundColor: "#fed7aa", color: "#c2410c" };
  }
  if (request.status === "accepted") {
    return { backgroundColor: "#bbf7d0", color: "#15803d" };
  }
  return { backgroundColor: "#fecaca", color: "#b91c1c" };
}

export function RequestsTab({
  requests,
  loading = false,
  updatingRequestId = null,
  onRequestAction,
}: RequestsTabProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 flex items-center justify-center min-h-[240px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      <h2 className="text-xl font-bold mb-6" style={{ color: "#111827" }}>Home Service Requests</h2>
      {requests.length === 0 ? (
        <div className="text-center py-12 rounded-lg" style={{ backgroundColor: "#f9fafb" }}>
          <HomeIcon className="w-12 h-12 mx-auto mb-3" style={{ color: "#9ca3af" }} />
          <p className="text-sm font-medium" style={{ color: "#374151" }}>No home service requests yet</p>
          <p className="text-sm mt-1 max-w-md mx-auto" style={{ color: "#6b7280" }}>
            Requests appear here when patients book a home visit with you.
          </p>
        </div>
      ) : (
      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="p-6 border-2 rounded-xl"
            style={{
              borderColor:
                request.status === "pending" ? "#fed7aa"
                : request.status === "accepted" ? "#bbf7d0"
                : "#fecaca",
              backgroundColor:
                request.status === "pending" ? "#fff7ed"
                : request.status === "accepted" ? "#f0fdf4"
                : "#fef2f2",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#ccfbf1" }}
                >
                  <HomeIcon className="w-6 h-6" style={{ color: "#0d9488" }} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: "#111827" }}>{request.patientName}</h3>
                  <p className="text-sm mt-1" style={{ color: "#6b7280" }}>{request.service}</p>
                </div>
              </div>
              <span
                className="px-3 py-1 text-sm rounded-full font-medium"
                style={getStatusStyles(request)}
              >
                {getStatusLabel(request)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#9ca3af" }} />
                <span className="text-sm" style={{ color: "#374151" }}>{request.address}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" style={{ color: "#9ca3af" }} />
                  <span className="text-sm" style={{ color: "#374151" }}>{request.requestedDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" style={{ color: "#9ca3af" }} />
                  <span className="text-sm" style={{ color: "#374151" }}>{request.requestedTime}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" style={{ color: "#9ca3af" }} />
                <span className="text-sm" style={{ color: "#374151" }}>{request.phone}</span>
              </div>
            </div>

            {(request.backendStatus === "pending" || request.backendStatus === "overdue") && (
              <div className="flex space-x-3">
                <button
                  onClick={() => onRequestAction(request.id, "accepted")}
                  disabled={updatingRequestId === request.id}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors text-sm bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {updatingRequestId === request.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => onRequestAction(request.id, "rejected")}
                  disabled={updatingRequestId === request.id}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
