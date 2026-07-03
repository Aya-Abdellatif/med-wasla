// frontend/src/app/pages/admin/AdminDashboard.tsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  fetchAdminSpecialists,
  updateSpecialistVerification,
  updateCertificateVerification,
  type AdminSpecialist,
} from "../../../services/adminApi";
import { showError, showInfo, showSuccess } from "../../../utils/toast";
import {
  Check,
  X,
  FileText,
  Phone,
  Mail,
  MapPin,
  Award,
  LogOut,
  RefreshCw,
  ShieldAlert,
  ExternalLink,
  Users 
} from "lucide-react";

type FilterTab = "all" | "pending" | "approved" | "rejected";

export default function AdminDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return null;
  }

  return <AdminDashboardView key={user.id} />;
}

function AdminDashboardView() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [specialists, setSpecialists] = useState<AdminSpecialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actioningCertKey, setActioningCertKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const refreshSpecialists = useCallback(async (notify = false) => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchAdminSpecialists();
      setSpecialists(data);
      if (notify) showInfo("Specialists list refreshed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load specialists";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchAdminSpecialists(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setSpecialists(data);
        setError("");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : "Failed to load specialists";
        setError(message);
        showError(message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActioningId(id);
    try {
      await updateSpecialistVerification(id, action);
      showSuccess(`Specialist ${action === "approve" ? "approved" : "rejected"} successfully!`);
      await refreshSpecialists();
    } catch (err) {
      showError(err instanceof Error ? err.message : `Failed to ${action} specialist`);
    } finally {
      setActioningId(null);
    }
  };

  const handleCertificateAction = async (
    specialistId: string,
    certId: string,
    action: "approve" | "reject",
  ) => {
    const key = `${specialistId}:${certId}`;
    setActioningCertKey(key);
    try {
      await updateCertificateVerification(specialistId, certId, action);
      showSuccess(`Certificate ${action === "approve" ? "approved" : "rejected"} successfully!`);
      await refreshSpecialists();
    } catch (err) {
      showError(err instanceof Error ? err.message : `Failed to ${action} certificate`);
    } finally {
      setActioningCertKey(null);
    }
  };

  const hasPendingCertificates = (specialist: AdminSpecialist) =>
    specialist.certifications?.some((cert) => cert.status === "pending") ?? false;

  const handleLogout = () => {
    logout();
    showInfo("Logged out successfully");
    navigate("/");
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      { bg: "bg-teal-50 text-teal-700 border-teal-200" },
      { bg: "bg-blue-50 text-blue-700 border-blue-200" },
      { bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      { bg: "bg-purple-50 text-purple-700 border-purple-200" },
      { bg: "bg-amber-50 text-amber-700 border-amber-200" },
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index].bg;
  };


  const filteredSpecialists = specialists.filter(specialist => {
    if (activeTab === "all") return true;
    return specialist.verificationStatus === activeTab;
  });

  const getStatusBadge = (status: "pending" | "approved" | "rejected") => {
    switch (status) {
      case "approved":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Approved</span>;
      case "rejected":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-200">
              🛡️
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-slate-900">Med</span>
                <span className="text-teal-600 font-extrabold">Wasla</span>
              </span>
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-slate-600 hidden sm:inline">
              Logged in as: <span className="text-slate-900">{user?.email}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Specialist Accounts Management
            </h1>
            <p className="text-slate-500 mt-1">
              Review, filter, and manage professional licenses and profiles for doctors and nurses.
            </p>
          </div>

          <button
            onClick={() => refreshSpecialists(true)}
            className="self-start flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-slate-700 font-bold hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tabs System */}
        <div className="flex border-b border-slate-200 mb-8 space-x-2 overflow-x-auto pb-px">
          {(["all", "pending", "approved", "rejected"] as const).map((tab) => {
            const count = tab === "all" ? specialists.length : specialists.filter(s => s.verificationStatus === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-5 font-bold text-sm capitalize border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? "border-teal-500 text-teal-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab === "all" && <Users className="w-4 h-4" />}
                <span>{tab}</span>
                <span className={`text-xs px-2 py-0.5 rounded-md font-extrabold ${
                  activeTab === tab ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 mt-4 font-semibold">Loading specialists list...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center max-w-2xl mx-auto shadow-sm">
            <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-rose-900 mb-2">Connection Problem</h3>
            <p className="text-rose-700 font-medium mb-6">{error}</p>
            <button
              onClick={() => refreshSpecialists(true)}
              className="px-6 py-3 bg-rose-600 text-white rounded-full font-bold hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredSpecialists.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm max-w-xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center text-3xl mx-auto mb-6 border border-slate-100">
              📂
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">No Records Found</h3>
            <p className="text-slate-500 font-medium">
              There are no specialists matching the "{activeTab}" filter right now.
            </p>
          </div>
        )}

        {/* Specialists List */}
        {!loading && !error && filteredSpecialists.length > 0 && (
          <div className="space-y-8">
            {filteredSpecialists.map(specialist => (
              <div
                key={specialist._id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col lg:flex-row"
              >
                {/* Specialist Profile Section */}
                <div className="p-8 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Header: Photo, Name & Status Badge */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {specialist.userId?.photoUrl ? (
                          <img
                            src={specialist.userId.photoUrl}
                            alt={specialist.userId.name}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-xl font-black shrink-0 ${getAvatarColor(specialist.userId?.name)}`}>
                            {specialist.userId?.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 leading-tight">
                            {specialist.userId?.name || "Unknown"}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800">
                              {specialist.specialistType}
                            </span>
                            {specialist.specialization && (
                              <span className="text-xs font-semibold text-slate-500">
                                {specialist.specialization}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 text-sm">
                      <span className="text-slate-500 font-medium">Status:</span>
                      {getStatusBadge(specialist.verificationStatus)}
                    </div>

                    {/* Bio */}
                    {specialist.pendingProfileUpdates &&
                    Object.keys(specialist.pendingProfileUpdates).length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                          Changes awaiting approval
                        </p>
                        {specialist.pendingProfileUpdates.bio && (
                          <p className="text-sm text-slate-600 bg-white p-4 rounded-2xl border border-amber-100 italic">
                            <span className="font-semibold not-italic text-slate-800">Bio: </span>
                            "{specialist.pendingProfileUpdates.bio}"
                          </p>
                        )}
                        {specialist.pendingProfileUpdates.clinicAddress && (
                          <p className="text-sm text-slate-600 bg-white p-4 rounded-2xl border border-amber-100">
                            <span className="font-semibold text-slate-800">Clinic address: </span>
                            {specialist.pendingProfileUpdates.clinicAddress}
                          </p>
                        )}
                        {specialist.pendingProfileUpdates.specialization && (
                          <p className="text-sm text-slate-600 bg-white p-4 rounded-2xl border border-amber-100">
                            <span className="font-semibold text-slate-800">Specialization: </span>
                            {specialist.pendingProfileUpdates.specialization}
                          </p>
                        )}
                      </div>
                    ) : (
                      specialist.bio && (
                        <p className="text-sm text-slate-600 bg-white p-4 rounded-2xl border border-slate-100 italic">
                          "{specialist.bio}"
                        </p>
                      )
                    )}

                    {/* Contacts & Info */}
                    <div className="space-y-3 pt-2 text-sm text-slate-600">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{specialist.userId?.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{specialist.userId?.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{specialist.userId?.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          License: <span className="font-mono">{specialist.licenseNumber}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">💰</span>
                        <span className="font-semibold text-slate-800">
                          Fee: <span className="text-teal-600 font-extrabold">{specialist.consultationFee || 0} EGP</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏡</span>
                        <span className="font-semibold text-slate-800">
                          Provides Home Visits:{" "}
                          <span className={specialist.homeVisit ? "text-emerald-600" : "text-slate-400"}>
                            {specialist.homeVisit ? "Yes" : "No"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    {specialist.verificationStatus === "pending" ? (
                      <div className="space-y-3">
                        {hasPendingCertificates(specialist) && (
                          <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                            This specialist has certificate updates waiting for your review.
                          </p>
                        )}
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleAction(specialist._id, "approve")}
                            disabled={actioningId !== null}
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3 px-4 rounded-2xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-100 disabled:opacity-50 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>{actioningId === specialist._id ? "Processing..." : "Approve All"}</span>
                          </button>
                          <button
                            onClick={() => handleAction(specialist._id, "reject")}
                            disabled={actioningId !== null}
                            className="flex-1 flex items-center justify-center gap-2 bg-rose-600 text-white font-bold py-3 px-4 rounded-2xl hover:bg-rose-700 transition-colors shadow-md shadow-rose-100 disabled:opacity-50 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            <span>{actioningId === specialist._id ? "Processing..." : "Reject All"}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-3 bg-slate-100 rounded-2xl text-xs font-semibold text-slate-500 border border-slate-200">
                        {hasPendingCertificates(specialist)
                          ? "Review pending certificates on the right."
                          : "Decision finalized. Profile updates will reset status to pending."}
                      </div>
                    )}
                  </div>
                </div>

                {/* Certificates Section */}
                <div className="p-8 lg:w-2/3 flex flex-col">
                  <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    <span>Uploaded Certifications & Degrees</span>
                    <span className="ml-1 text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {specialist.certifications?.length || 0} Total
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    {specialist.certifications && specialist.certifications.length > 0 ? (
                      specialist.certifications.map((cert) => {
                        const certActionKey = `${specialist._id}:${cert._id}`;
                        const isPendingCert = cert.status === "pending";

                        return (
                        <div
                          key={cert._id}
                          className={`p-5 border rounded-2xl flex flex-col justify-between transition-all ${
                            isPendingCert
                              ? "border-amber-300 bg-amber-50/40 hover:border-amber-400"
                              : "border-slate-200 hover:border-teal-200 hover:bg-teal-50/20"
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="font-bold text-slate-900 text-sm leading-snug">
                                {cert.title}
                              </h5>
                              <span className={`px-2.5 py-0.5 rounded-full text-xxs font-bold uppercase tracking-wider shrink-0 ${
                                cert.status === "approved" ? "bg-emerald-100 text-emerald-800" : 
                                cert.status === "rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                              }`}>
                                {cert.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Issued by: {cert.issuedBy}</p>
                            {cert.issuedAt && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                Date: {new Date(cert.issuedAt).toLocaleDateString()}
                              </p>
                            )}
                            {isPendingCert && (
                              <p className="text-xs text-amber-700 font-medium mt-2">
                                Awaiting admin review
                              </p>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <a
                              href={cert.certificateUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-teal-600 font-bold hover:text-teal-700 flex items-center gap-1"
                            >
                              <span>View Document</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            {isPendingCert && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  title="Approve certificate"
                                  aria-label="Approve certificate"
                                  disabled={actioningCertKey !== null}
                                  onClick={() =>
                                    handleCertificateAction(specialist._id, cert._id, "approve")
                                  }
                                  className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                                >
                                  {actioningCertKey === certActionKey ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  title="Reject certificate"
                                  aria-label="Reject certificate"
                                  disabled={actioningCertKey !== null}
                                  onClick={() =>
                                    handleCertificateAction(specialist._id, cert._id, "reject")
                                  }
                                  className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )})
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <FileText className="w-10 h-10 text-slate-300 mb-2" />
                        <p className="text-sm text-slate-400 font-medium">No certificates provided.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}