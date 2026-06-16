import { useState } from "react";
import { Link, useNavigate } from "react-router";
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

import type { Appointment, AppointmentReview,  AppointmentStatus, AppointmentType } from "../../components/patient-appointments/AppointmentTypes";
import { mockAppointments } from "./mockAppointments";

const statusConfig: Record<AppointmentStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    upcoming: { label: "Upcoming", color: "text-blue-700", bgColor: "bg-blue-50 border border-blue-200", icon: Clock },
    pending: { label: "Pending", color: "text-amber-700", bgColor: "bg-amber-50 border border-amber-200", icon: AlertCircle },
    completed: { label: "Completed", color: "text-emerald-700", bgColor: "bg-emerald-50 border border-emerald-200", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-50 border border-red-200", icon: XCircle },
};

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

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
    const status = statusConfig[appointment.status];
    const StatusIcon = status.icon;

    return (
        <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow p-5">
            <div className="flex items-start gap-4">
                {/* Doctor photo */}
                <div className="relative flex-shrink-0">
                    <ImageWithFallback
                        src={appointment.doctor.photo}
                        alt={appointment.doctor.name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${appointment.type === "clinic" ? "bg-blue-100" : "bg-teal-100"}`}>
                        {appointment.type === "clinic" ? <Stethoscope className="w-2.5 h-2.5 text-blue-600" /> : <HomeIcon className="w-2.5 h-2.5 text-teal-600" />}
                    </div>
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            <h4 className="font-semibold text-foreground leading-tight">{appointment.doctor.name}</h4>
                            <p className="text-sm text-primary">{appointment.doctor.specialty}</p>
                        </div>
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${status.bgColor} ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
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
                            {appointment.type === "clinic" ? "Clinic Visit" : "Home Visit"}
                        </span>
                    </div>

                    {appointment.address && (
                        <p className="flex items-start gap-1.5 mt-1.5 text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span className="truncate">{appointment.address}</span>
                        </p>
                    )}

                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                {/* Left side: Book Again for completed */}
                {appointment.status === "completed" && (
                    <button
                        onClick={onBookAgain}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-xs font-medium transition-colors"
                    >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        Book Again
                    </button>
                )}

                <button
                    onClick={onViewDetails}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg text-xs font-medium transition-colors"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                    View Details
                </button>

                <Link
                    to={`/provider/doctor/${appointment.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/5 hover:bg-secondary/10 text-secondary rounded-lg text-xs font-medium transition-colors"
                >
                    <User className="w-3.5 h-3.5" />
                    View Profile
                </Link>

                {(appointment.status === "upcoming" || appointment.status === "pending") && (
                    <>
                        <button
                            onClick={onReschedule}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Reschedule
                        </button>
                        <button
                            onClick={onCancel}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors"
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel
                        </button>
                    </>
                )}

                {appointment.status === "completed" && !appointment.review && (
                    <button
                        onClick={onReview}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-medium transition-colors"
                    >
                        <Star className="w-3.5 h-3.5" />
                        Add Review
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
                        <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />
                        View Review
                    </button>
                )}
            </div>
        </div>
    );
}


// ─── Empty State ───────────────────────────────────────────────
function EmptyState({ filterStatus }: { filterStatus: string }) {
    const sampleDoctor = mockAppointments[0].doctor;
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                <Calendar className="w-9 h-9 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
                No {filterStatus !== "all" ? filterStatus : ""} appointments
            </h3>
            <p className="text-muted-foreground mb-8 max-w-sm">
                {filterStatus === "all"
                    ? "You don't have any appointments yet. Book one with our specialists today."
                    : `You have no ${filterStatus} appointments matching your filters.`}
            </p>

            {filterStatus === "all" && (
                <div className="bg-white rounded-2xl border border-border shadow-sm p-5 flex items-center gap-4 max-w-sm w-full mb-6">
                    <ImageWithFallback src={sampleDoctor.photo} alt={sampleDoctor.name} className="w-14 h-14 rounded-full object-cover" />
                    <div className="flex-1 text-left">
                        <p className="font-semibold text-foreground">{sampleDoctor.name}</p>
                        <p className="text-sm text-primary">{sampleDoctor.specialty}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-muted-foreground">{sampleDoctor.rating}</span>
                        </div>
                    </div>
                </div>
            )}

            <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors font-medium">
                <CalendarPlus className="w-5 h-5" />
                Book Appointment
            </button>
        </div>
    );
}


// ─── Main Page ─────────────────────────────────────────────────
export function MyAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
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


    const handleBookAgain = (appt: Appointment) => {
        // Navigate to doctors page — in a real app this would pre-select the doctor
        navigate("/doctors");
    };

    const handleSubmitReview = (id: string, review: AppointmentReview) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, review } : a)));
    setReviewModal(null);
    };

    const counts = {
        upcoming: appointments.filter((a) => a.status === "upcoming").length,
        pending: appointments.filter((a) => a.status === "pending").length,
        completed: appointments.filter((a) => a.status === "completed").length,
        cancelled: appointments.filter((a) => a.status === "cancelled").length,
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

    const handleCancel = (id: string) => {
        setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "cancelled" as AppointmentStatus } : a)));
        setCancelModal(null);
    };

    const summaryCards = [
        { label: "Upcoming", count: counts.upcoming, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500", filter: "upcoming" as const },
        { label: "Pending", count: counts.pending, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", filter: "pending" as const },
        { label: "Completed", count: counts.completed, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", filter: "completed" as const },
        { label: "Cancelled", count: counts.cancelled, color: "text-red-700", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500", filter: "cancelled" as const },
    ];

    return (
        <div className="min-h-screen bg-muted/20">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-primary to-secondary py-10 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">My Appointments</h1>
                    </div>
                    <p className="text-primary-foreground/80 ml-12 text-sm">View and manage all your medical appointments in one place</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {summaryCards.map((card) => (
                        <button
                            key={card.label}
                            onClick={() => setStatusFilter(statusFilter === card.filter ? "all" : card.filter)}
                            className={`p-4 rounded-2xl border text-left transition-all hover:shadow-sm ${statusFilter === card.filter ? `${card.bg} ${card.border} shadow-sm` : "bg-white border-border hover:border-gray-300"}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${card.dot}`} />
                                <span className={`text-xs font-medium ${statusFilter === card.filter ? card.color : "text-muted-foreground"}`}>{card.label}</span>
                            </div>
                            <p className={`text-2xl font-bold ${statusFilter === card.filter ? card.color : "text-foreground"}`}>{card.count}</p>
                        </button>
                    ))}
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-2xl border border-border p-4">
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by doctor, specialty, or reason..."
                                className="w-full pl-9 pr-4 py-2.5 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "bg-primary text-white border-primary" : "border-border text-foreground hover:bg-muted/50"}`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span className="hidden sm:inline">Filters</span>
                            {(statusFilter !== "all" || typeFilter !== "all") && (
                                <span className={`w-2 h-2 rounded-full ${showFilters ? "bg-white" : "bg-primary"}`} />
                            )}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
                            {/* Status filter */}
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-muted-foreground self-center font-medium">Status:</span>
                                {(["all", "upcoming", "pending", "completed", "cancelled"] as const).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${statusFilter === s ? "bg-primary text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                                    >
                                        {s === "all" ? "All Status" : s}
                                    </button>
                                ))}
                            </div>

                            <div className="w-px bg-border hidden sm:block" />

                            {/* Type filter */}
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-muted-foreground self-center font-medium">Type:</span>
                                {(["all", "clinic", "home"] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTypeFilter(t)}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${typeFilter === t ? "bg-primary text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                                    >
                                        {t === "clinic" && <Stethoscope className="w-3 h-3" />}
                                        {t === "home" && <HomeIcon className="w-3 h-3" />}
                                        {t === "all" ? "All Types" : t === "clinic" ? "Clinic Visit" : "Home Visit"}
                                    </button>
                                ))}
                            </div>

                            {(statusFilter !== "all" || typeFilter !== "all") && (
                                <button
                                    onClick={() => { setStatusFilter("all"); setTypeFilter("all"); }}
                                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs text-red-600 bg-red-50 hover:bg-red-100 transition-colors ml-auto"
                                >
                                    <X className="w-3 h-3" />
                                    Clear
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{filtered.length}</span> of {appointments.length} appointments
                    </p>
                    {(search || statusFilter !== "all" || typeFilter !== "all") && (
                        <button
                            onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); }}
                            className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            Clear all filters
                        </button>
                    )}
                </div>

                {/* Appointments list */}
                {filtered.length === 0 ? (
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
                    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <CalendarPlus className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-foreground">Need another appointment?</h4>
                            <p className="text-sm text-muted-foreground">Browse our specialists and book a new appointment in minutes.</p>
                        </div>
                        <button
                            onClick={() => setIsAppointmentModalOpen(true)}
                            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium flex-shrink-0"
                        >
                            <CalendarPlus className="w-4 h-4" />
                            Book Now
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            {detailsModal && <DetailsModal appointment={detailsModal} onClose={() => setDetailsModal(null)} />}
            {rescheduleModal && <RescheduleModal appointment={rescheduleModal} onClose={() => setRescheduleModal(null)} />}
            {cancelModal && <CancelModal appointment={cancelModal} onClose={() => setCancelModal(null)} onConfirm={() => handleCancel(cancelModal.id)} />}
            {reviewModal && (
                <ReviewModal
                    appointment={reviewModal}
                    onClose={() => setReviewModal(null)}
                    onSubmit={(review) => handleSubmitReview(reviewModal.id, review)}
                />
            )}
            {viewReviewModal && <ViewReviewModal appointment={viewReviewModal} onClose={() => setViewReviewModal(null)} />}
            {AppointmentTypeModal && <AppointmentTypeModal isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)} />}
        </div>
    );
}
