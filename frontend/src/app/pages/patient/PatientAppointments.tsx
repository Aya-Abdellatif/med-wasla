import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation, Trans } from "react-i18next";
import {
    Calendar,
    Clock,
    MapPin,
    Search,
    Star,
    X,
    ChevronRight,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RefreshCw,
    Home as HomeIcon,
    Stethoscope,
    User,
    UserX,
    CalendarPlus,
    SlidersHorizontal,
} from "lucide-react";

import { ImageWithFallback } from "../../figma/ImageWithFallback";
import { CancelModal } from "../../components/patient-appointments/CancelModal";
import { DetailsModal } from "../../components/patient-appointments/DetailsModal";
import { RescheduleModal } from "../../components/patient-appointments/RescheduleModal";
import { ReviewModal } from "../../components/patient-appointments/ReviewModal";
import { ViewReviewModal } from "../../components/patient-appointments/ViewReviewModal";

import { AppointmentTypeModal } from "../../components/booking/AppointmentTypeModal";

import type { Appointment, AppointmentReview, AppointmentStatus, AppointmentType } from "../../components/patient-appointments/AppointmentTypes";
import { fetchMyAppointments, cancelAppointment, rescheduleAppointment } from "../../../services/appointmentsApi";
import { createReview } from "../../../services/reviewsApi";
import { useAuth } from "../../context/useAuth";
import { showError, showSuccess } from "../../../utils/toast";

const statusIconMap: Record<AppointmentStatus, React.ElementType> = {
    upcoming: Clock,
    pending: AlertCircle,
    completed: CheckCircle2,
    cancelled: XCircle,
    overdue: AlertCircle,
    no_show: UserX,
};

const statusStyleMap: Record<AppointmentStatus, { color: string; bgColor: string }> = {
    upcoming: { color: "text-blue-700", bgColor: "bg-blue-50 border border-blue-200" },
    pending: { color: "text-amber-700", bgColor: "bg-amber-50 border border-amber-200" },
    completed: { color: "text-emerald-700", bgColor: "bg-emerald-50 border border-emerald-200" },
    cancelled: { color: "text-red-700", bgColor: "bg-red-50 border border-red-200" },
    overdue: { color: "text-slate-700", bgColor: "bg-slate-100 border border-slate-200" },
    no_show: { color: "text-amber-800", bgColor: "bg-amber-50 border border-amber-200" },
};

// ─── Appointment Card ──────────────────────────────────────────
function AppointmentCard({
    appointment,
    onViewDetails,
    onReschedule,
    onCancel,
    onReview,
    onBookAgain,
}: {
    appointment: Appointment;
    onViewDetails: () => void;
    onReschedule: () => void;
    onCancel: () => void;
    onReview: () => void;
    onBookAgain: () => void;
}) {
    const { t, i18n } = useTranslation(["patientAppointments"]);
    const dateLocale = i18n.language === "ar" ? "ar-EG" : "en-US";

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString(dateLocale, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    };

    const StatusIcon = statusIconMap[appointment.status];
    const statusStyle = statusStyleMap[appointment.status];
    const statusLabel = t(`patientAppointments:status.${appointment.status}`);

    return (
        <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow p-5">
            <div className="flex items-start gap-4">
                {/* Doctor photo */}
                <div className="relative shrink-0">
                    <ImageWithFallback
                        src={appointment.doctor.photo}
                        alt={appointment.doctor.name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div className={`absolute -bottom-1 -right-1 rtl:-right-auto rtl:-left-1 w-5 h-5 rounded-full flex items-center justify-center ${appointment.type === "clinic" ? "bg-blue-100" : "bg-teal-100"}`}>
                        {appointment.type === "clinic" ? <Stethoscope className="w-2.5 h-2.5 text-blue-600" /> : <HomeIcon className="w-2.5 h-2.5 text-teal-600" />}
                    </div>
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            <h4 className="font-semibold text-fg leading-tight">{appointment.doctor.name}</h4>
                            <p className="text-sm text-primary">{appointment.doctor.specialty}</p>
                        </div>
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${statusStyle.bgColor} ${statusStyle.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusLabel}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-fg-muted">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(appointment.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {appointment.time}
                        </span>
                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${appointment.type === "clinic" ? "bg-blue-50 text-blue-700" : "bg-teal-50 text-teal-700"}`}>
                            {appointment.type === "clinic" ? <Stethoscope className="w-3 h-3" /> : <HomeIcon className="w-3 h-3" />}
                            {appointment.type === "clinic" ? t("patientAppointments:visitType.clinic") : t("patientAppointments:visitType.home")}
                        </span>
                    </div>

                    {appointment.address && (
                        <p className="flex items-start gap-1.5 mt-1.5 text-xs text-fg-muted">
                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span className="truncate">{appointment.address}</span>
                        </p>
                    )}

                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                {/* Left side: Book Again for completed */}
                {(appointment.status === "completed" || appointment.status === "overdue") && (
                    <button
                        onClick={onBookAgain}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-xs font-medium transition-colors"
                    >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        {t("patientAppointments:card.bookAgain")}
                    </button>
                )}

                <button
                    onClick={onViewDetails}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg text-xs font-medium transition-colors"
                >
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    {t("patientAppointments:card.viewDetails")}
                </button>

                <Link
                    to={`/doctor/${appointment.specialistId}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/5 hover:bg-secondary/10 text-secondary rounded-lg text-xs font-medium transition-colors"
                >
                    <User className="w-3.5 h-3.5" />
                    {t("patientAppointments:card.viewProfile")}
                </Link>

                {(appointment.status === "upcoming" || appointment.status === "pending") && (
                    <>
                        <button
                            onClick={onReschedule}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            {t("patientAppointments:card.reschedule")}
                        </button>
                        <button
                            onClick={onCancel}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors"
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            {t("patientAppointments:card.cancel")}
                        </button>
                    </>
                )}

                {appointment.status === "completed" && !appointment.review && (
                    <button
                        onClick={onReview}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-medium transition-colors"
                    >
                        <Star className="w-3.5 h-3.5" />
                        {t("patientAppointments:card.addReview")}
                    </button>
                )}

                {appointment.status === "completed" && appointment.review && (
                    <button
                        onClick={onReview}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium transition-colors"
                    >
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-3 h-3 ${s <= appointment.review!.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                            ))}
                        </div>
                        <CheckCircle2 className="w-3.5 h-3.5 ml-0.5 rtl:ml-0 rtl:mr-0.5" />
                        {t("patientAppointments:card.viewReview")}
                    </button>
                )}
            </div>
        </div>
    );
}


// ─── Empty State ───────────────────────────────────────────────
function EmptyState({ filterStatus }: { filterStatus: string }) {
    const { t } = useTranslation(["patientAppointments"]);
    const statusLabel = filterStatus !== "all" ? t(`patientAppointments:status.${filterStatus}`) : "";

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                <Calendar className="w-9 h-9 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-fg mb-2">
                {filterStatus === "all"
                    ? t("patientAppointments:empty.titleAll")
                    : t("patientAppointments:empty.titleFiltered", { status: statusLabel })}
            </h3>
            <p className="text-fg-muted mb-8 max-w-sm">
                {filterStatus === "all"
                    ? t("patientAppointments:empty.descriptionAll")
                    : t("patientAppointments:empty.descriptionFiltered", { status: statusLabel })}
            </p>

            {filterStatus === "all" && (
                <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors font-medium">
                    <CalendarPlus className="w-5 h-5" />
                    {t("patientAppointments:empty.bookButton")}
                </button>
            )}
        </div>
    );
}


// ─── Main Page ─────────────────────────────────────────────────
export function MyAppointments() {
    const { t } = useTranslation(["patientAppointments"]);
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>("all");
    const [typeFilter, setTypeFilter] = useState<"all" | AppointmentType>("all");
    const [showFilters, setShowFilters] = useState(false);

    const navigate = useNavigate();
    const [detailsModal, setDetailsModal] = useState<Appointment | null>(null);
    const [rescheduleModal, setRescheduleModal] = useState<Appointment | null>(null);
    const [cancelModal, setCancelModal] = useState<Appointment | null>(null);
    const [reviewModal, setReviewModal] = useState<Appointment | null>(null);
    const [viewReviewModal, setViewReviewModal] = useState<Appointment | null>(null);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

    const loadAppointments = useCallback(async (silent = false) => {
        if (!user || user.role !== "patient") {
            setAppointments([]);
            if (!silent) setLoading(false);
            return;
        }

        if (!silent) setLoading(true);

        try {
            const data = await fetchMyAppointments();
            setAppointments(data);
        } catch (err) {
            showError(err instanceof Error ? err.message : t("patientAppointments:toast.loadError"));
        } finally {
            if (!silent) setLoading(false);
        }
    }, [user, t]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadAppointments();
        }, 0);

        return () => {
            window.clearTimeout(timer);
        };
    }, [user?.id, user?.role, loadAppointments]);

    const handleBookAgain = (appt: Appointment) => {
        navigate(`/doctor/${appt.specialistId}`);
    };

    const handleSubmitReview = async (id: string, review: AppointmentReview) => {
        const appointment = appointments.find((item) => item.id === id);
        if (!appointment) return;

        try {
            await createReview({
                specialistId: appointment.specialistId,
                appointmentId: id,
                rating: review.rating,
                comment: review.comment,
            });

            setAppointments((prev) =>
                prev.map((item) => (item.id === id ? { ...item, review } : item)),
            );
            setReviewModal(null);
            showSuccess(t("patientAppointments:toast.reviewSuccess"));
        } catch (err) {
            showError(err instanceof Error ? err.message : t("patientAppointments:toast.reviewError"));
            throw err;
        }
    };

    const counts = {
        upcoming: appointments.filter((a) => a.status === "upcoming").length,
        pending: appointments.filter((a) => a.status === "pending").length,
        completed: appointments.filter((a) => a.status === "completed").length,
        cancelled: appointments.filter((a) => a.status === "cancelled").length,
        overdue: appointments.filter((a) => a.status === "overdue").length,
        no_show: appointments.filter((a) => a.status === "no_show").length,
    };

    const filtered = appointments.filter((a) => {
        const matchSearch =
            a.doctor.name.toLowerCase().includes(search.toLowerCase()) ||
            a.doctor.specialty.toLowerCase().includes(search.toLowerCase()) ||
            a.reason.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || a.status === statusFilter;
        const matchType = typeFilter === "all" || a.type === typeFilter;
        return matchSearch && matchStatus && matchType;
    });

    const handleCancel = async (id: string) => {
        try {
            await cancelAppointment(id);
            await loadAppointments(true);
            setCancelModal(null);
            showSuccess(t("patientAppointments:toast.cancelSuccess"));
        } catch (err) {
            showError(err instanceof Error ? err.message : t("patientAppointments:toast.cancelError"));
        }
    };

    const handleReschedule = async (id: string, date: string, time: string) => {
        try {
            await rescheduleAppointment(id, date, time);
            await loadAppointments(true);
            setRescheduleModal(null);
            showSuccess(t("patientAppointments:toast.rescheduleSuccess"));
        } catch (err) {
            showError(err instanceof Error ? err.message : t("patientAppointments:toast.rescheduleError"));
            throw err;
        }
    };

    const summaryCards = [
        { key: "upcoming", count: counts.upcoming, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500", filter: "upcoming" as const },
        { key: "pending", count: counts.pending, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", filter: "pending" as const },
        { key: "noShow", count: counts.no_show, color: "text-amber-800", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", filter: "no_show" as const },
        { key: "overdue", count: counts.overdue, color: "text-slate-700", bg: "bg-slate-100", border: "border-slate-200", dot: "bg-slate-500", filter: "overdue" as const },
        { key: "completed", count: counts.completed, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", filter: "completed" as const },
        { key: "cancelled", count: counts.cancelled, color: "text-red-700", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500", filter: "cancelled" as const },
    ];

    const statusFilterOptions = ["all", "upcoming", "pending", "no_show", "overdue", "completed", "cancelled"] as const;
    const typeFilterOptions = ["all", "clinic", "home"] as const;

    return (
        <div className="min-h-screen bg-muted/20">
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {summaryCards.map((card) => (
                        <button
                            key={card.key}
                            onClick={() => setStatusFilter(statusFilter === card.filter ? "all" : card.filter)}
                            className={`p-4 rounded-2xl border text-left rtl:text-right transition-all hover:shadow-sm ${statusFilter === card.filter ? `${card.bg} ${card.border} shadow-sm` : "bg-white border-border hover:border-gray-300"}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${card.dot}`} />
                                <span className={`text-xs font-medium ${statusFilter === card.filter ? card.color : "text-fg-muted"}`}>
                                    {t(`patientAppointments:summary.${card.key}`)}
                                </span>
                            </div>
                            <p className={`text-2xl font-bold ${statusFilter === card.filter ? card.color : "text-fg"}`}>{card.count}</p>
                        </button>
                    ))}
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-2xl border border-border p-4">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted rtl:left-auto rtl:right-3" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t("patientAppointments:search.placeholder")}
                                className="w-full pl-9 pr-4 py-2.5 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm rtl:pl-4 rtl:pr-9"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "bg-primary text-white border-primary" : "border-border text-fg hover:bg-muted/50"}`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span className="hidden sm:inline">{t("patientAppointments:search.filtersButton")}</span>
                            {(statusFilter !== "all" || typeFilter !== "all") && (
                                <span className={`w-2 h-2 rounded-full ${showFilters ? "bg-white" : "bg-primary"}`} />
                            )}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
                            {/* Status filter */}
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-fg-muted self-center font-medium">{t("patientAppointments:search.statusLabel")}</span>
                                {statusFilterOptions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-primary text-white" : "bg-muted/50 text-fg-muted hover:bg-muted"}`}
                                    >
                                        {s === "all" ? t("patientAppointments:search.allStatus") : t(`patientAppointments:status.${s}`)}
                                    </button>
                                ))}
                            </div>

                            <div className="w-px bg-border hidden sm:block" />

                            {/* Type filter */}
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-fg-muted self-center font-medium">{t("patientAppointments:search.typeLabel")}</span>
                                {typeFilterOptions.map((ty) => (
                                    <button
                                        key={ty}
                                        onClick={() => setTypeFilter(ty)}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${typeFilter === ty ? "bg-primary text-white" : "bg-muted/50 text-fg-muted hover:bg-muted"}`}
                                    >
                                        {ty === "clinic" && <Stethoscope className="w-3 h-3" />}
                                        {ty === "home" && <HomeIcon className="w-3 h-3" />}
                                        {ty === "all"
                                            ? t("patientAppointments:visitType.all")
                                            : ty === "clinic"
                                                ? t("patientAppointments:visitType.clinic")
                                                : t("patientAppointments:visitType.home")}
                                    </button>
                                ))}
                            </div>

                            {(statusFilter !== "all" || typeFilter !== "all") && (
                                <button
                                    onClick={() => { setStatusFilter("all"); setTypeFilter("all"); }}
                                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs text-red-600 bg-red-50 hover:bg-red-100 transition-colors ml-auto rtl:ml-0 rtl:mr-auto"
                                >
                                    <X className="w-3 h-3" />
                                    {t("patientAppointments:search.clear")}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-fg-muted">
                        <Trans
                            i18nKey="patientAppointments:results.showing"
                            values={{ filtered: filtered.length, total: appointments.length }}
                            components={{ bold: <span className="font-medium text-fg" /> }}
                        />
                    </p>
                    {(search || statusFilter !== "all" || typeFilter !== "all") && (
                        <button
                            onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); }}
                            className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            {t("patientAppointments:results.clearAllFilters")}
                        </button>
                    )}
                </div>

                {/* Appointments list */}
                {loading ? (
                    <div className="py-20 text-center text-fg-muted">{t("patientAppointments:loading")}</div>
                ) : filtered.length === 0 ? (
                    <EmptyState filterStatus={statusFilter} />
                ) : (
                    <div className="space-y-3">
                        {filtered.map((appt) => (
                            <AppointmentCard
                                key={appt.id}
                                appointment={appt}
                                onViewDetails={() => setDetailsModal(appt)}
                                onReschedule={() => setRescheduleModal(appt)}
                                onCancel={() => setCancelModal(appt)}
                                onReview={() => appt.review ? setViewReviewModal(appt) : setReviewModal(appt)}
                                onBookAgain={() => handleBookAgain(appt)}
                            />
                        ))}
                    </div>
                )}

                {/* Book new appointment CTA */}
                {filtered.length > 0 && (
                    <div className="bg-linear-to-r from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left rtl:sm:text-right">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                            <CalendarPlus className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-fg">{t("patientAppointments:cta.title")}</h4>
                            <p className="text-sm text-fg-muted">{t("patientAppointments:cta.description")}</p>
                        </div>
                        <button
                            onClick={() => setIsAppointmentModalOpen(true)}
                            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium shrink-0"
                        >
                            <CalendarPlus className="w-4 h-4" />
                            {t("patientAppointments:cta.bookNow")}
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            {detailsModal && <DetailsModal appointment={detailsModal} onClose={() => setDetailsModal(null)} />}
            {rescheduleModal && (
                <RescheduleModal
                    appointment={rescheduleModal}
                    onClose={() => setRescheduleModal(null)}
                    onConfirm={(date, time) => handleReschedule(rescheduleModal.id, date, time)}
                />
            )}
            {cancelModal && <CancelModal appointment={cancelModal} onClose={() => setCancelModal(null)} onConfirm={() => handleCancel(cancelModal.id)} />}
            {reviewModal && (
                <ReviewModal
                    appointment={reviewModal}
                    onClose={() => setReviewModal(null)}
                    onSubmit={(review) => handleSubmitReview(reviewModal.id, review)}
                />
            )}
            {viewReviewModal && <ViewReviewModal appointment={viewReviewModal} onClose={() => setViewReviewModal(null)} />}
            <AppointmentTypeModal isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)} />
        </div>
    );
}