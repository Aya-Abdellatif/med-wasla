import type { Appointment, AppointmentStatus } from "./AppointmentTypes";
import { ImageWithFallback } from "../../figma/ImageWithFallback";
import {
    Calendar,
    Clock,
    MapPin,
    Star,
    X,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Home as HomeIcon,
    Stethoscope,
    Bell,
} from "lucide-react";


function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

const statusConfig: Record<AppointmentStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    upcoming: { label: "Upcoming", color: "text-blue-700", bgColor: "bg-blue-50 border border-blue-200", icon: Clock },
    pending: { label: "Pending", color: "text-amber-700", bgColor: "bg-amber-50 border border-amber-200", icon: AlertCircle },
    completed: { label: "Completed", color: "text-emerald-700", bgColor: "bg-emerald-50 border border-emerald-200", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-50 border border-red-200", icon: XCircle },
    overdue: { label: "Overdue", color: "text-slate-700", bgColor: "bg-slate-100 border border-slate-200", icon: AlertCircle },
};

export function DetailsModal({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
    const status = statusConfig[appointment.status];
    const StatusIcon = status.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h3 className="text-lg font-bold text-foreground">Appointment Details</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Doctor info */}
                    <div className="flex items-center gap-4 p-4 bg-linear-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
                        <ImageWithFallback
                            src={appointment.doctor.photo}
                            alt={appointment.doctor.name}
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
                        />
                        <div className="flex-1">
                            <h4 className="font-bold text-foreground">{appointment.doctor.name}</h4>
                            <p className="text-primary text-sm">{appointment.doctor.specialty}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-sm text-muted-foreground">{appointment.doctor.rating}</span>
                            </div>
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                        </span>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Date</p>
                                <p className="text-sm font-medium text-foreground">{formatDate(appointment.date)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Time</p>
                                <p className="text-sm font-medium text-foreground">{appointment.time}</p>
                            </div>
                        </div>
                    </div>

                    {/* Type */}
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                            {appointment.type === "clinic" ? <Stethoscope className="w-4 h-4 text-primary" /> : <HomeIcon className="w-4 h-4 text-primary" />}
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Appointment Type</p>
                            <p className="text-sm font-medium text-foreground">{appointment.type === "clinic" ? "Clinic Visit" : "Home Visit"}</p>
                        </div>
                    </div>

                    {/* Address */}
                    {appointment.address && (
                        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Location / Address</p>
                                <p className="text-sm font-medium text-foreground">{appointment.address}</p>
                            </div>
                        </div>
                    )}

                    {/* Reason */}
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Reason for Visit</p>
                        <p className="text-sm text-foreground bg-muted/30 p-3 rounded-xl">{appointment.reason}</p>
                    </div>

                    {/* Reminders */}
                    {appointment.reminders.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Bell className="w-4 h-4 text-amber-500" />
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reminders</p>
                            </div>
                            <ul className="space-y-2">
                                {appointment.reminders.map((r, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-foreground bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Fee */}
                    <div className="flex items-center justify-between p-3 bg-linear-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
                        <span className="text-sm text-muted-foreground">Consultation Fee</span>
                        <span className="font-bold text-foreground">${appointment.fee}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
